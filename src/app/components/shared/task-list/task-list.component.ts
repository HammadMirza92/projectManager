// components/shared/task-list/task-list.component.ts
import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { Task, TaskStatus } from '../../../models/task.model';
import { TaskService } from '../../../services/task.service';
import { AuthService } from '../../../services/auth.service';
import { UserRole } from '../../../models/user.model';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { TaskFormComponent } from '../task-form/task-form.component';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent implements OnInit {
  @Input() projectId?: number;
  @Input() showActions = true;
  @Input() showProject = true;
  @Input() showFilters = true;
  @Output() taskUpdated = new EventEmitter<Task>();

  dataSource = new MatTableDataSource<Task>([]);
  displayedColumns: string[] = ['title', 'status', 'dueDate', 'assignedTo'];
  loading = true;
  error = '';
  totalTasks = 0;
  pageSize = 10;
  pageIndex = 0;
  TaskStatus = TaskStatus;
  currentUserRole: UserRole | null = null;
  today = new Date(); // Added today property

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('input') input!: ElementRef; // Added input reference

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUserRole = this.authService.currentUserValue?.role || null;

    // If no projectId is passed as Input, check if it's in the route
    if (!this.projectId) {
      this.route.params.subscribe(params => {
        if (params['projectId']) {
          this.projectId = +params['projectId'];
        }
      });
    }

    // Set up displayed columns based on user role and configuration
    this.configureDisplayedColumns();

    // Load tasks
    this.loadTasks();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  configureDisplayedColumns() {
    this.displayedColumns = ['title', 'status'];

    if (this.showProject) {
      this.displayedColumns.push('projectTitle');
    }

    this.displayedColumns.push('dueDate', 'assignedTo');

    if (this.showActions) {
      this.displayedColumns.push('actions');
    }
  }

  loadTasks(): void {
    this.loading = true;
    this.error = '';

    this.taskService.getTasks(this.pageIndex, this.pageSize, this.projectId)
      .subscribe({
        next: (response) => {
          this.dataSource.data = response.items;
          this.totalTasks = response.totalCount;
          this.loading = false;
        },
        error: (err) => {
          this.error = err.message || 'Failed to load tasks';
          this.loading = false;
        }
      });
  }

  pageChanged(event: any): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadTasks();
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getStatusClass(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.ToDo:
        return 'status-todo';
      case TaskStatus.InProgress:
        return 'status-progress';
      case TaskStatus.Done:
        return 'status-done';
      case TaskStatus.OnHold:
        return 'status-hold';
      default:
        return '';
    }
  }

  openTaskForm(task?: Task): void {
    const dialogRef = this.dialog.open(TaskFormComponent, {
      width: '600px',
      data: {
        task: task || null,
        projectId: this.projectId || (task ? task.projectId : null)
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadTasks();
        this.taskUpdated.emit(result);
      }
    });
  }

  updateTaskStatus(task: Task, newStatus: TaskStatus): void {
    const updatedTask = {
      status: newStatus
    };

    this.taskService.updateTask(task.id, updatedTask).subscribe({
      next: (result) => {
        // Update the task in the data source
        const index = this.dataSource.data.findIndex(t => t.id === task.id);
        if (index !== -1) {
          this.dataSource.data[index] = result;
          this.dataSource._updateChangeSubscription();
          this.taskUpdated.emit(result);
        }
      },
      error: (err) => {
        this.error = err.message || 'Failed to update task status';
      }
    });
  }

  deleteTask(task: Task): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Delete Task',
        message: `Are you sure you want to delete the task "${task.title}"?`,
        confirmButtonText: 'Delete'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.taskService.deleteTask(task.id).subscribe({
          next: () => {
            // Remove the task from the data source
            this.dataSource.data = this.dataSource.data.filter(t => t.id !== task.id);
            this.totalTasks--;
            this.taskUpdated.emit();
          },
          error: (err) => {
            this.error = err.message || 'Failed to delete task';
          }
        });
      }
    });
  }

  canEditTask(task: Task): boolean {
    const currentUserId = this.authService.currentUserValue?.id;

    // Admin can edit any task
    if (this.currentUserRole === UserRole.Admin) {
      return true;
    }

    // Developer can edit tasks assigned to them
    if (this.currentUserRole === UserRole.Developer) {
      return task.assignedToId === currentUserId;
    }

    // Client cannot edit tasks
    return false;
  }

  viewTaskDetails(task: Task): void {
    this.router.navigate(['/tasks', task.id]);
  }

  isAdmin(): boolean {
    return this.currentUserRole === UserRole.Admin;
  }

  isDeveloper(): boolean {
    return this.currentUserRole === UserRole.Developer;
  }
}
