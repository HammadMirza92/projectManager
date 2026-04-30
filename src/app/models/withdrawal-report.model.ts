export interface ReportProject {
  projectId: number;
  projectTitle: string;
  developerName: string;
  status: string;
  paymentInDollarTotal: number;
  paymentInDollarAfterDeduction: number;
  paymentWrtDevAfterDeduction: number;
  devPayment: number;
  tipAmount: number;
  dollarRate: number;
  dollarRateWrtDev: number;
  devPaymentInPkr: number;
  adminShareInPkr: number;
  devPaymentStatus: boolean;
  devExpenseDeduction: number;
  netDevPayment: number;
}

export interface ReportExpense {
  expenseId: number;
  description: string;
  amount: number;
  devShare: number;
  adminShare: number;
  expenseDate: Date;
  projectTitle: string;
}

export interface WithdrawalReport {
  id: number;
  withdrawalId: number;
  reportTitle: string;
  periodStart: Date;
  periodEnd: Date;
  totalProjects: number;
  totalFiverrEarnings: number;
  totalAfterFiverrDeduction: number;
  totalDevPayment: number;
  totalAdminShare: number;
  totalTips: number;
  totalExpenses: number;
  totalDevExpenseShare: number;
  totalAdminExpenseShare: number;
  withdrawalAmount: number;
  fiverrFee: number;
  netReceived: number;
  notes: string;
  createdAt: Date;
  projects: ReportProject[];
  expenses: ReportExpense[];
}

export interface DevPaymentTransfer {
  id: number;
  developerId: number;
  developerName: string;
  projectId?: number;
  projectTitle?: string;
  withdrawalId?: number;
  amountUsd: number;
  amountPkr: number;
  dollarRateUsed: number;
  transferDate: Date;
  method: string;
  notes: string;
  createdAt: Date;
}

export interface DevPaymentTransferCreate {
  developerId: number;
  projectId?: number;
  withdrawalId?: number;
  amountUsd: number;
  amountPkr: number;
  dollarRateUsed: number;
  transferDate: Date;
  method: string;
  notes?: string;
}

export interface DevBalanceSummary {
  developerId: number;
  developerName: string;
  developerEmail: string;
  totalOwed: number;
  totalPaid: number;
  balance: number;
  totalExpenseDeduction: number;
  transfers: DevPaymentTransfer[];
}

export interface FiverrDeposit {
  id: number;
  amount: number;
  depositDate: Date;
  source: string;
  notes: string;
  createdAt: Date;
}

export interface FiverrDepositCreate {
  amount: number;
  depositDate: Date;
  source?: string;
  notes?: string;
}

export interface AdminWithdrawal {
  id: number;
  amount: number;
  amountPkr: number;
  dollarRateUsed: number;
  withdrawalDate: Date;
  method: string;
  notes: string;
  createdAt: Date;
}

export interface AdminWithdrawalCreate {
  amount: number;
  amountPkr: number;
  dollarRateUsed: number;
  withdrawalDate: Date;
  method: string;
  notes?: string;
}
