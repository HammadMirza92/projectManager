import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DashboardService } from '../../../services/dashboard.service';
import { AuthService } from '../../../services/auth.service';
import { ClientDashboard } from '../../../models/dashboard.model';
import { ProjectStatus } from '../../../models/project.model';
import { TaskStatus } from '../../../models/task.model';
import { ThemePalette } from '@angular/material/core';

@Component({
  selector: 'app-client-dashboard',
  templateUrl: './client-dashboard.component.html',
  styleUrls: ['./client-dashboard.component.scss']
})
export class ClientDashboardComponent implements OnInit {
  dashboardData: ClientDashboard | null = null;
  isLoading = false;

  projectColumns = ['title', 'developerName', 'startDate', 'endDate', 'totalBudget', 'status', 'actions'];
  taskColumns = ['title', 'projectTitle', 'assignedToName', 'dueDate', 'status'];

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.isLoading = true;

    const currentUser = this.authService.currentUserValue;
    if (currentUser) {
      this.dashboardService.getClientDashboard(currentUser.id)
        .subscribe({
          next: (data) => {
            this.dashboardData = data;
            this.isLoading = false;
          },
          error: (error) => {
            this.isLoading = false;
            this.snackBar.open('Failed to load dashboard data', 'Close', {
              duration: 5000
            });
            console.error('Error loading dashboard data:', error);
          }
        });
    }
  }

  getStatusColor(status: ProjectStatus): ThemePalette {
    switch (status) {
      case ProjectStatus.Started:
        return 'primary';
      case ProjectStatus.Completed:
        return 'accent';
      case ProjectStatus.Pending:
        return 'warn';
      case ProjectStatus.Hold:
        return 'warn';
      case ProjectStatus.Revision:
        return 'warn';
      case ProjectStatus.Cancelled:
        return 'warn';
      default:
        return 'primary';
    }
  }

  getTaskStatusColor(status: TaskStatus): ThemePalette {
    switch (status) {
      case TaskStatus.ToDo:
        return 'primary';
      case TaskStatus.InProgress:
        return 'accent';
      case TaskStatus.Done:
        return 'primary';
      case TaskStatus.Blocked:
        return 'warn';
      default:
        return 'primary';
    }
  }
}
