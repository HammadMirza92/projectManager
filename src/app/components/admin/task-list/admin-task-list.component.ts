// components/admin/task-list/admin-task-list.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TaskService } from '../../../services/task.service';
import { ProjectService } from '../../../services/project.service';
import { Task } from '../../../models/task.model';
import { Project } from '../../../models/project.model';
import { AdminTaskFormComponent } from '../task-form/admin-task-form.component';

@Component({
  selector: 'app-admin-task-list',
  templateUrl: './admin-task-list.component.html',
  styleUrls: ['./admin-task-list.component.scss']
})
export class AdminTaskListComponent implements OnInit {
  projectId?: number;
  project?: Project;
  loading = false;
  error = '';

  constructor(
    private taskService: TaskService,
    private projectService: ProjectService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // Check if we're viewing tasks for a specific project
    this.route.params.subscribe(params => {
      if (params['projectId']) {
        this.projectId = +params['projectId'];
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
    // Navigate to the task form route
    if (this.projectId) {
      this.router.navigate(['/admin/projects', this.projectId, 'tasks', 'add']);
    } else {
      this.router.navigate(['/admin/tasks/add']);
    }
  }

  onTaskUpdated(): void {
    // Refresh project details if needed
    if (this.projectId) {
      this.loadProjectDetails();
    }
  }

  backToProjects(): void {
    this.router.navigate(['/admin/projects']);
  }
}
