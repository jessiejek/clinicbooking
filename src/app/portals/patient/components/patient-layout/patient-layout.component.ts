import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { addIcons } from 'ionicons';
import {
  calendarOutline,
  documentTextOutline,
  gridOutline,
  logOutOutline,
  medkitOutline,
  medicalOutline,
  personOutline
} from 'ionicons/icons';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavItem } from '../../../../core/models';
import { AuthStateService } from '../../../../core/services/auth-state.service';
import { ClinicSettingsService } from '../../../../core/services/clinic-settings.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { SidebarComponent } from '../../../admin/components/sidebar/sidebar.component';
import { TopbarComponent } from '../../../admin/components/topbar/topbar.component';
import { PATIENT_NAV_ITEMS } from '../../patient.routes';

@Component({
  selector: 'app-patient-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent],
  template: `
    <div class="portal-layout">
      <app-admin-sidebar
        class="portal-layout__sidebar"
        [navItems]="navItems"
        [portalLabel]="portalLabel"
        [clinicName]="clinicName"
        [currentUser]="currentUser()"
        [isOpen]="sidebarOpen"
        (navClick)="closeSidebar()"
        (logout)="logout()"
      ></app-admin-sidebar>

      <div class="main-content">
        <app-admin-topbar
          [title]="pageTitle"
          [portalLabel]="portalLabel"
          [searchPlaceholder]="searchPlaceholder"
          [currentUser]="currentUser()"
          [unreadCount]="unreadCount()"
          (menuToggle)="openSidebar()"
          (logout)="logout()"
        ></app-admin-topbar>

        <main class="page-content">
          <router-outlet></router-outlet>
        </main>
      </div>

      <div
        class="sidebar-overlay"
        [class.is-visible]="sidebarOpen"
        (click)="closeSidebar()"
        aria-hidden="true"
      ></div>
    </div>
  `,
  styleUrl: './patient-layout.component.scss'
})
export class PatientLayoutComponent implements OnInit {
  private readonly authState = inject(AuthStateService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly clinicSettingsService = inject(ClinicSettingsService);
  private readonly destroyRef = inject(DestroyRef);

  readonly currentUser = this.authState.currentUser;
  readonly unreadCount = this.notificationService.unreadCount;

  clinicName = '';
  portalLabel = 'Patient Portal';
  portalTitle = 'Dashboard';
  pageTitle = 'Dashboard';
  searchPlaceholder = 'Search doctors, bookings...';
  navItems: NavItem[] = PATIENT_NAV_ITEMS;
  sidebarOpen = false;

  constructor() {
    addIcons({
      gridOutline,
      calendarOutline,
      documentTextOutline,
      medicalOutline,
      medkitOutline,
      personOutline,
      logOutOutline
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

  openSidebar(): void {
    this.sidebarOpen = true;
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }

  logout(): void {
    this.authState.logout();
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
