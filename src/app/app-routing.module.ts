import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Auth Components
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';

// Admin Components
import { AdminDashboardComponent } from './components/admin/admin-dashboard/admin-dashboard.component';
import { UserListComponent } from './components/admin/user-list/user-list.component';
import { UserFormComponent } from './components/admin/user-form/user-form.component';
import { ProjectListComponent } from './components/admin/project-list/project-list.component';
import { PaymentListComponent } from './components/admin/payment-list/payment-list.component';
import { ProjectFormComponent } from './components/admin/project-form/project-form.component';
import { PaymentFormComponent } from './components/admin/payment-form/payment-form.component';
import { DeveloperEarningsComponent } from './components/admin/developer-earnings/developer-earnings.component';

// Developer Components
import { DeveloperDashboardComponent } from './components/developer/developer-dashboard/developer-dashboard.component';
import { DeveloperProjectsComponent } from './components/developer/developer-projects/developer-projects.component';
import { DeveloperProjectDetailsComponent } from './components/developer/developer-project-details/developer-project-details.component';
import { DeveloperPaymentsComponent } from './components/developer/developer-payments/developer-payments.component';

// Client Components
import { ClientDashboardComponent } from './components/client/client-dashboard/client-dashboard.component';
import { ClientProjectsComponent } from './components/client/client-projects/client-projects.component';
import { ClientProjectDetailsComponent } from './components/client/client-project-details/client-project-details.component';
import { ClientTasksComponent } from './components/client/client-tasks/client-tasks.component';

// Shared Components
import { ProjectDetailsComponent } from './components/shared/project-details/project-details.component';
import { PageNotFoundComponent } from './components/layout/page-not-found/page-not-found.component';

// Guards
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { UserRole } from './models/user.model';

const routes: Routes = [
  // Auth Routes
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Admin Routes
  {
    path: 'admin',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [UserRole.Admin] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'users', component: UserListComponent },
      { path: 'users/add', component: UserFormComponent },
      { path: 'users/edit/:id', component: UserFormComponent },
      { path: 'projects', component: ProjectListComponent },
      { path: 'projects/add', component: ProjectFormComponent },
      { path: 'projects/edit/:id', component: ProjectFormComponent },
      { path: 'projects/:id', component: ProjectDetailsComponent },
      { path: 'payments', component: PaymentListComponent },
      { path: 'payments/add', component: PaymentFormComponent },
      { path: 'payments/edit/:id', component: PaymentFormComponent },
      { path: 'developer-earnings', component: DeveloperEarningsComponent }
    ]
  },

  // Developer Routes
  {
    path: 'developer',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [UserRole.Developer] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DeveloperDashboardComponent },
      { path: 'projects', component: DeveloperProjectsComponent },
      { path: 'projects/:id', component: DeveloperProjectDetailsComponent },
      { path: 'payments', component: DeveloperPaymentsComponent }
    ]
  },

  // Client Routes
  {
    path: 'client',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [UserRole.Client] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: ClientDashboardComponent },
      { path: 'projects', component: ClientProjectsComponent },
      { path: 'projects/:id', component: ClientProjectDetailsComponent },
      { path: 'tasks', component: ClientTasksComponent }
    ]
  },

  // Redirect based on role
  {
    path: '',
    canActivate: [AuthGuard],
    component: AdminDashboardComponent
  },

  // Wildcard route for 404
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
