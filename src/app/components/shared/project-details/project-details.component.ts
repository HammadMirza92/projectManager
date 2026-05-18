import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ProjectService } from '../../../services/project.service';
import { TaskService } from '../../../services/task.service';
import { PaymentService } from '../../../services/payment.service';
import { AuthService } from '../../../services/auth.service';
import { WithdrawalService } from '../../../services/withdrawal.service';
import { Project, ProjectStatus } from '../../../models/project.model';
import { Task, TaskStatus } from '../../../models/task.model';
import { Payment, PaymentStatus } from '../../../models/payment.model';
import { DevPaymentTransfer } from '../../../models/withdrawal-report.model';
import { User, UserRole } from '../../../models/user.model';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-project-details',
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.scss']
})
export class ProjectDetailsComponent implements OnInit, OnDestroy {
  projectId: number = 0;
  project: Project | null = null;
  tasks: Task[] = [];
  payments: Payment[] = [];
  devTransfers: DevPaymentTransfer[] = [];
  currentUser: User | null = null;
  isLoading = false;

  // Countdown timer for Started projects
  elapsedTime = { days: 0, hours: 0, minutes: 0, seconds: 0 };
  private timerInterval: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private taskService: TaskService,
    private paymentService: PaymentService,
    private withdrawalService: WithdrawalService,
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
        this.loadDevTransfers();
      }
    });
  }

  loadProject() {
    this.isLoading = true;
    this.projectService.getProjectById(this.projectId).subscribe({
      next: (project) => {
        this.project = project;
        this.isLoading = false;
        if (project.status === ProjectStatus.Started && project.endDate) {
          this.startTimer(new Date(project.endDate));
        }
      },
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

  loadDevTransfers() {
    this.withdrawalService.getDevPayments().subscribe({
      next: (transfers) => {
        this.devTransfers = transfers.filter(t => t.projectId === this.projectId);
      },
      error: () => {}
    });
  }

  // Dev PKR = devPayment × dollarRateWrtDev
  // e.g. $128 × 264.25 = 33,825 PKR
  getDevPkr(): number {
    if (!this.project) return 0;
    return this.project.devPayment * this.project.dollarRateWrtDev;
  }

  // Our PKR = (paymentInDollarAfterDeduction × dollarRate) - devPKR
  // e.g. 640 × 280 - 33,825 = 145,375 PKR
  getOurSharePkr(): number {
    if (!this.project) return 0;
    const devPkr = this.getDevPkr();
    return (this.project.paymentInDollarAfterDeduction + (this.project.tipAmount || 0)) * this.project.dollarRate - devPkr;
  }

  // Total PKR transferred to dev for this project
  getTransferPaidPkr(): number {
    return this.devTransfers.reduce((s, t) => s + t.amountPkr, 0);
  }

  getTransferPaidUsd(): number {
    return this.devTransfers.reduce((s, t) => s + t.amountUsd, 0);
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

  startTimer(endDate: Date): void {
    this.updateCountdown(endDate);
    this.timerInterval = setInterval(() => this.updateCountdown(endDate), 1000);
  }

  private updateCountdown(endDate: Date): void {
    const diffMs = endDate.getTime() - Date.now();
    if (diffMs <= 0) { this.elapsedTime = { days: 0, hours: 0, minutes: 0, seconds: 0 }; return; }
    const totalSec = Math.floor(diffMs / 1000);
    this.elapsedTime = {
      days: Math.floor(totalSec / 86400),
      hours: Math.floor((totalSec % 86400) / 3600),
      minutes: Math.floor((totalSec % 3600) / 60),
      seconds: totalSec % 60
    };
  }

  ngOnDestroy(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
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
