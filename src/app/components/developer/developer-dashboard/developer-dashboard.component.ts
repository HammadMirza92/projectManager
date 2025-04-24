import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DashboardService } from '../../../services/dashboard.service';
import { AuthService } from '../../../services/auth.service';
import { DeveloperDashboard } from '../../../models/dashboard.model';
import { ProjectStatus } from '../../../models/project.model';
import { ThemePalette } from '@angular/material/core';

@Component({
  selector: 'app-developer-dashboard',
  templateUrl: './developer-dashboard.component.html',
  styleUrls: ['./developer-dashboard.component.scss']
})
export class DeveloperDashboardComponent implements OnInit {
  dashboardData: DeveloperDashboard | null = null;
  isLoading = false;

  deadlineColumns = ['title', 'endDate', 'daysRemaining', 'status', 'actions'];
  projectColumns = ['title', 'clientName', 'startDate', 'endDate', 'developerAmount', 'status', 'actions'];

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
      this.dashboardService.getDeveloperDashboard(currentUser.id)
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
}
