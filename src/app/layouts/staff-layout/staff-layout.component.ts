import { AsyncPipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { addIcons } from 'ionicons';
import {
  calendarOutline,
  gridOutline,
  logOutOutline,
  medicalOutline,
  notificationsOutline,
  peopleOutline,
  personOutline,
  searchOutline,
  timeOutline,
  walkOutline
} from 'ionicons/icons';
import { NavItem } from '../../core/models';
import { ClinicSettingsService } from '../../core/services/clinic-settings.service';
import { logout } from '../../store/auth/auth.actions';
import { selectCurrentUser } from '../../store/auth/auth.selectors';
import { selectUnreadCount } from '../../store/notifications/notifications.selectors';
import { SidebarComponent } from '../../portals/admin/components/sidebar/sidebar.component';
import { TopbarComponent } from '../../portals/admin/components/topbar/topbar.component';

@Component({
  selector: 'app-staff-layout',
  standalone: true,
  imports: [AsyncPipe, RouterOutlet, SidebarComponent, TopbarComponent],
  template: `
    <div class="portal-layout">
      <app-admin-sidebar
        class="portal-layout__sidebar"
        [navItems]="navItems"
        [portalLabel]="portalLabel"
        [clinicName]="clinicName"
        [currentUser]="currentUser$ | async"
        (logout)="logoutUser()"
      ></app-admin-sidebar>

      <div class="main-content">
        <app-admin-topbar
          [title]="pageTitle"
          [portalLabel]="portalLabel"
          [currentUser]="currentUser$ | async"
          [unreadCount]="(unreadCount$ | async) ?? 0"
          (logout)="logoutUser()"
        ></app-admin-topbar>

        <div class="page-content">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
  styleUrl: './staff-layout.component.scss'
})
export class StaffLayoutComponent implements OnInit {
  readonly portalLabel = 'Staff Portal';
  readonly navItems: NavItem[] = [
    { label: 'Dashboard', route: '/staff/dashboard', icon: 'grid-outline', section: 'Main' },
    { label: 'Bookings', route: '/staff/bookings', icon: 'calendar-outline', section: 'Main' },
    { label: 'Walk-In', route: '/staff/walk-in', icon: 'walk-outline', section: 'Main' },
    { label: 'Patients', route: '/staff/patients', icon: 'people-outline', section: 'Records' },
    {
      label: 'Doctor Status',
      route: '/staff/doctor-status',
      icon: 'medical-outline',
      section: 'Tools'
    },
    { label: 'My Profile', route: '/staff/profile', icon: 'person-outline', section: 'Account' }
  ];

  readonly currentUser$ = inject(Store).select(selectCurrentUser);
  readonly unreadCount$ = inject(Store).select(selectUnreadCount);

  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly clinicSettingsService = inject(ClinicSettingsService);
  private readonly destroyRef = inject(DestroyRef);

  clinicName = '';
  pageTitle = 'Dashboard';

  constructor() {
    addIcons({
      calendarOutline,
      gridOutline,
      logOutOutline,
      medicalOutline,
      notificationsOutline,
      peopleOutline,
      personOutline,
      searchOutline,
      timeOutline,
      walkOutline
    });
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

  logoutUser(): void {
    this.store.dispatch(logout());
    void this.router.navigate(['/auth/login']);
  }

  private updatePageTitle(): void {
    const activeRoute = this.getDeepestChild(this.route);
    this.pageTitle = (activeRoute.snapshot.data['title'] as string | undefined) ?? 'Dashboard';
  }

  private getDeepestChild(route: ActivatedRoute): ActivatedRoute {
    let current = route;
    while (current.firstChild) {
      current = current.firstChild;
    }
    return current;
  }
}
