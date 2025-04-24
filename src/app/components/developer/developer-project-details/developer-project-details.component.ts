import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ProjectService } from '../../../services/project.service';
import { TaskService } from '../../../services/task.service';
import { AuthService } from '../../../services/auth.service';
import { Project, ProjectStatus } from '../../../models/project.model';
import { Task, TaskStatus } from '../../../models/task.model';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-developer-project-details',
  templateUrl: './developer-project-details.component.html',
  styleUrls: ['./developer-project-details.component.scss']
})
export class DeveloperProjectDetailsComponent implements OnInit {
  projectId: number = 0;
  project: Project | null = null;
  tasks: Task[] = [];
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private taskService: TaskService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.projectId = +params['id'];
        this.loadProject();
        this.loadTasks();
      }
    });
  }

  loadProject() {
    this.isLoading = true;
    this.projectService.getProjectById(this.projectId)
      .subscribe({
        next: (project) => {
          this.project = project;

          // Verify that this project belongs to the current developer
          const currentUser = this.authService.currentUserValue;
          if (currentUser && project.developerId !== currentUser.id) {
            this.snackBar.open('You do not have access to this project', 'Close', { duration: 5000 });
            this.router.navigate(['/developer/projects']);
          }

          this.isLoading = false;
        },
        error: (error) => {
          this.snackBar.open('Failed to load project', 'Close', { duration: 5000 });
          this.isLoading = false;
          this.router.navigate(['/developer/projects']);
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

  goBack() {
    this.router.navigate(['/developer/projects']);
  }
}
