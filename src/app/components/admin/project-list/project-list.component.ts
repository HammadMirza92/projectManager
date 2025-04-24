import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ProjectService } from '../../../services/project.service';
import { UserService } from '../../../services/user.service';
import { Project, ProjectStatus } from '../../../models/project.model';
import { User } from '../../../models/user.model';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss']
})
export class ProjectListComponent implements OnInit {
  displayedColumns: string[] = ['id', 'title', 'developerName', 'clientName', 'endDate', 'daysRemaining', 'totalBudget', 'status', 'actions'];
  dataSource = new MatTableDataSource<Project>([]);
  isLoading = false;
  totalProjects = 0;

  filterForm!: FormGroup;
  developers: User[] = [];
  projectStatuses = Object.values(ProjectStatus);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private projectService: ProjectService,
    private userService: UserService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initFilterForm();
    this.loadDevelopers();
    this.loadProjects();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  initFilterForm() {
    this.filterForm = this.formBuilder.group({
      startDate: [null],
      endDate: [null],
      developerId: [null],
      status: [null],
      platform: ['']
    });
  }

  loadDevelopers() {
    this.userService.getDevelopers()
      .subscribe({
        next: (developers) => {
          this.developers = developers;
        },
        error: (error) => {
          this.snackBar.open('Failed to load developers', 'Close', { duration: 5000 });
        }
      });
  }

  loadProjects(pageIndex: number = 0, pageSize: number = 10) {
    this.isLoading = true;

    const filter = this.filterForm.value;

    this.projectService.getProjects(pageIndex, pageSize, filter)
      .subscribe({
        next: (response) => {
          this.dataSource.data = response.items;
          this.totalProjects = response.totalCount;
          this.isLoading = false;
        },
        error: (error) => {
          this.snackBar.open('Failed to load projects', 'Close', { duration: 5000 });
          this.isLoading = false;
        }
      });
  }

  onPageChange(event: any) {
    this.loadProjects(event.pageIndex, event.pageSize);
  }

  applyFilter() {
    this.loadProjects(0, this.paginator?.pageSize || 10);
  }

  resetFilter() {
    this.filterForm.reset();
    this.loadProjects(0, this.paginator?.pageSize || 10);
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
    this.router.navigate(['/admin/projects', projectId]);
  }

  editProject(projectId: number) {
    this.router.navigate(['/admin/projects/edit', projectId]);
  }

  deleteProject(project: Project) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirm Delete',
        message: `Are you sure you want to delete project "${project.title}"?`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        this.projectService.deleteProject(project.id)
          .subscribe({
            next: () => {
              this.snackBar.open('Project deleted successfully', 'Close', { duration: 3000 });
              this.loadProjects(this.paginator.pageIndex, this.paginator.pageSize);
            },
            error: (error) => {
              this.snackBar.open('Failed to delete project', 'Close', { duration: 5000 });
              this.isLoading = false;
            }
          });
      }
    });
  }

  addNewProject() {
    this.router.navigate(['/admin/projects/add']);
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
