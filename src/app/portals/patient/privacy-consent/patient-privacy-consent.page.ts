import { DatePipe, NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { IonButton, IonCheckbox, IonItem, IonLabel, ToastController } from '@ionic/angular/standalone';
import { AuthUser, ClinicSettings, Patient } from '../../../core/models';
import { ClinicSettingsService } from '../../../core/services/clinic-settings.service';
import { MockDataService } from '../../../core/services/mock-data.service';
import { loadPatients, updatePatient } from '../../../store/patients/patients.actions';
import { selectCurrentUser } from '../../../store/auth/auth.selectors';
import { selectCurrentPatient } from '../../../store/patients/patients.selectors';

@Component({
  selector: 'app-patient-privacy-consent-page',
  standalone: true,
  imports: [NgIf, DatePipe, FormsModule, IonItem, IonLabel, IonCheckbox, IonButton],
  template: `
    <section class="page-shell" *ngIf="currentPatient && settings">
      <div class="page-shell__header">
        <div>
          <h2 class="page-title">Privacy Consent</h2>
          <p class="page-subtitle">Review the clinic's privacy policy and accept the latest version.</p>
        </div>
      </div>

      <div class="clinic-card consent-card">
        <div class="section-heading">Clinic Privacy Policy</div>
        <p class="consent-text">{{ settings.privacyPolicyText }}</p>

        <div class="consent-meta">
          <div><span>Consent Version</span><strong>{{ settings.consentVersion }}</strong></div>
          <div><span>Last Updated</span><strong>{{ currentPatient.consentedAt ? (currentPatient.consentedAt | date : 'MMM d, y') : 'Not yet accepted' }}</strong></div>
        </div>

        <ion-item class="consent-checkbox" lines="none">
          <ion-checkbox slot="start" [(ngModel)]="accepted"></ion-checkbox>
          <ion-label>I have read and accept the clinic privacy consent.</ion-label>
        </ion-item>

        <ion-button type="button" expand="block" color="primary" [disabled]="!accepted" (click)="acceptConsent()">
          Accept Consent
        </ion-button>
      </div>
    </section>
  `,
  styleUrl: './patient-privacy-consent.page.scss'
})
export class PatientPrivacyConsentPage implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly mockData = inject(MockDataService);
  private readonly clinicSettingsService = inject(ClinicSettingsService);
  private readonly toastCtrl = inject(ToastController);

  currentUser: AuthUser | null = null;
  currentPatient: Patient | null = null;
  settings: ClinicSettings | null = null;
  accepted = false;

  ngOnInit(): void {
    this.store.dispatch(loadPatients());
    this.settings = this.clinicSettingsService.load();

    this.store.select(selectCurrentUser).subscribe((user) => {
      this.currentUser = user;
      if (user) {
        this.store.select(selectCurrentPatient(user.id)).subscribe((patient) => {
          this.currentPatient = patient ?? null;
        });
      }
    });
  }

  async acceptConsent(): Promise<void> {
    if (!this.currentPatient || !this.settings || !this.accepted) {
      return;
    }

    const updated: Patient = {
      ...this.currentPatient,
      consentVersion: this.settings.consentVersion,
      consentedAt: new Date().toISOString()
    };
    this.mockData.updatePatientConsent(updated.id, this.settings.consentVersion);
    this.store.dispatch(updatePatient({ patient: updated }));
    const toast = await this.toastCtrl.create({
      message: 'Privacy consent accepted.',
      duration: 2200,
      color: 'success',
      position: 'top'
    });
    await toast.present();
    void this.router.navigate(['/patient/dashboard']);
  }
}
