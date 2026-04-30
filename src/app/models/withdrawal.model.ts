export interface WithdrawalProject {
  projectId: number;
  projectTitle: string;
  amount: number;
}

export interface Withdrawal {
  id: number;
  amount: number;
  fiverrFee: number;
  netAmount: number;
  withdrawalDate: Date;
  notes: string;
  createdAt: Date;
  updatedAt?: Date;
  projects: WithdrawalProject[];
}

export interface WithdrawalCreate {
  amount: number;
  fiverrFee: number;
  withdrawalDate: Date;
  notes?: string;
  projects: { projectId: number; amount: number }[];
}

export interface WithdrawalUpdate {
  amount?: number;
  fiverrFee?: number;
  withdrawalDate?: Date;
  notes?: string;
}
