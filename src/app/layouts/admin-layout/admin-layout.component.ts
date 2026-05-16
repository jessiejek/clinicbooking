import { AsyncPipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { addIcons } from 'ionicons';
import {
  barChartOutline,
  briefcaseOutline,
  calendarNumberOutline,
  calendarOutline,
  documentTextOutline,
  gridOutline,
  logOutOutline,
  medicalOutline,
  megaphoneOutline,
  menuOutline,
  notificationsOutline,
  peopleOutline,
  personOutline,
  searchOutline,
  settingsOutline,
  walkOutline
} from 'ionicons/icons';
import { NavItem } from '../../core/models';
import { ClinicSettingsService } from '../../core/services/clinic-settings.service';
import { logout } from '../../store/auth/auth.actions';
import { selectCurrentUser } from '../../store/auth/auth.selectors';
import { selectPendingVerifications } from '../../store/bookings/bookings.selectors';
import { selectUnreadCount } from '../../store/notifications/notifications.selectors';
import { SidebarComponent } from '../../portals/admin/components/sidebar/sidebar.component';
import { TopbarComponent } from '../../portals/admin/components/topbar/topbar.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [AsyncPipe, RouterOutlet, SidebarComponent, TopbarComponent],
  template: `
    <div class="portal-layout">
      <app-admin-sidebar
        class="portal-layout__sidebar"
        [class.is-open]="sidebarOpen"
        [navItems]="navItemsWithBadges"
        [portalLabel]="portalLabel"
        [clinicName]="clinicName"
        [currentUser]="currentUser$ | async"
        [isOpen]="sidebarOpen"
        (logout)="logoutUser()"
        (navClick)="closeSidebar()"
      ></app-admin-sidebar>

      <div
        class="sidebar-overlay"
        [class.is-visible]="sidebarOpen"
        (click)="closeSidebar()"
      ></div>

      <div class="main-content">
        <app-admin-topbar
          [title]="pageTitle"
          [portalLabel]="portalLabel"
          [currentUser]="currentUser$ | async"
          [unreadCount]="(unreadCount$ | async) ?? 0"
          (menuToggle)="toggleSidebar()"
          (logout)="logoutUser()"
        ></app-admin-topbar>

        <div class="page-content">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
  styleUrl: './admin-layout.component.scss'
})
export class AdminLayoutComponent implements OnInit {
  readonly portalLabel = 'Admin Portal';
  readonly navItems: NavItem[] = [
    { label: 'Dashboard', route: '/admin/dashboard', icon: 'grid-outline', section: 'CORE' },
    { label: 'Bookings', route: '/admin/bookings', icon: 'calendar-outline', section: 'CORE' },
    { label: 'Patients', route: '/admin/patients', icon: 'people-outline', section: 'CORE' },
    { label: 'Doctors', route: '/admin/doctors', icon: 'medical-outline', section: 'CORE' },
    {
      label: 'Calendar',
      route: '/admin/calendar',
      icon: 'calendar-number-outline',
      section: 'CORE'
    },
    { label: 'Services', route: '/admin/services', icon: 'briefcase-outline', section: 'MANAGEMENT' },
    { label: 'Staff', route: '/admin/staff', icon: 'person-outline', section: 'MANAGEMENT' },
    { label: 'Walk-In', route: '/admin/walk-in', icon: 'walk-outline', section: 'MANAGEMENT' },
    { label: 'Reports', route: '/admin/reports', icon: 'bar-chart-outline', section: 'ANALYTICS' },
    {
      label: 'Audit Log',
      route: '/admin/audit-logs',
      icon: 'document-text-outline',
      section: 'ANALYTICS'
    },
    {
      label: 'Announcements',
      route: '/admin/announcements',
      icon: 'megaphone-outline',
      section: 'SYSTEM'
    },
    { label: 'Settings', route: '/admin/settings', icon: 'settings-outline', section: 'SYSTEM' }
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
  pendingCount = 0;
  sidebarOpen = false;

  constructor() {
    addIcons({
      barChartOutline,
      briefcaseOutline,
      calendarNumberOutline,
      calendarOutline,
      documentTextOutline,
      gridOutline,
      logOutOutline,
      medicalOutline,
      megaphoneOutline,
      menuOutline,
      notificationsOutline,
      peopleOutline,
      personOutline,
      searchOutline,
      settingsOutline,
      walkOutline
    });
  }

  ngOnInit(): void {
    this.clinicName = this.clinicSettingsService.load().clinicName;
    this.updatePageTitle();

    this.store
      .select(selectPendingVerifications)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((bookings) => {
        this.pendingCount = bookings.length;
      });

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => this.updatePageTitle());
  }

  get navItemsWithBadges(): NavItem[] {
    return this.navItems.map((item) =>
      item.route === '/admin/bookings' ? { ...item, badgeCount: this.pendingCount } : item
    );
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
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
