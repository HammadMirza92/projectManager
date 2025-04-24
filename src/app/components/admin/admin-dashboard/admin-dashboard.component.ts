import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DashboardService } from '../../../services/dashboard.service';
import { AdminDashboard } from '../../../models/dashboard.model';
import { ProjectStatus } from '../../../models/project.model';
import { ThemePalette } from '@angular/material/core';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  dashboardData: AdminDashboard | null = null;
  isLoading = false;
  dateRange: FormGroup;

  developerColumns = ['developerName', 'completedProjects', 'totalEarnings', 'paidAmount', 'pendingAmount'];
  deadlineColumns = ['title', 'developerName', 'endDate', 'daysRemaining', 'status', 'actions'];

  constructor(
    private dashboardService: DashboardService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.dateRange = this.formBuilder.group({
      start: [null],
      end: [null]
    });
  }

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.isLoading = true;

    const startDate = this.dateRange.value.start;
    const endDate = this.dateRange.value.end;

    this.dashboardService.getAdminDashboard(startDate, endDate)
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

  resetDateFilter() {
    this.dateRange.reset();
    this.loadDashboardData();
  }

  calculateNetRevenue(): number {
    if (!this.dashboardData) return 0;
    return this.dashboardData.totalRevenue - this.dashboardData.totalPaidToDevelopers;
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
