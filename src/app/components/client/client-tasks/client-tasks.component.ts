import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { TaskService } from '../../../services/task.service';
import { ProjectService } from '../../../services/project.service';
import { AuthService } from '../../../services/auth.service';
import { Task, TaskStatus } from '../../../models/task.model';
import { Project } from '../../../models/project.model';

@Component({
  selector: 'app-client-tasks',
  templateUrl: './client-tasks.component.html',
  styleUrls: ['./client-tasks.component.scss']
})
export class ClientTasksComponent implements OnInit {
  displayedColumns: string[] = ['id', 'title', 'projectTitle', 'dueDate', 'assignedToName', 'status'];
  dataSource = new MatTableDataSource<Task>([]);
  isLoading = false;

  projects: Project[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private taskService: TaskService,
    private projectService: ProjectService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadClientProjects();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadClientProjects() {
    this.isLoading = true;

    const currentUser = this.authService.currentUserValue;
    if (currentUser) {
      this.projectService.getProjectsByClient(currentUser.id)
        .subscribe({
          next: (projects) => {
            this.projects = projects;
            this.loadTasks();
          },
          error: (error) => {
            this.snackBar.open('Failed to load projects', 'Close', { duration: 5000 });
            this.isLoading = false;
          }
        });
    }
  }

  loadTasks() {
    if (this.projects.length === 0) {
      this.isLoading = false;
      return;
    }

    const projectIds = this.projects.map(p => p.id);
    const tasks: Task[] = [];

    // We need to load tasks for each project
    let loadedProjects = 0;

    for (const projectId of projectIds) {
      this.taskService.getTasksByProject(projectId)
        .subscribe({
          next: (projectTasks) => {
            tasks.push(...projectTasks);
            loadedProjects++;

            // Once we've loaded tasks for all projects, update the data source
            if (loadedProjects === projectIds.length) {
              this.dataSource.data = tasks;
              this.isLoading = false;
            }
          },
          error: (error) => {
            loadedProjects++;
            this.snackBar.open(`Failed to load tasks for project ${projectId}`, 'Close', { duration: 5000 });

            // Even if there's an error, check if we've processed all projects
            if (loadedProjects === projectIds.length) {
              this.dataSource.data = tasks;
              this.isLoading = false;
            }
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

  getStatusBadgeClass(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.ToDo:
        return 'task-todo';
      case TaskStatus.InProgress:
        return 'task-inprogress';
      case TaskStatus.Done:
        return 'task-done';
      case TaskStatus.Blocked:
        return 'task-blocked';
      default:
        return '';
    }
  }

  viewProject(projectId: number) {
    this.router.navigate(['/client/projects', projectId]);
  }
}
