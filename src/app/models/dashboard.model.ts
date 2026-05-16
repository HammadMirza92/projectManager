import { Project } from "./project.model";
import { Task } from "./task.model";

export interface AdminDashboard {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  delayedProjects: number;
  totalRevenue: number;               // completed projects earnings
  activeRevenue: number;              // all projects earnings
  allProjectsRevenue: number;         // all projects earnings (explicit alias)
  completedProjectsRevenue: number;   // completed projects earnings (explicit alias)
  totalPaidToDevelopers: number;
  netRevenue: number;
  pendingPayments: number;
  fiverrBalance: number;
  totalWithdrawn: number;
  totalExpenses: number;
  topDevelopers: DeveloperEarning[];
  upcomingDeadlines: Project[];
}

export interface DeveloperDashboard {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalEarnings: number;
  pendingPayments: number;
  assignedProjects: Project[];
  upcomingDeadlines: Project[];
}

export interface ClientDashboard {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalSpent: number;
  projects: Project[];
  recentTasks: Task[];
}

export interface DevProjectEarning {
  projectId: number;
  projectTitle: string;
  status: string;
  actualPrice: number;
  paymentInDollarTotal: number;
  paymentInDollarAfterDeduction: number;
  paymentWrtDev: number;
  paymentWrtDevAfterDeduction: number;
  devPayment: number;
  tipAmount: number;
  wtrToDevInPkr: number;      // PaymentWrtDevAfterDeduction × DollarRateWrtDev
  devPaymentInPkr: number;    // same as wtrToDevInPkr
  ourShareInPkr: number;
  dollarRate: number;
  dollarRateWrtDev: number;
  devPaymentStatus: boolean;
  transferPaid: boolean;       // true if a DevPaymentTransfer exists for this project
  transferAmountUsd: number;
  transferAmountPkr: number;
  endDate: Date;
}

export interface DeveloperEarning {
  developerId: number;
  developerName: string;
  developerEmail: string;
  totalEarnings: number;          // completed projects only (USD)
  allProjectsEarnings: number;    // all projects (USD)
  paidAmount: number;
  pendingAmount: number;
  completedProjects: number;
  totalProjects: number;
  activeProjects: number;
  manualPaymentAdjustment: number;
  totalEarningsInPkr: number;         // completed projects only (PKR)
  ourShareInPkr: number;              // completed projects only (PKR)
  allProjectsEarningsInPkr: number;   // all projects (PKR)
  allProjectsOurShareInPkr: number;   // all projects our share (PKR)
  avgDollarRate: number;
  avgDollarRateWrtDev: number;
  projects: DevProjectEarning[];
}
