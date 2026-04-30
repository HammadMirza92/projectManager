import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DashboardService } from '../../../services/dashboard.service';
import { AdminDashboard } from '../../../models/dashboard.model';
import { ProjectStatus } from '../../../models/project.model';
import { ThemePalette } from '@angular/material/core';

interface DonutSegment {
  label: string;
  count: number;
  color: string;
  dasharray: string;
  dashoffset: string;
  percent: number;
}

interface FinBar {
  label: string;
  value: number;
  percent: number;
  color: string;
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  dashboardData: AdminDashboard | null = null;
  isLoading = false;
  dateRange: FormGroup;
  donutSegments: DonutSegment[] = [];
  financialBars: FinBar[] = [];

  developerColumns = ['developerName', 'completedProjects', 'totalEarnings', 'paidAmount', 'pendingAmount'];
  deadlineColumns = ['title', 'developerName', 'endDate', 'daysRemaining', 'status', 'actions'];

  constructor(
    private dashboardService: DashboardService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.dateRange = this.formBuilder.group({ start: [null], end: [null] });
  }

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.isLoading = true;
    const { start, end } = this.dateRange.value;
    this.dashboardService.getAdminDashboard(start, end).subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.isLoading = false;
        this.computeCharts();
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Failed to load dashboard data', 'Close', { duration: 5000 });
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

  computeCharts() {
    if (!this.dashboardData) return;
    this.computeDonut();
    this.computeFinancialBars();
  }

  private computeDonut() {
    const d = this.dashboardData!;
    const total = d.totalProjects || 1;
    const C = 376.99; // 2π × 60

    const items = [
      { label: 'Completed', count: d.completedProjects, color: '#16a34a' },
      { label: 'Active',     count: d.activeProjects,   color: '#2563eb' },
      { label: 'Delayed',    count: d.delayedProjects,  color: '#f59e0b' },
    ];
    const other = Math.max(0, d.totalProjects - items.reduce((s, i) => s + i.count, 0));
    if (other > 0) items.push({ label: 'Other', count: other, color: '#94a3b8' });

    let offset = 0;
    this.donutSegments = items
      .filter(i => i.count > 0)
      .map(item => {
        const length = (item.count / total) * C;
        const seg: DonutSegment = {
          ...item,
          dasharray: `${length.toFixed(2)} ${C.toFixed(2)}`,
          dashoffset: `${(-offset).toFixed(2)}`,
          percent: Math.round((item.count / total) * 100)
        };
        offset += length;
        return seg;
      });
  }

  private computeFinancialBars() {
    const d = this.dashboardData!;
    const max = Math.max(d.totalRevenue, 1);
    this.financialBars = [
      { label: 'Total Revenue',     value: d.totalRevenue,            percent: 100,                            color: '#16a34a' },
      { label: 'Paid to Devs',      value: d.totalPaidToDevelopers,   percent: (d.totalPaidToDevelopers / max) * 100,  color: '#2563eb' },
      { label: 'Pending Payments',  value: d.pendingPayments,         percent: (d.pendingPayments / max) * 100,        color: '#f59e0b' },
      { label: 'Net Revenue',       value: this.calculateNetRevenue(), percent: (this.calculateNetRevenue() / max) * 100, color: '#8b5cf6' },
    ];
  }

  getStatusBadgeClass(status: ProjectStatus): string {
    const map: Record<string, string> = {
      [ProjectStatus.Completed]: 'status-completed',
      [ProjectStatus.Started]:   'status-started',
      [ProjectStatus.Pending]:   'status-pending',
      [ProjectStatus.Hold]:      'status-hold',
      [ProjectStatus.Revision]:  'status-revision',
      [ProjectStatus.Cancelled]: 'status-cancelled'
    };
    return map[status] ?? '';
  }

  getDaysRemainingClass(days: number): string {
    if (days <= 0) return 'days-overdue';
    if (days <= 3) return 'days-critical';
    if (days <= 7) return 'days-warning';
    return '';
  }
}
