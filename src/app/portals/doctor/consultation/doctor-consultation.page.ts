import { AsyncPipe, DatePipe, NgFor, NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ToastController } from '@ionic/angular/standalone';
import { combineLatest, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import {
  Allergy,
  Booking,
  Consultation,
  Diagnosis,
  Doctor,
  FollowUp,
  LabRequest,
  LabResult,
  Patient,
  Prescription,
  PrescriptionItem,
  VitalSigns,
  VaccinationRecord
} from '../../../core/models';
import { loadBookings, markComplete } from '../../../store/bookings/bookings.actions';
import { selectBookingById } from '../../../store/bookings/bookings.selectors';
import { selectCurrentUser } from '../../../store/auth/auth.selectors';
import { loadDoctors } from '../../../store/doctors/doctors.actions';
import { selectDoctorByUserId } from '../../../store/doctors/doctors.selectors';
import {
  addFollowUp,
  addLabRequest,
  addLabResult,
  addPrescription,
  loadMedicalRecords,
  saveConsultation,
  updateConsultation
} from '../../../store/medical-records/medical-records.actions';
import { selectMedicalRecordsState } from '../../../store/medical-records/medical-records.selectors';
import { loadPatients } from '../../../store/patients/patients.actions';
import { selectAllPatients } from '../../../store/patients/patients.selectors';
import { BannerComponent } from '../../../shared/components/banner/banner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { AllergyWarningBannerComponent } from '../components/allergy-warning-banner/allergy-warning-banner.component';
import { DiagnosisPickerComponent } from '../components/diagnosis-picker/diagnosis-picker.component';
import { FollowUpFormComponent, FollowUpDraftView } from '../components/follow-up-form/follow-up-form.component';
import { LabRequestDraftView, LabRequestFormComponent } from '../components/lab-request-form/lab-request-form.component';
import { PrescriptionBuilderComponent } from '../components/prescription-builder/prescription-builder.component';
import { SoapFormComponent, SoapFormValue } from '../components/soap-form/soap-form.component';
import { VitalSignsFormComponent } from '../components/vital-signs-form/vital-signs-form.component';
import { VitalsTrendChartComponent } from '../components/vitals-trend-chart/vitals-trend-chart.component';

interface ConsultationPageVm {
  booking: Booking;
  patient: Patient;
  doctor: Doctor;
  consultation: Consultation | null;
  soap: SoapFormValue;
  existingPrescription: Prescription | null;
  allergies: Allergy[];
  labRequests: LabRequest[];
  labResults: LabResult[];
  vaccinations: VaccinationRecord[];
  followUps: FollowUp[];
  recentConsultations: Consultation[];
}

@Component({
  standalone: true,
  selector: 'app-doctor-consultation-page',
  imports: [
    AsyncPipe,
    DatePipe,
    NgFor,
    NgIf,
    PageHeaderComponent,
    EmptyStateComponent,
    BannerComponent,
    StatusBadgeComponent,
    AllergyWarningBannerComponent,
    VitalSignsFormComponent,
    SoapFormComponent,
    DiagnosisPickerComponent,
    PrescriptionBuilderComponent,
    LabRequestFormComponent,
    FollowUpFormComponent,
    VitalsTrendChartComponent
  ],
  template: `
    <ng-container *ngIf="vm$ | async as vm; else notFound">
      <app-page-header
        title="Consultation"
        subtitle="Complete the medical record from the appointment"
        [showBackButton]="true"
        defaultBackHref="/doctor/appointments"
      >
        <div class="consultation-header">
          <div class="consultation-header__copy">
            <h2>{{ patientName(vm.patient) }}</h2>
            <p>
              Booking {{ vm.booking.id }} • {{ vm.booking.appointmentDate }}
              {{ vm.booking.slotStartTime }} - {{ vm.booking.slotEndTime }}
            </p>
          </div>
          <div class="consultation-header__actions">
            <button
              type="button"
              class="btn-ghost"
              [disabled]="isLocked(vm)"
              (click)="saveDraft(vm)"
            >
              Save Draft
            </button>
            <button
              type="button"
              class="btn-primary"
              [disabled]="isLocked(vm)"
              (click)="completeConsultation(vm)"
            >
              Complete Consultation
            </button>
          </div>
        </div>
      </app-page-header>

      <app-banner
        *ngIf="isLocked(vm)"
        variant="warning"
        message="This consultation is locked. Create an amendment for changes."
      ></app-banner>

      <section class="summary-grid">
        <article class="clinic-card summary-card">
          <h3>Patient Summary</h3>
          <p><strong>Age / Sex:</strong> {{ ageLabel(vm.patient) }} / {{ vm.patient.sex }}</p>
          <p><strong>Allergies:</strong> {{ allergySummary(vm.allergies) }}</p>
          <p><strong>Last Visit:</strong> {{ lastVisit(vm.recentConsultations) }}</p>
          <p><strong>Existing Conditions:</strong> {{ conditionSummary(vm.recentConsultations) }}</p>
        </article>
        <article class="clinic-card summary-card">
          <h3>Record Status</h3>
          <p><strong>Consultation:</strong> {{ vm.consultation?.status || 'Draft' }}</p>
          <p><strong>Locked:</strong> {{ vm.consultation?.isLocked ? 'Yes' : 'No' }}</p>
          <p><strong>Prescriptions:</strong> {{ vm.existingPrescription ? 1 : 0 }}</p>
          <p><strong>Follow-Ups:</strong> {{ vm.followUps.length }}</p>
        </article>
      </section>

      <section class="consultation-grid">
        <div class="consultation-main">
          <app-vital-signs-form
            [value]="vm.consultation?.vitalSigns ?? null"
            [locked]="isLocked(vm)"
            (vitalSignsChange)="onVitalsChange($event)"
            (validityChange)="vitalsValid = $event"
          ></app-vital-signs-form>

          <app-soap-form
            [value]="vm.soap"
            [locked]="isLocked(vm)"
            (soapChange)="onSoapChange($event)"
            (validityChange)="soapValid = $event"
          ></app-soap-form>

          <app-diagnosis-picker
            [value]="vm.consultation?.diagnoses ?? emptyDiagnoses"
            [locked]="isLocked(vm)"
            (diagnosesChange)="onDiagnosesChange($event)"
            (validityChange)="diagnosisValid = $event"
          ></app-diagnosis-picker>

          <app-allergy-warning-banner
            [allergies]="vm.allergies"
            [prescriptionItems]="prescriptionItems"
          ></app-allergy-warning-banner>

          <app-prescription-builder
            [items]="vm.existingPrescription?.items ?? emptyPrescriptionItems"
            [locked]="isLocked(vm)"
            (itemsChange)="onPrescriptionItemsChange($event)"
          ></app-prescription-builder>

          <app-lab-request-form
            [locked]="isLocked(vm)"
            (requestsChange)="onLabRequestsChange($event)"
          ></app-lab-request-form>

          <div class="record-list clinic-card" *ngIf="vm.labRequests.length > 0">
            <h3>Saved Lab Requests</h3>
            <article class="record-item" *ngFor="let request of vm.labRequests">
              <strong>{{ request.testName }}</strong>
              <p>{{ request.reason || 'No reason' }} • {{ request.status }}</p>
            </article>
          </div>

          <app-follow-up-form
            [locked]="isLocked(vm)"
            (followUpChange)="onFollowUpChange($event)"
          ></app-follow-up-form>

          <div class="record-list clinic-card" *ngIf="vm.followUps.length > 0">
            <h3>Saved Follow-Ups</h3>
            <article class="record-item" *ngFor="let followUp of vm.followUps">
              <strong>{{ followUp.followUpDate | date : 'MMM d, y' }}</strong>
              <p>{{ followUp.reason }} • {{ followUp.status }}</p>
            </article>
          </div>
        </div>

        <aside class="consultation-side">
          <app-vitals-trend-chart [consultations]="vm.recentConsultations"></app-vitals-trend-chart>

          <section class="clinic-card side-card">
            <h3>Patient Allergies</h3>
            <p *ngFor="let allergy of vm.allergies">{{ allergy.allergen }} • {{ allergy.severity }}</p>
            <p *ngIf="vm.allergies.length === 0">No allergies on record.</p>
          </section>

          <section class="clinic-card side-card">
            <h3>Vaccinations</h3>
            <p *ngFor="let vaccination of vm.vaccinations">
              {{ vaccination.vaccineName }} • {{ vaccination.dateGiven | date : 'MMM d, y' }}
            </p>
            <p *ngIf="vm.vaccinations.length === 0">No vaccinations on record.</p>
          </section>

          <section class="clinic-card side-card">
            <h3>Lab Results</h3>
            <p *ngFor="let result of vm.labResults">{{ result.fileName }} • {{ result.resultDate | date : 'MMM d, y' }}</p>
            <p *ngIf="vm.labResults.length === 0">No lab results on record.</p>
          </section>
        </aside>
      </section>
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
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toastController = inject(ToastController);

  readonly emptyDiagnoses: Diagnosis[] = [];
  readonly emptyPrescriptionItems: PrescriptionItem[] = [];
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
    this.store.select(selectCurrentUser)
  ]).pipe(
    switchMap(([bookingId, user]) =>
      bookingId && user
        ? combineLatest([
            this.store.select(selectBookingById(bookingId)),
            this.store.select(selectDoctorByUserId(user.id)),
            this.store.select(selectAllPatients),
            this.store.select(selectMedicalRecordsState)
          ])
        : of([undefined, undefined, [], { consultations: [], prescriptions: [], allergies: [], labRequests: [], labResults: [], vaccinations: [], followUps: [], isLoading: false, error: null }] as const)
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
      const existingPrescription =
        consultation?.prescriptionIds
          .map((prescriptionId) => records.prescriptions.find((item) => item.id === prescriptionId))
          .find((item): item is Prescription => Boolean(item)) ?? null;

      const labRequests = records.labRequests.filter((item) =>
        consultation ? item.consultationId === consultation.id : item.patientId === patient.id
      );
      const labResults = records.labResults.filter((item) =>
        consultation ? item.consultationId === consultation.id : item.patientId === patient.id
      );
      const followUps = records.followUps.filter((item) => item.patientId === patient.id);
      const vaccinations = records.vaccinations.filter((item) => item.patientId === patient.id);
      const allergies = records.allergies.filter((item) => item.patientId === patient.id);
      const recentConsultations = records.consultations
        .filter((item) => item.patientId === patient.id)
        .slice(0, 5);

      return {
        booking,
        patient,
        doctor,
        consultation,
        soap: this.soapFromConsultation(consultation),
        existingPrescription,
        allergies,
        labRequests,
        labResults,
        vaccinations,
        followUps,
        recentConsultations
      } satisfies ConsultationPageVm;
    })
  );

  ngOnInit(): void {
    this.store.dispatch(loadBookings());
    this.store.dispatch(loadDoctors());
    this.store.dispatch(loadPatients());
    this.store.dispatch(loadMedicalRecords());
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
    if (this.isLocked(vm)) {
      return;
    }
    this.persistConsultation(vm, 'Draft');
  }

  completeConsultation(vm: ConsultationPageVm): void {
    if (this.isLocked(vm) || !this.soapValid || !this.diagnosisValid || !this.vitalsValid) {
      void this.presentToast('Please complete chief complaint and a primary diagnosis before finishing.');
      return;
    }
    this.persistConsultation(vm, 'Completed');
    this.store.dispatch(markComplete({ bookingId: vm.booking.id }));
    void this.presentToast('Consultation completed.');
    void this.router.navigate(['/doctor/appointments', vm.booking.id]);
  }

  isLocked(vm: ConsultationPageVm): boolean {
    return Boolean(vm.consultation?.isLocked);
  }

  patientName(patient: Patient): string {
    return `${patient.firstName} ${patient.lastName}`;
  }

  ageLabel(patient: Patient): string {
    const birthDate = new Date(patient.dateOfBirth);
    if (Number.isNaN(birthDate.getTime())) {
      return 'Age unavailable';
    }
    const years = new Date().getFullYear() - birthDate.getFullYear();
    return `${years} years old`;
  }

  allergySummary(allergies: Allergy[]): string {
    return allergies.length > 0 ? allergies.map((allergy) => allergy.allergen).join(', ') : 'None recorded';
  }

  lastVisit(consultations: Consultation[]): string {
    return consultations[0]?.consultationDate || 'No prior visit';
  }

  conditionSummary(consultations: Consultation[]): string {
    const diagnoses = consultations.flatMap((consultation) => consultation.diagnoses.map((diagnosis) => diagnosis.description));
    const unique = [...new Set(diagnoses)];
    return unique.length > 0 ? unique.slice(0, 3).join(', ') : 'No existing conditions';
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

  private persistConsultation(vm: ConsultationPageVm, status: Consultation['status']): void {
    const consultationId =
      vm.consultation?.id ?? this.pendingConsultationId ?? `consult-${Date.now()}`;
    const now = new Date().toISOString();
    const prescriptionId =
      vm.existingPrescription?.id ??
      this.pendingPrescriptionId ??
      (this.prescriptionItems.length > 0 ? `rx-${Date.now()}` : undefined);
    const labRequestIds = [
      ...vm.labRequests.map((item) => item.id),
      ...this.labRequests.map((item) => item.id)
    ].filter((id, index, ids) => ids.indexOf(id) === index);

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

    if (vm.consultation) {
      this.store.dispatch(updateConsultation({ consultation }));
    } else {
      this.store.dispatch(saveConsultation({ consultation }));
    }

    if (this.prescriptionItems.length > 0 && prescriptionId) {
      this.store.dispatch(
        addPrescription({
          prescription: {
            id: prescriptionId,
            consultationId,
            patientId: vm.patient.id,
            doctorId: vm.doctor.id,
            issuedAt: now,
            status: status === 'Completed' ? 'Completed' : 'Active',
            items: [...this.prescriptionItems],
            notes: this.allergySummary(vm.allergies)
          }
        })
      );
    }

    this.labRequests.forEach((request) => {
      this.store.dispatch(
        addLabRequest({
          labRequest: {
            id: request.id,
            consultationId,
            patientId: vm.patient.id,
            doctorId: vm.doctor.id,
            testName: request.testName,
            reason: request.reason,
            status: 'Requested',
            requestedAt: now
          }
        })
      );

      if (request.fileName) {
        this.store.dispatch(
          addLabResult({
            labResult: {
              id: `labres-${request.id}`,
              labRequestId: request.id,
              patientId: vm.patient.id,
              fileName: request.fileName,
              resultDate: now,
              notes: request.reason
            }
          })
        );
      }
    });

    if (this.followUpValue) {
      this.store.dispatch(
        addFollowUp({
          followUp: {
            id: this.followUpValue.id,
            consultationId,
            patientId: vm.patient.id,
            doctorId: vm.doctor.id,
            followUpDate: this.followUpValue.followUpDate,
            reason: this.followUpValue.reason,
            status: 'Pending',
            reminderEnabled: this.followUpValue.reminderEnabled
          }
        })
      );
    }
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
