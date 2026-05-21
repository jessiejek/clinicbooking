import { AsyncPipe, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController, ToastController } from '@ionic/angular/standalone';
import { BehaviorSubject, Observable, combineLatest, firstValueFrom, of } from 'rxjs';
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
import {
  MedicalRecordsService,
  MedicalRecordsState
} from '../../../core/services/medical-records.service';
import { PatientStateService } from '../../../core/services/patient-state.service';
import { BannerComponent } from '../../../shared/components/banner/banner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { FollowUpDraftView } from '../components/follow-up-form/follow-up-form.component';
import { LabRequestDraftView } from '../components/lab-request-form/lab-request-form.component';
import { SoapFormValue } from '../components/soap-form/soap-form.component';
import { DoctorService } from '../services/doctor.service';
import {
  ConsultationCompleteModalComponent,
  ConsultationCompleteModalPayload
} from './components/consultation-complete-modal.component';
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

interface ConsultationLocalDraft {
  bookingId: string;
  savedAt: string;
  soap: SoapFormValue;
  vitalsValue: VitalSigns | null;
  diagnoses: Diagnosis[];
  prescriptionItems: PrescriptionItem[];
  labRequests: LabRequestDraftView[];
  followUpValue: FollowUpDraftView | null;
  isProfessionalFeeWaived: boolean;
  finalAmount: number;
  professionalFeeWaivedReason: string;
}

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
        [saveDisabled]="isLocked(vm) || isSavingDraft"
        [completeDisabled]="isCompleteActionDisabled(vm)"
        [isSavingDraft]="isSavingDraft"
        [isCompleting]="isSubmittingComplete"
        (saveDraft)="saveDraft(vm)"
        (completeTransaction)="requestCompletion(vm)"
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
export class DoctorConsultationPage {
  private readonly apiService = inject(ApiService);
  private readonly authState = inject(AuthStateService);
  private readonly bookingService = inject(BookingService);
  private readonly doctorService = inject(DoctorService);
  private readonly medicalRecords = inject(MedicalRecordsService);
  private readonly modalCtrl = inject(ModalController);
  private readonly patientState = inject(PatientStateService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toastController = inject(ToastController);
  private readonly reloadSubject = new BehaviorSubject(0);

  isProfessionalFeeWaived = false;
  completionFinalAmount = 0;
  completionWaivedReason = '';
  isSubmittingComplete = false;
  isSavingDraft = false;

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
    this.authState.currentUser$,
    this.reloadSubject
  ]).pipe(
    switchMap(([bookingId, user]) => {
      if (!bookingId || !user) {
        return of(null);
      }

      return this.bookingService.getBookingById$(bookingId).pipe(
        switchMap((booking) => {
          if (!booking) {
            return of(null);
          }

          return combineLatest([
            of(booking),
            this.doctorService.getMyProfile().pipe(catchError(() => of(undefined))),
            this.resolvePatient$(booking)
          ]).pipe(
            switchMap(([resolvedBooking, doctor, patient]) => {
              if (!doctor || resolvedBooking.doctorId !== doctor.id || !patient) {
                return of(null);
              }

              return this.medicalRecords.fetchPatientMedicalRecords(patient.id).pipe(
                catchError(() => of(EMPTY_RECORDS)),
                switchMap((records) => {
                  const consultationSummary =
                    records.consultations.find((item) => item.bookingId === resolvedBooking.id) ?? null;
                  const consultationId = consultationSummary?.id;

                  const consultation$: Observable<Consultation | null> = consultationId
                    ? this.medicalRecords.fetchConsultation(consultationId).pipe(
                        catchError(() => of(consultationSummary))
                      )
                    : of(null);

                  return consultation$.pipe(
                    map((consultation) =>
                      this.buildVm({
                        booking: resolvedBooking,
                        patient,
                        doctor,
                        records,
                        consultation
                      })
                    )
                  );
                })
              );
            })
          );
        })
      );
    })
  );

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
    if (this.isLocked(vm) || this.isSavingDraft) {
      return;
    }

    this.isSavingDraft = true;
    try {
      this.writeLocalDraft(vm);
      void this.presentToast('Draft saved locally.', 'success');
    } catch (error) {
      void this.presentToast(extractApiErrorMessage(error, 'Failed to save local draft.'), 'danger');
    } finally {
      this.isSavingDraft = false;
    }
  }

  requestCompletion(vm: ConsultationPageVm): void {
    if (this.isCompleteActionDisabled(vm)) {
      void this.presentToast(
        'Complete the chief complaint and add at least one primary diagnosis before completing.',
        'warning'
      );
      return;
    }

    void this.openCompleteModal(vm);
  }

  async openCompleteModal(vm: ConsultationPageVm): Promise<void> {
    const booking = vm.booking;
    const draft = this.readLocalDraft(booking.id);
    this.isSubmittingComplete = false;
    this.isProfessionalFeeWaived =
      draft?.isProfessionalFeeWaived ?? (booking.isProfessionalFeeWaived === true || booking.paymentStatus === 'Waived');
    this.completionFinalAmount =
      draft?.finalAmount ?? Math.max(0, booking.finalAmount ?? booking.consultationFeeSnapshot ?? 0);
    this.completionWaivedReason = draft?.professionalFeeWaivedReason ?? booking.professionalFeeWaivedReason ?? '';

    const modal = await this.modalCtrl.create({
      component: ConsultationCompleteModalComponent,
      componentProps: {
        patientName: [vm.patient.firstName, vm.patient.lastName].filter(Boolean).join(' ') || 'Patient',
        serviceLabel: this.servicesLabel(booking),
        scheduleLabel: `${booking.appointmentDate} \u2022 ${booking.slotStartTime} - ${booking.slotEndTime}`,
        initialFinalAmount: this.completionFinalAmount,
        initialIsProfessionalFeeWaived: this.isProfessionalFeeWaived,
        initialProfessionalFeeWaivedReason: this.completionWaivedReason,
        submitHandler: (completion: ConsultationCompleteModalPayload) => this.submitCompletion(booking, completion)
      },
      cssClass: 'modal-default',
      backdropDismiss: false
    });

    await modal.present();
    await modal.onDidDismiss();
  }

  servicesLabel(booking: Booking): string {
    return formatServicesLabel(booking);
  }

  async submitCompletion(booking: Booking, completion: ConsultationCompleteModalPayload): Promise<boolean> {
    if (this.isSubmittingComplete) {
      return false;
    }

    this.isProfessionalFeeWaived = completion.isProfessionalFeeWaived;
    this.completionFinalAmount = completion.isProfessionalFeeWaived ? 0 : completion.finalAmount;
    this.completionWaivedReason = completion.professionalFeeWaivedReason;

    const finalAmount = this.completionFinalAmount;
    const professionalFeeWaivedReason = this.completionWaivedReason.trim();

    if (!this.isProfessionalFeeWaived && (!Number.isFinite(finalAmount) || finalAmount < 0)) {
      await this.presentToast('Enter a valid final amount.', 'warning');
      return false;
    }

    if (this.isProfessionalFeeWaived && !professionalFeeWaivedReason) {
      await this.presentToast('A waived reason is required.', 'warning');
      return false;
    }

    const payload: DoctorCompleteBookingRequest = {
      finalAmount: this.isProfessionalFeeWaived ? 0 : finalAmount,
      isProfessionalFeeWaived: this.isProfessionalFeeWaived,
      professionalFeeWaivedReason: professionalFeeWaivedReason || undefined,
      soapNotes: this.buildSoapNotes(),
      notes: this.soapValue.plan.trim() || undefined
    };

    this.isSubmittingComplete = true;

    try {
      await firstValueFrom(this.bookingService.doctorCompleteBooking(booking.id, payload));
      this.clearLocalDraft(booking.id);
      this.resetCompletionModalState();
      this.reload();
      await this.presentToast('Consultation completed successfully.', 'success');
      void this.router.navigate(['/doctor/appointments']);
      return true;
    } catch (error) {
      await this.presentToast(extractApiErrorMessage(error, 'Failed to complete consultation.'), 'danger');
      return false;
    } finally {
      this.isSubmittingComplete = false;
    }
  }

  isLocked(vm: ConsultationPageVm): boolean {
    return Boolean(vm.consultation?.isLocked);
  }

  isCompleteActionDisabled(vm: ConsultationPageVm): boolean {
    return this.isLocked(vm) || this.isSavingDraft || this.isSubmittingComplete || !this.soapValid || !this.diagnosisValid || !this.vitalsValid;
  }

  private buildVm(args: {
    booking: Booking;
    patient: Patient;
    doctor: ConsultationPageVm['doctor'];
    records: MedicalRecordsState;
    consultation: Consultation | null;
  }): ConsultationPageVm {
    const localDraft = this.readLocalDraft(args.booking.id);
    const mergedConsultation = mergeConsultationWithDraft(args.consultation, localDraft);
    const existingPrescription =
      localDraft?.prescriptionItems.length
        ? mergePrescriptionWithDraft(
            args.consultation?.prescriptions?.[0] ??
              args.records.prescriptions.find((item) => item.consultationId === args.consultation?.id) ??
              null,
            localDraft
          )
        : args.consultation?.prescriptions?.[0] ??
          args.records.prescriptions.find((item) => item.consultationId === args.consultation?.id) ??
          null;

    return {
      booking: args.booking,
      patient: args.patient,
      doctor: args.doctor,
      consultation: mergedConsultation,
      soap: this.soapFromConsultation(mergedConsultation),
      existingPrescription,
      allergies: args.records.allergies.filter((item) => item.patientId === args.patient.id),
      labRequests:
        mergedConsultation?.labRequests ??
        args.records.labRequests.filter((item) =>
          mergedConsultation?.id ? item.consultationId === mergedConsultation.id : item.patientId === args.patient.id
        ),
      labResults: args.records.labResults.filter((item) => item.patientId === args.patient.id),
      vaccinations: args.records.vaccinations.filter((item) => item.patientId === args.patient.id),
      followUps: args.records.followUps.filter((item) => item.patientId === args.patient.id),
      labRequestDrafts:
        localDraft?.labRequests.length
          ? localDraft.labRequests.map((item) => ({ ...item }))
          : (mergedConsultation?.labRequests ?? []).map((request) => ({
              id: request.id,
              testName: request.testName,
              reason: request.reason
            })),
      followUpDraft:
        localDraft?.followUpValue ??
        (mergedConsultation?.followUpDate
          ? {
              id: `fu-${mergedConsultation.id}`,
              followUpDate: mergedConsultation.followUpDate,
              reason: '',
              reminderEnabled: false
            }
          : null),
      recentConsultations: args.records.consultations
        .filter((item) => item.patientId === args.patient.id)
        .slice(0, 5)
    };
  }

  private soapFromConsultation(consultation: Consultation | null): SoapFormValue {
    return {
      chiefComplaint: consultation?.chiefComplaint ?? '',
      subjective: consultation?.subjective ?? consultation?.historyOfPresentIllness ?? '',
      objective: consultation?.objective ?? consultation?.peGeneralFindings ?? '',
      assessment: consultation?.assessment ?? '',
      plan: consultation?.plan ?? ''
    };
  }

  private buildSoapNotes(): string | undefined {
    const sections = [
      ['Chief Complaint', this.soapValue.chiefComplaint.trim()],
      ['Subjective', this.soapValue.subjective.trim()],
      ['Objective', this.soapValue.objective.trim()],
      ['Assessment', this.soapValue.assessment.trim()],
      ['Plan', this.soapValue.plan.trim()]
    ]
      .filter(([, value]) => value.length > 0)
      .map(([label, value]) => `${label}: ${value}`);

    return sections.length ? sections.join('\n') : undefined;
  }

  private writeLocalDraft(vm: ConsultationPageVm): void {
    if (typeof localStorage === 'undefined') {
      throw new Error('Local draft storage is not available in this browser.');
    }

    const draft: ConsultationLocalDraft = {
      bookingId: vm.booking.id,
      savedAt: new Date().toISOString(),
      soap: {
        chiefComplaint: this.soapValue.chiefComplaint,
        subjective: this.soapValue.subjective,
        objective: this.soapValue.objective,
        assessment: this.soapValue.assessment,
        plan: this.soapValue.plan
      },
      vitalsValue: this.vitalsValue ? { ...this.vitalsValue } : null,
      diagnoses: this.diagnoses.map((diagnosis) => ({ ...diagnosis })),
      prescriptionItems: this.prescriptionItems.map((item) => ({ ...item })),
      labRequests: this.labRequests.map((request) => ({ ...request })),
      followUpValue: this.followUpValue ? { ...this.followUpValue } : null,
      isProfessionalFeeWaived: this.isProfessionalFeeWaived,
      finalAmount: this.completionFinalAmount,
      professionalFeeWaivedReason: this.completionWaivedReason.trim()
    };

    localStorage.setItem(buildConsultationDraftKey(vm.booking.id), JSON.stringify(draft));
  }

  private readLocalDraft(bookingId: string): ConsultationLocalDraft | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }

    const raw = localStorage.getItem(buildConsultationDraftKey(bookingId));
    if (!raw) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw) as Partial<ConsultationLocalDraft>;
      if (parsed.bookingId !== bookingId) {
        return null;
      }

      return {
        bookingId,
        savedAt: typeof parsed.savedAt === 'string' ? parsed.savedAt : new Date().toISOString(),
        soap: {
          chiefComplaint: parsed.soap?.chiefComplaint ?? '',
          subjective: parsed.soap?.subjective ?? '',
          objective: parsed.soap?.objective ?? '',
          assessment: parsed.soap?.assessment ?? '',
          plan: parsed.soap?.plan ?? ''
        },
        vitalsValue: parsed.vitalsValue ? { ...parsed.vitalsValue } : null,
        diagnoses: Array.isArray(parsed.diagnoses) ? parsed.diagnoses.map((diagnosis) => ({ ...diagnosis })) : [],
        prescriptionItems: Array.isArray(parsed.prescriptionItems)
          ? parsed.prescriptionItems.map((item) => ({ ...item }))
          : [],
        labRequests: Array.isArray(parsed.labRequests) ? parsed.labRequests.map((request) => ({ ...request })) : [],
        followUpValue: parsed.followUpValue ? { ...parsed.followUpValue } : null,
        isProfessionalFeeWaived: Boolean(parsed.isProfessionalFeeWaived),
        finalAmount: typeof parsed.finalAmount === 'number' ? parsed.finalAmount : 0,
        professionalFeeWaivedReason: parsed.professionalFeeWaivedReason ?? ''
      };
    } catch {
      return null;
    }
  }

  private clearLocalDraft(bookingId: string): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    localStorage.removeItem(buildConsultationDraftKey(bookingId));
  }

  private resetCompletionModalState(): void {
    this.isProfessionalFeeWaived = false;
    this.completionFinalAmount = 0;
    this.completionWaivedReason = '';
    this.isSubmittingComplete = false;
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

  private reload(): void {
    this.reloadSubject.next(this.reloadSubject.value + 1);
  }

  private async presentToast(
    message: string,
    color: 'success' | 'danger' | 'warning' = 'success'
  ): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 2200,
      position: 'top',
      color
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
  if (typeof error === 'object' && error !== null) {
    const apiError = error as {
      error?: { message?: unknown; errors?: Record<string, unknown> };
      message?: unknown;
    };

    const directMessage = apiError.error?.message ?? apiError.message;
    if (typeof directMessage === 'string' && directMessage.trim()) {
      return directMessage;
    }

    const firstValidationError = apiError.error?.errors
      ? Object.values(apiError.error.errors)
          .flatMap((value) => (Array.isArray(value) ? value : [value]))
          .find((value): value is string => typeof value === 'string' && value.trim().length > 0)
      : undefined;

    if (firstValidationError) {
      return firstValidationError;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}

function buildConsultationDraftKey(bookingId: string): string {
  return `doctor-consultation-draft:${bookingId}`;
}

function mergeConsultationWithDraft(
  consultation: Consultation | null,
  draft: ConsultationLocalDraft | null
): Consultation | null {
  if (!consultation && !draft) {
    return null;
  }

  const base = consultation ?? {
    id: '',
    bookingId: draft?.bookingId ?? '',
    patientId: '',
    doctorId: '',
    consultationDate: '',
    chiefComplaint: '',
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
    diagnoses: [],
    prescriptionIds: [],
    labRequestIds: [],
    status: 'Draft' as const,
    isLocked: false,
    createdAt: draft?.savedAt ?? new Date().toISOString(),
    updatedAt: draft?.savedAt ?? new Date().toISOString()
  };

  if (!draft) {
    return base;
  }

  return {
    ...base,
    chiefComplaint: draft.soap.chiefComplaint,
    subjective: draft.soap.subjective,
    objective: draft.soap.objective,
    assessment: draft.soap.assessment,
    plan: draft.soap.plan,
    historyOfPresentIllness: draft.soap.subjective,
    peGeneralFindings: draft.soap.objective,
    vitalSigns: draft.vitalsValue ? { ...draft.vitalsValue } : base.vitalSigns,
    diagnoses: draft.diagnoses.map((diagnosis) => ({ ...diagnosis })),
    followUpDate: draft.followUpValue?.followUpDate ?? base.followUpDate,
    updatedAt: draft.savedAt
  };
}

function mergePrescriptionWithDraft(
  prescription: Prescription | null,
  draft: ConsultationLocalDraft
): Prescription {
  return {
    id: prescription?.id ?? '',
    consultationId: prescription?.consultationId ?? '',
    patientId: prescription?.patientId ?? '',
    doctorId: prescription?.doctorId ?? '',
    issuedAt: prescription?.issuedAt ?? draft.savedAt,
    status: prescription?.status ?? 'Active',
    notes: prescription?.notes,
    prescriptionDate: prescription?.prescriptionDate,
    items: draft.prescriptionItems.map((item) => ({ ...item }))
  };
}
