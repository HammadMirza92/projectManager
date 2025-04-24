export enum UserRole {
  Admin = 'Admin',
  Developer = 'Developer',
  Client = 'Client'
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface UserCreate {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UserUpdate {
  name?: string;
  email?: string;
  password?: string;
}

export interface UserLogin {
  email: string;
  password: string;
}
