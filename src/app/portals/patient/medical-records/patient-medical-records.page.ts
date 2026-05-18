import { AsyncPipe, DatePipe, NgFor, NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { combineLatest, map, of, switchMap } from 'rxjs';
import { AuthUser, Consultation, Doctor, Patient } from '../../../core/models';
import { AuthStateService } from '../../../core/services/auth-state.service';
import { MedicalRecordsService } from '../../../core/services/medical-records.service';
import { MockDataService } from '../../../core/services/mock-data.service';
import { PatientStateService } from '../../../core/services/patient-state.service';
import { BannerComponent } from '../../../shared/components/banner/banner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { MedicalRecordCardComponent } from '../components/medical-record-card/medical-record-card.component';
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
          (viewDetails)="showReadOnlyToast()"
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
  private readonly authState = inject(AuthStateService);
  private readonly medicalRecords = inject(MedicalRecordsService);
  private readonly mockData = inject(MockDataService);
  private readonly patientState = inject(PatientStateService);
  private readonly toastCtrl = inject(ToastController);

  readonly currentUser$ = this.authState.currentUser$;
  readonly patient$ = this.currentUser$.pipe(
    switchMap((user) => (user ? this.patientState.getPatientByUserId(user.id) : of(undefined)))
  );

  vm$ = combineLatest([this.currentUser$, this.patient$]).pipe(
    switchMap(([user, patient]) =>
      patient
        ? this.medicalRecords.getConsultationsByPatientId(patient.id).pipe(
            map((consultations) => ({
              user,
              patient,
              records: consultations.map((consultation) => ({
                consultation,
                doctor: this.mockData.getDoctorById(consultation.doctorId)
              }))
            }))
          )
        : of({ user, patient, records: [] } satisfies MedicalRecordsVm)
    )
  );

  ngOnInit(): void {
    this.patientState.refresh();
    this.medicalRecords.refresh();
  }

  async showReadOnlyToast(): Promise<void> {
    const toast = await this.toastCtrl.create({
      message: 'Medical records are read-only in the patient portal.',
      duration: 2200,
      position: 'top'
    });
    await toast.present();
  }
}
