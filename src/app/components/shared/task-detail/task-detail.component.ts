import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TaskService } from '../../../services/task.service';
import { AuthService } from '../../../services/auth.service';
import { Task, TaskStatus } from '../../../models/task.model';
import { UserRole } from '../../../models/user.model';
import { TaskFormComponent } from '../task-form/task-form.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { Location } from '@angular/common';

@Component({
  selector: 'app-task-detail',
  templateUrl: './task-detail.component.html',
  styleUrls: ['./task-detail.component.scss']
})
export class TaskDetailComponent implements OnInit {
  task: Task | null = null;
  loading = true;
  error = '';
  TaskStatus = TaskStatus;
  currentUserRole: UserRole | null = null;
  today = new Date(); // Add today property for date comparison

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private taskService: TaskService,
    private authService: AuthService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.currentUserRole = this.authService.currentUserValue?.role || null;
    this.loadTask();
  }

  loadTask(): void {
    const taskId = this.route.snapshot.paramMap.get('id');
    if (!taskId) {
      this.error = 'Task ID is missing';
      this.loading = false;
      return;
    }

    this.taskService.getTaskById(+taskId).subscribe({
      next: (task) => {
        this.task = task;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Failed to load task';
        this.loading = false;
      }
    });
  }

  getStatusClass(status: TaskStatus | undefined): string {
    if (!status) return '';

    switch (status) {
      case TaskStatus.ToDo:
        return 'status-todo';
      case TaskStatus.InProgress:
        return 'status-progress';
      case TaskStatus.Done:
        return 'status-done';
      case TaskStatus.OnHold:
        return 'status-hold';
      default:
        return '';
    }
  }

  updateTaskStatus(newStatus: TaskStatus): void {
    if (!this.task) return;

    this.task.status = newStatus;

    this.loading = true;

    this.taskService.updateTask(this.task.id, this.task).subscribe({
      next: (result) => {
        this.task = result;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Failed to update task status';
        this.loading = false;
      }
    });
  }

  editTask(): void {
    if (!this.task) return;

    const dialogRef = this.dialog.open(TaskFormComponent, {
      width: '600px',
      data: {
        task: this.task,
        projectId: this.task.projectId
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.task = result;
      }
    });
  }

  deleteTask(): void {
    if (!this.task) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Delete Task',
        message: `Are you sure you want to delete the task "${this.task.title}"?`,
        confirmButtonText: 'Delete'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;

        this.taskService.deleteTask(this.task!.id).subscribe({
          next: () => {
            this.router.navigate(['/tasks']);
          },
          error: (err) => {
            this.error = err.message || 'Failed to delete task';
            this.loading = false;
          }
        });
      }
    });
  }

  goBack(): void {
    this.location.back();
  }

  navigateToProject(): void {
    if (!this.task) return;

    const baseRoute = this.getBaseRouteByRole();
    if (baseRoute) {
      this.router.navigate([`${baseRoute}/projects`, this.task.projectId]);
    }
  }

  canEditTask(): boolean {
    if (!this.task) return false;

    const currentUserId = this.authService.currentUserValue?.id;

    // Admin can edit any task
    if (this.currentUserRole === UserRole.Admin) {
      return true;
    }

    // Developer can edit tasks assigned to them
    if (this.currentUserRole === UserRole.Developer) {
      return this.task.assignedToId === currentUserId;
    }

    // Client cannot edit tasks
    return false;
  }

  isAdmin(): boolean {
    return this.currentUserRole === UserRole.Admin;
  }

  isDeveloper(): boolean {
    return this.currentUserRole === UserRole.Developer;
  }

  private getBaseRouteByRole(): string | null {
    switch (this.currentUserRole) {
      case UserRole.Admin:
        return 'admin';
      case UserRole.Developer:
        return 'developer';
      case UserRole.Client:
        return 'client';
      default:
        return null;
    }
  }
}
