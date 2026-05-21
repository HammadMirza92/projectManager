import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { KhataService } from '../../../services/khata.service';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import {
  KhataEntry, KhataEntryCreate, KhataExpense, KhataExpenseCreate,
  KhataDashboard, MonthlyExpenseSummary,
  KhataPaymentType, KhataPaymentStatus, KhataExpenseCategory, KhataPaymentFrequency,
  KhataIncome, KhataIncomeCreate, KhataIncomeCategory
} from '../../../models/khata.model';

@Component({
  selector: 'app-khata',
  templateUrl: './khata.component.html',
  styleUrls: ['./khata.component.scss']
})
export class KhataComponent implements OnInit {
  activeTab = 0;

  // Dashboard
  dashboard: KhataDashboard | null = null;
  dashboardLoading = false;

  // Entries
  entries: KhataEntry[] = [];
  entriesLoading = false;
  entryFilterForm!: FormGroup;
  entryForm!: FormGroup;
  showEntryForm = false;
  editingEntry: KhataEntry | null = null;
  payForm!: FormGroup;
  payingEntry: KhataEntry | null = null;
  reminderSending: Record<number, boolean> = {};

  // Expenses
  khataExpenses: KhataExpense[] = [];
  expensesLoading = false;
  showCalendar = false;
  calendarDays: Array<{ date: Date | null; expenses: KhataExpense[] }> = [];
  selectedCalendarDate: Date | null = null;
  calendarExpenses: KhataExpense[] = [];
  showOutstanding = true;
  payingOccurrence: { expense: KhataExpense } | null = null;
  calendarMonth: number = new Date().getMonth() + 1;
  calendarYear: number = new Date().getFullYear();
  calendarExpensePool: KhataExpense[] = [];
  calendarLoading = false;
  calendarYears: number[] = Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 2 + i);

  // Income
  incomes: KhataIncome[] = [];
  incomesLoading = false;
  incomeForm!: FormGroup;
  showIncomeForm = false;
  editingIncome: KhataIncome | null = null;
  incomeFilterForm!: FormGroup;
  incomeCategories: KhataIncomeCategory[] = ['Salary', 'Freelance', 'RentalIncome', 'BusinessProfit', 'Investment', 'SideProject', 'Other'];
  incomeDisplayedColumns = ['title', 'category', 'amount', 'frequency', 'startDate', 'monthly', 'actions'];

  // History
  historyEntries: KhataEntry[] = [];
  historyExpenses: KhataExpense[] = [];
  historyLoading = false;
  historyEntryType: string = '';
  historySearch: string = '';
  historyExpenseCategory: string = '';
  historyExpenseSearch: string = '';
  historyTab = 0;
  expenseFilterForm!: FormGroup;
  expenseForm!: FormGroup;
  showExpenseForm = false;
  editingExpense: KhataExpense | null = null;
  expenseSummary: MonthlyExpenseSummary[] = [];

  paymentTypes: KhataPaymentType[] = ['Receivable', 'Payable'];
  paymentStatuses: KhataPaymentStatus[] = ['Pending', 'Paid', 'Overdue', 'Cancelled'];
  frequencies: KhataPaymentFrequency[] = ['OneTime', 'Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly'];
  expenseCategories: KhataExpenseCategory[] = [
    'Rent', 'Salary', 'Utilities', 'Internet', 'Software',
    'Hardware', 'Marketing', 'Office', 'Travel', 'Miscellaneous' , 'Home'
  ];

  months = [
    { value: 1, label: 'January' }, { value: 2, label: 'February' },
    { value: 3, label: 'March' }, { value: 4, label: 'April' },
    { value: 5, label: 'May' }, { value: 6, label: 'June' },
    { value: 7, label: 'July' }, { value: 8, label: 'August' },
    { value: 9, label: 'September' }, { value: 10, label: 'October' },
    { value: 11, label: 'November' }, { value: 12, label: 'December' }
  ];

  currentYear = new Date().getFullYear();
  currentMonth = new Date().getMonth() + 1;
  years = [this.currentYear - 2, this.currentYear - 1, this.currentYear, this.currentYear + 1];

  entryDisplayedColumns = ['party', 'type', 'amount', 'remaining', 'dueDate', 'source', 'status', 'actions'];
  expenseDisplayedColumns = ['title', 'category', 'amount', 'date', 'recurring', 'actions'];

  constructor(
    private khataService: KhataService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.loadDashboard();
    this.loadEntries();
    this.loadExpenses();
    this.loadExpenseSummary();
    this.loadIncomes();
  }

  initForms(): void {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    this.entryFilterForm = this.fb.group({
      type: [null],
      status: [null],
      month: [null],
      year: [null],
      search: ['']
    });

    this.entryForm = this.fb.group({
      partyName: ['', Validators.required],
      partyEmail: ['', Validators.email],
      partyPhone: [''],
      type: ['Receivable', Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      dueDate: [now, Validators.required],
      paymentSource: [''],
      description: [''],
      notes: [''],
      isRecurring: [false],
      frequency: ['Monthly'],
      neverEnds: [true],
      recurringEndDate: [null]
    });

    this.payForm = this.fb.group({
      amount: [null, [Validators.required, Validators.min(0.01)]]
    });

    this.expenseFilterForm = this.fb.group({
      month: [null],
      year: [null],
      category: [null],
      search: ['']
    });

    this.expenseForm = this.fb.group({
      title: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      category: ['Home', Validators.required],
      expenseDate: [now, Validators.required],
      description: [''],
      notes: [''],
      isRecurring: [false],
      frequency: ['Monthly'],
      neverEnds: [true],
      recurringEndDate: [null]
    });

    this.incomeFilterForm = this.fb.group({
      month: [now.getMonth() + 1],
      year: [now.getFullYear()]
    });

    this.incomeForm = this.fb.group({
      title: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      category: ['Salary', Validators.required],
      startDate: [now, Validators.required],
      isRecurring: [true],
      frequency: ['Monthly', Validators.required],
      neverEnds: [true],
      recurringEndDate: [null],
      description: [''],
      notes: ['']
    });
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────

  loadDashboard(): void {
    this.dashboardLoading = true;
    this.khataService.getDashboard().subscribe({
      next: d => { this.dashboard = d; this.dashboardLoading = false; },
      error: () => { this.snackBar.open('Failed to load dashboard', 'Close', { duration: 4000 }); this.dashboardLoading = false; }
    });
  }

  // ── Entries ───────────────────────────────────────────────────────────────

  loadEntries(): void {
    this.entriesLoading = true;
    const f = this.entryFilterForm.value;
    this.khataService.getEntries({
      type: f.type || undefined,
      status: f.status || undefined,
      month: f.month || undefined,
      year: f.year || undefined,
      search: f.search || undefined
    }).subscribe({
      next: d => { this.entries = d; this.entriesLoading = false; },
      error: () => { this.snackBar.open('Failed to load entries', 'Close', { duration: 4000 }); this.entriesLoading = false; }
    });
  }

  applyEntryFilter(): void { this.loadEntries(); }

  resetEntryFilter(): void {
    this.entryFilterForm.reset();
    this.loadEntries();
  }

  openEntryForm(entry?: KhataEntry): void {
    this.editingEntry = entry || null;
    if (entry) {
      this.entryForm.patchValue({
        partyName: entry.partyName,
        partyEmail: entry.partyEmail || '',
        partyPhone: entry.partyPhone || '',
        type: entry.type,
        amount: entry.amount,
        dueDate: new Date(entry.dueDate),
        paymentSource: entry.paymentSource || '',
        description: entry.description || '',
        notes: entry.notes || '',
        isRecurring: entry.isRecurring,
        frequency: entry.frequency || 'Monthly',
        recurringEndDate: entry.recurringEndDate ? new Date(entry.recurringEndDate) : null
      });
    } else {
      this.entryForm.reset({ type: 'Receivable', isRecurring: false, frequency: 'Monthly', neverEnds: true, dueDate: new Date() });
    }
    this.showEntryForm = true;
  }

  closeEntryForm(): void { this.showEntryForm = false; this.editingEntry = null; }

  saveEntry(): void {
    if (this.entryForm.invalid) return;
    const v = this.entryForm.value;
    const dueDate = v.dueDate instanceof Date ? v.dueDate.toISOString() : v.dueDate;
    const rawEnd = v.neverEnds ? null : v.recurringEndDate;
    const recurringEndDate = rawEnd instanceof Date ? rawEnd.toISOString() : rawEnd;

    if (this.editingEntry) {
      this.khataService.updateEntry(this.editingEntry.id, {
        partyName: v.partyName, partyEmail: v.partyEmail, partyPhone: v.partyPhone,
        amount: v.amount, dueDate, paymentSource: v.paymentSource,
        description: v.description, notes: v.notes,
        isRecurring: v.isRecurring, frequency: v.frequency, recurringEndDate
      }).subscribe({
        next: () => { this.snackBar.open('Entry updated', 'Close', { duration: 3000 }); this.closeEntryForm(); this.loadEntries(); this.loadDashboard(); },
        error: () => this.snackBar.open('Failed to update entry', 'Close', { duration: 4000 })
      });
    } else {
      const payload: KhataEntryCreate = {
        partyName: v.partyName, partyEmail: v.partyEmail, partyPhone: v.partyPhone,
        type: v.type, amount: v.amount, dueDate,
        paymentSource: v.paymentSource, description: v.description, notes: v.notes,
        isRecurring: v.isRecurring, frequency: v.frequency, recurringEndDate
      };
      this.khataService.createEntry(payload).subscribe({
        next: () => { this.snackBar.open('Entry created', 'Close', { duration: 3000 }); this.closeEntryForm(); this.loadEntries(); this.loadDashboard(); },
        error: () => this.snackBar.open('Failed to create entry', 'Close', { duration: 4000 })
      });
    }
  }

  deleteEntry(entry: KhataEntry): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '380px',
      data: { title: 'Delete Entry', message: `Delete "${entry.partyName}"? This will also remove all recurring children.`, confirmText: 'Delete', cancelText: 'Cancel' }
    });
    ref.afterClosed().subscribe(ok => {
      if (!ok) return;
      this.khataService.deleteEntry(entry.id).subscribe({
        next: () => { this.snackBar.open('Deleted', 'Close', { duration: 3000 }); this.loadEntries(); this.loadDashboard(); },
        error: () => this.snackBar.open('Failed to delete', 'Close', { duration: 4000 })
      });
    });
  }

  openPayDialog(entry: KhataEntry): void {
    this.payingEntry = entry;
    this.payForm.reset({ amount: entry.remainingAmount });
  }

  closePayDialog(): void { this.payingEntry = null; }

  submitPayment(): void {
    if (this.payForm.invalid || !this.payingEntry) return;
    this.khataService.payEntry(this.payingEntry.id, this.payForm.value.amount).subscribe({
      next: () => { this.snackBar.open('Payment recorded', 'Close', { duration: 3000 }); this.closePayDialog(); this.loadEntries(); this.loadDashboard(); },
      error: () => this.snackBar.open('Failed to record payment', 'Close', { duration: 4000 })
    });
  }

  sendReminder(entry: KhataEntry): void {
    if (!entry.partyEmail) { this.snackBar.open('No email address on file', 'Close', { duration: 4000 }); return; }
    this.reminderSending[entry.id] = true;
    this.khataService.sendReminder(entry.id).subscribe({
      next: () => { this.snackBar.open('Reminder sent', 'Close', { duration: 3000 }); this.reminderSending[entry.id] = false; this.loadEntries(); },
      error: () => { this.snackBar.open('Failed to send reminder', 'Close', { duration: 4000 }); this.reminderSending[entry.id] = false; }
    });
  }

  // ── Expenses ──────────────────────────────────────────────────────────────

  loadExpenses(): void {
    this.expensesLoading = true;
    const f = this.expenseFilterForm.value;
    const month = f.month || undefined;
    const year = f.year || undefined;
    this.khataService.getExpenses({
      month,
      year,
      category: f.category || undefined,
      search: f.search || undefined,
      includeOutstanding: this.showOutstanding && !!(month && year)
    }).subscribe({
      next: d => {
        this.khataExpenses = d;
        this.expensesLoading = false;
        this.buildCalendar();
      },
      error: () => { this.snackBar.open('Failed to load expenses', 'Close', { duration: 4000 }); this.expensesLoading = false; }
    });
  }

  buildCalendar(): void {
    const month = this.calendarMonth;
    const year = this.calendarYear;
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const startPad = firstDay.getDay();
    this.calendarDays = [];
    this.selectedCalendarDate = null;
    this.calendarExpenses = [];

    for (let i = 0; i < startPad; i++) this.calendarDays.push({ date: null, expenses: [] });

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month - 1, d);
      const expenses = this.calendarExpensePool.filter(e => {
        const ed = new Date(e.expenseDate);
        return ed.getDate() === d && ed.getMonth() === month - 1 && ed.getFullYear() === year;
      });
      this.calendarDays.push({ date, expenses });
    }
  }

  loadCalendarExpenses(): void {
    this.calendarLoading = true;
    this.khataService.getExpenses({
      month: this.calendarMonth,
      year: this.calendarYear,
      includeOutstanding: this.showOutstanding,
      showFuture: true
    }).subscribe({
      next: d => {
        this.calendarExpensePool = d;
        this.calendarLoading = false;
        this.buildCalendar();
      },
      error: () => { this.calendarLoading = false; }
    });
  }

  calendarPrevMonth(): void {
    if (this.calendarMonth === 1) { this.calendarMonth = 12; this.calendarYear--; }
    else this.calendarMonth--;
    this.loadCalendarExpenses();
  }

  calendarNextMonth(): void {
    if (this.calendarMonth === 12) { this.calendarMonth = 1; this.calendarYear++; }
    else this.calendarMonth++;
    this.loadCalendarExpenses();
  }

  calendarGoToMonth(month: number, year: number): void {
    this.calendarMonth = month;
    this.calendarYear = year;
    this.loadCalendarExpenses();
  }

  get calendarMonthLabel(): string {
    return new Date(this.calendarYear, this.calendarMonth - 1, 1)
      .toLocaleString('default', { month: 'long' });
  }

  selectCalendarDay(day: { date: Date | null; expenses: KhataExpense[] }): void {
    if (!day.date) return;
    this.selectedCalendarDate = day.date;
    this.calendarExpenses = day.expenses;
  }

  payOccurrence(expense: KhataExpense): void {
    this.khataService.payExpenseOccurrence(expense.id, expense.expenseDate).subscribe({
      next: () => {
        this.snackBar.open('Expense marked as paid', 'Close', { duration: 3000 });
        this.loadExpenses();
        this.loadCalendarExpenses();
        this.loadDashboard();
      },
      error: () => this.snackBar.open('Failed to mark as paid', 'Close', { duration: 4000 })
    });
  }

  ignoreOccurrence(expense: KhataExpense): void {
    this.khataService.ignoreExpenseOccurrence(expense.id, expense.expenseDate).subscribe({
      next: () => {
        this.snackBar.open('Expense ignored', 'Close', { duration: 3000 });
        this.loadExpenses();
        this.loadCalendarExpenses();
      },
      error: () => this.snackBar.open('Failed to ignore expense', 'Close', { duration: 4000 })
    });
  }

  getExpenseStatusClass(expense: KhataExpense): string {
    if (expense.isPaid) return 'expense-paid';
    if (expense.isIgnored) return 'expense-ignored';
    if (this.isOverdueExpense(expense)) return 'expense-overdue';
    return '';
  }

  getDayTotal(expenses: KhataExpense[]): number {
    return expenses.filter(e => !e.isIgnored).reduce((s, e) => s + e.amount, 0);
  }

  isToday(date: Date): boolean {
    const t = new Date();
    return date.getDate() === t.getDate() && date.getMonth() === t.getMonth() && date.getFullYear() === t.getFullYear();
  }

  isOverdueExpense(expense: KhataExpense): boolean {
    return new Date(expense.expenseDate) < new Date() && !expense.isPaid && !expense.isIgnored;
  }

  isOutstandingExpense(expense: KhataExpense): boolean {
    const f = this.expenseFilterForm.value;
    const month: number = f.month || new Date().getMonth() + 1;
    const year: number = f.year || new Date().getFullYear();
    const ed = new Date(expense.expenseDate);
    return ed.getMonth() + 1 !== month || ed.getFullYear() !== year;
  }

  toggleCalendar(): void {
    this.showCalendar = !this.showCalendar;
    if (this.showCalendar) {
      const f = this.expenseFilterForm.value;
      this.calendarMonth = f.month || new Date().getMonth() + 1;
      this.calendarYear = f.year || new Date().getFullYear();
      this.loadCalendarExpenses();
    }
  }

  loadExpenseSummary(): void {
    this.khataService.getExpenseSummary().subscribe({
      next: d => this.expenseSummary = d,
      error: () => {}
    });
  }

  applyExpenseFilter(): void { this.loadExpenses(); }

  resetExpenseFilter(): void { this.expenseFilterForm.reset(); this.loadExpenses(); }

  openExpenseForm(expense?: KhataExpense): void {
    this.editingExpense = expense || null;
    if (expense) {
      this.expenseForm.patchValue({
        title: expense.title,
        amount: expense.amount,
        category: expense.category,
        expenseDate: new Date(expense.expenseDate),
        description: expense.description || '',
        notes: expense.notes || '',
        isRecurring: expense.isRecurring,
        frequency: expense.frequency || 'Monthly'
      });
    } else {
      this.expenseForm.reset({ category: 'Home', isRecurring: false, frequency: 'Monthly', neverEnds: true, expenseDate: new Date() });
    }
    this.showExpenseForm = true;
  }

  closeExpenseForm(): void { this.showExpenseForm = false; this.editingExpense = null; }

  saveExpense(): void {
    if (this.expenseForm.invalid) return;
    const v = this.expenseForm.value;
    const expenseDate = v.expenseDate instanceof Date ? v.expenseDate.toISOString() : v.expenseDate;
    const rawEnd = v.neverEnds ? null : v.recurringEndDate;
    const recurringEndDate = rawEnd instanceof Date ? rawEnd.toISOString() : rawEnd;

    if (this.editingExpense) {
      this.khataService.updateExpense(this.editingExpense.id, {
        title: v.title, amount: v.amount, category: v.category,
        expenseDate, description: v.description, notes: v.notes
      }).subscribe({
        next: () => { this.snackBar.open('Expense updated', 'Close', { duration: 3000 }); this.closeExpenseForm(); this.loadExpenses(); this.loadExpenseSummary(); this.loadDashboard(); },
        error: () => this.snackBar.open('Failed to update expense', 'Close', { duration: 4000 })
      });
    } else {
      const payload: KhataExpenseCreate = {
        title: v.title, amount: v.amount, category: v.category,
        expenseDate, description: v.description, notes: v.notes,
        isRecurring: v.isRecurring, frequency: v.frequency
      };
      this.khataService.createExpense(payload).subscribe({
        next: () => { this.snackBar.open('Expense added', 'Close', { duration: 3000 }); this.closeExpenseForm(); this.loadExpenses(); this.loadExpenseSummary(); this.loadDashboard(); },
        error: () => this.snackBar.open('Failed to add expense', 'Close', { duration: 4000 })
      });
    }
  }

  deleteExpense(expense: KhataExpense): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '380px',
      data: { title: 'Delete Expense', message: `Delete "${expense.title}"? Recurring children will also be removed.`, confirmText: 'Delete', cancelText: 'Cancel' }
    });
    ref.afterClosed().subscribe(ok => {
      if (!ok) return;
      this.khataService.deleteExpense(expense.id).subscribe({
        next: () => { this.snackBar.open('Deleted', 'Close', { duration: 3000 }); this.loadExpenses(); this.loadExpenseSummary(); this.loadDashboard(); },
        error: () => this.snackBar.open('Failed to delete', 'Close', { duration: 4000 })
      });
    });
  }

  // ── Income ────────────────────────────────────────────────────────────────

  loadIncomes(): void {
    this.incomesLoading = true;
    const f = this.incomeFilterForm.value;
    this.khataService.getIncomes({ month: f.month || undefined, year: f.year || undefined }).subscribe({
      next: d => { this.incomes = d; this.incomesLoading = false; },
      error: () => { this.snackBar.open('Failed to load incomes', 'Close', { duration: 4000 }); this.incomesLoading = false; }
    });
  }

  applyIncomeFilter(): void { this.loadIncomes(); }
  resetIncomeFilter(): void { this.incomeFilterForm.reset({ month: new Date().getMonth() + 1, year: new Date().getFullYear() }); this.loadIncomes(); }

  openIncomeForm(income?: KhataIncome): void {
    this.editingIncome = income || null;
    if (income) {
      this.incomeForm.patchValue({
        title: income.title,
        amount: income.amount,
        category: income.category,
        startDate: new Date(income.startDate),
        isRecurring: income.isRecurring,
        frequency: income.frequency,
        neverEnds: !income.recurringEndDate,
        recurringEndDate: income.recurringEndDate ? new Date(income.recurringEndDate) : null,
        description: income.description || '',
        notes: income.notes || ''
      });
    } else {
      this.incomeForm.reset({ category: 'Salary', isRecurring: true, frequency: 'Monthly', neverEnds: true, startDate: new Date() });
    }
    this.showIncomeForm = true;
  }

  closeIncomeForm(): void { this.showIncomeForm = false; this.editingIncome = null; }

  saveIncome(): void {
    if (this.incomeForm.invalid) return;
    const v = this.incomeForm.value;
    const startDate = v.startDate instanceof Date ? v.startDate.toISOString() : v.startDate;
    const rawEnd = v.neverEnds ? null : v.recurringEndDate;
    const recurringEndDate = rawEnd instanceof Date ? rawEnd.toISOString() : rawEnd;

    if (this.editingIncome) {
      this.khataService.updateIncome(this.editingIncome.id, {
        title: v.title, amount: v.amount, category: v.category, startDate,
        isRecurring: v.isRecurring, frequency: v.frequency, recurringEndDate,
        description: v.description, notes: v.notes
      }).subscribe({
        next: () => { this.snackBar.open('Income updated', 'Close', { duration: 3000 }); this.closeIncomeForm(); this.loadIncomes(); },
        error: () => this.snackBar.open('Failed to update income', 'Close', { duration: 4000 })
      });
    } else {
      const payload: KhataIncomeCreate = {
        title: v.title, amount: v.amount, category: v.category, startDate,
        isRecurring: v.isRecurring, frequency: v.frequency, recurringEndDate,
        description: v.description, notes: v.notes
      };
      this.khataService.createIncome(payload).subscribe({
        next: () => { this.snackBar.open('Income source added', 'Close', { duration: 3000 }); this.closeIncomeForm(); this.loadIncomes(); },
        error: () => this.snackBar.open('Failed to add income', 'Close', { duration: 4000 })
      });
    }
  }

  deleteIncome(income: KhataIncome): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '380px',
      data: { title: 'Delete Income', message: `Delete "${income.title}"?`, confirmText: 'Delete', cancelText: 'Cancel' }
    });
    ref.afterClosed().subscribe(ok => {
      if (!ok) return;
      this.khataService.deleteIncome(income.id).subscribe({
        next: () => { this.snackBar.open('Deleted', 'Close', { duration: 3000 }); this.loadIncomes(); },
        error: () => this.snackBar.open('Failed to delete', 'Close', { duration: 4000 })
      });
    });
  }

  getTotalMonthlyIncome(): number {
    return this.incomes.reduce((s, i) => s + i.monthlyEquivalent, 0);
  }

  getIncomeCategoryIcon(cat: string): string {
    const map: Record<string, string> = {
      Salary: 'work', Freelance: 'laptop', RentalIncome: 'home_work',
      BusinessProfit: 'storefront', Investment: 'trending_up',
      SideProject: 'build', Other: 'attach_money'
    };
    return map[cat] || 'attach_money';
  }

  getIncomeCategoryLabel(cat: string): string {
    const map: Record<string, string> = {
      RentalIncome: 'Rental Income', BusinessProfit: 'Business Profit',
      SideProject: 'Side Project'
    };
    return map[cat] || cat;
  }

  getNetMonthly(): number {
    return this.getTotalMonthlyIncome() - this.getTotalExpenses();
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  getStatusClass(status: KhataPaymentStatus): string {
    const map: Record<string, string> = {
      Pending: 'status-pending', Paid: 'status-paid',
      Overdue: 'status-overdue', Cancelled: 'status-cancelled'
    };
    return map[status] || '';
  }

  getTypeClass(type: KhataPaymentType): string {
    return type === 'Receivable' ? 'type-receivable' : 'type-payable';
  }

  getCategoryIcon(cat: string): string {
    const map: Record<string, string> = {
      Rent: 'home', Salary: 'people', Utilities: 'bolt', Internet: 'wifi',
      Software: 'code', Hardware: 'computer', Marketing: 'campaign',
      Office: 'business', Travel: 'flight', Miscellaneous: 'Miscellaneous', Home: 'home'  
    };
    return map[cat] || 'receipt';
  }

  isOverdue(dueDate: string): boolean {
    return new Date(dueDate) < new Date() ;
  }

  getDaysUntilDue(dueDate: string): number {
    const diff = new Date(dueDate).getTime() - Date.now();
    return Math.ceil(diff / 86400000);
  }

  getTotalExpenses(): number {
    return this.khataExpenses
      .filter(e => !e.isPaid && !e.isIgnored)
      .reduce((s, e) => s + e.amount, 0);
  }

  getTotalPaidExpenses(): number {
    return this.khataExpenses
      .filter(e => e.isPaid)
      .reduce((s, e) => s + e.amount, 0);
  }

  getExpensesByCategory(): Record<string, number> {
    const result: Record<string, number> = {};
    for (const e of this.khataExpenses) {
      result[e.category] = (result[e.category] || 0) + e.amount;
    }
    return result;
  }

  getCategoryKeys(obj: Record<string, number>): string[] {
    return Object.keys(obj);
  }

  getTopCategories(): Array<{ name: string; amount: number }> {
    const bycat = this.getExpensesByCategory();
    return Object.entries(bycat)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }

  // ── History ───────────────────────────────────────────────────────────────

  loadHistory(): void {
    this.historyLoading = true;
    this.khataService.getEntryHistory({ type: this.historyEntryType || undefined, search: this.historySearch || undefined }).subscribe({
      next: d => { this.historyEntries = d; this.historyLoading = false; },
      error: () => { this.snackBar.open('Failed to load entry history', 'Close', { duration: 4000 }); this.historyLoading = false; }
    });
    this.khataService.getExpenseHistory({ category: this.historyExpenseCategory || undefined, search: this.historyExpenseSearch || undefined }).subscribe({
      next: d => { this.historyExpenses = d; },
      error: () => {}
    });
  }

  onHistoryTabChange(i: number): void {
    this.historyTab = i;
    if (this.historyEntries.length === 0 && this.historyExpenses.length === 0) this.loadHistory();
  }

  applyHistoryFilter(): void { this.loadHistory(); }

  resetHistoryFilter(): void {
    this.historyEntryType = '';
    this.historySearch = '';
    this.historyExpenseCategory = '';
    this.historyExpenseSearch = '';
    this.loadHistory();
  }

  getMaxTrend(): number {
    if (!this.dashboard?.monthlyExpenseSummary?.length) return 1;
    return Math.max(...this.dashboard.monthlyExpenseSummary.map(m => m.total), 1);
  }

  onTabChange(index: number): void {
    this.activeTab = index;
  }
}
