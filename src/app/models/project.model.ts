export enum ProjectStatus {
  Hold = 'Hold',
  Started = 'Started',
  Pending = 'Pending',
  Revision = 'Revision',
  Cancelled = 'Cancelled',
  Completed = 'Completed'
}

export interface Project {
  id: number;
  title: string;
  description: string;
  orderLink: string;
  developerId: number;
  developerName: string;
  clientId: number;
  clientName: string;
  websiteUrl: string;
  websiteLogin: string;
  startDate: Date;
  endDate: Date;
  sourceOfProject: string;
  totalBudget: number;
  totalAfterDeduction: number;
  developerAmount: number;
  status: ProjectStatus;
  statusName: string;
  platform: string;
  daysRemaining: number;
  daysRemainingWrtDev: number;
  originalEndDate?: Date | null;
  extendedDays: number;
  paidAmount: number;
  remainingAmount: number;
  // Admin-only payment tracking fields
  paymentInDollarTotal: number;
  paymentInDollarAfterDeduction: number;
  paymentWrtDevTotal: number;
  paymentWrtDevAfterDeduction: number;
  tipAmount: number;
  devPayment: number;
  devPaymentStatus: boolean;
  paymentStatusOnFiverr: string;
  dollarRate: number;
  dollarRateWrtDev: number;
  devPaymentInPkr: number;
  wtrToDevInPkr: number;
}

export interface ProjectCreate {
  title: string;
  description: string;
  orderLink: string;
  developerId: number;
  clientId: number;
  websiteUrl: string;
  websiteLogin: string;
  startDate: Date;
  endDate: Date;
  originalEndDate?: Date | null;
  extendedDays?: number;
  sourceOfProject: string;
  totalBudget: number;
  totalAfterDeduction: number;
  developerAmount: number;
  status: ProjectStatus;
  platform: string;
  paymentInDollarTotal?: number;
  paymentInDollarAfterDeduction?: number;
  paymentWrtDevTotal?: number;
  paymentWrtDevAfterDeduction?: number;
  tipAmount?: number;
  devPayment?: number;
  devPaymentStatus?: boolean;
  paymentStatusOnFiverr?: string;
  dollarRate?: number;
  dollarRateWrtDev?: number;
}

export interface ProjectUpdate {
  title?: string;
  description?: string;
  orderLink?: string;
  developerId?: number;
  websiteUrl?: string;
  websiteLogin?: string;
  startDate?: Date;
  endDate?: Date;
  originalEndDate?: Date | null;
  extendedDays?: number;
  sourceOfProject?: string;
  totalBudget?: number;
  totalAfterDeduction?: number;
  developerAmount?: number;
  status?: ProjectStatus;
  platform?: string;
  paymentInDollarTotal?: number;
  paymentInDollarAfterDeduction?: number;
  paymentWrtDevTotal?: number;
  paymentWrtDevAfterDeduction?: number;
  tipAmount?: number;
  devPayment?: number;
  devPaymentStatus?: boolean;
  paymentStatusOnFiverr?: string;
  dollarRate?: number;
  dollarRateWrtDev?: number;
}

export interface ProjectFilter {
  startDate?: Date;
  endDate?: Date;
  developerId?: number;
  status?: ProjectStatus;
  platform?: string;
}
