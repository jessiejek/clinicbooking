import { NgFor, NgIf } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { alertCircleOutline } from 'ionicons/icons';
import { Booking, Doctor, Patient } from '../../../core/models';
import { BookingService } from '../../../core/services/booking.service';
import { ClinicDashboardRealtimeService } from '../../../core/services/clinic-dashboard-realtime.service';
import { DoctorStateService } from '../../../core/services/doctor-state.service';
import { PatientStateService } from '../../../core/services/patient-state.service';
import { QueueTableComponent } from '../components/queue-table/queue-table.component';

@Component({
  selector: 'app-staff-dashboard-page',
  standalone: true,
  imports: [NgFor, NgIf, IonIcon, QueueTableComponent],
  template: `
    <section class="page-shell">
      <div class="page-shell__header">
        <div>
          <h2 class="page-title">Dashboard</h2>
          <p class="page-subtitle">Track today's queue and resolve booking actions quickly.</p>
        </div>
      </div>

      <div class="stat-grid">
        <article class="stat-card stat-card--green clinic-card">
          <p class="stat-card__label">Today's Appointments</p>
          <div class="stat-card__value">{{ todaysAppointmentsCount }}</div>
        </article>

        <article class="stat-card stat-card--red clinic-card">
          <p class="stat-card__label">Pending Verifications</p>
          <div class="stat-card__value">{{ pendingVerificationCount }}</div>
          <span class="stat-card__badge" *ngIf="pendingVerificationCount > 0">Action Required</span>
        </article>

        <article class="stat-card stat-card--blue clinic-card">
          <p class="stat-card__label">Walk-Ins Today</p>
          <div class="stat-card__value">{{ walkInsTodayCount }}</div>
        </article>

        <article class="stat-card stat-card--neutral clinic-card">
          <p class="stat-card__label">Confirmed Today</p>
          <div class="stat-card__value">{{ confirmedTodayCount }}</div>
        </article>
      </div>

      <div
        class="banner banner--danger"
        style="cursor: pointer"
        *ngIf="pendingVerificationCount > 0"
        (click)="goToProofSubmitted()"
      >
        <ion-icon name="alert-circle-outline"></ion-icon>
        <span>
          {{ pendingVerificationCount }} booking(s) require payment verification.
          <strong>Review now -&gt;</strong>
        </span>
      </div>

      <div class="clinic-card queue-card">
        <div class="section-heading">Today's Queue</div>
        <app-queue-table
          [bookings]="todaysBookings"
          [doctors]="doctors"
          [patients]="patients"
          [isLoading]="isLoading"
          [showWaiveRefund]="false"
          (rowClicked)="openBooking($event)"
          (actionTaken)="onQueueAction($event)"
        ></app-queue-table>
      </div>
    </section>
  `,
  styleUrl: './staff-dashboard.page.scss'
})
export class StaffDashboardPage implements OnInit {
  private readonly bookingService = inject(BookingService);
  private readonly realtime = inject(ClinicDashboardRealtimeService);
  private readonly doctorState = inject(DoctorStateService);
  private readonly patientState = inject(PatientStateService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  todaysBookings: Booking[] = [];
  doctors: Doctor[] = [];
  patients: Patient[] = [];
  pendingVerificationCount = 0;
  bookingsLoading = false;
  doctorsLoading = false;
  patientsLoading = false;

  get isLoading(): boolean {
    return this.bookingsLoading || this.doctorsLoading || this.patientsLoading;
  }

  get todaysAppointmentsCount(): number {
    return this.todaysBookings.length;
  }

  get walkInsTodayCount(): number {
    return this.todaysBookings.filter((booking) => booking.isWalkIn).length;
  }

  get confirmedTodayCount(): number {
    return this.todaysBookings.filter((booking) => booking.status === 'Confirmed').length;
  }

  constructor() {
    addIcons({ alertCircleOutline });
  }

  ngOnInit(): void {
    this.bookingService
      .getTodaysBookings()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((bookings) => (this.todaysBookings = bookings));
    this.bookingService
      .getPendingVerifications()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((bookings) => {
      this.pendingVerificationCount = bookings.length;
    });
    this.doctorState
      .getDoctors()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((doctors) => (this.doctors = doctors));
    this.patientState
      .getPatients()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((patients) => (this.patients = patients));
    this.bookingService.isLoading$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((bookingsLoading) => {
      this.bookingsLoading = bookingsLoading;
    });
    this.doctorState.isLoading$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((doctorsLoading) => {
      this.doctorsLoading = doctorsLoading;
    });
    this.patientState.isLoading$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((patientsLoading) => {
      this.patientsLoading = patientsLoading;
    });

    void this.realtime.ensureConnected();
    this.realtime.events$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        if (
          [
            'BookingCreated',
            'BookingCancelled',
            'PatientCheckedIn',
            'PatientCheckInUndone',
            'DoctorCompletedConsultation',
            'PaymentCompleted',
            'PaymentWaived'
          ].includes(event.eventName)
        ) {
          this.refreshDashboardBookings();
        }
      });
  }

  goToProofSubmitted(): void {
    void this.router.navigate(['/staff/bookings'], { queryParams: { status: 'ProofSubmitted' } });
  }

  openBooking(bookingId: string): void {
    void this.router.navigate(['/staff/bookings', bookingId]);
  }

  onQueueAction(event: { action: string; bookingId: string }): void {
    // Booking lifecycle actions mirror the demo clinic workflow used by admin/staff queues.
    switch (event.action) {
      case 'confirm':
        this.bookingService.confirmBooking(event.bookingId);
        break;
      case 'reject':
        this.bookingService.rejectBooking(event.bookingId, 'Rejected by staff.');
        break;
      case 'paid':
        this.bookingService.confirmPayment(event.bookingId);
        break;
      case 'waive-pf':
        this.bookingService.waivePayment(event.bookingId, 'Professional fee waived by staff.');
        break;
      case 'complete':
        this.bookingService.markComplete(event.bookingId);
        break;
      case 'noshow':
        this.bookingService.markNoShow(event.bookingId);
        break;
    }
  }

  private refreshDashboardBookings(): void {
    // These calls refresh the shared booking cache that the dashboard subscriptions already consume.
    this.bookingService.getTodaysBookings();
    this.bookingService.getPendingVerifications();
  }
}
