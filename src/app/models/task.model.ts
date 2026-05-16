export enum TaskStatus {
  ToDo = 'ToDo',
  InProgress = 'InProgress',
  Done = 'Done',
  Blocked = 'Blocked',
  OnHold = 'OnHold',
}

export interface Task {
  id: number;
  title: string;
  description: string;
  projectId: number;
  projectTitle: string;
  dueDate?: Date;
  status: TaskStatus;
  statusName: string;
  assignedToId?: number;
  assignedToName?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface TaskCreate {
  title: string;
  description: string;
  projectId: number;
  dueDate?: Date;
  status: TaskStatus;
  assignedToId?: number;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  dueDate?: Date;
  status?: TaskStatus;
  assignedToId?: number;
}
