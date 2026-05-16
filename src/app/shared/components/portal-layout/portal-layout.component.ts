import { AsyncPipe } from '@angular/common';
import { Component, DestroyRef, Input, OnInit, inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { addIcons } from 'ionicons';
import {
  alertCircleOutline,
  arrowBackOutline,
  cashOutline,
  calendarNumberOutline,
  calendarOutline,
  checkmarkCircleOutline,
  checkmarkOutline,
  closeOutline,
  createOutline,
  documentTextOutline,
  ellipsisVertical,
  eyeOffOutline,
  eyeOutline,
  gridOutline,
  listOutline,
  logOutOutline,
  medicalOutline,
  megaphoneOutline,
  menuOutline,
  notificationsOutline,
  peopleOutline,
  personAddOutline,
  personCircleOutline,
  personRemoveOutline,
  pricetagOutline,
  refreshOutline,
  searchOutline,
  settingsOutline,
  shieldCheckmarkOutline,
  statsChartOutline,
  timeOutline,
  toggleOutline,
  walkOutline,
  warningOutline
} from 'ionicons/icons';
import { NavItem } from '../../../core/models';
import { ClinicSettingsService } from '../../../core/services/clinic-settings.service';
import { logout } from '../../../store/auth/auth.actions';
import { selectCurrentUser } from '../../../store/auth/auth.selectors';
import { selectUnreadCount } from '../../../store/notifications/notifications.selectors';
import { SidebarComponent } from '../../../portals/admin/components/sidebar/sidebar.component';
import { TopbarComponent } from '../../../portals/admin/components/topbar/topbar.component';

@Component({
  selector: 'app-portal-layout',
  standalone: true,
  imports: [
    AsyncPipe,
    RouterOutlet,
    SidebarComponent,
    TopbarComponent
  ],
  template: `
    <div class="portal-layout">
      <app-admin-sidebar
        class="portal-layout__sidebar"
        [navItems]="resolvedNavItems"
        [portalLabel]="portalLabel"
        [clinicName]="clinicName"
        [currentUser]="currentUser$ | async"
        (logout)="logout()"
      ></app-admin-sidebar>

      <div class="main-content">
        <app-admin-topbar
          [title]="pageTitle"
          [portalLabel]="portalLabel"
          [currentUser]="currentUser$ | async"
          [unreadCount]="(unreadCount$ | async) ?? 0"
          (logout)="logout()"
        ></app-admin-topbar>

        <div class="page-content">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
  styleUrl: './portal-layout.component.scss'
})
export class PortalLayoutComponent implements OnInit {
  @Input() navItems: NavItem[] = [];
  @Input() portalTitle = 'Dashboard';
  @Input() portalLabel = 'Admin Portal';

  readonly currentUser$ = inject(Store).select(selectCurrentUser);
  readonly unreadCount$ = inject(Store).select(selectUnreadCount);

  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly clinicSettingsService = inject(ClinicSettingsService);
  private readonly destroyRef = inject(DestroyRef);

  clinicName = '';
  pageTitle = 'Dashboard';
  resolvedNavItems: NavItem[] = [];

  constructor() {
    addIcons({
      alertCircleOutline,
      arrowBackOutline,
      cashOutline,
      calendarNumberOutline,
      calendarOutline,
      checkmarkCircleOutline,
      checkmarkOutline,
      closeOutline,
      createOutline,
      documentTextOutline,
      ellipsisVertical,
      eyeOffOutline,
      eyeOutline,
      gridOutline,
      listOutline,
      logOutOutline,
      medicalOutline,
      megaphoneOutline,
      menuOutline,
      notificationsOutline,
      peopleOutline,
      personAddOutline,
      personCircleOutline,
      personRemoveOutline,
      pricetagOutline,
      refreshOutline,
      searchOutline,
      settingsOutline,
      shieldCheckmarkOutline,
      statsChartOutline,
      timeOutline,
      toggleOutline,
      walkOutline,
      warningOutline
    });
  }

  ngOnInit(): void {
    this.clinicName = this.clinicSettingsService.load().clinicName;
    this.resolvedNavItems = (this.route.snapshot.data['navItems'] as NavItem[]) ?? this.navItems;
    this.portalLabel = (this.route.snapshot.data['portalLabel'] as string | undefined) ?? this.portalLabel;
    this.updatePageTitle();

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => this.updatePageTitle());
  }

  logout(): void {
    this.store.dispatch(logout());
    void this.router.navigate(['/auth/login']);
  }

  private updatePageTitle(): void {
    const route = this.getDeepestChild(this.route);
    this.pageTitle =
      (route.snapshot.data['title'] as string | undefined) ?? this.portalTitle ?? 'Dashboard';
  }

  private getDeepestChild(route: ActivatedRoute): ActivatedRoute {
    let current = route;
    while (current.firstChild) {
      current = current.firstChild;
    }
    return current;
  }
}
