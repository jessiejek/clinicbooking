import { AsyncPipe, DatePipe, NgFor, NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest, map, of, switchMap } from 'rxjs';
import { AuthUser, Consultation, Doctor, Patient } from '../../../core/models';
import { MockDataService } from '../../../core/services/mock-data.service';
import { loadPatients } from '../../../store/patients/patients.actions';
import { selectCurrentUser } from '../../../store/auth/auth.selectors';
import { selectCurrentPatient } from '../../../store/patients/patients.selectors';
import { BannerComponent } from '../../../shared/components/banner/banner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { MedicalRecordCardComponent } from '../components/medical-record-card/medical-record-card.component';
import { PatientService } from '../services/patient.service';
import { ToastController } from '@ionic/angular/standalone';

interface MedicalRecordsVm {
  user: AuthUser | null;
  patient: Patient | undefined;
  records: Array<{ consultation: Consultation; doctor?: Doctor }>;
}

@Component({
  selector: 'app-patient-medical-records-page',
  standalone: true,
  imports: [AsyncPipe, DatePipe, NgFor, NgIf, BannerComponent, EmptyStateComponent, MedicalRecordCardComponent],
  template: `
    <section class="page-shell" *ngIf="vm$ | async as vm">
      <div class="page-shell__header">
        <div>
          <h2 class="page-title">Medical Records</h2>
          <p class="page-subtitle">Read-only consultation history for your account.</p>
        </div>
      </div>

      <ng-container *ngIf="vm.records.length > 0; else emptyTpl">
        <app-medical-record-card
          *ngFor="let item of vm.records"
          [consultation]="item.consultation"
          [doctor]="item.doctor"
          (viewDetails)="showPhaseNineToast()"
        ></app-medical-record-card>
      </ng-container>

      <ng-template #emptyTpl>
        <app-empty-state
          icon="document-text-outline"
          title="No medical records yet"
          description="Your completed consultations will appear here."
        ></app-empty-state>
      </ng-template>
    </section>
  `,
  styleUrl: './patient-medical-records.page.scss'
})
export class PatientMedicalRecordsPage implements OnInit {
  private readonly store = inject(Store);
  private readonly mockData = inject(MockDataService);
  private readonly patientService = inject(PatientService);
  private readonly toastCtrl = inject(ToastController);

  readonly currentUser$ = this.store.select(selectCurrentUser);
  readonly patient$ = this.currentUser$.pipe(
    switchMap((user) => (user ? this.store.select(selectCurrentPatient(user.id)) : of(undefined)))
  );

  vm$ = combineLatest([this.currentUser$, this.patient$]).pipe(
    switchMap(([user, patient]) => {
      if (!patient) {
        return of({ user, patient, records: [] } satisfies MedicalRecordsVm);
      }

      return this.patientService.getPatientConsultations(patient.id).pipe(
        map((consultations) => ({
          user,
          patient,
          records: consultations.map((consultation) => ({
            consultation,
            doctor: this.mockData.getDoctorById(consultation.doctorId)
          }))
        }))
      );
    })
  );

  ngOnInit(): void {
    this.store.dispatch(loadPatients());
  }

  async showPhaseNineToast(): Promise<void> {
    const toast = await this.toastCtrl.create({
      message: 'Detailed consultation view will be available in Phase 9.',
      duration: 2200,
      position: 'top'
    });
    await toast.present();
  }
}
