import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { User, UserRole } from '../../../models/user.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Input() mobileQuery!: MediaQueryList;
  @Output() toggleSidenav = new EventEmitter<void>();

  currentUser: User | null = null;
  unreadCount: number = 0;

  constructor(
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
      this.loadUnreadNotificationsCount();
    });
  }

  loadUnreadNotificationsCount() {
    if (this.currentUser) {
      this.notificationService.getUnreadNotificationsCount(this.currentUser.id)
        .subscribe(count => {
          this.unreadCount = count;
        });
    }
  }

  onToggleSidenav() {
    this.toggleSidenav.emit();
  }

  navigateToDashboard() {
    if (this.currentUser) {
      switch (this.currentUser.role) {
        case UserRole.Admin:
          this.router.navigate(['/admin/dashboard']);
          break;
        case UserRole.Developer:
          this.router.navigate(['/developer/dashboard']);
          break;
        case UserRole.Client:
          this.router.navigate(['/client/dashboard']);
          break;
      }
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
