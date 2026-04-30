import { Project } from "./project.model";
import { Task } from "./task.model";

export interface AdminDashboard {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  delayedProjects: number;
  totalRevenue: number;
  totalPaidToDevelopers: number;
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
  paymentInDollarTotal: number;
  paymentInDollarAfterDeduction: number;
  paymentWrtDevAfterDeduction: number;
  devPayment: number;
  devPaymentInPkr: number;
  ourShareInPkr: number;
  dollarRate: number;
  dollarRateWrtDev: number;
  devPaymentStatus: boolean;
  endDate: Date;
}

export interface DeveloperEarning {
  developerId: number;
  developerName: string;
  developerEmail: string;
  totalEarnings: number;
  paidAmount: number;
  pendingAmount: number;
  completedProjects: number;
  totalProjects: number;
  activeProjects: number;
  manualPaymentAdjustment: number;
  totalEarningsInPkr: number;
  ourShareInPkr: number;
  avgDollarRate: number;
  avgDollarRateWrtDev: number;
  projects: DevProjectEarning[];
}
