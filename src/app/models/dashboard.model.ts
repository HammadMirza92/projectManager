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

export interface DeveloperEarning {
  developerId: number;
  developerName: string;
  totalEarnings: number;
  paidAmount: number;
  pendingAmount: number;
  completedProjects: number;
}
