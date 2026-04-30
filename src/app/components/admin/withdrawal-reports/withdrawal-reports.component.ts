import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WithdrawalService } from '../../../services/withdrawal.service';
import { WithdrawalReport } from '../../../models/withdrawal-report.model';

@Component({
  selector: 'app-withdrawal-reports',
  templateUrl: './withdrawal-reports.component.html',
  styleUrls: ['./withdrawal-reports.component.scss']
})
export class WithdrawalReportsComponent implements OnInit {
  reports: WithdrawalReport[] = [];
  isLoading = false;
  expandedReport: number | null = null;
  searchForm!: FormGroup;

  projectColumns = ['projectTitle', 'developerName', 'status', 'paymentInDollarTotal',
    'paymentInDollarAfterDeduction', 'devPayment', 'devExpenseDeduction', 'netDevPayment', 'devPaymentInPkr', 'adminShareInPkr', 'devPaymentStatus'];
  expenseColumns = ['description', 'amount', 'devShare', 'adminShare', 'expenseDate', 'projectTitle'];

  constructor(
    private withdrawalService: WithdrawalService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.searchForm = this.fb.group({ search: [''], startDate: [null], endDate: [null] });
    this.loadReports();
  }

  loadReports() {
    this.isLoading = true;
    const { search, startDate, endDate } = this.searchForm.value;
    this.withdrawalService.getReports(search || undefined, startDate || undefined, endDate || undefined).subscribe({
      next: (data) => { this.reports = data; this.isLoading = false; },
      error: () => { this.snackBar.open('Failed to load reports', 'Close', { duration: 4000 }); this.isLoading = false; }
    });
  }

  applySearch() { this.loadReports(); }
  resetSearch() { this.searchForm.reset(); this.loadReports(); }

  toggleExpand(id: number) {
    this.expandedReport = this.expandedReport === id ? null : id;
  }

  getUnpaidProjects(report: WithdrawalReport): number {
    return report.projects?.filter(p => !p.devPaymentStatus).length || 0;
  }
}
