export type KhataOccurrenceStatus = 'Pending' | 'Paid' | 'Ignored';
export type KhataPaymentType = 'Receivable' | 'Payable';
export type KhataPaymentStatus = 'Pending' | 'Paid' | 'Overdue' | 'Cancelled';
export type KhataPaymentFrequency = 'OneTime' | 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly';
export type KhataExpenseCategory =
  | 'Rent' | 'Salary' | 'Utilities' | 'Internet' | 'Software'  | 'Home'
  | 'Hardware' | 'Marketing' | 'Office' | 'Travel' | 'Miscellaneous';

export interface KhataEntry {
  id: number;
  partyName: string;
  partyEmail?: string;
  partyPhone?: string;
  type: KhataPaymentType;
  amount: number;
  paidAmount: number;
  remainingAmount: number;
  dueDate: string;
  paymentSource?: string;
  description?: string;
  notes?: string;
  status: KhataPaymentStatus;
  reminderSent: boolean;
  reminderSentAt?: string;
  isRecurring: boolean;
  frequency?: KhataPaymentFrequency;
  recurringEndDate?: string;
  parentEntryId?: number;
  createdAt: string;
  updatedAt?: string;
  paidAt?: string;
}

export interface KhataEntryCreate {
  partyName: string;
  partyEmail?: string;
  partyPhone?: string;
  type: KhataPaymentType;
  amount: number;
  dueDate: string;
  paymentSource?: string;
  description?: string;
  notes?: string;
  isRecurring: boolean;
  frequency?: KhataPaymentFrequency;
  recurringEndDate?: string;
}

export interface KhataEntryUpdate {
  partyName?: string;
  partyEmail?: string;
  partyPhone?: string;
  amount?: number;
  dueDate?: string;
  paymentSource?: string;
  description?: string;
  notes?: string;
  status?: KhataPaymentStatus;
  isRecurring?: boolean;
  frequency?: KhataPaymentFrequency;
  recurringEndDate?: string;
}

export interface KhataExpense {
  id: number;
  title: string;
  amount: number;
  category: KhataExpenseCategory;
  expenseDate: string;
  description?: string;
  notes?: string;
  isRecurring: boolean;
  frequency?: KhataPaymentFrequency;
  recurringEndDate?: string;
  parentExpenseId?: number;
  monthYear: string;
  createdAt: string;
  updatedAt?: string;
  status: KhataOccurrenceStatus;
  isPaid: boolean;
  isIgnored: boolean;
}

export interface KhataExpenseCreate {
  title: string;
  amount: number;
  category: KhataExpenseCategory;
  expenseDate: string;
  description?: string;
  notes?: string;
  isRecurring: boolean;
  frequency?: KhataPaymentFrequency;
  recurringEndDate?: string;
}

export interface KhataExpenseUpdate {
  title?: string;
  amount?: number;
  category?: KhataExpenseCategory;
  expenseDate?: string;
  description?: string;
  notes?: string;
  isRecurring?: boolean;
  frequency?: KhataPaymentFrequency;
  recurringEndDate?: string;
}

export type KhataIncomeCategory = 'Salary' | 'Freelance' | 'RentalIncome' | 'BusinessProfit' | 'Investment' | 'SideProject' | 'Other';

export interface KhataIncome {
  id: number;
  title: string;
  amount: number;
  category: KhataIncomeCategory;
  categoryName: string;
  startDate: string;
  isRecurring: boolean;
  frequency: KhataPaymentFrequency;
  recurringEndDate?: string;
  description?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  monthlyEquivalent: number;
}

export interface KhataIncomeCreate {
  title: string;
  amount: number;
  category: KhataIncomeCategory;
  startDate: string;
  isRecurring: boolean;
  frequency: KhataPaymentFrequency;
  recurringEndDate?: string;
  description?: string;
  notes?: string;
}

export interface KhataIncomeUpdate {
  title?: string;
  amount?: number;
  category?: KhataIncomeCategory;
  startDate?: string;
  isRecurring?: boolean;
  frequency?: KhataPaymentFrequency;
  recurringEndDate?: string;
  description?: string;
  notes?: string;
}

export interface MonthlyExpenseSummary {
  year: number;
  month: number;
  monthName: string;
  total: number;
  byCategory: Record<string, number>;
}

export interface KhataDashboard {
  totalMonthlyExpenses: number;
  totalMonthlyIncome: number;
  totalPendingReceivables: number;
  totalPendingPayables: number;
  totalOverdueReceivables: number;
  totalOverduePayables: number;
  monthlyNetCashFlow: number;
  overdueCount: number;
  upcomingCount: number;
  upcomingReceivables: KhataEntry[];
  upcomingPayables: KhataEntry[];
  overdueEntries: KhataEntry[];
  monthlyExpenseSummary: MonthlyExpenseSummary[];
}
