// components/shared/task-form/task-form.component.ts
import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TaskService } from '../../../services/task.service';
import { ProjectService } from '../../../services/project.service';
import { UserService } from '../../../services/user.service';
import { Task, TaskStatus } from '../../../models/task.model';
import { Project } from '../../../models/project.model';
import { User, UserRole } from '../../../models/user.model';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Component({
  selector: 'app-task-form',
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.scss']
})
export class TaskFormComponent implements OnInit {
  taskForm!: FormGroup;
  loading = false;
  submitted = false;
  currentUser:any;
  currentUserRole:any;
  error = '';
  projects: Project[] = [];
  developers: User[] = [];
  editMode = false;
  taskStatusOptions = Object.keys(TaskStatus)
    .filter(key => !isNaN(Number(TaskStatus[key as keyof typeof TaskStatus])))
    .map(key => ({
      value: TaskStatus[key as keyof typeof TaskStatus],
      label: key
    }));

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<TaskFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { task: Task | null; projectId: number | null },
    private taskService: TaskService,
    private projectService: ProjectService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.editMode = !!this.data.task;
    this.currentUser = localStorage.getItem('currentUser');
    const parsedUser = this.currentUser ? JSON.parse(this.currentUser) : null;
    this.currentUserRole = parsedUser?.role || '';
    this.initForm();
    this.loadFormData();
  }

  initForm(): void {
    this.taskForm = this.fb.group({
      title: [this.data.task?.title || '', [Validators.required, Validators.maxLength(200)]],
      description: [this.data.task?.description || '', Validators.maxLength(500)],
      projectId: [{
        value: this.data.task?.projectId || this.data.projectId || '',
        disabled: !!this.data.projectId || this.editMode
      }, Validators.required],
      dueDate: [this.data.task?.dueDate || null],
      status: [this.data.task?.status || TaskStatus.ToDo, Validators.required],
      assignedToId: [this.data.task?.assignedToId || null]
    });
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


    // Load data in parallel
    forkJoin({
      projects: projectsObservable,
      //developers: developersObservable
    }).subscribe({
      next: result => {
        this.projects = result.projects;
       // this.developers = result.developers;
        this.loading = false;
      },
      error: err => {
        this.error = 'Failed to load form data';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.taskForm.invalid) {
      return;
    }

    this.loading = true;

    const formData = this.taskForm.getRawValue();

    // Handle the case when projectId is disabled
    if (this.data.projectId && (!formData.projectId || this.taskForm.get('projectId')?.disabled)) {
      formData.projectId = this.data.projectId;
    }

    let request: Observable<Task>;

    if (this.editMode) {
      request = this.taskService.updateTask(this.data.task!.id, formData);
    } else {
      request = this.taskService.createTask(formData);
    }

    request.subscribe({
      next: task => {
        this.loading = false;
        this.dialogRef.close(task);
      },
      error: err => {
        this.error = err.message || 'Failed to save task';
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getProjectName(projectId: number): string {
    const project = this.projects.find(p => p.id === projectId);
    return project ? project.title : 'Unknown Project';
  }

  getDeveloperName(userId: number): string {
    const developer = this.developers.find(d => d.id === userId);
    return developer ? developer.name : 'Unknown Developer';
  }
}
