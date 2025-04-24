import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../services/auth.service';
import { PaymentService } from '../../../services/payment.service';
import { Payment, PaymentStatus } from '../../../models/payment.model';

@Component({
  selector: 'app-developer-payments',
  templateUrl: './developer-payments.component.html',
  styleUrls: ['./developer-payments.component.scss']
})
export class DeveloperPaymentsComponent implements OnInit {
  displayedColumns: string[] = ['id', 'projectTitle', 'amount', 'paymentDate', 'status', 'paymentDetails'];
  dataSource = new MatTableDataSource<Payment>([]);
  isLoading = false;

  totalEarnings: number = 0;
  completedPayments: number = 0;
  pendingPayments: number = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private paymentService: PaymentService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadPayments();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadPayments() {
    this.isLoading = true;

    const currentUser = this.authService.currentUserValue;
    if (currentUser) {
      this.paymentService.getPaymentsByDeveloper(currentUser.id)
        .subscribe({
          next: (payments) => {
            this.dataSource.data = payments;
            this.calculateTotals(payments);
            this.isLoading = false;
          },
          error: (error) => {
            this.snackBar.open('Failed to load payments', 'Close', { duration: 5000 });
            this.isLoading = false;
          }
        });
    }
  }

  calculateTotals(payments: Payment[]) {
    this.totalEarnings = payments.reduce((sum, payment) => sum + payment.amount, 0);
    this.completedPayments = payments
      .filter(p => p.status === PaymentStatus.Completed)
      .reduce((sum, payment) => sum + payment.amount, 0);
    this.pendingPayments = payments
      .filter(p => p.status === PaymentStatus.Pending)
      .reduce((sum, payment) => sum + payment.amount, 0);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
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
}
