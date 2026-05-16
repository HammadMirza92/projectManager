import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Task, TaskStatus } from '../../../models/task.model';
import { TaskService } from '../../../services/task.service';
import { AuthService } from '../../../services/auth.service';
import { TaskFormComponent } from '../task-form/task-form.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-task-card',
  templateUrl: './task-card.component.html',
  styleUrls: ['./task-card.component.scss']
})
export class TaskCardComponent {
  @Input() task: Task;
  @Input() showProjectTitle: boolean = true;
  @Output() statusChanged = new EventEmitter<void>();
  @Output() taskDeleted = new EventEmitter<number>();

  currentUserRole: string = '';
  currentUserId: number = 0;

  TaskStatus = TaskStatus;

  constructor(
    private authService: AuthService,
    private taskService: TaskService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    const userInfo = this.authService.getUserInfo();
    if (userInfo) {
      this.currentUserRole = userInfo.role;
      this.currentUserId = userInfo.id;
    }
  }

  editTask(): void {
    const dialogRef = this.dialog.open(TaskFormComponent, {
      width: '600px',
      data: {
        task: this.task,
        projectId: this.task.projectId,
        isEdit: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.task = result;
        this.statusChanged.emit();
      }
    });
  }

  updateTaskStatus(newStatus: TaskStatus): void {
    this.taskService.updateTask(this.task.id, { status: newStatus }).subscribe({
      next: (updatedTask) => {
        this.task.status = updatedTask.status;
        this.task.statusName = updatedTask.statusName;
        this.snackBar.open('Task status updated', 'Close', { duration: 3000 });
        this.statusChanged.emit();
      },
      error: (error) => {
        console.error('Error updating task status:', error);
        this.snackBar.open('Failed to update task status', 'Close', { duration: 3000 });
      }
    });
  }

  deleteTask(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Confirm Delete',
        message: `Are you sure you want to delete the task "${this.task.title}"?`,
        confirmButton: 'Delete',
        cancelButton: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.taskService.deleteTask(this.task.id).subscribe({
          next: () => {
            this.snackBar.open('Task deleted successfully', 'Close', { duration: 3000 });
            this.taskDeleted.emit(this.task.id);
          },
          error: (error) => {
            console.error('Error deleting task:', error);
            this.snackBar.open('Failed to delete task', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  canEditTask(): boolean {
    return this.currentUserRole === UserRole.Admin ||
           (this.currentUserRole === UserRole.Developer &&
            (this.task.assignedToId === this.currentUserId || this.isProjectDeveloper()));
  }

  canDeleteTask(): boolean {
    return this.currentUserRole === UserRole.Admin ||
           (this.currentUserRole === UserRole.Client && this.isProjectClient());
  }

  // These methods would need actual implementation with project service
  isProjectDeveloper(): boolean {
    // This should check if the current user is the developer assigned to this project
    // For now, we'll assume true for simplicity
    return true;
  }

  isProjectClient(): boolean {
    // This should check if the current user is the client for this project
    // For now, we'll assume true for simplicity
    return true;
  }

  getStatusClass(): string {
    switch (this.task.status) {
      case TaskStatus.ToDo: return 'status-todo';
      case TaskStatus.InProgress: return 'status-in-progress';
      case TaskStatus.Done: return 'status-done';
      default: return '';
    }
  }

  getStatusText(): string {
    return this.task.statusName || 'Unknown';
  }
}
