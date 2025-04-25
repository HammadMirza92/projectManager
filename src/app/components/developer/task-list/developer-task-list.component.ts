// components/developer/task-list/developer-task-list.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TaskService } from '../../../services/task.service';
import { ProjectService } from '../../../services/project.service';
import { AuthService } from '../../../services/auth.service';
import { Project } from '../../../models/project.model';
import { Task, TaskStatus } from '../../../models/task.model';
import { TaskFormComponent } from '../../shared/task-form/task-form.component';

@Component({
  selector: 'app-developer-task-list',
  templateUrl: './developer-task-list.component.html',
  styleUrls: ['./developer-task-list.component.scss']
})
export class DeveloperTaskListComponent implements OnInit {
  projectId?: number;
  project?: Project;
  loading = false;
  error = '';
  tasksToDisplay: 'all' | 'assigned' | 'project' = 'all';
  currentUserId?: number;

  constructor(
    private taskService: TaskService,
    private projectService: ProjectService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.currentUserId = this.authService.currentUserValue?.id;
  }

  ngOnInit(): void {
    // Check if we're viewing tasks for a specific project
    this.route.params.subscribe(params => {
      if (params['projectId']) {
        this.projectId = +params['projectId'];
        this.tasksToDisplay = 'project';
        this.loadProjectDetails();
      }
    });
  }

  loadProjectDetails(): void {
    if (!this.projectId) return;

    this.loading = true;
    this.projectService.getProjectById(this.projectId).subscribe({
      next: (project) => {
        this.project = project;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Failed to load project details';
        this.loading = false;
      }
    });
  }

  openTaskForm(): void {
    const dialogRef = this.dialog.open(TaskFormComponent, {
      width: '600px',
      data: {
        task: null,
        projectId: this.projectId
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.refreshData();
      }
    });
  }

  refreshData(): void {
    if (this.projectId) {
      this.loadProjectDetails();
    }
  }

  backToProjects(): void {
    this.router.navigate(['/developer/projects']);
  }

  changeTasksToDisplay(display: 'all' | 'assigned' | 'project'): void {
    this.tasksToDisplay = display;

    if (display === 'project') {
      // If showing project tasks without a selected project, return to all tasks
      if (!this.projectId) {
        this.tasksToDisplay = 'all';
      }
    }
  }

  onTaskUpdated(): void {
    this.refreshData();
  }

  get filterText(): string {
    switch (this.tasksToDisplay) {
      case 'assigned':
        return 'Tasks Assigned to Me';
      case 'project':
        return `Tasks for Project: ${this.project?.title || ''}`;
      default:
        return 'All Tasks';
    }
  }
}
