import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ProjectService } from '../../../services/project.service';
import { TaskService } from '../../../services/task.service';
import { PaymentService } from '../../../services/payment.service';
import { AuthService } from '../../../services/auth.service';
import { Project, ProjectStatus } from '../../../models/project.model';
import { Task, TaskStatus } from '../../../models/task.model';
import { Payment, PaymentStatus } from '../../../models/payment.model';
import { User, UserRole } from '../../../models/user.model';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-project-details',
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.scss']
})
export class ProjectDetailsComponent implements OnInit {
  projectId: number = 0;
  project: Project | null = null;
  tasks: Task[] = [];
  payments: Payment[] = [];
  currentUser: User | null = null;
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private taskService: TaskService,
    private paymentService: PaymentService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.projectId = +params['id'];
        this.loadProject();
        this.loadTasks();
        this.loadPayments();
      }
    });
  }

  loadProject() {
    this.isLoading = true;
    this.projectService.getProjectById(this.projectId)
      .subscribe({
        next: (project) => {
          this.project = project;
          this.isLoading = false;
        },
        error: (error) => {
          this.snackBar.open('Failed to load project', 'Close', { duration: 5000 });
          this.isLoading = false;
          this.navigateBack();
        }
      });
  }

  loadTasks() {
    this.taskService.getTasksByProject(this.projectId)
      .subscribe({
        next: (tasks) => {
          this.tasks = tasks;
        },
        error: (error) => {
          this.snackBar.open('Failed to load tasks', 'Close', { duration: 5000 });
        }
      });
  }

  loadPayments() {
    this.paymentService.getPaymentsByProject(this.projectId)
      .subscribe({
        next: (payments) => {
          this.payments = payments;
        },
        error: (error) => {
          this.snackBar.open('Failed to load payments', 'Close', { duration: 5000 });
        }
      });
  }

  getStatusBadgeClass(status: ProjectStatus): string {
    switch (status) {
      case ProjectStatus.Completed:
        return 'status-completed';
      case ProjectStatus.Started:
        return 'status-started';
      case ProjectStatus.Pending:
        return 'status-pending';
      case ProjectStatus.Hold:
        return 'status-hold';
      case ProjectStatus.Revision:
        return 'status-revision';
      case ProjectStatus.Cancelled:
        return 'status-cancelled';
      default:
        return '';
    }
  }

  getTaskStatusBadgeClass(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.ToDo:
        return 'task-todo';
      case TaskStatus.InProgress:
        return 'task-inprogress';
      case TaskStatus.Done:
        return 'task-done';
      case TaskStatus.Blocked:
        return 'task-blocked';
      default:
        return '';
    }
  }

  getPaymentStatusBadgeClass(status: PaymentStatus): string {
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

  getDaysRemainingColor(daysRemaining: number): string {
    if (daysRemaining <= 0) {
      return 'days-overdue';
    } else if (daysRemaining <= 3) {
      return 'days-critical';
    } else if (daysRemaining <= 7) {
      return 'days-warning';
    } else {
      return '';
    }
  }

  getTaskCompletionPercentage(): number {
    if (!this.tasks || this.tasks.length === 0) {
      return 0;
    }

    const doneTasks = this.tasks.filter(t => t.status === TaskStatus.Done).length;
    return Math.round((doneTasks / this.tasks.length) * 100);
  }

  getTotalPaidAmount(): number {
    if (!this.payments || this.payments.length === 0) {
      return 0;
    }

    return this.payments
      .filter(p => p.status === PaymentStatus.Completed)
      .reduce((sum, payment) => sum + payment.amount, 0);
  }

  getRemainingAmount(): number {
    if (!this.project) {
      return 0;
    }

    return this.project.developerAmount - this.getTotalPaidAmount();
  }

  isAdmin(): boolean {
    return this.currentUser?.role === UserRole.Admin;
  }

  editProject() {
    if (this.isAdmin() && this.project) {
      this.router.navigate(['/admin/projects/edit', this.project.id]);
    }
  }

  deleteProject() {
    if (this.isAdmin() && this.project) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '400px',
        data: {
          title: 'Confirm Delete',
          message: `Are you sure you want to delete project "${this.project.title}"? This action cannot be undone.`,
          confirmText: 'Delete',
          cancelText: 'Cancel'
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result && this.project) {
          this.projectService.deleteProject(this.project.id)
            .subscribe({
              next: () => {
                this.snackBar.open('Project deleted successfully', 'Close', { duration: 3000 });
                this.navigateBack();
              },
              error: (error) => {
                this.snackBar.open('Failed to delete project', 'Close', { duration: 5000 });
              }
            });
        }
      });
    }
  }

  addTask() {
    if (this.isAdmin() && this.project) {
      this.router.navigate(['/admin/tasks/add'], {
        queryParams: { projectId: this.project.id }
      });
    }
  }

  addPayment() {
    if (this.isAdmin() && this.project) {
      this.router.navigate(['/admin/payments/add'], {
        queryParams: { projectId: this.project.id }
      });
    }
  }

  navigateBack() {
    if (this.currentUser) {
      switch (this.currentUser.role) {
        case UserRole.Admin:
          this.router.navigate(['/admin/projects']);
          break;
        case UserRole.Developer:
          this.router.navigate(['/developer/projects']);
          break;
        case UserRole.Client:
          this.router.navigate(['/client/projects']);
          break;
        default:
          this.router.navigate(['/']);
      }
    } else {
      this.router.navigate(['/']);
    }
  }
}
