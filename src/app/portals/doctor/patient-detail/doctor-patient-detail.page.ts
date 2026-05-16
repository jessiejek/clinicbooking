import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Booking, Patient } from '../../../core/models';
import { selectCurrentUser } from '../../../store/auth/auth.selectors';
import { selectDoctorByUserId } from '../../../store/doctors/doctors.selectors';
import { selectBookingsByDoctorId } from '../../../store/bookings/bookings.selectors';
import { selectPatientById } from '../../../store/patients/patients.selectors';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { FormsModule } from '@angular/forms';
import { IonLabel, IonSegment, IonSegmentButton } from '@ionic/angular/standalone';

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
        <app-empty-state
          icon="document-text-outline"
          title="Medical Records"
          description="Consultation history will be implemented in Phase 9."
        ></app-empty-state>
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
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);

  activeTab: 'overview' | 'records' = 'overview';

  readonly currentDoctor$ = this.store.select(selectCurrentUser).pipe(
    switchMap((user) => (user ? this.store.select(selectDoctorByUserId(user.id)) : of(undefined)))
  );

  readonly detail$ = combineLatest([
    this.route.paramMap.pipe(map((paramMap) => paramMap.get('id') ?? '')),
    this.currentDoctor$
  ]).pipe(
    switchMap(([patientId, doctor]) =>
      patientId && doctor
        ? combineLatest([
            this.store.select(selectPatientById(patientId)),
            this.store.select(selectBookingsByDoctorId(doctor.id))
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
}
