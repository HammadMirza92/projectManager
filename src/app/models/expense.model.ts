export type ExpenseType = 0 | 1; // 0 = Fiverr (50/50), 1 = Ours (admin only)

export interface Expense {
  id: number;
  description: string;
  amount: number;
  expenseDate: Date;
  expenseType: ExpenseType;
  expenseTypeName?: string;
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
  expenseType: ExpenseType;
  projectId?: number;
  notes?: string;
}

export interface ExpenseUpdate {
  description?: string;
  amount?: number;
  expenseDate?: Date;
  expenseType?: ExpenseType;
  projectId?: number;
  notes?: string;
}
