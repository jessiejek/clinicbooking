import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Allergy, Booking, Consultation, FollowUp, LabResult, Patient, Prescription, VaccinationRecord } from '../../../core/models';
import { AuthStateService } from '../../../core/services/auth-state.service';
import { BookingService } from '../../../core/services/booking.service';
import { DoctorStateService } from '../../../core/services/doctor-state.service';
import { MedicalRecordsService } from '../../../core/services/medical-records.service';
import { PatientStateService } from '../../../core/services/patient-state.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { PatientMediaPanelComponent } from '../../../shared/components/patient-media-panel/patient-media-panel.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { FormsModule } from '@angular/forms';
import { IonLabel, IonSegment, IonSegmentButton } from '@ionic/angular/standalone';
import { ConsultationTimelineComponent } from '../../admin/components/consultation-timeline/consultation-timeline.component';
import { VitalsTrendChartComponent } from '../components/vitals-trend-chart/vitals-trend-chart.component';

@Component({
  standalone: true,
  selector: 'app-doctor-patient-detail-page',
  imports: [
    AsyncPipe,
    FormsModule,
    NgFor,
    NgIf,
    IonLabel,
    IonSegment,
    IonSegmentButton,
    PageHeaderComponent,
    EmptyStateComponent,
    PatientMediaPanelComponent,
    ConsultationTimelineComponent,
    VitalsTrendChartComponent,
    StatusBadgeComponent
  ],
  template: `
    <ng-container *ngIf="detail$ | async as detail; else notFound">
      <app-page-header
        title="Patient Detail"
        subtitle="Read-only patient profile"
        [showBackButton]="true"
        defaultBackHref="/doctor/patients"
      ></app-page-header>

      <section class="clinic-card tab-card">
        <ion-segment [(ngModel)]="activeTab">
          <ion-segment-button value="overview">
            <ion-label>Overview</ion-label>
          </ion-segment-button>
          <ion-segment-button value="records">
            <ion-label>Medical Records</ion-label>
          </ion-segment-button>
        </ion-segment>
      </section>

      <section *ngIf="activeTab === 'overview'" class="detail-grid">
        <div class="detail-main">
          <div class="clinic-card">
            <h3>{{ patientName(detail.patient) }}</h3>
            <div class="info-grid">
              <div><span>Patient Code</span><strong>{{ detail.patient.patientCode }}</strong></div>
              <div><span>Age / Gender</span><strong>{{ ageLabel(detail.patient) }} / {{ detail.patient.sex }}</strong></div>
              <div><span>Contact</span><strong>{{ detail.patient.contactNumber || 'N/A' }}</strong></div>
              <div><span>Email</span><strong>{{ detail.patient.email || 'N/A' }}</strong></div>
              <div><span>Emergency Contact</span><strong>{{ emergencyContact(detail.patient) }}</strong></div>
              <div><span>Allergies</span><strong>No allergies recorded in mock data</strong></div>
              <div><span>PhilHealth</span><strong>{{ detail.patient.philHealthNumber || 'N/A' }}</strong></div>
              <div><span>HMO</span><strong>{{ detail.patient.hmoProvider || 'N/A' }}</strong></div>
            </div>
          </div>

          <div class="clinic-card">
            <h3>Booking History With This Doctor</h3>
            <div class="history-list" *ngIf="detail.bookings.length > 0; else noHistory">
              <article class="history-item" *ngFor="let booking of detail.bookings">
                <div>
                  <strong>{{ booking.appointmentDate }} {{ booking.slotStartTime }}</strong>
                  <p>{{ booking.status }} • {{ booking.paymentStatus }}</p>
                </div>
                <app-status-badge [status]="booking.status"></app-status-badge>
              </article>
            </div>
            <ng-template #noHistory>
              <p class="muted-text">No booking history is available for this doctor.</p>
            </ng-template>
          </div>
        </div>

        <aside class="detail-side">
          <div class="clinic-card">
            <h3>Last Visit</h3>
            <p class="muted-text">{{ lastCompletedVisit(detail.bookings) || 'No completed visits yet.' }}</p>
          </div>
        </aside>
      </section>

      <section *ngIf="activeTab === 'records'">
        <div class="records-grid">
          <app-consultation-timeline [consultations]="consultations"></app-consultation-timeline>
          <app-vitals-trend-chart [consultations]="consultations"></app-vitals-trend-chart>
          <app-patient-media-panel
            class="records-grid__full"
            *ngIf="detail.patient"
            kind="document"
            [patientId]="detail.patient.id"
            [allowUpload]="false"
            heading="Patient Documents"
            subheading="View supporting documents uploaded by the patient or staff."
          ></app-patient-media-panel>
          <app-patient-media-panel
            class="records-grid__full"
            *ngIf="detail.patient"
            kind="lab-result"
            [patientId]="detail.patient.id"
            [allowUpload]="false"
            heading="Patient Lab Results"
            subheading="View uploaded lab reports and result files."
          ></app-patient-media-panel>
          <section class="clinic-card">
            <h3>Allergies</h3>
            <p *ngFor="let allergy of allergies">{{ allergy.allergen }} • {{ allergy.severity }}</p>
            <p *ngIf="allergies.length === 0">No allergies recorded.</p>
          </section>
          <section class="clinic-card">
            <h3>Prescriptions</h3>
            <p *ngFor="let prescription of prescriptions">{{ prescription.items.length }} medicine(s)</p>
            <p *ngIf="prescriptions.length === 0">No prescriptions recorded.</p>
          </section>
          <section class="clinic-card">
            <h3>Lab Results</h3>
            <p *ngFor="let labResult of labResults">{{ labResult.fileName }} • {{ labResult.resultDate }}</p>
            <p *ngIf="labResults.length === 0">No lab results recorded.</p>
          </section>
          <section class="clinic-card">
            <h3>Vaccinations</h3>
            <p *ngFor="let vaccination of vaccinations">{{ vaccination.vaccineName }} • {{ vaccination.dateGiven }}</p>
            <p *ngIf="vaccinations.length === 0">No vaccination records.</p>
          </section>
          <section class="clinic-card">
            <h3>Follow-Ups</h3>
            <p *ngFor="let followUp of followUps">{{ followUp.followUpDate }} • {{ followUp.reason }}</p>
            <p *ngIf="followUps.length === 0">No follow-ups scheduled.</p>
          </section>
        </div>
      </section>
    </ng-container>

    <ng-template #notFound>
      <app-empty-state
        icon="people-outline"
        title="Patient not found"
        description="This patient is not assigned to your bookings."
        ctaLabel="Back to Patients"
        ctaRoute="/doctor/patients"
      ></app-empty-state>
    </ng-template>
  `,
  styleUrl: './doctor-patient-detail.page.scss'
})
export class DoctorPatientDetailPage {
  private readonly authState = inject(AuthStateService);
  private readonly bookingService = inject(BookingService);
  private readonly doctorState = inject(DoctorStateService);
  private readonly medicalRecords = inject(MedicalRecordsService);
  private readonly patientState = inject(PatientStateService);
  private readonly route = inject(ActivatedRoute);

