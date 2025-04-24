import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { User, UserRole } from '../../../models/user.model';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  displayedColumns: string[] = ['id', 'name', 'email', 'role', 'actions'];
  dataSource = new MatTableDataSource<User>([]);
  isLoading = false;
  totalUsers = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private userService: UserService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadUsers(pageIndex: number = 0, pageSize: number = 10) {
    this.isLoading = true;
    this.userService.getUsers(pageIndex, pageSize)
      .subscribe({
        next: (response) => {
          this.dataSource.data = response.items;
          this.totalUsers = response.totalCount;
          this.isLoading = false;
        },
        error: (error) => {
          this.snackBar.open('Failed to load users. Please try again.', 'Close', { duration: 5000 });
          this.isLoading = false;
        }
      });
  }

  onPageChange(event: any) {
    this.loadUsers(event.pageIndex, event.pageSize);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getRoleBadgeClass(role: UserRole): string {
    switch (role) {
      case UserRole.Admin:
        return 'admin-badge';
      case UserRole.Developer:
        return 'developer-badge';
      case UserRole.Client:
        return 'client-badge';
      default:
        return '';
    }
  }

  editUser(userId: number) {
    this.router.navigate(['/admin/users/edit', userId]);
  }

  deleteUser(user: User) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirm Delete',
        message: `Are you sure you want to delete user ${user.name}?`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        this.userService.deleteUser(user.id)
          .subscribe({
            next: () => {
              this.snackBar.open('User deleted successfully', 'Close', { duration: 3000 });
              this.loadUsers(this.paginator.pageIndex, this.paginator.pageSize);
            },
            error: (error) => {
              this.snackBar.open('Failed to delete user. Please try again.', 'Close', { duration: 5000 });
              this.isLoading = false;
            }
          });
      }
    });
  }

  addNewUser() {
    this.router.navigate(['/admin/users/add']);
  }
}
