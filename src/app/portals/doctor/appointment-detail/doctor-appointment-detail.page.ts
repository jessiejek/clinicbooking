import { AsyncPipe, CurrencyPipe, NgFor, NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Booking, Patient, Service } from '../../../core/models';
import { MockDataService } from '../../../core/services/mock-data.service';
import { markComplete, markNoShow } from '../../../store/bookings/bookings.actions';
import { selectBookingById } from '../../../store/bookings/bookings.selectors';
import { selectCurrentUser } from '../../../store/auth/auth.selectors';
import { selectDoctorByUserId } from '../../../store/doctors/doctors.selectors';
import { selectAllPatients } from '../../../store/patients/patients.selectors';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  standalone: true,
  selector: 'app-doctor-appointment-detail-page',
  imports: [AsyncPipe, CurrencyPipe, NgFor, NgIf, PageHeaderComponent, EmptyStateComponent, StatusBadgeComponent],
  template: `
    <ng-container *ngIf="detail$ | async as detail; else notFound">
      <app-page-header
        title="Appointment Detail"
        subtitle="Review the booking before starting consultation"
        [showBackButton]="true"
        defaultBackHref="/doctor/appointments"
      ></app-page-header>

      <section class="detail-grid">
        <div class="detail-main">
          <div class="clinic-card">
            <div class="card-head">
              <div>
                <p class="section-label">Booking ID</p>
                <h2>{{ detail.booking.id }}</h2>
              </div>
              <app-status-badge [status]="detail.booking.status"></app-status-badge>
            </div>
          </div>

          <div class="clinic-card">
            <h3>Patient Info</h3>
            <div class="info-grid">
              <div><span>Patient</span><strong>{{ patientName(detail.patient) }}</strong></div>
              <div><span>Code</span><strong>{{ detail.patient.patientCode }}</strong></div>
              <div><span>Contact</span><strong>{{ detail.patient.contactNumber || 'N/A' }}</strong></div>
              <div><span>Email</span><strong>{{ detail.patient.email || 'N/A' }}</strong></div>
            </div>
          </div>

          <div class="clinic-card">
            <h3>Appointment Details</h3>
            <div class="info-grid">
              <div><span>Date</span><strong>{{ detail.booking.appointmentDate }}</strong></div>
              <div><span>Time</span><strong>{{ detail.booking.slotStartTime }} - {{ detail.booking.slotEndTime }}</strong></div>
              <div><span>Queue #</span><strong>{{ detail.booking.queueNumber ?? '-' }}</strong></div>
              <div><span>Payment</span><strong>{{ detail.booking.paymentStatus }}</strong></div>
            </div>
          </div>

          <div class="clinic-card">
            <h3>Service Details</h3>
            <div class="info-grid">
              <div><span>Service</span><strong>{{ detail.service.name }}</strong></div>
              <div><span>Category</span><strong>{{ detail.service.category }}</strong></div>
              <div><span>Consultation Fee</span><strong>{{ detail.booking.consultationFeeSnapshot | currency:'PHP':'symbol-narrow':'1.0-0' }}</strong></div>
              <div><span>Service Fee</span><strong>{{ detail.booking.serviceFeeSnapshot | currency:'PHP':'symbol-narrow':'1.0-0' }}</strong></div>
            </div>
          </div>

          <div class="clinic-card">
            <h3>Booking Timeline</h3>
            <div class="timeline">
              <article class="timeline-item" *ngFor="let step of timeline(detail.booking.status)">
                <div class="timeline-dot" [class.timeline-dot--active]="step.active"></div>
                <div>
                  <strong>{{ step.label }}</strong>
                  <p>{{ step.description }}</p>
                </div>
              </article>
            </div>
          </div>

          <div class="clinic-card">
            <h3>Doctor Notes</h3>
            <p class="muted-text">Notes will be captured in the Phase 9 consultation workspace.</p>
          </div>
        </div>

        <aside class="detail-side">
          <div class="clinic-card action-card">
            <button type="button" class="btn-primary" (click)="startConsultation(detail.booking.id)">Start Consultation</button>
            <button type="button" class="btn-ghost" (click)="complete(detail.booking.id)">Mark Complete</button>
            <button type="button" class="btn-ghost" (click)="noShow(detail.booking.id)">Mark No Show</button>
            <button type="button" class="btn-ghost" (click)="back()">Back to appointments</button>
          </div>

          <div class="clinic-card">
            <h3>Payment Summary</h3>
            <div class="summary-list">
              <div><span>Total Fee</span><strong>{{ detail.booking.totalFee | currency:'PHP':'symbol-narrow':'1.0-0' }}</strong></div>
              <div><span>Status</span><strong>{{ detail.booking.paymentStatus }}</strong></div>
              <div><span>Mode</span><strong>{{ detail.booking.paymentMode }}</strong></div>
            </div>
          </div>
        </aside>
      </section>
    </ng-container>

    <ng-template #notFound>
      <app-empty-state
        icon="document-text-outline"
        title="Appointment not available"
        description="This appointment is either unavailable or assigned to another doctor."
        ctaLabel="Back to Appointments"
        ctaRoute="/doctor/appointments"
      ></app-empty-state>
    </ng-template>
  `,
  styleUrl: './doctor-appointment-detail.page.scss'
})
export class DoctorAppointmentDetailPage implements OnInit {
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly mockData = inject(MockDataService);

  readonly detail$ = combineLatest([
    this.route.paramMap.pipe(map((paramMap) => paramMap.get('id') ?? '')),
    this.store.select(selectCurrentUser)
  ]).pipe(
    switchMap(([bookingId, user]) =>
      bookingId && user
        ? combineLatest([
            this.store.select(selectBookingById(bookingId)),
            this.store.select(selectDoctorByUserId(user.id)),
            this.store.select(selectAllPatients)
          ])
        : of([undefined, undefined, []] as const)
    ),
    map(([booking, doctor, patients]) => {
      if (!booking || !doctor || booking.doctorId !== doctor.id) {
        return null;
      }
      const patient = patients.find((item) => item.id === booking.patientId);
      const service = this.mockData.getServiceById(booking.serviceId);
      if (!patient || !service) {
        return null;
      }
      return { booking, patient, service };
    })
  );

  ngOnInit(): void {
    // Data is preloaded by the doctor portal resolver, so the detail view only needs to stay in sync.
  }

  startConsultation(bookingId: string): void {
    void this.router.navigate(['/doctor/consultation', bookingId]);
  }

  complete(bookingId: string): void {
    this.store.dispatch(markComplete({ bookingId }));
  }

  noShow(bookingId: string): void {
    this.store.dispatch(markNoShow({ bookingId }));
  }

  back(): void {
    void this.router.navigate(['/doctor/appointments']);
  }

  patientName(patient: Patient): string {
    return `${patient.firstName} ${patient.lastName}`;
  }

  timeline(status: Booking['status']): Array<{ label: string; description: string; active: boolean }> {
    const steps = [
      { label: 'Confirmed', description: 'Booking is ready for consultation.' },
      { label: 'In Consultation', description: 'Consultation session in progress.' },
      { label: 'Completed', description: 'Visit has been completed.' }
    ];

    const activeIndex = status === 'Completed' ? 2 : status === 'Confirmed' ? 0 : -1;
    return steps.map((step, index) => ({
      ...step,
      active: index <= activeIndex
    }));
  }
}
