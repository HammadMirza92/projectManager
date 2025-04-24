import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ProjectService } from '../../../services/project.service';
import { AuthService } from '../../../services/auth.service';
import { Project, ProjectStatus } from '../../../models/project.model';

@Component({
  selector: 'app-client-projects',
  templateUrl: './client-projects.component.html',
  styleUrls: ['./client-projects.component.scss']
})
export class ClientProjectsComponent implements OnInit {
  displayedColumns: string[] = ['id', 'title', 'developerName', 'endDate', 'daysRemaining', 'totalBudget', 'status', 'actions'];
  dataSource = new MatTableDataSource<Project>([]);
  isLoading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private projectService: ProjectService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadProjects() {
    this.isLoading = true;

    const currentUser = this.authService.currentUserValue;
    if (currentUser) {
      this.projectService.getProjectsByClient(currentUser.id)
        .subscribe({
          next: (projects) => {
            this.dataSource.data = projects;
            this.isLoading = false;
          },
          error: (error) => {
            this.snackBar.open('Failed to load projects', 'Close', { duration: 5000 });
            this.isLoading = false;
          }
        });
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getStatusBadgeClass(status: ProjectStatus): string {
    switch (status) {
      case ProjectStatus.Completed:
        return 'status-completed';
      case ProjectStatus.Started:
        return 'status-started';
      case ProjectStatus.Pending:
        return 'status-pending';
      case ProjectStatus.Hold:
        return 'status-hold';
      case ProjectStatus.Revision:
        return 'status-revision';
      case ProjectStatus.Cancelled:
        return 'status-cancelled';
      default:
        return '';
    }
  }

  viewProject(projectId: number) {
    this.router.navigate(['/client/projects', projectId]);
  }

  getDaysRemainingColor(daysRemaining: number): string {
    if (daysRemaining <= 0) {
      return 'days-overdue';
    } else if (daysRemaining <= 3) {
      return 'days-critical';
    } else if (daysRemaining <= 7) {
      return 'days-warning';
    } else {
      return '';
    }
  }
}
