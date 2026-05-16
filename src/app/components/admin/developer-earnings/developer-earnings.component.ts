import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DashboardService } from '../../../services/dashboard.service';
import { DeveloperEarning } from '../../../models/dashboard.model';

@Component({
  selector: 'app-developer-earnings',
  templateUrl: './developer-earnings.component.html',
  styleUrls: ['./developer-earnings.component.scss']
})
export class DeveloperEarningsComponent implements OnInit {
  displayedColumns: string[] = ['developerName', 'totalEarnings', 'totalEarningsInPkr', 'ourShareInPkr', 'paidAmount', 'pendingAmount', 'completedProjects'];
  projectColumns: string[] = ['projectTitle', 'status', 'devPayment', 'devPaymentInPkr', 'ourShareInPkr', 'dollarRateWrtDev', 'dollarRate', 'devPaymentStatus'];

  dataSource = new MatTableDataSource<DeveloperEarning>([]);
  isLoading = false;
  totalEarnings = 0;          // completed projects only (USD)
  totalAllProjectsEarnings = 0; // all projects (USD)
  totalPaid = 0;
  totalPending = 0;
  totalEarningsPkr = 0;       // completed projects only (PKR)
  totalOurSharePkr = 0;       // completed projects only (PKR)
  allProjectsRevenue = 0;
  completedProjectsRevenue = 0;

  // Global rate override (admin can set a single rate for quick calculation)
  globalDollarRate = 0;
  globalDollarRateWrtDev = 0;
  showRateSettings = false;
  expandedDev: number | null = null;

  dateFilterForm!: FormGroup;
  rateForm!: FormGroup;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private dashboardService: DashboardService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.dateFilterForm = this.formBuilder.group({ startDate: [null], endDate: [null] });
    this.rateForm = this.formBuilder.group({ dollarRate: [280], dollarRateWrtDev: [275] });
    this.loadDeveloperEarnings();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadDeveloperEarnings() {
    this.isLoading = true;
    const { startDate, endDate } = this.dateFilterForm.value;
    this.dashboardService.getDeveloperEarnings(startDate, endDate).subscribe({
      next: (earnings) => {
        this.dataSource.data = earnings;
        this.calculateTotals(earnings);
        this.isLoading = false;
      },
      error: () => {
        this.snackBar.open('Failed to load developer earnings', 'Close', { duration: 5000 });
        this.isLoading = false;
      }
    });
  }

  calculateTotals(earnings: DeveloperEarning[]) {
    // Completed projects only for the top cards
    this.totalEarnings = earnings.reduce((s, d) => s + d.totalEarnings, 0);
    this.totalAllProjectsEarnings = earnings.reduce((s, d) => s + (d.allProjectsEarnings || 0), 0);
    this.totalPaid = earnings.reduce((s, d) => s + d.paidAmount, 0);
    this.totalPending = earnings.reduce((s, d) => s + d.pendingAmount, 0);
    this.totalEarningsPkr = earnings.reduce((s, d) => s + this.getDevPkr(d), 0);
    this.totalOurSharePkr = earnings.reduce((s, d) => s + this.getOurPkr(d), 0);
  }

  applyFilter() { this.loadDeveloperEarnings(); }
  resetFilter() { this.dateFilterForm.reset(); this.loadDeveloperEarnings(); }

  toggleRateSettings() { this.showRateSettings = !this.showRateSettings; }

  toggleExpand(devId: number) {
    this.expandedDev = this.expandedDev === devId ? null : devId;
  }

  getPaymentProgress(earning: DeveloperEarning): number {
    if (earning.totalEarnings === 0) return 0;
    return Math.min(100, Math.round((earning.paidAmount / earning.totalEarnings) * 100));
  }

  // If global rate set, use it; otherwise fall back to avg from projects
  getEffectiveDollarRate(): number {
    return this.rateForm.value.dollarRate || 0;
  }

  getEffectiveDollarRateWrtDev(): number {
    return this.rateForm.value.dollarRateWrtDev || 0;
  }

  // Dev PKR for top cards and summary table: completed projects only (use backend-calculated value)
  getDevPkr(earning: DeveloperEarning): number {
    if (earning.totalEarningsInPkr > 0) {
      return earning.totalEarningsInPkr;
    }
    if (earning.projects?.length) {
      return earning.projects
        .filter(p => p.status === 'Completed')
        .reduce((s, p) => s + this.getProjectDevPkr(p), 0);
    }
    return earning.totalEarnings * this.getEffectiveDollarRateWrtDev();
  }

  // Our PKR share for top cards and summary table: completed projects only (use backend-calculated value)
  getOurPkr(earning: DeveloperEarning): number {
    if (earning.ourShareInPkr > 0) {
      return earning.ourShareInPkr;
    }
    if (earning.projects?.length) {
      return earning.projects
        .filter(p => p.status === 'Completed')
        .reduce((s, p) => s + this.getProjectOurPkr(p), 0);
    }
    return 0;
  }

  // Dev PKR = devPayment × dollarRateWrtDev
  // e.g. $128 × 264.25 = 33,825 PKR
  getProjectDevPkr(p: any): number {
    const rate = p.dollarRateWrtDev > 0 ? p.dollarRateWrtDev : this.getEffectiveDollarRateWrtDev();
    return p.devPayment * rate;
  }

  // Our PKR = (paymentInDollarAfterDeduction × dollarRate) - devPKR
  // e.g. 640 × 280 - 33,825 = 145,375 PKR
  getProjectOurPkr(p: any): number {
    const adminRate = p.dollarRate > 0 ? p.dollarRate : this.getEffectiveDollarRate();
    const devPkr = this.getProjectDevPkr(p);
    return (p.paymentInDollarAfterDeduction + (p.tipAmount || 0)) * adminRate - devPkr;
  }
}
