import { AsyncPipe, NgIf } from '@angular/common';
import { Component, HostBinding, OnInit, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { ClinicSettingsService } from '../../../../core/services/clinic-settings.service';
import { logout } from '../../../../store/auth/auth.actions';
import { selectCurrentUser } from '../../../../store/auth/auth.selectors';
import { PatientTopbarComponent } from '../patient-topbar/patient-topbar.component';
import { PatientBottomNavComponent } from '../patient-bottom-nav/patient-bottom-nav.component';
import { PATIENT_NAV_ITEMS } from '../../patient.routes';

@Component({
  selector: 'app-patient-layout',
  standalone: true,
  imports: [NgIf, AsyncPipe, RouterOutlet, PatientTopbarComponent, PatientBottomNavComponent],
  template: `
    <div class="patient-layout">
      <app-patient-topbar
        [navItems]="navItems"
        [clinicName]="clinicName"
        [currentUser]="currentUser$ | async"
        (logout)="logoutUser()"
      ></app-patient-topbar>

      <main class="patient-layout__main">
        <div class="content-container patient-layout__content">
          <router-outlet></router-outlet>
        </div>
      </main>

      <app-patient-bottom-nav></app-patient-bottom-nav>
    </div>
  `,
  styleUrl: './patient-layout.component.scss'
})
export class PatientLayoutComponent implements OnInit {
  @HostBinding('style.display') readonly display = 'block';

  private readonly store = inject(Store);
  private readonly router = inject(Router);
  readonly currentUser$ = inject(Store).select(selectCurrentUser);

  clinicName = 'Clinic';
  navItems = PATIENT_NAV_ITEMS;

  private readonly clinicSettingsService = inject(ClinicSettingsService);

  ngOnInit(): void {
    this.clinicName = this.clinicSettingsService.load().clinicName;
  }

  logoutUser(): void {
    this.store.dispatch(logout());
    void this.router.navigate(['/auth/login']);
  }
}
