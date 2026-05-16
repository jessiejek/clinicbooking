import { AsyncPipe, NgIf } from '@angular/common';
import { Component, DestroyRef, HostBinding, OnInit, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { logOutOutline } from 'ionicons/icons';
import { ClinicSettingsService } from '../../../../core/services/clinic-settings.service';
import { logout } from '../../../../store/auth/auth.actions';
import { selectCurrentUser } from '../../../../store/auth/auth.selectors';
import { PatientTopbarComponent } from '../patient-topbar/patient-topbar.component';
import { PATIENT_NAV_ITEMS } from '../../patient.routes';

@Component({
  selector: 'app-patient-layout',
  standalone: true,
  imports: [NgIf, AsyncPipe, RouterOutlet, IonIcon, PatientTopbarComponent],
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
    </div>
  `,
  styleUrl: './patient-layout.component.scss'
})
export class PatientLayoutComponent implements OnInit {
  @HostBinding('style.display') readonly display = 'block';

  readonly currentUser$ = inject(Store).select(selectCurrentUser);

  clinicName = 'Clinic';
  navItems = PATIENT_NAV_ITEMS;

  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly clinicSettingsService = inject(ClinicSettingsService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    addIcons({ logOutOutline });
  }

  ngOnInit(): void {
    this.clinicName = this.clinicSettingsService.load().clinicName;
  }

  logoutUser(): void {
    this.store.dispatch(logout());
    void this.router.navigate(['/auth/login']);
  }
}