  activeTab: 'overview' | 'records' = 'overview';
  consultations: Consultation[] = [];
  prescriptions: Prescription[] = [];
  allergies: Allergy[] = [];
  labResults: LabResult[] = [];
  vaccinations: VaccinationRecord[] = [];
  followUps: FollowUp[] = [];

  readonly currentDoctor$ = this.authState.currentUser$.pipe(
    switchMap((user) => (user ? this.doctorState.getDoctorByUserId(user.id) : of(undefined)))
  );

  readonly detail$ = combineLatest([
    this.route.paramMap.pipe(map((paramMap) => paramMap.get('id') ?? '')),
    this.currentDoctor$
  ]).pipe(
    switchMap(([patientId, doctor]) =>
      patientId && doctor
        ? combineLatest([
            this.patientState.getPatientById(patientId),
            this.bookingService.getBookingsByDoctorId(doctor.id)
          ])
        : of([undefined, []] as const)
    ),
    map(([patient, bookings]) => {
      if (!patient) {
        return null;
      }
      const doctorBookings = bookings
        .filter((booking) => booking.patientId === patient.id)
        .sort((a, b) => `${b.appointmentDate} ${b.slotStartTime}`.localeCompare(`${a.appointmentDate} ${a.slotStartTime}`));
      if (doctorBookings.length === 0) {
        return null;
      }
      return { patient, bookings: doctorBookings };
    })
  );

  patientName(patient: Patient): string {
    return `${patient.firstName} ${patient.lastName}`;
  }

  ageLabel(patient: Patient): string {
    const birthDate = new Date(patient.dateOfBirth);
    if (Number.isNaN(birthDate.getTime())) {
      return 'Age unavailable';
    }
    return `${new Date().getFullYear() - birthDate.getFullYear()} years old`;
  }

  emergencyContact(patient: Patient): string {
    const name = patient.emergencyContactName || 'N/A';
    const number = patient.emergencyContactNumber || '';
    const relationship = patient.emergencyContactRelationship || '';
    return [name, relationship, number].filter(Boolean).join(' • ') || 'N/A';
  }

  lastCompletedVisit(bookings: Booking[]): string {
    const completed = bookings.filter((booking) => booking.status === 'Completed');
    return completed[0]?.appointmentDate ?? '';
  }

  ngOnInit(): void {
    const patientId = this.route.snapshot.paramMap.get('id') ?? '';
    this.medicalRecords.refresh();
    this.medicalRecords.getConsultationsByPatientId(patientId).subscribe((consultations) => (this.consultations = consultations));
    this.medicalRecords.getPrescriptionsByPatientId(patientId).subscribe((prescriptions) => (this.prescriptions = prescriptions));
    this.medicalRecords.getAllergiesByPatientId(patientId).subscribe((allergies) => (this.allergies = allergies));
    this.medicalRecords.getLabResultsByPatientId(patientId).subscribe((labResults) => (this.labResults = labResults));
    this.medicalRecords.getVaccinationsByPatientId(patientId).subscribe((vaccinations) => (this.vaccinations = vaccinations));
    this.medicalRecords.getFollowUpsByPatientId(patientId).subscribe((followUps) => (this.followUps = followUps));
  }
}
