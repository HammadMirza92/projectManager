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
    const now = new Date();
    this.projectForm = this.formBuilder.group({
      title: ['', [Validators.required]],
      description: [''],
      orderLink: ['', [Validators.required]],
      developerId: [null, [Validators.required]],
      clientId: [null, [Validators.required]],
      websiteUrl: [''],
      websiteLogin: [''],
      startDate: [now, [Validators.required]],
      startTime: [this.formatTime(now)],
      endDate: [null, [Validators.required]],
      endTime: [''],
      daysRemainingWrtDev: [{ value: null, disabled: true }],
      extendedDays: [0],
      sourceOfProject: [''],
      totalBudget: [0, [Validators.required, Validators.min(0)]],
      totalAfterDeduction: [0, [Validators.required, Validators.min(0)]],
      developerAmount: [0, [Validators.required, Validators.min(0)]],
      status: [ProjectStatus.Pending, [Validators.required]],
      platform: [''],
      // Admin payment fields
      paymentInDollarTotal: [0],
      paymentInDollarAfterDeduction: [0],
      paymentWrtDevTotal: [0],
      paymentWrtDevAfterDeduction: [0],
      tipAmount: [0],
      devPayment: [0],
      devPaymentStatus: [false],
      paymentStatusOnFiverr: [''],
      dollarRate: [0],
      dollarRateWrtDev: [0]
    });
  }

  private formatTime(date: Date): string {
    const h = date.getHours().toString().padStart(2, '0');
    const m = date.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  }

  private combineDateAndTime(date: Date | null, time: string): Date | null {
    if (!date) return null;
    const d = new Date(date);
    if (time) {
      const [hours, minutes] = time.split(':').map(Number);
      d.setHours(hours || 0, minutes || 0, 0, 0);
    }
    return d;
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
            startTime: this.formatTime(new Date(project.startDate)),
            endDate: new Date(project.endDate),
            endTime: this.formatTime(new Date(project.endDate)),
            daysRemainingWrtDev: project.daysRemainingWrtDev ?? null,
            extendedDays: project.extendedDays ?? 0,
            sourceOfProject: project.sourceOfProject,
            totalBudget: project.totalBudget,
            totalAfterDeduction: project.totalAfterDeduction,
            developerAmount: project.developerAmount,
            status: project.status,
            platform: project.platform,
            paymentInDollarTotal: project.paymentInDollarTotal || 0,
            paymentInDollarAfterDeduction: project.paymentInDollarAfterDeduction || 0,
            paymentWrtDevTotal: project.paymentWrtDevTotal || 0,
            paymentWrtDevAfterDeduction: project.paymentWrtDevAfterDeduction || 0,
            tipAmount: project.tipAmount || 0,
            devPayment: project.devPayment || 0,
            devPaymentStatus: project.devPaymentStatus || false,
            paymentStatusOnFiverr: project.paymentStatusOnFiverr || '',
            dollarRate: project.dollarRate || 0,
            dollarRateWrtDev: project.dollarRateWrtDev || 0
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
    const v = this.projectForm.value;
    const projectData: ProjectCreate = {
      title: v.title,
      description: v.description,
      orderLink: v.orderLink,
      developerId: v.developerId,
      clientId: v.clientId,
      websiteUrl: v.websiteUrl,
      websiteLogin: v.websiteLogin,
      startDate: this.combineDateAndTime(v.startDate, v.startTime) ?? v.startDate,
      endDate: this.combineDateAndTime(v.endDate, v.endTime) ?? v.endDate,
      extendedDays: v.extendedDays || 0,
      sourceOfProject: v.sourceOfProject,
      totalBudget: v.totalBudget,
      totalAfterDeduction: v.totalAfterDeduction,
      developerAmount: v.developerAmount,
      status: v.status,
      platform: v.platform,
      paymentInDollarTotal: v.paymentInDollarTotal,
      paymentInDollarAfterDeduction: v.paymentInDollarAfterDeduction,
      paymentWrtDevTotal: v.paymentWrtDevTotal,
      paymentWrtDevAfterDeduction: v.paymentWrtDevAfterDeduction,
      tipAmount: v.tipAmount,
      devPayment: v.devPayment,
      devPaymentStatus: v.devPaymentStatus,
      paymentStatusOnFiverr: v.paymentStatusOnFiverr,
      dollarRate: v.dollarRate,
      dollarRateWrtDev: v.dollarRateWrtDev
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

    const v = this.projectForm.value;
    const projectData: ProjectUpdate = {
      title: v.title,
      description: v.description,
      orderLink: v.orderLink,
      developerId: v.developerId,
      websiteUrl: v.websiteUrl,
      websiteLogin: v.websiteLogin,
      startDate: this.combineDateAndTime(v.startDate, v.startTime) ?? v.startDate,
      endDate: this.combineDateAndTime(v.endDate, v.endTime) ?? v.endDate,
      extendedDays: v.extendedDays || 0,
      sourceOfProject: v.sourceOfProject,
      totalBudget: v.totalBudget,
      totalAfterDeduction: v.totalAfterDeduction,
      developerAmount: v.developerAmount,
      status: v.status,
      platform: v.platform,
      paymentInDollarTotal: v.paymentInDollarTotal,
      paymentInDollarAfterDeduction: v.paymentInDollarAfterDeduction,
      paymentWrtDevTotal: v.paymentWrtDevTotal,
      paymentWrtDevAfterDeduction: v.paymentWrtDevAfterDeduction,
      tipAmount: v.tipAmount,
      devPayment: v.devPayment,
      devPaymentStatus: v.devPaymentStatus,
      paymentStatusOnFiverr: v.paymentStatusOnFiverr,
      dollarRate: v.dollarRate,
      dollarRateWrtDev: v.dollarRateWrtDev
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
    const totalAfterDeduction = totalBudget * 0.9;
    const developerAmount = totalAfterDeduction * 0.7;
    this.projectForm.patchValue({ totalAfterDeduction, developerAmount }, { emitEvent: false });
  }

  onPaymentTotalChange() {
    const total = this.projectForm.get('paymentInDollarTotal')?.value || 0;
    const afterDeduction = Math.round(total * 0.8 * 100) / 100;
    const wrtDevTotal = afterDeduction;
    const wrtDevAfterDeduction = Math.round(afterDeduction * 0.8 * 100) / 100;
    const devPayment = Math.round(wrtDevAfterDeduction * 0.5 * 100) / 100;
    this.projectForm.patchValue({
      paymentInDollarAfterDeduction: afterDeduction,
      paymentWrtDevTotal: wrtDevTotal,
      paymentWrtDevAfterDeduction: wrtDevAfterDeduction,
      devPayment
    }, { emitEvent: false });
  }

  onExtendedDaysChange() {
    // Preview only — actual extension applied server-side on save
  }

  getExtendedDeadline(): Date | null {
    const endDate = this.projectForm.get('endDate')?.value;
    const extDays = this.projectForm.get('extendedDays')?.value || 0;
    if (!endDate || extDays <= 0) return null;
    const d = new Date(endDate);
    d.setDate(d.getDate() + extDays);
    return d;
  }

  onWrtDevChange() {
    const wrtDevAfterDeduction = this.projectForm.get('paymentWrtDevAfterDeduction')?.value || 0;
    const devPayment = Math.round(wrtDevAfterDeduction * 0.5 * 100) / 100;
    this.projectForm.patchValue({ devPayment }, { emitEvent: false });
  }

  cancel() {
    this.router.navigate(['/admin/projects']);
  }
}
