import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PaymentService } from '../../../services/payment.service';
import { UserService } from '../../../services/user.service';
import { ProjectService } from '../../../services/project.service';
import { Payment, PaymentStatus } from '../../../models/payment.model';
import { User } from '../../../models/user.model';
import { Project } from '../../../models/project.model';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-payment-list',
  templateUrl: './payment-list.component.html',
  styleUrls: ['./payment-list.component.scss']
})
export class PaymentListComponent implements OnInit {
  displayedColumns: string[] = ['id', 'projectTitle', 'developerName', 'amount', 'paymentDate', 'status', 'actions'];
  dataSource = new MatTableDataSource<Payment>([]);
  isLoading = false;
  totalPayments = 0;

  filterForm!: FormGroup;
  developers: User[] = [];
  projects: Project[] = [];
  paymentStatuses = Object.values(PaymentStatus);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private paymentService: PaymentService,
    private userService: UserService,
    private projectService: ProjectService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initFilterForm();
    this.loadDevelopers();
    this.loadProjects();
    this.loadPayments();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  initFilterForm() {
    this.filterForm = this.formBuilder.group({
      startDate: [null],
      endDate: [null],
      developerId: [null],
      projectId: [null],
      status: [null]
    });
  }

  loadDevelopers() {
    this.userService.getDevelopers()
      .subscribe({
        next: (developers) => {
          this.developers = developers;
        },
        error: (error) => {
          this.snackBar.open('Failed to load developers', 'Close', { duration: 5000 });
        }
      });
  }

  loadProjects() {
    this.projectService.getProjects(0, 1000)
      .subscribe({
        next: (response) => {
          this.projects = response.items;
        },
        error: (error) => {
          this.snackBar.open('Failed to load projects', 'Close', { duration: 5000 });
        }
      });
  }

  loadPayments(pageIndex: number = 0, pageSize: number = 10) {
    this.isLoading = true;

    const filter = this.filterForm.value;

    this.paymentService.getPayments(pageIndex, pageSize, filter)
      .subscribe({
        next: (response) => {
          this.dataSource.data = response.items;
          this.totalPayments = response.totalCount;
          this.isLoading = false;
        },
        error: (error) => {
          this.snackBar.open('Failed to load payments', 'Close', { duration: 5000 });
          this.isLoading = false;
        }
      });
  }

  onPageChange(event: any) {
    this.loadPayments(event.pageIndex, event.pageSize);
  }

  applyFilter() {
    this.loadPayments(0, this.paginator?.pageSize || 10);
  }

  resetFilter() {
    this.filterForm.reset();
    this.loadPayments(0, this.paginator?.pageSize || 10);
  }

  getStatusBadgeClass(status: PaymentStatus): string {
    switch (status) {
      case PaymentStatus.Completed:
        return 'status-completed';
      case PaymentStatus.Pending:
        return 'status-pending';
      case PaymentStatus.Cancelled:
        return 'status-cancelled';
      default:
        return '';
    }
  }

  editPayment(paymentId: number) {
    this.router.navigate(['/admin/payments/edit', paymentId]);
  }

  deletePayment(payment: Payment) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirm Delete',
        message: `Are you sure you want to delete this payment of ${payment.amount} for ${payment.developerName}?`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        this.paymentService.deletePayment(payment.id)
          .subscribe({
            next: () => {
              this.snackBar.open('Payment deleted successfully', 'Close', { duration: 3000 });
              this.loadPayments(this.paginator.pageIndex, this.paginator.pageSize);
            },
            error: (error) => {
              this.snackBar.open('Failed to delete payment', 'Close', { duration: 5000 });
              this.isLoading = false;
            }
          });
      }
    });
  }

  addNewPayment() {
    this.router.navigate(['/admin/payments/add']);
  }
}
