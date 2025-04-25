// components/shared/project-task-summary/project-task-summary.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TaskService } from '../../../services/task.service';
import { AuthService } from '../../../services/auth.service';
import { Task, TaskStatus } from '../../../models/task.model';
import { UserRole } from '../../../models/user.model';

@Component({
  selector: 'app-project-task-summary',
  templateUrl: './project-task-summary.component.html',
  styleUrls: ['./project-task-summary.component.scss']
})
export class ProjectTaskSummaryComponent implements OnInit {
  @Input() projectId!: number;

  tasks: Task[] = [];
  loading = false;
  error = '';
  currentUserRole?: UserRole;

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUserRole = this.authService.currentUserValue?.role;
  }

  ngOnInit(): void {
    this.loadProjectTasks();
  }

  loadProjectTasks(): void {
    if (!this.projectId) return;

    this.loading = true;
    this.taskService.getTasksByProject(this.projectId).subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Failed to load tasks';
        this.loading = false;
      }
    });
  }

  getStatusCount(status: TaskStatus): number {
    return this.tasks.filter(task => task.status === status).length;
  }

  getCompletionPercentage(): number {
    if (this.tasks.length === 0) return 0;
    const completedTasks = this.getStatusCount(TaskStatus.Done);
    return Math.round((completedTasks / this.tasks.length) * 100);
  }

  getStatusClass(status: TaskStatus): string {
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

  viewAllTasks(): void {
    const baseRoute = this.getBaseRouteByRole();
    if (baseRoute) {
      this.router.navigate([`${baseRoute}/projects/${this.projectId}/tasks`]);
    }
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
