import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProjectService } from '../../../services/project.service';
import { UserService } from '../../../services/user.service';
import { Project, ProjectStatus, ProjectCreate, ProjectUpdate } from '../../../models/project.model';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-project-form',
  templateUrl: './project-form.component.html',
  styleUrls: ['./project-form.component.scss']
})
export class ProjectFormComponent implements OnInit {
  projectForm!: FormGroup;
  projectId: number | null = null;
  isEditMode = false;
  isLoading = false;

  developers: User[] = [];
  clients: User[] = [];
  projectStatuses = Object.values(ProjectStatus);

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.initForm();

    // Check if we're in edit mode
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.projectId = +params['id'];
        this.isEditMode = true;
        this.loadProjectData();
      }
    });
  }

  loadUsers() {
    this.userService.getDevelopers().subscribe(developers => this.developers = developers);
    this.userService.getClients().subscribe(clients => this.clients = clients);
  }

  initForm() {
    this.projectForm = this.formBuilder.group({
      title: ['', [Validators.required]],
      description: [''],
      orderLink: ['', [Validators.required]],
      developerId: [null, [Validators.required]],
      clientId: [null, [Validators.required]],
      websiteUrl: [''],
      websiteLogin: [''],
      startDate: [new Date(), [Validators.required]],
      endDate: [null, [Validators.required]],
      sourceOfProject: [''],
      totalBudget: [0, [Validators.required, Validators.min(0)]],
      totalAfterDeduction: [0, [Validators.required, Validators.min(0)]],
      developerAmount: [0, [Validators.required, Validators.min(0)]],
      status: [ProjectStatus.Pending, [Validators.required]],
      platform: ['']
    });
  }

  loadProjectData() {
    if (!this.projectId) return;

    this.isLoading = true;
    this.projectService.getProjectById(this.projectId)
      .subscribe({
        next: (project) => {
          this.projectForm.patchValue({
            title: project.title,
            description: project.description,
            orderLink: project.orderLink,
            developerId: project.developerId,
            clientId: project.clientId,
            websiteUrl: project.websiteUrl,
            websiteLogin: project.websiteLogin,
            startDate: new Date(project.startDate),
            endDate: new Date(project.endDate),
            sourceOfProject: project.sourceOfProject,
            totalBudget: project.totalBudget,
            totalAfterDeduction: project.totalAfterDeduction,
            developerAmount: project.developerAmount,
            status: project.status,
            platform: project.platform
          });
          this.isLoading = false;
        },
        error: (error) => {
          this.snackBar.open('Failed to load project data', 'Close', { duration: 5000 });
          this.isLoading = false;
          this.router.navigate(['/admin/projects']);
        }
      });
  }

  onSubmit() {
    if (this.projectForm.invalid) {
      return;
    }

    this.isLoading = true;

    if (this.isEditMode) {
      this.updateProject();
    } else {
      this.createProject();
    }
  }

  createProject() {
    const projectData: ProjectCreate = {
      title: this.projectForm.value.title,
      description: this.projectForm.value.description,
      orderLink: this.projectForm.value.orderLink,
      developerId: this.projectForm.value.developerId,
      clientId: this.projectForm.value.clientId,
      websiteUrl: this.projectForm.value.websiteUrl,
      websiteLogin: this.projectForm.value.websiteLogin,
      startDate: this.projectForm.value.startDate,
      endDate: this.projectForm.value.endDate,
      sourceOfProject: this.projectForm.value.sourceOfProject,
      totalBudget: this.projectForm.value.totalBudget,
      totalAfterDeduction: this.projectForm.value.totalAfterDeduction,
      developerAmount: this.projectForm.value.developerAmount,
      status: this.projectForm.value.status,
      platform: this.projectForm.value.platform
    };

    this.projectService.createProject(projectData)
      .subscribe({
        next: (project) => {
          this.snackBar.open('Project created successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/admin/projects']);
        },
        error: (error) => {
          this.snackBar.open('Failed to create project', 'Close', { duration: 5000 });
          this.isLoading = false;
        }
      });
  }

  updateProject() {
    if (!this.projectId) return;

    const projectData: ProjectUpdate = {
      title: this.projectForm.value.title,
      description: this.projectForm.value.description,
      orderLink: this.projectForm.value.orderLink,
      developerId: this.projectForm.value.developerId,
      websiteUrl: this.projectForm.value.websiteUrl,
      websiteLogin: this.projectForm.value.websiteLogin,
      startDate: this.projectForm.value.startDate,
      endDate: this.projectForm.value.endDate,
      sourceOfProject: this.projectForm.value.sourceOfProject,
      totalBudget: this.projectForm.value.totalBudget,
      totalAfterDeduction: this.projectForm.value.totalAfterDeduction,
      developerAmount: this.projectForm.value.developerAmount,
      status: this.projectForm.value.status,
      platform: this.projectForm.value.platform
    };

    this.projectService.updateProject(this.projectId, projectData)
      .subscribe({
        next: (project) => {
          this.snackBar.open('Project updated successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/admin/projects']);
        },
        error: (error) => {
          this.snackBar.open('Failed to update project', 'Close', { duration: 5000 });
          this.isLoading = false;
        }
      });
  }

  onTotalBudgetChange() {
    const totalBudget = this.projectForm.get('totalBudget')?.value || 0;
    // Calculate totalAfterDeduction as 90% of totalBudget (10% fee)
    const totalAfterDeduction = totalBudget * 0.9;
    // Calculate developerAmount as 70% of totalAfterDeduction
    const developerAmount = totalAfterDeduction * 0.7;

    this.projectForm.patchValue({
      totalAfterDeduction: totalAfterDeduction,
      developerAmount: developerAmount
    });
  }

  cancel() {
    this.router.navigate(['/admin/projects']);
  }
}
