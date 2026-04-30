import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { WithdrawalService } from '../../../services/withdrawal.service';
import { ProjectService } from '../../../services/project.service';
import { ExpenseService } from '../../../services/expense.service';
import { Withdrawal, WithdrawalCreate } from '../../../models/withdrawal.model';
import { Expense } from '../../../models/expense.model';
import { Project } from '../../../models/project.model';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-withdrawals',
  templateUrl: './withdrawals.component.html',
  styleUrls: ['./withdrawals.component.scss']
})
export class WithdrawalsComponent implements OnInit {
  withdrawals: Withdrawal[] = [];
  filteredWithdrawals: Withdrawal[] = [];
  projects: Project[] = [];
  expenses: Expense[] = [];
  fiverrBalance = 0;
  totalExpenses = 0;
  isLoading = false;
  showForm = false;
  showExpenseDialog = false;
  expandedWithdrawal: number | null = null;

  withdrawalForm!: FormGroup;
  filterForm!: FormGroup;
  expenseForm!: FormGroup;

  displayedColumns = ['date', 'amount', 'fiverrFee', 'netAmount', 'projectCount', 'notes', 'actions'];

  constructor(
    private withdrawalService: WithdrawalService,
    private projectService: ProjectService,
    private expenseService: ExpenseService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.filterForm = this.formBuilder.group({ startDate: [null], endDate: [null] });
    this.withdrawalForm = this.formBuilder.group({
      amount: [0, [Validators.required, Validators.min(0.01)]],
      fiverrFee: [3, [Validators.required, Validators.min(0)]],
      withdrawalDate: [new Date(), Validators.required],
      notes: [''],
      projectIds: [[], Validators.required]
    });
    this.expenseForm = this.formBuilder.group({
      description: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      expenseDate: [new Date(), Validators.required],
      projectId: [null],
      notes: ['']
    });
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    const { startDate, endDate } = this.filterForm.value;
    this.withdrawalService.getWithdrawals(startDate || undefined, endDate || undefined).subscribe({
      next: (data) => { this.withdrawals = data; this.filteredWithdrawals = data; this.isLoading = false; },
      error: () => { this.snackBar.open('Failed to load withdrawals', 'Close', { duration: 4000 }); this.isLoading = false; }
    });
    this.withdrawalService.getFiverrBalance().subscribe({ next: b => { this.fiverrBalance = b; } });
    this.projectService.getProjects(0, 200).subscribe({ next: r => { this.projects = r.items; } });
    this.expenseService.getExpenses().subscribe({
      next: (data) => { this.expenses = data; this.totalExpenses = data.reduce((s, e) => s + e.amount, 0); }
    });
  }

  submitExpense() {
    if (this.expenseForm.invalid) return;
    const v = this.expenseForm.value;
    this.expenseService.createExpense({
      description: v.description, amount: v.amount,
      expenseDate: v.expenseDate, projectId: v.projectId || undefined, notes: v.notes
    }).subscribe({
      next: () => {
        this.snackBar.open('Expense added', 'Close', { duration: 3000 });
        this.showExpenseDialog = false;
        this.expenseForm.reset({ expenseDate: new Date() });
        this.loadData();
      },
      error: () => this.snackBar.open('Failed to save expense', 'Close', { duration: 4000 })
    });
  }

  deleteExpense(id: number) {
    this.expenseService.deleteExpense(id).subscribe({ next: () => this.loadData() });
  }

  applyFilter() { this.loadData(); }
  resetFilter() { this.filterForm.reset(); this.loadData(); }

  toggleForm() { this.showForm = !this.showForm; }

  toggleExpand(id: number) {
    this.expandedWithdrawal = this.expandedWithdrawal === id ? null : id;
  }

  submitWithdrawal() {
    if (this.withdrawalForm.invalid) return;
    const v = this.withdrawalForm.value;
    const selectedIds: number[] = v.projectIds || [];
    const payload: WithdrawalCreate = {
      amount: v.amount,
      fiverrFee: v.fiverrFee,
      withdrawalDate: v.withdrawalDate,
      notes: v.notes,
      projects: selectedIds.map(pid => ({ projectId: pid, amount: v.amount / (selectedIds.length || 1) }))
    };
    this.withdrawalService.createWithdrawal(payload).subscribe({
      next: () => {
        this.snackBar.open('Withdrawal recorded', 'Close', { duration: 3000 });
        this.showForm = false;
        this.withdrawalForm.reset({ fiverrFee: 3, withdrawalDate: new Date(), projectIds: [] });
        this.loadData();
      },
      error: () => this.snackBar.open('Failed to save withdrawal', 'Close', { duration: 4000 })
    });
  }

  deleteWithdrawal(id: number) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '380px',
      data: { title: 'Delete Withdrawal', message: 'Are you sure you want to delete this withdrawal?', confirmText: 'Delete', cancelText: 'Cancel' }
    });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.withdrawalService.deleteWithdrawal(id).subscribe({
          next: () => { this.snackBar.open('Deleted', 'Close', { duration: 3000 }); this.loadData(); },
          error: () => this.snackBar.open('Failed to delete', 'Close', { duration: 4000 })
        });
      }
    });
  }

  getNetAmount(): number {
    const amount = this.withdrawalForm.get('amount')?.value || 0;
    const fee = this.withdrawalForm.get('fiverrFee')?.value || 0;
    return amount - fee;
  }

  getTotalWithdrawn(): number {
    return this.filteredWithdrawals.reduce((s, w) => s + w.amount, 0);
  }

  getTotalFees(): number {
    return this.filteredWithdrawals.reduce((s, w) => s + w.fiverrFee, 0);
  }

  getTotalNet(): number {
    return this.filteredWithdrawals.reduce((s, w) => s + w.netAmount, 0);
  }

  // Projects that are completed but not yet linked to any withdrawal
  getUnwithdrawProjects(): Project[] {
    const linkedIds = new Set<number>();
    this.withdrawals.forEach(w => w.projects?.forEach(p => linkedIds.add(p.projectId)));
    return this.projects.filter(p => !linkedIds.has(p.id) && (p as any).paymentInDollarAfterDeduction > 0);
  }
}
