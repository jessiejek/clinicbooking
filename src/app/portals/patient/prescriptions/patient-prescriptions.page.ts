import { AsyncPipe, DatePipe, NgFor, NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, map, of, switchMap } from 'rxjs';
import { ToastController } from '@ionic/angular/standalone';
import { AuthUser, Doctor, Patient, Prescription } from '../../../core/models';
import { MockDataService } from '../../../core/services/mock-data.service';
import { loadPatients } from '../../../store/patients/patients.actions';
import { selectCurrentUser } from '../../../store/auth/auth.selectors';
import { selectCurrentPatient } from '../../../store/patients/patients.selectors';
import { loadMedicalRecords } from '../../../store/medical-records/medical-records.actions';
import { selectPrescriptionsByPatientId } from '../../../store/medical-records/medical-records.selectors';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { PrescriptionCardComponent } from '../components/prescription-card/prescription-card.component';

interface PrescriptionVm {
  user: AuthUser | null;
  patient: Patient | undefined;
  prescriptions: Array<{ prescription: Prescription; doctor?: Doctor }>;
}

@Component({
  selector: 'app-patient-prescriptions-page',
  standalone: true,
  imports: [AsyncPipe, DatePipe, NgFor, NgIf, EmptyStateComponent, PrescriptionCardComponent],
  template: `
    <section class="page-shell" *ngIf="vm$ | async as vm">
      <div class="page-shell__header">
        <div>
          <h2 class="page-title">Prescriptions</h2>
          <p class="page-subtitle">Your active and historical prescriptions.</p>
        </div>
      </div>

      <ng-container *ngIf="vm.prescriptions.length > 0; else emptyTpl">
        <app-prescription-card
          *ngFor="let item of vm.prescriptions"
          [prescription]="item.prescription"
          [doctor]="item.doctor"
          (download)="showDownloadToast()"
        ></app-prescription-card>
      </ng-container>

      <ng-template #emptyTpl>
        <app-empty-state
          icon="medkit-outline"
          title="No prescriptions yet"
          description="Prescription records will appear here once issued."
        ></app-empty-state>
      </ng-template>
    </section>
  `,
  styleUrl: './patient-prescriptions.page.scss'
})
export class PatientPrescriptionsPage implements OnInit {
  private readonly store = inject(Store);
  private readonly mockData = inject(MockDataService);
  private readonly toastCtrl = inject(ToastController);

  readonly currentUser$ = this.store.select(selectCurrentUser);
  readonly patient$ = this.currentUser$.pipe(
    switchMap((user) => (user ? this.store.select(selectCurrentPatient(user.id)) : of(undefined)))
  );

  vm$ = combineLatest([this.currentUser$, this.patient$]).pipe(
    switchMap(([user, patient]) =>
      patient
        ? this.store.select(selectPrescriptionsByPatientId(patient.id)).pipe(
            map((prescriptions) => ({
              user,
              patient,
              prescriptions: prescriptions.map((prescription) => ({
                prescription,
                doctor: this.mockData.getDoctorById(prescription.doctorId)
              }))
            }))
          )
        : of({ user, patient, prescriptions: [] } satisfies PrescriptionVm)
    )
  );

  ngOnInit(): void {
    this.store.dispatch(loadPatients());
    this.store.dispatch(loadMedicalRecords());
  }

  async showDownloadToast(): Promise<void> {
    const toast = await this.toastCtrl.create({
      message: 'Prescription PDF download will be available in Phase 10.',
      duration: 2200,
      position: 'top'
    });
    await toast.present();
  }
}
