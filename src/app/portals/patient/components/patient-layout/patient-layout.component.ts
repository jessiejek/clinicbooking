import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavItem } from '../../../../core/models';
import { ClinicSettingsService } from '../../../../core/services/clinic-settings.service';
import { logout as logoutAction } from '../../../../store/auth/auth.actions';
import { selectCurrentUser } from '../../../../store/auth/auth.selectors';
import { selectUnreadCount } from '../../../../store/notifications/notifications.selectors';
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
        (logout)="logout()"
      ></app-admin-sidebar>

      <div class="main-content">
        <app-admin-topbar
          [title]="pageTitle"
          [portalLabel]="portalLabel"
          [searchPlaceholder]="searchPlaceholder"
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
  styleUrl: './patient-layout.component.scss'
})
export class PatientLayoutComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly clinicSettingsService = inject(ClinicSettingsService);
  private readonly destroyRef = inject(DestroyRef);

  readonly currentUser = this.store.selectSignal(selectCurrentUser);
  readonly unreadCount = this.store.selectSignal(selectUnreadCount);

  clinicName = '';
  portalLabel = 'Patient Portal';
  portalTitle = 'Dashboard';
  pageTitle = 'Dashboard';
  searchPlaceholder = 'Search doctors, bookings...';
  navItems: NavItem[] = PATIENT_NAV_ITEMS;

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
