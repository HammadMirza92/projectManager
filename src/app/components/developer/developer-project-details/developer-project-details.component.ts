import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProjectService } from '../../../services/project.service';
import { TaskService } from '../../../services/task.service';
import { AuthService } from '../../../services/auth.service';
import { Project, ProjectStatus } from '../../../models/project.model';
import { Task, TaskCreate, TaskStatus } from '../../../models/task.model';

@Component({
  selector: 'app-developer-project-details',
  templateUrl: './developer-project-details.component.html',
  styleUrls: ['./developer-project-details.component.scss']
})
export class DeveloperProjectDetailsComponent implements OnInit {
  projectId: number = 0;
  project: Project | null = null;
  tasks: Task[] = [];
  isLoading = false;
  showTaskForm = false;
  isSavingTask = false;
  updatingTaskId: number | null = null;

  taskForm!: FormGroup;

  taskStatuses = [
    { value: TaskStatus.ToDo,       label: 'To Do' },
    { value: TaskStatus.InProgress, label: 'In Progress' },
    { value: TaskStatus.Done,       label: 'Done' },
    { value: TaskStatus.Blocked,    label: 'Blocked' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private projectService: ProjectService,
    private taskService: TaskService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.taskForm = this.fb.group({
      title:       ['', Validators.required],
      description: [''],
      dueDate:     [null],
      status:      [TaskStatus.ToDo, Validators.required]
    });

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.projectId = +params['id'];
        this.loadProject();
        this.loadTasks();
      }
    });
  }

  loadProject() {
    this.isLoading = true;
    this.projectService.getProjectById(this.projectId).subscribe({
      next: (project) => {
        this.project = project;
        const currentUser = this.authService.currentUserValue;
        if (currentUser && project.developerId !== currentUser.id) {
          this.snackBar.open('You do not have access to this project', 'Close', { duration: 5000 });
          this.router.navigate(['/developer/projects']);
        }
        this.isLoading = false;
      },
      error: () => {
        this.snackBar.open('Failed to load project', 'Close', { duration: 5000 });
        this.isLoading = false;
        this.router.navigate(['/developer/projects']);
      }
    });
  }

  loadTasks() {
    this.taskService.getTasksByProject(this.projectId).subscribe({
      next: (tasks) => { this.tasks = tasks; },
      error: () => {}
    });
  }

  toggleTaskForm() {
    this.showTaskForm = !this.showTaskForm;
    if (!this.showTaskForm) this.taskForm.reset({ status: TaskStatus.ToDo });
  }

  submitTask() {
    if (this.taskForm.invalid) return;
    this.isSavingTask = true;
    const v = this.taskForm.value;
    const payload: TaskCreate = {
      title:       v.title,
      description: v.description || '',
      projectId:   this.projectId,
      dueDate:     v.dueDate || undefined,
      status:      v.status
    };
    this.taskService.createTask(payload).subscribe({
      next: (task) => {
        this.tasks = [...this.tasks, task];
        this.isSavingTask = false;
        this.showTaskForm = false;
        this.taskForm.reset({ status: TaskStatus.ToDo });
        this.snackBar.open('Task added', 'Close', { duration: 3000 });
      },
      error: () => {
        this.isSavingTask = false;
        this.snackBar.open('Failed to add task', 'Close', { duration: 5000 });
      }
    });
  }

  updateTaskStatus(task: Task, newStatus: string) {
    const status = newStatus as TaskStatus;
    this.updatingTaskId = task.id;
    this.taskService.updateTask(task.id, { status }).subscribe({
      next: (updated) => {
        const idx = this.tasks.findIndex(t => t.id === task.id);
        if (idx !== -1) {
          this.tasks = [
            ...this.tasks.slice(0, idx),
            updated,
            ...this.tasks.slice(idx + 1)
          ];
        }
        this.updatingTaskId = null;
        this.snackBar.open('Status updated', 'Close', { duration: 2000 });
      },
      error: () => {
        this.updatingTaskId = null;
        this.snackBar.open('Failed to update status', 'Close', { duration: 5000 });
      }
    });
  }

  getStatusBadgeClass(status: ProjectStatus): string {
    const map: Record<string, string> = {
      [ProjectStatus.Completed]: 'status-completed',
      [ProjectStatus.Started]:   'status-started',
      [ProjectStatus.Pending]:   'status-pending',
      [ProjectStatus.Hold]:      'status-hold',
      [ProjectStatus.Revision]:  'status-revision',
      [ProjectStatus.Cancelled]: 'status-cancelled'
    };
    return map[status] ?? '';
  }

  getTaskStatusBadgeClass(status: TaskStatus): string {
    const map: Record<string, string> = {
      [TaskStatus.ToDo]:       'task-todo',
      [TaskStatus.InProgress]: 'task-inprogress',
      [TaskStatus.Done]:       'task-done',
      [TaskStatus.Blocked]:    'task-blocked'
    };
    return map[status] ?? '';
  }

  getDaysRemainingColor(days: number): string {
    if (days <= 0) return 'days-overdue';
    if (days <= 3) return 'days-critical';
    if (days <= 7) return 'days-warning';
    return '';
  }

  getTaskCompletionPercentage(): number {
    if (!this.tasks.length) return 0;
    const done = this.tasks.filter(t => t.status === TaskStatus.Done).length;
    return Math.round((done / this.tasks.length) * 100);
  }

  goBack() {
    this.router.navigate(['/developer/projects']);
  }
}
