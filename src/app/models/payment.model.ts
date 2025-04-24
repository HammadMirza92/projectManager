export enum PaymentStatus {
  Pending = 'Pending',
  Completed = 'Completed',
  Cancelled = 'Cancelled'
}

export interface Payment {
  id: number;
  projectId: number;
  projectTitle: string;
  developerId: number;
  developerName: string;
  amount: number;
  paymentDate: Date;
  status: PaymentStatus;
  statusName: string;
  paymentDetails: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface PaymentCreate {
  projectId: number;
  developerId: number;
  amount: number;
  paymentDate: Date;
  status: PaymentStatus;
  paymentDetails: string;
}

export interface PaymentUpdate {
  amount?: number;
  paymentDate?: Date;
  status?: PaymentStatus;
  paymentDetails?: string;
}

export interface PaymentFilter {
  startDate?: Date;
  endDate?: Date;
  developerId?: number;
  projectId?: number;
  status?: PaymentStatus;
}
