import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ExpenseService } from '../../../services/expense.service';
import { ProjectService } from '../../../services/project.service';
import { Expense, ExpenseCreate } from '../../../models/expense.model';
import { Project } from '../../../models/project.model';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-expenses',
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.scss']
})
export class ExpensesComponent implements OnInit {
  expenses: Expense[] = [];
  projects: Project[] = [];
  isLoading = false;
  showForm = false;
  expenseForm!: FormGroup;
  displayedColumns = ['date', 'description', 'amount', 'project', 'notes', 'actions'];

  constructor(
    private expenseService: ExpenseService,
    private projectService: ProjectService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadData();
  }

  initForm() {
    this.expenseForm = this.formBuilder.group({
      description: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      expenseDate: [new Date(), Validators.required],
      projectId: [null],
      notes: ['']
    });
  }

  loadData() {
    this.isLoading = true;
    this.expenseService.getExpenses().subscribe({
      next: (data) => { this.expenses = data; this.isLoading = false; },
      error: () => { this.snackBar.open('Failed to load expenses', 'Close', { duration: 4000 }); this.isLoading = false; }
    });
    this.projectService.getProjects(0, 100).subscribe({
      next: (resp) => { this.projects = resp.items; }
    });
  }

  toggleForm() { this.showForm = !this.showForm; }

  submitExpense() {
    if (this.expenseForm.invalid) return;
    const v = this.expenseForm.value;
    const payload: ExpenseCreate = {
      description: v.description,
      amount: v.amount,
      expenseDate: v.expenseDate,
      projectId: v.projectId || undefined,
      notes: v.notes
    };
    this.expenseService.createExpense(payload).subscribe({
      next: () => {
        this.snackBar.open('Expense added', 'Close', { duration: 3000 });
        this.showForm = false;
        this.expenseForm.reset({ expenseDate: new Date() });
        this.loadData();
      },
      error: () => this.snackBar.open('Failed to save expense', 'Close', { duration: 4000 })
    });
  }

  deleteExpense(id: number) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '380px',
      data: { title: 'Delete Expense', message: 'Are you sure?', confirmText: 'Delete', cancelText: 'Cancel' }
    });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.expenseService.deleteExpense(id).subscribe({
          next: () => { this.snackBar.open('Deleted', 'Close', { duration: 3000 }); this.loadData(); },
          error: () => this.snackBar.open('Failed to delete', 'Close', { duration: 4000 })
        });
      }
    });
  }

  getTotalExpenses(): number {
    return this.expenses.reduce((sum, e) => sum + e.amount, 0);
  }
}
