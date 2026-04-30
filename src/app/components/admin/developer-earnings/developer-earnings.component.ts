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
  totalEarnings = 0;
  totalPaid = 0;
  totalPending = 0;
  totalEarningsPkr = 0;
  totalOurSharePkr = 0;

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
    this.totalEarnings = earnings.reduce((s, d) => s + d.totalEarnings, 0);
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

  // Dev's PKR earnings: use per-project rates when available, else fall back to global
  getDevPkr(earning: DeveloperEarning): number {
    if (earning.projects?.length) {
      const sumFromProjects = earning.projects.reduce((s, p) => {
        const rate = p.dollarRateWrtDev > 0 ? p.dollarRateWrtDev : this.getEffectiveDollarRateWrtDev();
        return s + p.devPayment * rate;
      }, 0);
      return sumFromProjects;
    }
    return earning.totalEarnings * this.getEffectiveDollarRateWrtDev();
  }

  // Our PKR share: PaymentWrtDevAfterDeduction × DollarRate (per project or global)
  getOurPkr(earning: DeveloperEarning): number {
    if (earning.projects?.length) {
      return earning.projects.reduce((s, p) => {
        const rate = p.dollarRate > 0 ? p.dollarRate : this.getEffectiveDollarRate();
        return s + p.paymentWrtDevAfterDeduction * rate;
      }, 0);
    }
    return 0;
  }

  getProjectDevPkr(p: any): number {
    const rate = p.dollarRateWrtDev > 0 ? p.dollarRateWrtDev : this.getEffectiveDollarRateWrtDev();
    return p.devPayment * rate;
  }

  getProjectOurPkr(p: any): number {
    const rate = p.dollarRate > 0 ? p.dollarRate : this.getEffectiveDollarRate();
    return p.paymentWrtDevAfterDeduction * rate;
  }
}
