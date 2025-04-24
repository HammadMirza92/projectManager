import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../services/auth.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An unknown error occurred!';

        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = `Error: ${error.error.message}`;
        } else {
          // Server-side error
          if (error.status === 401) {
            // Auto logout if 401 response returned from api
            this.authService.logout();
            location.reload();
            errorMessage = 'Your session has expired. Please login again.';
          } else if (error.status === 403) {
            errorMessage = 'You are not authorized to access this resource.';
            this.router.navigate(['/login']);
          } else if (error.status === 404) {
            errorMessage = 'Resource not found.';
          } else if (error.status >= 500) {
            errorMessage = 'Server error. Please try again later.';
          }

          // Use server error message if available
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }
        }

        // Show error in snackbar
        this.snackBar.open(errorMessage, 'Close', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          panelClass: ['error-snackbar']
        });

        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
