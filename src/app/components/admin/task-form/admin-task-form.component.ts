// components/admin/task-form/admin-task-form.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from '../../../services/task.service';
import { ProjectService } from '../../../services/project.service';
import { UserService } from '../../../services/user.service';
import { Task, TaskStatus } from '../../../models/task.model';
import { Project } from '../../../models/project.model';
import { User, UserRole } from '../../../models/user.model';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Location } from '@angular/common';

@Component({
  selector: 'app-admin-task-form',
  templateUrl: './admin-task-form.component.html',
  styleUrls: ['./admin-task-form.component.scss']
})
export class AdminTaskFormComponent implements OnInit {
  taskForm!: FormGroup;
  taskId?: number;
  projectId?: number;
  loading = false;
  submitting = false;
  error = '';
  projects: Project[] = [];
  developers: User[] = [];
  editMode = false;

  taskStatusOptions = Object.keys(TaskStatus)
  .filter(key => isNaN(Number(key)))
  .map(key => ({
    value: key,
    label: key.replace(/([A-Z])/g, ' $1').trim() // Add spaces before capital letters
  }));

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private projectService: ProjectService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.initForm();

    // Get task ID from route if editing
    this.route.params.subscribe(params => {
      // Check if we're editing an existing task
      if (params['id']) {
        this.taskId = +params['id'];
        this.editMode = true;
        this.loadTaskDetails();
      }

      // Check if we're creating a task for a specific project
      if (params['projectId']) {
        this.projectId = +params['projectId'];
        this.taskForm.patchValue({ projectId: this.projectId });
        this.taskForm.get('projectId')?.disable();
      }
    });

    this.loadFormData();
  }

  initForm(): void {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      description: ['', Validators.maxLength(500)],
      projectId: ['', Validators.required],
      dueDate: [null],
      status: [TaskStatus.ToDo, Validators.required],
      assignedToId: [null]
    });
  }

  loadTaskDetails(): void {
    if (!this.taskId) return;

    this.loading = true;
    this.taskService.getTaskById(this.taskId).subscribe({
      next: (task) => {
        this.projectId = task.projectId;
        this.patchFormWithTask(task);
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Failed to load task details';
        this.loading = false;
      }
    });
  }

  patchFormWithTask(task: Task): void {
    this.taskForm.patchValue({
      title: task.title,
      description: task.description,
      projectId: task.projectId,
      dueDate: task.dueDate,
      status: task.status,
      assignedToId: task.assignedToId
    });

    // Disable project selection when editing
    this.taskForm.get('projectId')?.disable();
  }

  loadFormData(): void {
    this.loading = true;

    // Create observables for data loading
    const projectsObservable = this.projectService.getProjects(0, 100).pipe(
      map(response => response.items),
      catchError(error => {
        this.error = 'Failed to load projects';
        return of([]);
      })
    );

    const developersObservable = this.userService.getUsersByRole(UserRole.Developer).pipe(
      catchError(error => {
        this.error = 'Failed to load developers';
        return of([]);
      })
    );

    // Load data in parallel
    forkJoin({
      projects: projectsObservable,
      developers: developersObservable
    }).subscribe({
      next: result => {
        this.projects = result.projects;
        this.developers = result.developers;
        this.loading = false;
      },
      error: err => {
        this.error = 'Failed to load form data';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.taskForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.taskForm.controls).forEach(key => {
        const control = this.taskForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.submitting = true;

    const formValue = this.taskForm.getRawValue();

    // Make sure projectId is set if disabled
    if (this.projectId && (!formValue.projectId || this.taskForm.get('projectId')?.disabled)) {
      formValue.projectId = this.projectId;
    }

    let request: Observable<Task>;

    if (this.editMode && this.taskId) {
      request = this.taskService.updateTask(this.taskId, formValue);
    } else {
      request = this.taskService.createTask(formValue);
    }

    request.subscribe({
      next: task => {
        this.submitting = false;
        // Navigate back based on context
        if (this.projectId) {
          this.router.navigate(['/admin/projects', this.projectId, 'tasks']);
        } else {
          this.router.navigate(['/admin/tasks']);
        }
      },
      error: err => {
        this.error = err.message || 'Failed to save task';
        this.submitting = false;
      }
    });
  }

  onCancel(): void {
    this.location.back();
  }

  getProjectName(projectId: number): string {
    const project = this.projects.find(p => p.id === projectId);
    return project ? project.title : 'Unknown Project';
  }
}
