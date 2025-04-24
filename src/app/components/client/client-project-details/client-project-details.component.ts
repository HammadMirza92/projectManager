import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProjectService } from '../../../services/project.service';
import { TaskService } from '../../../services/task.service';
import { AuthService } from '../../../services/auth.service';
import { Project } from '../../../models/project.model';
import { Task } from '../../../models/task.model';

@Component({
  selector: 'app-client-project-details',
  templateUrl: './client-project-details.component.html',
  styleUrls: ['./client-project-details.component.scss']
})
export class ClientProjectDetailsComponent implements OnInit {
  projectId: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private taskService: TaskService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.projectId = +params['id'];
        this.router.navigate(['/shared/project-details', this.projectId]);
      }
    });
  }
}
