import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { WithdrawalService } from '../../../services/withdrawal.service';
import { ProjectService } from '../../../services/project.service';
import { UserService } from '../../../services/user.service';
import { DashboardService } from '../../../services/dashboard.service';
import { DevBalanceSummary, DevPaymentTransferCreate, FiverrDeposit, FiverrDepositCreate, AdminWithdrawal, AdminWithdrawalCreate } from '../../../models/withdrawal-report.model';
import { DeveloperEarning, DevProjectEarning } from '../../../models/dashboard.model';
import { Project } from '../../../models/project.model';
import { User } from '../../../models/user.model';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-dev-payments',
  templateUrl: './dev-payments.component.html',
  styleUrls: ['./dev-payments.component.scss']
})
export class DevPaymentsComponent implements OnInit {
  devBalances: DevBalanceSummary[] = [];
  deposits: FiverrDeposit[] = [];
  adminWithdrawals: AdminWithdrawal[] = [];
  projects: Project[] = [];
  developers: User[] = [];
  developerEarnings: DeveloperEarning[] = [];
  fiverrBalance = 0;
  isLoading = false;

  showPayForm = false;
  showDepositForm = false;
  showAdminWithdrawalForm = false;
  expandedDev: number | null = null;
  showProjectsTable = false;
  expandedEarningDev: number | null = null;

  // Global rates (can be edited inline)
  globalDollarRate = 280;
  globalDollarRateWrtDev = 275;

  payForm!: FormGroup;
  depositForm!: FormGroup;
  adminWithdrawalForm!: FormGroup;

  paymentMethods = ['Bank Transfer', 'Cash', 'EasyPaisa', 'JazzCash', 'Raast', 'Other'];

  constructor(
    private withdrawalService: WithdrawalService,
    private projectService: ProjectService,
    private userService: UserService,
    private dashboardService: DashboardService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.payForm = this.fb.group({
      developerId: [null, Validators.required],
      projectIds: [[], Validators.required],
      amountUsd: [{ value: 0, disabled: true }],
      amountPkr: [{ value: 0, disabled: true }],
      dollarRateUsed: [this.globalDollarRateWrtDev, Validators.required],
      transferDate: [new Date(), Validators.required],
      method: ['Bank Transfer'],
      notes: ['']
    });

    this.depositForm = this.fb.group({
      amount: [0, [Validators.required, Validators.min(0.01)]],
      depositDate: [new Date(), Validators.required],
      source: [''],
      notes: ['']
    });

    this.adminWithdrawalForm = this.fb.group({
      amount: [0, [Validators.required, Validators.min(0.01)]],
      amountPkr: [0],
      dollarRateUsed: [this.globalDollarRate],
      withdrawalDate: [new Date(), Validators.required],
      method: ['Bank Transfer'],
      notes: ['']
    });

    this.loadAll();

    // When developer changes, reset projects selection
    this.payForm.get('developerId')?.valueChanges.subscribe(() => {
      this.payForm.patchValue({ projectIds: [] }, { emitEvent: false });
      this.recalcPayAmount();
    });

    // When projects change, recalculate amount
    this.payForm.get('projectIds')?.valueChanges.subscribe(() => this.recalcPayAmount());
    this.payForm.get('dollarRateUsed')?.valueChanges.subscribe(() => this.recalcPayAmount());

    this.adminWithdrawalForm.get('amount')?.valueChanges.subscribe(() => this.calcAdminPkr());
    this.adminWithdrawalForm.get('dollarRateUsed')?.valueChanges.subscribe(() => this.calcAdminPkr());
  }

