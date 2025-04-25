// src/app/components/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { ProjectSummary, Project, ProjectStatus } from './../../../models/project.model';
import { ProjectService } from 'src/app/services/project.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  summary: ProjectSummary | null = null;
  recentProjects: Project[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(private projectService: ProjectService) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.error = null;

    // Get project summary
    this.projectService.getProjectSummary().subscribe({
      next: (data) => {
        this.summary = data;
        this.loadRecentProjects();
      },
      error: (err) => {
        this.error = 'Failed to load summary data';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  loadRecentProjects(): void {
    // Get recent projects
    this.projectService.getProjects().subscribe({
      next: (projects) => {
        // Sort by creation date descending and take the first 5
        this.recentProjects = projects
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load recent projects';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  getStatusClass(status: ProjectStatus): string {
    switch (status) {
      case ProjectStatus.Start:
        return 'badge bg-success';
      case ProjectStatus.Hold:
        return 'badge bg-warning';
      case ProjectStatus.Pending:
        return 'badge bg-info';
      case ProjectStatus.Revision:
        return 'badge bg-primary';
      case ProjectStatus.Cancel:
        return 'badge bg-danger';
      default:
        return 'badge bg-secondary';
    }
  }
}
