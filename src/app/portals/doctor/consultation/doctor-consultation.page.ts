import { AsyncPipe, NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonModal,
  IonTitle,
  IonToolbar,
  ToastController
} from '@ionic/angular/standalone';
import { combineLatest, Observable, of } from 'rxjs';
import { catchError, map, switchMap, take } from 'rxjs/operators';
import {
  Booking,
  Consultation,
  Diagnosis,
  LabRequest,
  Patient,
  Prescription,
  PrescriptionItem,
  VitalSigns
} from '../../../core/models';
import { ApiService } from '../../../core/services/api.service';
import { AuthStateService } from '../../../core/services/auth-state.service';
import { BookingService, DoctorCompleteBookingRequest } from '../../../core/services/booking.service';
import { MedicalRecordsService, MedicalRecordsState } from '../../../core/services/medical-records.service';
import { PatientStateService } from '../../../core/services/patient-state.service';
import { BannerComponent } from '../../../shared/components/banner/banner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { FollowUpDraftView } from '../components/follow-up-form/follow-up-form.component';
import { LabRequestDraftView } from '../components/lab-request-form/lab-request-form.component';
import { SoapFormValue } from '../components/soap-form/soap-form.component';
import { DoctorService } from '../services/doctor.service';
import { ConsultationHeaderComponent } from './components/consultation-header.component';
import { ConsultationOverviewComponent } from './components/consultation-overview.component';
import { ConsultationWorkspaceComponent } from './components/consultation-workspace.component';
import { ConsultationPageVm } from './doctor-consultation.types';

type NullableString = string | null | undefined;

