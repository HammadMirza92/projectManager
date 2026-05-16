import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TaskService } from '../../../services/task.service';
import { AuthService } from '../../../services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Task, TaskStatus } from '../../../models/task.model';
import { TaskFormComponent } from '../task-form/task-form.component';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-task-board',
  templateUrl: './task-board.component.html',
  styleUrls: ['./task-board.component.scss']
})
export class TaskBoardComponent implements OnInit {
  @Input() projectId: number | null = null;
  @Output() tasksUpdated = new EventEmitter<void>();

  todoTasks: Task[] = [];
  inProgressTasks: Task[] = [];
  doneTasks: Task[] = [];

  loading: boolean = false;
  error: string | null = null;

  currentUserRole: string = '';
  currentUserId: number = 0;

  TaskStatus = TaskStatus;

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    const userInfo = this.authService.getUserInfo();
    if (userInfo) {
      this.currentUserRole = userInfo.role;
      this.currentUserId = userInfo.id;
    }
  }

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.loading = true;
    this.error = null;

    if (this.projectId) {
      this.taskService.getTasksByProject(this.projectId).subscribe({
        next: (tasks) => {
          this.processTasks(tasks);
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading tasks:', err);
          this.error = 'Failed to load tasks. Please try again later.';
          this.loading = false;
        }
      });
    } else {
      this.taskService.getTasks(0, 100).subscribe({
        next: (response) => {
          this.processTasks(response.items);
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading tasks:', err);
          this.error = 'Failed to load tasks. Please try again later.';
          this.loading = false;
        }
      });
    }
  }

  processTasks(tasks: Task[]): void {
    this.todoTasks = tasks.filter(task => task.status === TaskStatus.ToDo);
    this.inProgressTasks = tasks.filter(task => task.status === TaskStatus.InProgress);
    this.doneTasks = tasks.filter(task => task.status === TaskStatus.Done);
  }

  openTaskForm(): void {
    const dialogRef = this.dialog.open(TaskFormComponent, {
      width: '600px',
      data: {
        projectId: this.projectId,
        isEdit: false
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadTasks();
        this.tasksUpdated.emit();
      }
    });
  }

  onStatusChanged(): void {
    this.loadTasks();
    this.tasksUpdated.emit();
  }

  onTaskDeleted(taskId: number): void {
    this.todoTasks = this.todoTasks.filter(t => t.id !== taskId);
    this.inProgressTasks = this.inProgressTasks.filter(t => t.id !== taskId);
    this.doneTasks = this.doneTasks.filter(t => t.id !== taskId);
    this.tasksUpdated.emit();
  }

  drop(event: CdkDragDrop<Task[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Get the task being moved
      const task = event.previousContainer.data[event.previousIndex];

      // Determine the new status based on the destination container
      let newStatus: TaskStatus;

      if (event.container.id === 'todo-list') {
        newStatus = TaskStatus.ToDo;
      } else if (event.container.id === 'in-progress-list') {
        newStatus = TaskStatus.InProgress;
      } else {
        newStatus = TaskStatus.Done;
      }

      // Update the task's status in the database
      this.taskService.updateTask(task.id, { status: newStatus }).subscribe({
        next: () => {
          // Only move the item in the UI once the API call succeeds
          transferArrayItem(
            event.previousContainer.data,
            event.container.data,
            event.previousIndex,
            event.currentIndex,
          );

          // Update the task's status in our local data
          task.status = newStatus;
          this.tasksUpdated.emit();
        },
        error: (error) => {
          console.error('Error updating task status:', error);
          this.snackBar.open('Failed to update task status', 'Close', { duration: 3000 });
        }
      });
    }
  }

  canAddTask(): boolean {
    return this.currentUserRole === UserRole.Admin || this.currentUserRole === UserRole.Developer;
  }
}