  loadAll() {
    this.isLoading = true;
    this.withdrawalService.getDevBalances().subscribe({
      next: d => { this.devBalances = d; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
    this.withdrawalService.getFiverrBalance().subscribe({ next: b => { this.fiverrBalance = b; } });
    this.withdrawalService.getDeposits().subscribe({ next: d => { this.deposits = d; } });
    this.withdrawalService.getAdminWithdrawals().subscribe({ next: a => { this.adminWithdrawals = a; } });
    this.projectService.getProjects(0, 200).subscribe({ next: r => { this.projects = r.items; } });
    this.userService.getDevelopers().subscribe({ next: d => { this.developers = d; } });
    this.dashboardService.getDeveloperEarnings(undefined, undefined).subscribe({
      next: earnings => { this.developerEarnings = earnings; }
    });
  }

  // ── Projects for selected developer ──────────────────────────────────────
  getDevProjects(): DevProjectEarning[] {
    const devId = this.payForm.get('developerId')?.value;
    if (!devId) return [];
    const earning = this.developerEarnings.find(e => e.developerId === devId);
    return earning?.projects || [];
  }

  // Recalculate USD and PKR based on selected projects
  recalcPayAmount() {
    const selectedIds: number[] = this.payForm.get('projectIds')?.value || [];
    const rate = this.payForm.get('dollarRateUsed')?.value || this.globalDollarRateWrtDev;
    const devProjects = this.getDevProjects();

    const totalUsd = selectedIds.reduce((sum, id) => {
      const proj = devProjects.find(p => p.projectId === id);
      return sum + (proj?.devPayment || 0);
    }, 0);

    this.payForm.patchValue(
      { amountUsd: Math.round(totalUsd * 100) / 100, amountPkr: Math.round(totalUsd * rate) },
      { emitEvent: false }
    );
  }

  calcAdminPkr() {
    const usd = this.adminWithdrawalForm.get('amount')?.value || 0;
    const rate = this.adminWithdrawalForm.get('dollarRateUsed')?.value || 0;
    this.adminWithdrawalForm.patchValue({ amountPkr: Math.round(usd * rate) }, { emitEvent: false });
  }

  submitPayment() {
    if (this.payForm.invalid) return;
    const v = this.payForm.getRawValue();
    const dto: DevPaymentTransferCreate = {
      developerId: v.developerId,
      projectId: v.projectIds?.length === 1 ? v.projectIds[0] : undefined,
      amountUsd: v.amountUsd,
      amountPkr: v.amountPkr,
      dollarRateUsed: v.dollarRateUsed,
      transferDate: v.transferDate,
      method: v.method,
      notes: v.notes
    };
    this.withdrawalService.createDevPayment(dto).subscribe({
      next: () => {
        this.snackBar.open('Payment recorded', 'Close', { duration: 3000 });
        this.showPayForm = false;
        this.payForm.reset({ transferDate: new Date(), method: 'Bank Transfer', dollarRateUsed: this.globalDollarRateWrtDev, projectIds: [] });
        this.loadAll();
      },
      error: () => this.snackBar.open('Failed to save payment', 'Close', { duration: 4000 })
    });
  }

  submitDeposit() {
    if (this.depositForm.invalid) return;
    const v = this.depositForm.value;
    const dto: FiverrDepositCreate = { amount: v.amount, depositDate: v.depositDate, source: v.source, notes: v.notes };
    this.withdrawalService.createDeposit(dto).subscribe({
      next: () => {
        this.snackBar.open('Deposit added to Fiverr balance', 'Close', { duration: 3000 });
        this.showDepositForm = false;
        this.depositForm.reset({ depositDate: new Date() });
        this.loadAll();
      },
      error: () => this.snackBar.open('Failed to save deposit', 'Close', { duration: 4000 })
    });
  }

  submitAdminWithdrawal() {
    if (this.adminWithdrawalForm.invalid) return;
    const v = this.adminWithdrawalForm.value;
    const dto: AdminWithdrawalCreate = {
      amount: v.amount, amountPkr: v.amountPkr, dollarRateUsed: v.dollarRateUsed,
      withdrawalDate: v.withdrawalDate, method: v.method, notes: v.notes
    };
    this.withdrawalService.createAdminWithdrawal(dto).subscribe({
      next: () => {
        this.snackBar.open('Admin withdrawal recorded', 'Close', { duration: 3000 });
        this.showAdminWithdrawalForm = false;
        this.adminWithdrawalForm.reset({ withdrawalDate: new Date(), method: 'Bank Transfer', dollarRateUsed: this.globalDollarRate });
        this.loadAll();
      },
      error: () => this.snackBar.open('Failed to save', 'Close', { duration: 4000 })
    });
  }

  deleteTransfer(id: number) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '380px',
      data: { title: 'Delete Transfer', message: 'Delete this payment transfer?', confirmText: 'Delete', cancelText: 'Cancel' }
    });
    ref.afterClosed().subscribe(ok => {
      if (ok) this.withdrawalService.deleteDevPayment(id).subscribe({ next: () => this.loadAll() });
    });
  }

  deleteDeposit(id: number) {
    this.withdrawalService.deleteDeposit(id).subscribe({ next: () => this.loadAll() });
  }

  deleteAdminWithdrawal(id: number) {
    this.withdrawalService.deleteAdminWithdrawal(id).subscribe({ next: () => this.loadAll() });
  }

  toggleDev(id: number) { this.expandedDev = this.expandedDev === id ? null : id; }
  toggleEarningDev(id: number) { this.expandedEarningDev = this.expandedEarningDev === id ? null : id; }

  // ── Summary Calculations ──────────────────────────────────────────────────
  getTotalOwed()   { return this.devBalances.reduce((s, d) => s + d.totalOwed, 0); }
  getTotalPaid()   { return this.devBalances.reduce((s, d) => s + d.totalPaid, 0); }
  getTotalBalance(){ return this.devBalances.reduce((s, d) => s + d.balance, 0); }
  getTotalDeposits(){ return this.deposits.reduce((s, d) => s + d.amount, 0); }
  getTotalAdminWithdrawn(){ return this.adminWithdrawals.reduce((s, a) => s + a.amount, 0); }

  // Our total earnings = sum of (paymentWrtDevAfterDeduction + tip) across all projects for all devs
  getTotalOurEarnings(): number {
    return this.developerEarnings.reduce((sum, dev) => {
      return sum + (dev.projects || []).reduce((s, p) => s + p.paymentWrtDevAfterDeduction + (p.tipAmount || 0), 0);
    }, 0);
  }

  getTotalOurEarningsPkr(): number {
    return this.developerEarnings.reduce((sum, dev) => {
      return sum + (dev.projects || []).reduce((s, p) => s + this.getProjectOurPkr(p), 0);
    }, 0);
  }

  getProjectOurShare(p: DevProjectEarning): number {
    return p.paymentInDollarAfterDeduction - p.devPayment + (p.tipAmount || 0);
  }

  // Dev PKR = devPayment × dollarRateWrtDev
  getProjectDevPkr(p: DevProjectEarning): number {
    const rate = p.dollarRateWrtDev > 0 ? p.dollarRateWrtDev : this.globalDollarRateWrtDev;
    return p.devPayment * rate;
  }

  // Our PKR = (paymentInDollarAfterDeduction × dollarRate) - devPKR
  getProjectOurPkr(p: DevProjectEarning): number {
    const adminRate = p.dollarRate > 0 ? p.dollarRate : this.globalDollarRate;
    const devPkr = this.getProjectDevPkr(p);
    return (p.paymentInDollarAfterDeduction + (p.tipAmount || 0)) * adminRate - devPkr;
  }
}
