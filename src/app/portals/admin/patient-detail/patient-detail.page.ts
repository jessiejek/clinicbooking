import { AsyncPipe, CommonModule, NgFor, NgIf, DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Allergy, Booking, Consultation, FollowUp, LabResult, Patient, Prescription, VaccinationRecord } from '../../../core/models';
import { BookingService } from '../../../core/services/booking.service';
import { MedicalRecordsService } from '../../../core/services/medical-records.service';
import { PatientStateService } from '../../../core/services/patient-state.service';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { MedicalRecordsTabComponent } from '../components/medical-records-tab/medical-records-tab.component';
import { IonLabel, IonModal, IonSegment, IonSegmentButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-admin-patient-detail-page',
  standalone: true,
  imports: [
    AsyncPipe,
    NgFor,
    NgIf,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    DatePipe,
    AvatarComponent,
    EmptyStateComponent,
    MedicalRecordsTabComponent,
    StatusBadgeComponent,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonModal
  ],
  template: `
    <section class="page-shell" *ngIf="patient">
      <div class="page-shell__header">
        <div>
          <button type="button" class="btn-ghost" (click)="back()">← Back to Patients</button>
          <h2 class="page-title">{{ patient.firstName }} {{ patient.lastName }}</h2>
          <div class="page-subtitle data-mono">{{ patient.patientCode }}</div>
        </div>
        <button class="btn-primary" type="button" (click)="openEdit()">Edit Profile</button>
      </div>

      <ion-segment [(ngModel)]="selectedTab">
        <ion-segment-button value="overview"><ion-label>Overview</ion-label></ion-segment-button>
        <ion-segment-button value="bookings"><ion-label>Bookings</ion-label></ion-segment-button>
        <ion-segment-button value="records"><ion-label>Medical Records</ion-label></ion-segment-button>
      </ion-segment>

      <div *ngIf="selectedTab === 'overview'" class="overview-grid">
        <div class="clinic-card">
          <div class="section-heading">Personal Info</div>
          <div class="profile-card"><app-avatar [name]="patient.firstName + ' ' + patient.lastName" size="lg"></app-avatar><div><p>{{ patient.dateOfBirth }}</p><p>{{ patient.sex }}</p><p>{{ patient.civilStatus || 'N/A' }}</p><p>{{ patient.bloodType || 'N/A' }}</p></div></div>
        </div>
        <div class="clinic-card">
          <div class="section-heading">Contact Info</div>
          <p>{{ patient.address || 'No address provided' }}</p>
          <p>{{ patient.contactNumber || 'No phone provided' }}</p>
          <p>{{ patient.email || 'No email provided' }}</p>
        </div>
        <div class="clinic-card">
          <div class="section-heading">Emergency Contact</div>
          <p>{{ patient.emergencyContactName || 'N/A' }}</p>
          <p>{{ patient.emergencyContactNumber || 'N/A' }}</p>
          <p>{{ patient.emergencyContactRelationship || 'N/A' }}</p>
        </div>
        <div class="clinic-card">
          <div class="section-heading">Insurance</div>
          <p>{{ patient.philHealthNumber || 'N/A' }}</p>
          <p>{{ patient.hmoProvider || 'N/A' }}</p>
          <p>{{ patient.hmoCardNumber || 'N/A' }}</p>
        </div>
      </div>

      <div *ngIf="selectedTab === 'bookings'" class="clinic-card">
        <table class="clinic-table" *ngIf="bookings.length > 0">
          <thead>
            <tr>
              <th>ID</th><th>Date</th><th>Time</th><th>Status</th><th>Payment</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let booking of bookings">
              <td class="data-mono">{{ booking.id }}</td>
              <td>{{ booking.appointmentDate }}</td>
              <td>{{ booking.slotStartTime }}</td>
              <td><app-status-badge [status]="booking.status"></app-status-badge></td>
              <td><app-status-badge [status]="booking.paymentStatus"></app-status-badge></td>
            </tr>
          </tbody>
        </table>
        <app-empty-state *ngIf="bookings.length === 0" icon="calendar-outline" title="No bookings" description="This patient has no bookings yet."></app-empty-state>
      </div>

      <div *ngIf="selectedTab === 'records'" class="clinic-card">
        <app-medical-records-tab
          [patientId]="patient?.id || ''"
          [consultations]="consultations"
          [prescriptions]="prescriptions"
          [allergies]="allergies"
          [labResults]="labResults"
          [vaccinations]="vaccinations"
          [followUps]="followUps"
        ></app-medical-records-tab>
      </div>
    </section>

    <ion-modal [isOpen]="editOpen" (didDismiss)="editOpen = false">
      <ng-template>
        <div class="modal-shell">
          <h3>Edit Patient</h3>
          <form class="modal-form" [formGroup]="form" (ngSubmit)="save()">
            <input class="filter-input" formControlName="firstName" placeholder="First name" />
            <input class="filter-input" formControlName="lastName" placeholder="Last name" />
            <input class="filter-input" formControlName="contactNumber" placeholder="Contact number" />
            <input class="filter-input" formControlName="email" placeholder="Email" />
            <input class="filter-input" formControlName="address" placeholder="Address" />
            <input class="filter-input" formControlName="emergencyContactName" placeholder="Emergency contact name" />
            <input class="filter-input" formControlName="emergencyContactNumber" placeholder="Emergency contact number" />
            <input class="filter-input" formControlName="philHealthNumber" placeholder="PhilHealth number" />
            <input class="filter-input" formControlName="hmoProvider" placeholder="HMO provider" />
            <input class="filter-input" formControlName="hmoCardNumber" placeholder="HMO card number" />
            <div class="modal-actions">
              <button type="button" class="btn-ghost" (click)="editOpen = false">Cancel</button>
              <button type="submit" class="btn-primary">Save</button>
            </div>
          </form>
        </div>
      </ng-template>
    </ion-modal>
  `,
  styleUrl: './patient-detail.page.scss'
})
export class PatientDetailPage implements OnInit {
  private readonly bookingService = inject(BookingService);
  private readonly medicalRecords = inject(MedicalRecordsService);
  private readonly patientState = inject(PatientStateService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  patient: Patient | null = null;
  bookings: Booking[] = [];
  consultations: Consultation[] = [];
  prescriptions: Prescription[] = [];
  allergies: Allergy[] = [];
  labResults: LabResult[] = [];
  vaccinations: VaccinationRecord[] = [];
  followUps: FollowUp[] = [];
  selectedTab: 'overview' | 'bookings' | 'records' = 'overview';
  editOpen = false;
  form = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    contactNumber: [''],
    email: [''],
    address: [''],
    emergencyContactName: [''],
    emergencyContactNumber: [''],
    philHealthNumber: [''],
    hmoProvider: [''],
    hmoCardNumber: ['']
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.patientState.getPatientById(id).subscribe((patient) => {
      this.patient = patient ?? null;
      if (patient) {
        this.form.patchValue(patient);
        this.medicalRecords.getConsultationsByPatientId(patient.id).subscribe((consultations) => (this.consultations = consultations));
        this.medicalRecords.getPrescriptionsByPatientId(patient.id).subscribe((prescriptions) => (this.prescriptions = prescriptions));
        this.medicalRecords.getAllergiesByPatientId(patient.id).subscribe((allergies) => (this.allergies = allergies));
        this.medicalRecords.getLabResultsByPatientId(patient.id).subscribe((labResults) => (this.labResults = labResults));
        this.medicalRecords.getVaccinationsByPatientId(patient.id).subscribe((vaccinations) => (this.vaccinations = vaccinations));
        this.medicalRecords.getFollowUpsByPatientId(patient.id).subscribe((followUps) => (this.followUps = followUps));
      }
    });
    this.bookingService.getBookingsByPatientId(id).subscribe((bookings) => (this.bookings = bookings));
  }

  back(): void {
    void this.router.navigate(['/admin/patients']);
  }

  openEdit(): void {
    this.editOpen = true;
  }

  save(): void {
    if (!this.patient) {
      return;
    }
    const value = this.form.getRawValue();
    const updated: Patient = {
      ...this.patient,
      firstName: value.firstName ?? this.patient.firstName,
      lastName: value.lastName ?? this.patient.lastName,
      contactNumber: value.contactNumber ?? this.patient.contactNumber,
      email: value.email ?? this.patient.email,
      address: value.address ?? this.patient.address,
      emergencyContactName: value.emergencyContactName ?? this.patient.emergencyContactName,
      emergencyContactNumber: value.emergencyContactNumber ?? this.patient.emergencyContactNumber,
      philHealthNumber: value.philHealthNumber ?? this.patient.philHealthNumber,
      hmoProvider: value.hmoProvider ?? this.patient.hmoProvider,
      hmoCardNumber: value.hmoCardNumber ?? this.patient.hmoCardNumber
    };
    this.patientState.savePatient(updated);
    this.editOpen = false;
  }
}
