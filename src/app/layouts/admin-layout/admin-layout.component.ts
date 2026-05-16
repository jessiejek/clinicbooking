import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavItem } from '../../core/models';
import { ClinicSettingsService } from '../../core/services/clinic-settings.service';
import { logout as logoutAction } from '../../store/auth/auth.actions';
import { selectCurrentUser } from '../../store/auth/auth.selectors';
import { selectBookingsByStatus } from '../../store/bookings/bookings.selectors';
import { selectUnreadCount } from '../../store/notifications/notifications.selectors';
import { SidebarComponent } from '../../portals/admin/components/sidebar/sidebar.component';
import { TopbarComponent } from '../../portals/admin/components/topbar/topbar.component';

@Component({
  selector: 'app-admin-layout',
  template: `
    <div class="portal-layout">
      <app-admin-sidebar
        class="portal-layout__sidebar"
        [navItems]="navItems"
        [portalLabel]="portalLabel"
        [clinicName]="clinicName"
        [currentUser]="currentUser()"
        (logout)="logout()"
      ></app-admin-sidebar>

      <div class="main-content">
        <app-admin-topbar
          [title]="pageTitle"
          [portalLabel]="portalLabel"
          [currentUser]="currentUser()"
          [unreadCount]="unreadCount()"
          (logout)="logout()"
        ></app-admin-topbar>

        <main class="page-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styleUrl: './admin-layout.component.scss',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent]
})
export class AdminLayoutComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly clinicSettingsService = inject(ClinicSettingsService);
  private readonly destroyRef = inject(DestroyRef);

  readonly currentUser = this.store.selectSignal(selectCurrentUser);
  readonly unreadCount = this.store.selectSignal(selectUnreadCount);
  readonly pendingBookings = this.store.selectSignal(selectBookingsByStatus('Pending'));

  clinicName = '';
  portalLabel = 'Admin Portal';
  portalTitle = 'Dashboard';
  pageTitle = 'Dashboard';

  get pendingCount(): number {
    return this.pendingBookings().length;
  }

  get navItems(): NavItem[] {
    return [
      { section: 'CORE', label: 'Dashboard', route: '/admin/dashboard', icon: 'grid-outline' },
      {
        section: 'CORE',
        label: 'Bookings',
        route: '/admin/bookings',
        icon: 'calendar-outline',
        badgeCount: this.pendingCount
      },
      { section: 'CORE', label: 'Patients', route: '/admin/patients', icon: 'people-outline' },
      { section: 'CORE', label: 'Doctors', route: '/admin/doctors', icon: 'medical-outline' },
      { section: 'CORE', label: 'Calendar', route: '/admin/calendar', icon: 'calendar-number-outline' },
      { section: 'MANAGEMENT', label: 'Services', route: '/admin/services', icon: 'briefcase-outline' },
      { section: 'MANAGEMENT', label: 'Staff', route: '/admin/staff', icon: 'person-outline' },
      { section: 'MANAGEMENT', label: 'Walk-In', route: '/admin/walk-in', icon: 'walk-outline' },
      { section: 'ANALYTICS', label: 'Reports', route: '/admin/reports', icon: 'bar-chart-outline' },
      {
        section: 'ANALYTICS',
        label: 'Audit Log',
        route: '/admin/audit-logs',
        icon: 'document-text-outline'
      },
      {
        section: 'SYSTEM',
        label: 'Announcements',
        route: '/admin/announcements',
        icon: 'megaphone-outline'
      },
      { section: 'SYSTEM', label: 'Settings', route: '/admin/settings', icon: 'settings-outline' }
    ];
  }

  ngOnInit(): void {
    this.clinicName = this.clinicSettingsService.load().clinicName;
    this.updatePageTitle();

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => this.updatePageTitle());
  }

  logout(): void {
    this.store.dispatch(logoutAction());
    void this.router.navigate(['/auth/login']);
  }

  private updatePageTitle(): void {
    const route = this.getDeepestChild(this.route);
    this.pageTitle = (route.snapshot.data['title'] as string | undefined) ?? this.portalTitle;
  }

  private getDeepestChild(route: ActivatedRoute): ActivatedRoute {
    let current = route;
    while (current.firstChild) {
      current = current.firstChild;
    }
    return current;
  }
}
