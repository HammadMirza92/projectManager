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
    this.projectService.getProjectById(this.projectId).subscribe({
      next: (project) => { this.project = project; this.isLoading = false; },
      error: () => {
        this.snackBar.open('Failed to load project', 'Close', { duration: 5000 });
        this.isLoading = false;
        this.navigateBack();
      }
    });
  }

  loadTasks() {
    this.taskService.getTasksByProject(this.projectId).subscribe({
      next: (tasks) => { this.tasks = tasks; },
      error: () => this.snackBar.open('Failed to load tasks', 'Close', { duration: 5000 })
    });
  }

  loadPayments() {
    this.paymentService.getPaymentsByProject(this.projectId).subscribe({
      next: (payments) => { this.payments = payments; },
      error: () => this.snackBar.open('Failed to load payments', 'Close', { duration: 5000 })
    });
  }

  getStatusBadgeClass(status: ProjectStatus): string {
    const map: Record<string, string> = {
      [ProjectStatus.Completed]: 'status-completed',
      [ProjectStatus.Started]: 'status-started',
      [ProjectStatus.Pending]: 'status-pending',
      [ProjectStatus.Hold]: 'status-hold',
      [ProjectStatus.Revision]: 'status-revision',
      [ProjectStatus.Cancelled]: 'status-cancelled'
    };
    return map[status] || '';
  }

  getTaskStatusBadgeClass(status: TaskStatus | string): string {
    const map: Record<string, string> = {
      [TaskStatus.ToDo]: 'task-todo',
      [TaskStatus.InProgress]: 'task-inprogress',
      [TaskStatus.Done]: 'task-done',
      [TaskStatus.Blocked]: 'task-blocked',
      'OnHold': 'task-onhold'
    };
    return map[status] || '';
  }

  getPaymentStatusBadgeClass(status: PaymentStatus | string): string {
    const map: Record<string, string> = {
      [PaymentStatus.Completed]: 'pay-completed',
      [PaymentStatus.Pending]: 'pay-pending',
      [PaymentStatus.Cancelled]: 'pay-cancelled'
    };
    return map[status] || '';
  }

  getDaysRemainingColor(daysRemaining: number): string {
    if (daysRemaining <= 0) return 'deadline-overdue';
    if (daysRemaining <= 3) return 'deadline-critical';
    if (daysRemaining <= 7) return 'deadline-warning';
    return 'deadline-ok';
  }

  getTaskCompletionPercentage(): number {
    if (!this.tasks?.length) return 0;
    const done = this.tasks.filter(t => t.status === TaskStatus.Done).length;
    return Math.round((done / this.tasks.length) * 100);
  }

  getCompletedTaskCount(): number {
    return this.tasks.filter(t => t.status === TaskStatus.Done).length;
  }

  getTotalPaidAmount(): number {
    return this.payments
      .filter(p => p.status === PaymentStatus.Completed)
      .reduce((sum, p) => sum + p.amount, 0);
  }

  getRemainingAmount(): number {
    if (!this.project) return 0;
    return this.project.developerAmount - this.getTotalPaidAmount();
  }

  getPaymentPercentage(): number {
    if (!this.project || this.project.developerAmount === 0) return 0;
    return Math.min(100, Math.round((this.getTotalPaidAmount() / this.project.developerAmount) * 100));
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
    if (!this.isAdmin() || !this.project) return;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirm Delete',
        message: `Are you sure you want to delete "${this.project.title}"? This cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && this.project) {
        this.projectService.deleteProject(this.project.id).subscribe({
          next: () => {
            this.snackBar.open('Project deleted', 'Close', { duration: 3000 });
            this.navigateBack();
          },
          error: () => this.snackBar.open('Failed to delete project', 'Close', { duration: 5000 })
        });
      }
    });
  }

  addTask() {
    if (this.isAdmin() && this.project) {
      this.router.navigate(['/admin/tasks/add'], { queryParams: { projectId: this.project.id } });
    }
  }

  addPayment() {
    if (this.isAdmin() && this.project) {
      this.router.navigate(['/admin/payments/add'], { queryParams: { projectId: this.project.id } });
    }
  }

  navigateBack() {
    if (!this.currentUser) { this.router.navigate(['/']); return; }
    switch (this.currentUser.role) {
      case UserRole.Admin: this.router.navigate(['/admin/projects']); break;
      case UserRole.Developer: this.router.navigate(['/developer/projects']); break;
      case UserRole.Client: this.router.navigate(['/client/projects']); break;
      default: this.router.navigate(['/']);
    }
  }
}
