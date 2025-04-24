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
  paidAmount: number;
  remainingAmount: number;
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
  sourceOfProject: string;
  totalBudget: number;
  totalAfterDeduction: number;
  developerAmount: number;
  status: ProjectStatus;
  platform: string;
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
  sourceOfProject?: string;
  totalBudget?: number;
  totalAfterDeduction?: number;
  developerAmount?: number;
  status?: ProjectStatus;
  platform?: string;
}

export interface ProjectFilter {
  startDate?: Date;
  endDate?: Date;
  developerId?: number;
  status?: ProjectStatus;
  platform?: string;
}
