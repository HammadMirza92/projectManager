import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { ErrorInterceptor } from './interceptors/error.interceptor';

// Material UI Modules
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDividerModule } from '@angular/material/divider';

// Core Components
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { HeaderComponent } from './components/layout/header/header.component';
import { SidenavComponent } from './components/layout/sidenav/sidenav.component';
import { NotificationsComponent } from './components/layout/notifications/notifications.component';
import { PageNotFoundComponent } from './components/layout/page-not-found/page-not-found.component';

// Admin Components
import { AdminDashboardComponent } from './components/admin/admin-dashboard/admin-dashboard.component';
import { UserListComponent } from './components/admin/user-list/user-list.component';
import { UserFormComponent } from './components/admin/user-form/user-form.component';
import { ProjectListComponent } from './components/admin/project-list/project-list.component';
import { ProjectFormComponent } from './components/admin/project-form/project-form.component';
import { PaymentListComponent } from './components/admin/payment-list/payment-list.component';
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
import { TaskListComponent } from './components/shared/task-list/task-list.component';
import { TaskFormComponent } from './components/shared/task-form/task-form.component';
import { ConfirmDialogComponent } from './components/shared/confirm-dialog/confirm-dialog.component';
import { LoadingSpinnerComponent } from './components/shared/loading-spinner/loading-spinner.component';
import { AdminTaskFormComponent } from './components/admin/task-form/admin-task-form.component';
import { AdminTaskListComponent } from './components/admin/task-list/admin-task-list.component';
import { DeveloperTaskListComponent } from './components/developer/task-list/developer-task-list.component';
import { TaskDetailComponent } from './components/shared/task-detail/task-detail.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    HeaderComponent,
    SidenavComponent,
    NotificationsComponent,
    PageNotFoundComponent,
    AdminDashboardComponent,
    UserListComponent,
    UserFormComponent,
    ProjectListComponent,
    ProjectFormComponent,
    PaymentListComponent,
    PaymentFormComponent,
    DeveloperEarningsComponent,
    DeveloperDashboardComponent,
    DeveloperProjectsComponent,
    DeveloperProjectDetailsComponent,
    DeveloperPaymentsComponent,
    ClientDashboardComponent,
    ClientProjectsComponent,
    ClientProjectDetailsComponent,
    ClientTasksComponent,
    ProjectDetailsComponent,
    TaskListComponent,
    TaskFormComponent,
    ConfirmDialogComponent,
    LoadingSpinnerComponent,
    AdminTaskFormComponent,
    AdminTaskListComponent,
    DeveloperTaskListComponent,
    TaskDetailComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    MatToolbarModule,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatNativeDateModule,
    MatTableModule,
    MatPaginatorModule,
    MatDatepickerModule,
    MatSortModule,
    MatDialogModule,
    MatSnackBarModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatBadgeModule,
    MatExpansionModule,
    MatTabsModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatButtonToggleModule,
    MatDividerModule
  ],
  exports: [
    AdminDashboardComponent,
    UserListComponent,
    UserFormComponent,
    ProjectListComponent,
    ProjectFormComponent,
    PaymentListComponent,
    PaymentFormComponent,
    DeveloperEarningsComponent,
    AdminTaskFormComponent,
    AdminTaskListComponent,
    DeveloperTaskListComponent
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
