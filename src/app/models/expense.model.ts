export interface Expense {
  id: number;
  description: string;
  amount: number;
  expenseDate: Date;
  projectId?: number;
  projectTitle?: string;
  notes?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface ExpenseCreate {
  description: string;
  amount: number;
  expenseDate: Date;
  projectId?: number;
  notes?: string;
}

export interface ExpenseUpdate {
  description?: string;
  amount?: number;
  expenseDate?: Date;
  projectId?: number;
  notes?: string;
}
