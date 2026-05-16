import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavItem } from '../../core/models';
import { ClinicSettingsService } from '../../core/services/clinic-settings.service';
import { logout as logoutAction } from '../../store/auth/auth.actions';
import { selectCurrentUser } from '../../store/auth/auth.selectors';
import { selectUnreadCount } from '../../store/notifications/notifications.selectors';
import { SidebarComponent } from '../../portals/admin/components/sidebar/sidebar.component';
import { TopbarComponent } from '../../portals/admin/components/topbar/topbar.component';

@Component({
  selector: 'app-staff-layout',
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
  styleUrl: './staff-layout.component.scss',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent]
})
export class StaffLayoutComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly clinicSettingsService = inject(ClinicSettingsService);
  private readonly destroyRef = inject(DestroyRef);

  readonly currentUser = this.store.selectSignal(selectCurrentUser);
  readonly unreadCount = this.store.selectSignal(selectUnreadCount);

  clinicName = '';
  portalLabel = 'Staff Portal';
  portalTitle = 'Dashboard';
  pageTitle = 'Dashboard';

  readonly navItems: NavItem[] = [
    { section: 'CORE', label: 'Dashboard', route: '/staff/dashboard', icon: 'grid-outline' },
    { section: 'CORE', label: 'Bookings', route: '/staff/bookings', icon: 'calendar-outline' },
    { section: 'CORE', label: 'Walk-In', route: '/staff/walk-in', icon: 'walk-outline' },
    { section: 'MANAGEMENT', label: 'Patients', route: '/staff/patients', icon: 'people-outline' },
    {
      section: 'TOOLS',
      label: 'Doctor Status',
      route: '/staff/doctor-status',
      icon: 'medical-outline'
    },
    { section: 'ACCOUNT', label: 'My Profile', route: '/staff/profile', icon: 'person-outline' }
  ];

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
