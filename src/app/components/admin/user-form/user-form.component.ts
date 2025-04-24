import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../../services/user.service';
import { User, UserRole, UserCreate, UserUpdate } from '../../../models/user.model';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent implements OnInit {
  userForm!: FormGroup;
  userId: number | null = null;
  isEditMode = false;
  isLoading = false;
  hidePassword = true;
  userRoles = Object.values(UserRole);

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initForm();

    // Check if we're in edit mode
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.userId = +params['id'];
        this.isEditMode = true;
        this.loadUserData();
      }
    });
  }

  initForm() {
    this.userForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(6)]],
      role: [UserRole.Client, [Validators.required]]
    });

    // Password is optional in edit mode
    if (this.isEditMode) {
      this.userForm.get('password')?.setValidators([]);
      this.userForm.get('password')?.updateValueAndValidity();
    }
  }

  loadUserData() {
    if (!this.userId) return;

    this.isLoading = true;
    this.userService.getUserById(this.userId)
      .subscribe({
        next: (user) => {
          this.userForm.patchValue({
            name: user.name,
            email: user.email,
            role: user.role
          });
          this.isLoading = false;
        },
        error: (error) => {
          this.snackBar.open('Failed to load user data', 'Close', { duration: 5000 });
          this.isLoading = false;
          this.router.navigate(['/admin/users']);
        }
      });
  }

  onSubmit() {
    if (this.userForm.invalid) {
      return;
    }

    this.isLoading = true;

    if (this.isEditMode) {
      this.updateUser();
    } else {
      this.createUser();
    }
  }

  createUser() {
    const userData: UserCreate = {
      name: this.userForm.value.name,
      email: this.userForm.value.email,
      password: this.userForm.value.password,
      role: this.userForm.value.role
    };

    this.userService.createUser(userData)
      .subscribe({
        next: () => {
          this.snackBar.open('User created successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/admin/users']);
        },
        error: (error) => {
          this.snackBar.open('Failed to create user', 'Close', { duration: 5000 });
          this.isLoading = false;
        }
      });
  }

  updateUser() {
    if (!this.userId) return;

    const userData: UserUpdate = {};

    if (this.userForm.value.name) {
      userData.name = this.userForm.value.name;
    }

    if (this.userForm.value.email) {
      userData.email = this.userForm.value.email;
    }

    if (this.userForm.value.password) {
      userData.password = this.userForm.value.password;
    }

    this.userService.updateUser(this.userId, userData)
      .subscribe({
        next: () => {
          this.snackBar.open('User updated successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/admin/users']);
        },
        error: (error) => {
          this.snackBar.open('Failed to update user', 'Close', { duration: 5000 });
          this.isLoading = false;
        }
      });
  }

  cancel() {
    this.router.navigate(['/admin/users']);
  }
}
