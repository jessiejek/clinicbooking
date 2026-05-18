import { AsyncPipe, NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular/standalone';
import { combineLatest, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Consultation, Diagnosis, LabRequest, Prescription, PrescriptionItem, VitalSigns } from '../../../core/models';
import { AuthStateService } from '../../../core/services/auth-state.service';
import { BookingService } from '../../../core/services/booking.service';
import { DoctorStateService } from '../../../core/services/doctor-state.service';
import { MedicalRecordsService, MedicalRecordsState } from '../../../core/services/medical-records.service';
import { PatientStateService } from '../../../core/services/patient-state.service';
import { BannerComponent } from '../../../shared/components/banner/banner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { FollowUpDraftView } from '../components/follow-up-form/follow-up-form.component';
import { LabRequestDraftView } from '../components/lab-request-form/lab-request-form.component';
import { SoapFormValue } from '../components/soap-form/soap-form.component';
import { ConsultationHeaderComponent } from './components/consultation-header.component';
import { ConsultationOverviewComponent } from './components/consultation-overview.component';
import { ConsultationWorkspaceComponent } from './components/consultation-workspace.component';
import { ConsultationPageVm } from './doctor-consultation.types';

const EMPTY_RECORDS: MedicalRecordsState = {
  consultations: [],
  prescriptions: [],
  allergies: [],
  labRequests: [],
  labResults: [],
  vaccinations: [],
  followUps: [],
  isLoading: false,
  error: null
};

@Component({
  standalone: true,
  selector: 'app-doctor-consultation-page',
  imports: [
    AsyncPipe,
    NgIf,
    EmptyStateComponent,
    BannerComponent,
    ConsultationHeaderComponent,
    ConsultationOverviewComponent,
    ConsultationWorkspaceComponent
  ],
  template: `
    <ng-container *ngIf="vm$ | async as vm; else notFound">
      <app-consultation-header
        [booking]="vm.booking"
        [patient]="vm.patient"
        [locked]="isLocked(vm)"
        (saveDraft)="saveDraft(vm)"
        (complete)="completeConsultation(vm)"
      ></app-consultation-header>

      <app-banner
        *ngIf="isLocked(vm)"
        variant="warning"
        message="This consultation is locked. Create an amendment for changes."
      ></app-banner>

      <app-consultation-overview
        [patient]="vm.patient"
        [consultation]="vm.consultation"
        [existingPrescription]="vm.existingPrescription"
        [allergies]="vm.allergies"
        [followUps]="vm.followUps"
        [recentConsultations]="vm.recentConsultations"
      ></app-consultation-overview>

      <app-consultation-workspace
        [vm]="vm"
        [locked]="isLocked(vm)"
        [prescriptionItems]="prescriptionItems"
        (vitalSignsChange)="onVitalsChange($event)"
        (vitalsValidityChange)="vitalsValid = $event"
        (soapChange)="onSoapChange($event)"
        (soapValidityChange)="soapValid = $event"
        (diagnosesChange)="onDiagnosesChange($event)"
        (diagnosisValidityChange)="diagnosisValid = $event"
        (prescriptionItemsChange)="onPrescriptionItemsChange($event)"
        (labRequestsChange)="onLabRequestsChange($event)"
        (followUpChange)="onFollowUpChange($event)"
      ></app-consultation-workspace>
    </ng-container>

    <ng-template #notFound>
      <app-empty-state
        icon="document-text-outline"
        title="Consultation unavailable"
        description="This appointment is either missing or belongs to another doctor."
        ctaLabel="Back to Appointments"
        ctaRoute="/doctor/appointments"
      ></app-empty-state>
    </ng-template>
  `,
  styleUrl: './doctor-consultation.page.scss'
})
export class DoctorConsultationPage implements OnInit {
  private readonly authState = inject(AuthStateService);
  private readonly bookingService = inject(BookingService);
  private readonly doctorState = inject(DoctorStateService);
  private readonly medicalRecords = inject(MedicalRecordsService);
  private readonly patientState = inject(PatientStateService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toastController = inject(ToastController);

  private pendingConsultationId: string | null = null;
  private pendingPrescriptionId: string | null = null;

  soapValid = false;
  diagnosisValid = false;
  vitalsValid = true;
  soapValue: SoapFormValue = {
    chiefComplaint: '',
    subjective: '',
    objective: '',
    assessment: '',
    plan: ''
  };
  vitalsValue: VitalSigns | null = null;
  diagnoses: Diagnosis[] = [];
  prescriptionItems: PrescriptionItem[] = [];
  labRequests: LabRequestDraftView[] = [];
  followUpValue: FollowUpDraftView | null = null;

  readonly vm$ = combineLatest([
    this.route.paramMap.pipe(map((paramMap) => paramMap.get('bookingId') ?? '')),
    this.authState.currentUser$
  ]).pipe(
    switchMap(([bookingId, user]) =>
      bookingId && user
        ? combineLatest([
            this.bookingService.getBookingById$(bookingId),
            this.doctorState.getDoctorByUserId(user.id),
            this.patientState.getPatients(),
            this.medicalRecords.state$
          ])
        : of([undefined, undefined, [], EMPTY_RECORDS] as const)
    ),
    map(([booking, doctor, patients, records]) => {
      if (!booking || !doctor || booking.doctorId !== doctor.id) {
        return null;
      }

      const patient = patients.find((item) => item.id === booking.patientId);
      if (!patient) {
        return null;
      }

      const consultation = records.consultations.find((item) => item.bookingId === booking.id) ?? null;
      const existingPrescription = this.findPrescription(consultation, records.prescriptions);
      const consultationId = consultation?.id;

      return {
        booking,
        patient,
        doctor,
        consultation,
        soap: this.soapFromConsultation(consultation),
        existingPrescription,
        allergies: records.allergies.filter((item) => item.patientId === patient.id),
        labRequests: records.labRequests.filter((item) =>
          consultationId ? item.consultationId === consultationId : item.patientId === patient.id
        ),
        labResults: records.labResults.filter((item) =>
          consultationId ? item.consultationId === consultationId : item.patientId === patient.id
        ),
        vaccinations: records.vaccinations.filter((item) => item.patientId === patient.id),
        followUps: records.followUps.filter((item) => item.patientId === patient.id),
        recentConsultations: records.consultations
          .filter((item) => item.patientId === patient.id)
          .slice(0, 5)
      } satisfies ConsultationPageVm;
    })
  );

  ngOnInit(): void {
    this.bookingService.refresh();
    this.doctorState.refresh();
    this.patientState.refresh();
    this.medicalRecords.refresh();
  }

  onVitalsChange(value: VitalSigns): void {
    this.vitalsValue = value;
  }

  onSoapChange(value: SoapFormValue): void {
    this.soapValue = value;
  }

  onDiagnosesChange(value: Diagnosis[]): void {
    this.diagnoses = value;
  }

  onPrescriptionItemsChange(value: PrescriptionItem[]): void {
    this.prescriptionItems = value;
  }

  onLabRequestsChange(value: LabRequestDraftView[]): void {
    this.labRequests = value;
  }

  onFollowUpChange(value: FollowUpDraftView | null): void {
    this.followUpValue = value;
  }

  saveDraft(vm: ConsultationPageVm): void {
    if (!this.isLocked(vm)) {
      this.persistConsultation(vm, 'Draft');
    }
  }

  completeConsultation(vm: ConsultationPageVm): void {
    if (this.isLocked(vm) || !this.soapValid || !this.diagnosisValid || !this.vitalsValid) {
      void this.presentToast('Please complete chief complaint and a primary diagnosis before finishing.');
      return;
    }
    this.persistConsultation(vm, 'Completed');
    this.bookingService.markComplete(vm.booking.id);
    void this.presentToast('Consultation completed.');
    void this.router.navigate(['/doctor/appointments', vm.booking.id]);
  }

  isLocked(vm: ConsultationPageVm): boolean {
    return Boolean(vm.consultation?.isLocked);
  }

  soapFromConsultation(consultation: Consultation | null): SoapFormValue {
    return {
      chiefComplaint: consultation?.chiefComplaint ?? '',
      subjective: consultation?.subjective ?? consultation?.historyOfPresentIllness ?? '',
      objective: consultation?.objective ?? consultation?.peGeneralFindings ?? '',
      assessment: consultation?.assessment ?? '',
      plan: consultation?.plan ?? ''
    };
  }

  private findPrescription(
    consultation: Consultation | null,
    prescriptions: Prescription[]
  ): Prescription | null {
    return (
      consultation?.prescriptionIds
        .map((prescriptionId) => prescriptions.find((item) => item.id === prescriptionId))
        .find((item): item is Prescription => Boolean(item)) ?? null
    );
  }

  private persistConsultation(vm: ConsultationPageVm, status: Consultation['status']): void {
    const consultationId = vm.consultation?.id ?? this.pendingConsultationId ?? `consult-${Date.now()}`;
    const now = new Date().toISOString();
    const prescriptionId = this.resolvePrescriptionId(vm);
    const labRequestIds = this.resolveLabRequestIds(vm.labRequests);

    this.pendingConsultationId = consultationId;
    if (prescriptionId) {
      this.pendingPrescriptionId = prescriptionId;
    }

    const consultation: Consultation = {
      id: consultationId,
      bookingId: vm.booking.id,
      patientId: vm.patient.id,
      doctorId: vm.doctor.id,
      consultationDate: vm.booking.appointmentDate,
      consultationTime: vm.booking.slotStartTime,
      chiefComplaint: this.soapValue.chiefComplaint,
      subjective: this.soapValue.subjective,
      objective: this.soapValue.objective,
      assessment: this.soapValue.assessment,
      plan: this.soapValue.plan,
      vitalSigns: this.vitalsValue ?? undefined,
      diagnoses: [...this.diagnoses],
      prescriptionIds: prescriptionId ? [prescriptionId] : [],
      labRequestIds,
      followUpDate: this.followUpValue?.followUpDate ?? vm.consultation?.followUpDate,
      status,
      isLocked: status === 'Completed' ? true : vm.consultation?.isLocked ?? false,
      createdAt: vm.consultation?.createdAt ?? now,
      updatedAt: now,
      historyOfPresentIllness: this.soapValue.subjective,
      peGeneralFindings: this.soapValue.objective
    };

    this.saveConsultationRecord(vm, consultation);
    this.savePrescription(vm, consultationId, prescriptionId, status, now);
    this.saveLabRequests(vm, consultationId, now);
    this.saveFollowUp(vm, consultationId);
  }

  private resolvePrescriptionId(vm: ConsultationPageVm): string | undefined {
    return (
      vm.existingPrescription?.id ??
      this.pendingPrescriptionId ??
      (this.prescriptionItems.length > 0 ? `rx-${Date.now()}` : undefined)
    );
  }

  private resolveLabRequestIds(existing: LabRequest[]): string[] {
    return [...existing.map((item) => item.id), ...this.labRequests.map((item) => item.id)].filter(
      (id, index, ids) => ids.indexOf(id) === index
    );
  }

  private saveConsultationRecord(vm: ConsultationPageVm, consultation: Consultation): void {
    if (vm.consultation) {
      this.medicalRecords.updateConsultation(consultation);
    } else {
      this.medicalRecords.saveConsultation(consultation);
    }
  }

  private savePrescription(
    vm: ConsultationPageVm,
    consultationId: string,
    prescriptionId: string | undefined,
    status: Consultation['status'],
    issuedAt: string
  ): void {
    if (this.prescriptionItems.length === 0 || !prescriptionId) {
      return;
    }

    this.medicalRecords.addPrescription({
      id: prescriptionId,
      consultationId,
      patientId: vm.patient.id,
      doctorId: vm.doctor.id,
      issuedAt,
      status: status === 'Completed' ? 'Completed' : 'Active',
      items: [...this.prescriptionItems],
      notes: this.allergySummary(vm)
    });
  }

  private saveLabRequests(vm: ConsultationPageVm, consultationId: string, requestedAt: string): void {
    this.labRequests.forEach((request) => {
      this.medicalRecords.addLabRequest({
        id: request.id,
        consultationId,
        patientId: vm.patient.id,
        doctorId: vm.doctor.id,
        testName: request.testName,
        reason: request.reason,
        status: 'Requested',
        requestedAt
      });

      if (request.fileName) {
        this.medicalRecords.addLabResult({
          id: `labres-${request.id}`,
          labRequestId: request.id,
          patientId: vm.patient.id,
          fileName: request.fileName,
          resultDate: requestedAt,
          notes: request.reason
        });
      }
    });
  }

  private saveFollowUp(vm: ConsultationPageVm, consultationId: string): void {
    if (!this.followUpValue) {
      return;
    }

    this.medicalRecords.addFollowUp({
      id: this.followUpValue.id,
      consultationId,
      patientId: vm.patient.id,
      doctorId: vm.doctor.id,
      followUpDate: this.followUpValue.followUpDate,
      reason: this.followUpValue.reason,
      status: 'Pending',
      reminderEnabled: this.followUpValue.reminderEnabled
    });
  }

  private allergySummary(vm: ConsultationPageVm): string {
    return vm.allergies.length > 0
      ? vm.allergies.map((allergy) => allergy.allergen).join(', ')
      : 'None recorded';
  }

  private async presentToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 2200,
      position: 'top'
    });
    await toast.present();
  }
}
