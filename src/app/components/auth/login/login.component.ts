import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../services/auth.service';
import { UserLogin, UserRole } from '../../../models/user.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  hidePassword = true;
  returnUrl: string = '/';

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    // Get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    // Redirect if already logged in
    if (this.authService.isAuthenticated()) {
      this.redirectBasedOnRole();
    }
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    const loginData: UserLogin = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    this.authService.login(loginData)
      .subscribe({
        next: (user) => {
          this.isLoading = false;
          this.snackBar.open('Login successful', 'Close', { duration: 3000 });
          if (this.returnUrl && this.returnUrl !== '/') {
            this.router.navigateByUrl(this.returnUrl);
          } else {
            this.redirectBasedOnRole();
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.snackBar.open(error.message || 'Login failed', 'Close', { duration: 5000 });
        }
      });
  }

  private redirectBasedOnRole() {
    const currentUser = this.authService.currentUserValue;
    if (currentUser) {
      switch (currentUser.role) {
        case UserRole.Admin:
          this.router.navigate(['/admin/dashboard']);
          break;
        case UserRole.Developer:
          this.router.navigate(['/developer/dashboard']);
          break;
        case UserRole.Client:
          this.router.navigate(['/client/dashboard']);
          break;
        default:
          this.router.navigate(['/']);
      }
    }
  }
}
