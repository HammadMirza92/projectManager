import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { User, UserRole } from '../../../models/user.model';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent implements OnInit {
  @Input() mobileQuery!: MediaQueryList;
  @Output() closeSidenav = new EventEmitter<void>();

  currentUser: User | null = null;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
    });
  }

  getUserInitials(): string {
    if (!this.currentUser || !this.currentUser.name) return '';

    const nameParts = this.currentUser.name.split(' ');
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    } else {
      return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
    }
  }

  isAdmin(): boolean {
    return this.currentUser?.role === UserRole.Admin;
  }

  isDeveloper(): boolean {
    return this.currentUser?.role === UserRole.Developer;
  }

  isClient(): boolean {
    return this.currentUser?.role === UserRole.Client;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
    if (this.mobileQuery.matches) {
      this.closeSidenav.emit();
    }
  }
}
