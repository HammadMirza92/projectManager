import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PaymentService } from '../../../services/payment.service';
import { UserService } from '../../../services/user.service';
import { ProjectService } from '../../../services/project.service';
import { Payment, PaymentStatus, PaymentCreate, PaymentUpdate } from '../../../models/payment.model';
import { User } from '../../../models/user.model';
import { Project } from '../../../models/project.model';

@Component({
  selector: 'app-payment-form',
  templateUrl: './payment-form.component.html',
  styleUrls: ['./payment-form.component.scss']
})
export class PaymentFormComponent implements OnInit {
  paymentForm!: FormGroup;
  paymentId: number | null = null;
  isEditMode = false;
  isLoading = false;

  developers: User[] = [];
  projects: Project[] = [];
  paymentStatuses = Object.values(PaymentStatus);

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService,
    private userService: UserService,
    private projectService: ProjectService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadProjects();
    this.initForm();

    // Check if we're in edit mode
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.paymentId = +params['id'];
        this.isEditMode = true;
        this.loadPaymentData();
      }
    });
  }

  loadUsers() {
    this.userService.getDevelopers().subscribe(developers => this.developers = developers);
  }

  loadProjects() {
    this.projectService.getProjects(0, 1000).subscribe(response => this.projects = response.items);
  }

  initForm() {
    this.paymentForm = this.formBuilder.group({
      projectId: [null, [Validators.required]],
      developerId: [null, [Validators.required]],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      paymentDate: [new Date(), [Validators.required]],
      status: [PaymentStatus.Pending, [Validators.required]],
      paymentDetails: ['']
    });
  }

  loadPaymentData() {
    if (!this.paymentId) return;

    this.isLoading = true;
    this.paymentService.getPaymentById(this.paymentId)
      .subscribe({
        next: (payment) => {
          this.paymentForm.patchValue({
            projectId: payment.projectId,
            developerId: payment.developerId,
            amount: payment.amount,
            paymentDate: new Date(payment.paymentDate),
            status: payment.status,
            paymentDetails: payment.paymentDetails
          });
          this.isLoading = false;
        },
        error: (error) => {
          this.snackBar.open('Failed to load payment data', 'Close', { duration: 5000 });
          this.isLoading = false;
          this.router.navigate(['/admin/payments']);
        }
      });
  }

  onSubmit() {
    if (this.paymentForm.invalid) {
      return;
    }

    this.isLoading = true;

    if (this.isEditMode) {
      this.updatePayment();
    } else {
      this.createPayment();
    }
  }

  createPayment() {
    const paymentData: PaymentCreate = {
      projectId: this.paymentForm.value.projectId,
      developerId: this.paymentForm.value.developerId,
      amount: this.paymentForm.value.amount,
      paymentDate: this.paymentForm.value.paymentDate,
      status: this.paymentForm.value.status,
      paymentDetails: this.paymentForm.value.paymentDetails
    };

    this.paymentService.createPayment(paymentData)
      .subscribe({
        next: () => {
          this.snackBar.open('Payment created successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/admin/payments']);
        },
        error: (error) => {
          this.snackBar.open('Failed to create payment', 'Close', { duration: 5000 });
          this.isLoading = false;
        }
      });
  }

  updatePayment() {
    if (!this.paymentId) return;

    const paymentData: PaymentUpdate = {
      amount: this.paymentForm.value.amount,
      paymentDate: this.paymentForm.value.paymentDate,
      status: this.paymentForm.value.status,
      paymentDetails: this.paymentForm.value.paymentDetails
    };

    this.paymentService.updatePayment(this.paymentId, paymentData)
      .subscribe({
        next: () => {
          this.snackBar.open('Payment updated successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/admin/payments']);
        },
        error: (error) => {
          this.snackBar.open('Failed to update payment', 'Close', { duration: 5000 });
          this.isLoading = false;
        }
      });
  }

  onProjectChange() {
    const projectId = this.paymentForm.value.projectId;
    if (projectId) {
      const selectedProject = this.projects.find(p => p.id === projectId);
      if (selectedProject) {
        this.paymentForm.patchValue({
          developerId: selectedProject.developerId
        });
      }
    }
  }

  cancel() {
    this.router.navigate(['/admin/payments']);
  }
}
