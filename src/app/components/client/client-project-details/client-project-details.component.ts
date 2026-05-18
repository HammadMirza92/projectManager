import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ProjectService } from '../../../services/project.service';
import { TaskService } from '../../../services/task.service';
import { PaymentService } from '../../../services/payment.service';
import { Project, ProjectStatus } from '../../../models/project.model';
import { Task, TaskCreate, TaskStatus } from '../../../models/task.model';
import { Payment, PaymentStatus } from '../../../models/payment.model';

@Component({
  selector: 'app-client-project-details',
  templateUrl: './client-project-details.component.html',
  styleUrls: ['./client-project-details.component.scss']
})
export class ClientProjectDetailsComponent implements OnInit {
  projectId: number = 0;
  project: Project | null = null;
  tasks: Task[] = [];
  payments: Payment[] = [];
  isLoading = false;
  isSavingTask = false;

  showTaskForm = false;
  taskForm!: FormGroup;

  taskStatuses = [
    { value: TaskStatus.ToDo, label: 'To Do' },
    { value: TaskStatus.InProgress, label: 'In Progress' },
    { value: TaskStatus.Done, label: 'Done' },
    { value: TaskStatus.Blocked, label: 'Blocked' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private projectService: ProjectService,
    private taskService: TaskService,
    private paymentService: PaymentService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      dueDate: [null],
      status: [TaskStatus.ToDo, Validators.required]
    });

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.projectId = +params['id'];
        this.loadProject();
        this.loadTasks();
        this.loadPayments();
      }
    });
  }

  loadProject() {
    this.isLoading = true;
    this.projectService.getProjectById(this.projectId).subscribe({
      next: (project) => { this.project = project; this.isLoading = false; },
      error: () => {
        this.snackBar.open('Failed to load project', 'Close', { duration: 5000 });
        this.isLoading = false;
        this.router.navigate(['/client/projects']);
      }
    });
  }

  loadTasks() {
    this.taskService.getTasksByProject(this.projectId).subscribe({
      next: (tasks) => { this.tasks = tasks; },
      error: () => {}
    });
  }

  loadPayments() {
    this.paymentService.getPaymentsByProject(this.projectId).subscribe({
      next: (payments) => { this.payments = payments; },
      error: () => {}
    });
  }

  toggleTaskForm() {
    this.showTaskForm = !this.showTaskForm;
    if (!this.showTaskForm) {
      this.taskForm.reset({ status: TaskStatus.ToDo });
    }
  }

  submitTask() {
    if (this.taskForm.invalid) return;

    this.isSavingTask = true;
    const value = this.taskForm.value;
    const payload: TaskCreate = {
      title: value.title,
      description: value.description || '',
      projectId: this.projectId,
      dueDate: value.dueDate || undefined,
      status: value.status
    };

    this.taskService.createTask(payload).subscribe({
      next: (task) => {
        this.tasks = [...this.tasks, task];
        this.isSavingTask = false;
        this.showTaskForm = false;
        this.taskForm.reset({ status: TaskStatus.ToDo });
        this.snackBar.open('Task added successfully', 'Close', { duration: 3000 });
      },
      error: () => {
        this.isSavingTask = false;
        this.snackBar.open('Failed to add task', 'Close', { duration: 5000 });
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

  getPaymentStatusBadgeClass(status: PaymentStatus): string {
    const map: Record<string, string> = {
      [PaymentStatus.Completed]: 'status-completed',
      [PaymentStatus.Pending]:   'status-pending',
      [PaymentStatus.Cancelled]: 'status-cancelled'
    };
    return map[status] ?? '';
  }

  getDaysRemainingColor(days: number): string {
    if (days <= 0) return 'days-overdue';
    if (days <= 3) return 'days-critical';
    if (days <= 7) return 'days-warning';
    return '';
  }

  getCompletedTaskCount(): number {
    return this.tasks.filter(t => t.status === TaskStatus.Done).length;
  }

  getTaskCompletionPercentage(): number {
    if (!this.tasks.length) return 0;
    return Math.round((this.getCompletedTaskCount() / this.tasks.length) * 100);
  }

  getTotalPaidAmount(): number {
    return this.payments
      .filter(p => p.status === PaymentStatus.Completed)
      .reduce((sum, p) => sum + p.amount, 0);
  }

  goBack() {
    this.router.navigate(['/client/projects']);
  }
}