interface PatientDto {
  id: string;
  patientCode?: NullableString;
  firstName?: NullableString;
  middleName?: NullableString;
  lastName?: NullableString;
  dateOfBirth?: NullableString;
  sex?: NullableString;
  civilStatus?: NullableString;
  address?: NullableString;
  city?: NullableString;
  zipCode?: NullableString;
  contactNumber?: NullableString;
  email?: NullableString;
  emergencyContactName?: NullableString;
  emergencyContactNumber?: NullableString;
  emergencyContactRelationship?: NullableString;
  bloodType?: NullableString;
  philHealthNumber?: NullableString;
  hmoProvider?: NullableString;
  hmoCardNumber?: NullableString;
  userId?: NullableString;
  isEmailVerified?: boolean | null;
  isGuest?: boolean | null;
  consentedAt?: NullableString;
  consentVersion?: NullableString;
}

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
    FormsModule,
    NgIf,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonModal,
    IonTitle,
    IonToolbar,
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
        (complete)="requestCompletion(vm)"
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

      <ion-modal [isOpen]="completeModalOpen" (didDismiss)="closeCompleteModal()">
        <ng-template>
          <ion-header>
            <ion-toolbar>
              <ion-title>Complete Consultation</ion-title>
              <ion-buttons slot="end">
                <ion-button fill="clear" (click)="closeCompleteModal()">Close</ion-button>
              </ion-buttons>
            </ion-toolbar>
          </ion-header>
          <ion-content class="ion-padding">
            <div class="clinic-card completion-modal__summary">
              <div class="section-heading">{{ vm.patient.firstName }} {{ vm.patient.lastName }}</div>
              <p>{{ servicesLabel(vm.booking) }}</p>
              <p>{{ vm.booking.appointmentDate }} &bull; {{ vm.booking.slotStartTime }} - {{ vm.booking.slotEndTime }}</p>
            </div>

            <div class="payment-mode-tabs">
              <button type="button" [class.active]="!isProfessionalFeeWaived" (click)="setWaived(false)">
                Charge PF
              </button>
              <button type="button" [class.active]="isProfessionalFeeWaived" (click)="setWaived(true)">
                Waive PF
              </button>
            </div>

            <div class="clinic-card completion-modal__card" *ngIf="!isProfessionalFeeWaived">
              <label class="form-label" for="consultation-final-amount">Final Amount</label>
              <input
                id="consultation-final-amount"
                class="completion-modal__input"
                type="number"
                min="0"
                [(ngModel)]="finalAmount"
              />
            </div>

            <div class="clinic-card completion-modal__card" *ngIf="isProfessionalFeeWaived">
              <label class="form-label" for="consultation-waive-reason">Waived Reason</label>
              <textarea
                id="consultation-waive-reason"
                class="completion-modal__input completion-modal__textarea"
                rows="3"
                [(ngModel)]="professionalFeeWaivedReason"
              ></textarea>
            </div>

            <div class="clinic-card completion-modal__note">
              Staff will see this booking in the payment queue after completion.
            </div>

            <div class="wizard-actions wizard-actions--split">
              <button type="button" class="btn-outline" (click)="closeCompleteModal()">Cancel</button>
              <button type="button" class="btn-primary" [disabled]="isSubmittingComplete" (click)="submitCompletion(vm)">
                {{ isSubmittingComplete ? 'Saving...' : 'Complete Booking' }}
              </button>
            </div>
          </ion-content>
        </ng-template>
      </ion-modal>
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
  private readonly apiService = inject(ApiService);
  private readonly authState = inject(AuthStateService);
  private readonly bookingService = inject(BookingService);
  private readonly doctorService = inject(DoctorService);
  private readonly medicalRecords = inject(MedicalRecordsService);
  private readonly patientState = inject(PatientStateService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toastController = inject(ToastController);

  private pendingConsultationId: string | null = null;
  private pendingPrescriptionId: string | null = null;

  completeModalOpen = false;
  isProfessionalFeeWaived = false;
  finalAmount = 0;
  professionalFeeWaivedReason = '';
  isSubmittingComplete = false;

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
    switchMap(([bookingId, user]) => {
      if (!bookingId || !user) {
        return of([undefined, undefined, undefined, EMPTY_RECORDS] as const);
      }

      return this.bookingService.getBookingById$(bookingId).pipe(
        switchMap((booking) =>
          booking
            ? combineLatest([
                of(booking),
                this.doctorService.getMyProfile().pipe(catchError(() => of(undefined))),
                this.resolvePatient$(booking),
                this.medicalRecords.state$
              ])
            : of([undefined, undefined, undefined, EMPTY_RECORDS] as const)
        )
      );
    }),
    map(([booking, doctor, patient, records]) => {
      if (!booking || !doctor || booking.doctorId !== doctor.id || !patient) {
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

  requestCompletion(vm: ConsultationPageVm): void {
    if (this.isLocked(vm) || !this.soapValid || !this.diagnosisValid || !this.vitalsValid) {
      void this.presentToast('Please complete chief complaint and a primary diagnosis before finishing.');
      return;
    }

    this.openCompleteModal(vm.booking);
  }

  openCompleteModal(booking: Booking): void {
    this.completeModalOpen = true;
    this.isSubmittingComplete = false;
    this.isProfessionalFeeWaived = booking.isProfessionalFeeWaived === true || booking.paymentStatus === 'Waived';
    this.finalAmount = Math.max(0, booking.finalAmount ?? booking.consultationFeeSnapshot ?? 0);
    this.professionalFeeWaivedReason = booking.professionalFeeWaivedReason ?? '';
  }

  closeCompleteModal(): void {
    this.completeModalOpen = false;
    this.isSubmittingComplete = false;
  }

  setWaived(value: boolean): void {
    this.isProfessionalFeeWaived = value;
    if (value) {
      this.finalAmount = 0;
    }
  }

  servicesLabel(booking: Booking): string {
    return formatServicesLabel(booking);
  }

  submitCompletion(vm: ConsultationPageVm): void {
    if (this.isSubmittingComplete) {
      return;
    }

    if (!this.isProfessionalFeeWaived && (this.finalAmount < 0 || Number.isNaN(this.finalAmount))) {
      void this.presentToast('Enter a valid final amount.');
      return;
    }

    if (this.isProfessionalFeeWaived && !this.professionalFeeWaivedReason.trim()) {
      void this.presentToast('A waived reason is required.');
      return;
    }

    const payload: DoctorCompleteBookingRequest = {
      finalAmount: this.isProfessionalFeeWaived ? 0 : this.finalAmount,
      isProfessionalFeeWaived: this.isProfessionalFeeWaived,
      professionalFeeWaivedReason: this.professionalFeeWaivedReason.trim() || undefined
    };

    this.isSubmittingComplete = true;
    this.bookingService.doctorCompleteBooking(vm.booking.id, payload).subscribe({
      next: async () => {
        this.persistConsultation(vm, 'Completed');
        this.closeCompleteModal();
        await this.presentToast('Consultation completed.');
        void this.router.navigate(['/doctor/appointments']);
      },
      error: async (error) => {
        this.isSubmittingComplete = false;
        await this.presentToast(extractApiErrorMessage(error, 'Failed to complete consultation.'));
      }
    });
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

  private resolvePatient$(booking: Booking): Observable<Patient | undefined> {
    return this.apiService.get<PatientDto>(`/patients/${encodeURIComponent(booking.patientId)}`).pipe(
      map((patient) => mapPatientDetail(patient)),
      catchError(() =>
        this.patientState.getPatientById(booking.patientId).pipe(
          take(1),
          map((patient) => patient ?? buildFallbackPatient(booking))
        )
      )
    );
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

function mapPatientDetail(dto: PatientDto): Patient {
  return {
    id: dto.id,
    patientCode: normalizeString(dto.patientCode) || dto.id,
    firstName: normalizeString(dto.firstName) || '',
    middleName: normalizeString(dto.middleName),
    lastName: normalizeString(dto.lastName) || '',
    dateOfBirth: normalizeString(dto.dateOfBirth) || '',
    sex: normalizeString(dto.sex) || '',
    civilStatus: normalizeString(dto.civilStatus),
    address: normalizeString(dto.address),
    city: normalizeString(dto.city),
    zipCode: normalizeString(dto.zipCode),
    contactNumber: normalizeString(dto.contactNumber),
    email: normalizeString(dto.email),
    emergencyContactName: normalizeString(dto.emergencyContactName),
    emergencyContactNumber: normalizeString(dto.emergencyContactNumber),
    emergencyContactRelationship: normalizeString(dto.emergencyContactRelationship),
    bloodType: normalizeString(dto.bloodType),
    philHealthNumber: normalizeString(dto.philHealthNumber),
    hmoProvider: normalizeString(dto.hmoProvider),
    hmoCardNumber: normalizeString(dto.hmoCardNumber),
    userId: normalizeString(dto.userId),
    isEmailVerified: dto.isEmailVerified ?? undefined,
    isGuest: Boolean(dto.isGuest),
    consentedAt: normalizeString(dto.consentedAt),
    consentVersion: normalizeString(dto.consentVersion)
  };
}

function buildFallbackPatient(booking: Booking): Patient {
  const [firstName, ...lastNameParts] = booking.patientName?.trim().split(/\s+/).filter(Boolean) ?? [];

  return {
    id: booking.patientId,
    patientCode: booking.patientId,
    firstName: firstName ?? 'Patient',
    lastName: lastNameParts.join(' '),
    dateOfBirth: '',
    sex: 'Not specified',
    contactNumber: undefined,
    email: undefined,
    isGuest: false
  };
}

function normalizeString(value: NullableString): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function formatServicesLabel(booking: Booking): string {
  if (booking.serviceNames?.length) {
    return booking.serviceNames.join(', ');
  }

  const names = booking.services?.map((service) => service.name).filter((name) => name.trim().length > 0) ?? [];
  if (names.length > 0) {
    return names.join(', ');
  }

  return booking.serviceName?.trim() || 'Service';
}

function extractApiErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}
