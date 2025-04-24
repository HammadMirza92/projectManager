import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router
} from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const currentUser = this.authService.currentUserValue;
    const requiredRoles = route.data['roles'] as UserRole[];

    if (currentUser && requiredRoles && requiredRoles.includes(currentUser.role)) {
      // Role is allowed, so return true
      return true;
    }

    // Role not authorized, redirect to home page
    this.router.navigate(['/']);
    return false;
  }
}
