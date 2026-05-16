import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { alertCircleOutline } from 'ionicons/icons';
import { Booking, Doctor, Patient } from '../../../core/models';
import { loadBookings, confirmBooking, rejectBooking, markComplete, markNoShow } from '../../../store/bookings/bookings.actions';
import {
  selectBookingsLoading,
  selectPendingVerifications,
  selectTodaysBookings
} from '../../../store/bookings/bookings.selectors';
import { loadDoctors } from '../../../store/doctors/doctors.actions';
import { selectAllDoctors, selectDoctorsLoading } from '../../../store/doctors/doctors.selectors';
import { loadNotifications } from '../../../store/notifications/notifications.actions';
import { loadPatients } from '../../../store/patients/patients.actions';
import { selectAllPatients, selectPatientsLoading } from '../../../store/patients/patients.selectors';
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
  private readonly store = inject(Store);
  private readonly router = inject(Router);

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
    this.store.dispatch(loadBookings());
    this.store.dispatch(loadDoctors());
    this.store.dispatch(loadPatients());
    this.store.dispatch(loadNotifications());

    this.store.select(selectTodaysBookings).subscribe((bookings) => (this.todaysBookings = bookings));
    this.store.select(selectPendingVerifications).subscribe((bookings) => {
      this.pendingVerificationCount = bookings.length;
    });
    this.store.select(selectAllDoctors).subscribe((doctors) => (this.doctors = doctors));
    this.store.select(selectAllPatients).subscribe((patients) => (this.patients = patients));
    this.store.select(selectBookingsLoading).subscribe((bookingsLoading) => {
      this.bookingsLoading = bookingsLoading;
    });
    this.store.select(selectDoctorsLoading).subscribe((doctorsLoading) => {
      this.doctorsLoading = doctorsLoading;
    });
    this.store.select(selectPatientsLoading).subscribe((patientsLoading) => {
      this.patientsLoading = patientsLoading;
    });
  }

  goToProofSubmitted(): void {
    void this.router.navigate(['/staff/bookings'], { queryParams: { status: 'ProofSubmitted' } });
  }

  openBooking(bookingId: string): void {
    void this.router.navigate(['/staff/bookings', bookingId]);
  }

  onQueueAction(event: { action: string; bookingId: string }): void {
    switch (event.action) {
      case 'confirm':
        this.store.dispatch(confirmBooking({ bookingId: event.bookingId }));
        break;
      case 'reject':
        this.store.dispatch(rejectBooking({ bookingId: event.bookingId, reason: 'Rejected by staff.' }));
        break;
      case 'complete':
        this.store.dispatch(markComplete({ bookingId: event.bookingId }));
        break;
      case 'noshow':
        this.store.dispatch(markNoShow({ bookingId: event.bookingId }));
        break;
    }
  }
}
