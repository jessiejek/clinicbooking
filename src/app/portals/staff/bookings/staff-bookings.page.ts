import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Booking, Doctor, Patient, Service } from '../../../core/models';
import { MockDataService } from '../../../core/services/mock-data.service';
import { loadBookings, confirmBooking, rejectBooking, markComplete, markNoShow } from '../../../store/bookings/bookings.actions';
import { selectBookings, selectBookingsLoading } from '../../../store/bookings/bookings.selectors';
import { loadDoctors } from '../../../store/doctors/doctors.actions';
import { selectAllDoctors, selectDoctorsLoading } from '../../../store/doctors/doctors.selectors';
import { loadPatients } from '../../../store/patients/patients.actions';
import { selectAllPatients, selectPatientsLoading } from '../../../store/patients/patients.selectors';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { QueueTableComponent } from '../components/queue-table/queue-table.component';

@Component({
  selector: 'app-staff-bookings-page',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, EmptyStateComponent, SkeletonComponent, StatusBadgeComponent, QueueTableComponent],
  template: `
    <section class="page-shell">
      <div class="page-shell__header">
        <div>
          <h2 class="page-title">Bookings</h2>
          <p class="page-subtitle">Filter bookings and manage queue actions.</p>
        </div>
      </div>

      <div class="filter-bar clinic-card">
        <select class="filter-input" [(ngModel)]="doctorFilter">
          <option value="all">All Doctors</option>
          <option *ngFor="let doctor of doctors" [value]="doctor.id">{{ doctor.fullName }}</option>
        </select>
        <select class="filter-input" [(ngModel)]="statusFilter">
          <option value="all">All Statuses</option>
          <option *ngFor="let status of statuses" [value]="status">{{ status }}</option>
        </select>
        <input class="filter-input" type="date" [(ngModel)]="dateFilter" />
        <input
          class="filter-input"
          type="search"
          placeholder="Search patient or booking ID"
          [(ngModel)]="searchQuery"
        />
        <button type="button" class="btn-ghost" (click)="clearFilters()">Clear Filters</button>
      </div>

      <div class="clinic-card">
        <div class="table-desktop" *ngIf="filteredBookings.length > 0">
          <app-queue-table
            [bookings]="filteredBookings"
            [doctors]="doctors"
            [patients]="patients"
            [isLoading]="isLoading"
            [showWaiveRefund]="false"
            (rowClicked)="openBooking($event)"
            (actionTaken)="onQueueAction($event)"
          ></app-queue-table>
        </div>

        <div class="table-mobile" *ngIf="!isLoading && filteredBookings.length > 0">
          <div
            class="mobile-card clinic-card"
            *ngFor="let booking of filteredBookings"
            (click)="openBooking(booking.id)"
            role="button"
            tabindex="0"
            (keydown.enter)="openBooking(booking.id)"
          >
            <div class="mobile-card__header">
              <span class="mobile-card__name">{{ patientName(booking.patientId) }}</span>
              <app-status-badge [status]="booking.status"></app-status-badge>
            </div>
            <div class="mobile-card__row">
              <span class="mobile-card__label">Doctor</span>
              <span>{{ doctorName(booking.doctorId) }}</span>
            </div>
            <div class="mobile-card__row">
              <span class="mobile-card__label">Service</span>
              <span>{{ serviceName(booking.serviceId) }}</span>
            </div>
            <div class="mobile-card__row">
              <span class="mobile-card__label">Time</span>
              <span class="data-mono">{{ booking.slotStartTime }}</span>
            </div>
            <div class="mobile-card__row">
              <span class="mobile-card__label">Payment</span>
              <span class="data-mono">{{ booking.paymentStatus }}</span>
            </div>
            <div class="staff-mobile-actions">
              <button type="button" class="btn-ghost" (click)="onQueueAction({ action: 'confirm', bookingId: booking.id }); $event.stopPropagation()">Confirm</button>
              <button type="button" class="btn-ghost" (click)="onQueueAction({ action: 'reject', bookingId: booking.id }); $event.stopPropagation()">Reject</button>
              <button type="button" class="btn-ghost" (click)="onQueueAction({ action: 'complete', bookingId: booking.id }); $event.stopPropagation()">Complete</button>
              <button type="button" class="btn-ghost" (click)="onQueueAction({ action: 'noshow', bookingId: booking.id }); $event.stopPropagation()">No Show</button>
            </div>
          </div>
        </div>

        <app-skeleton *ngIf="isLoading" variant="row" [count]="5"></app-skeleton>

        <app-empty-state
          *ngIf="!isLoading && filteredBookings.length === 0"
          icon="calendar-outline"
          title="No bookings found"
          description="Try adjusting the filters or create a new walk-in booking."
        ></app-empty-state>
      </div>
    </section>
  `,
  styleUrl: './staff-bookings.page.scss'
})
export class StaffBookingsPage implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly mockData = inject(MockDataService);

  bookings: Booking[] = [];
  doctors: Doctor[] = [];
  patients: Patient[] = [];
  bookingsLoading = false;
  doctorsLoading = false;
  patientsLoading = false;
  doctorFilter = 'all';
  statusFilter = 'all';
  dateFilter = '';
  searchQuery = '';
  statuses = ['Pending', 'Confirmed', 'Completed', 'Cancelled', 'OnHold', 'ProofSubmitted', 'NoShow', 'Rescheduled'];
  services: Service[] = this.mockData.getServices();

  get isLoading(): boolean {
    return this.bookingsLoading || this.doctorsLoading || this.patientsLoading;
  }

  ngOnInit(): void {
    this.store.dispatch(loadBookings());
    this.store.dispatch(loadDoctors());
    this.store.dispatch(loadPatients());

    const initialStatus = this.route.snapshot.queryParamMap.get('status');
    if (initialStatus) {
      this.statusFilter = initialStatus;
    }

    this.store.select(selectBookings).subscribe((bookings) => (this.bookings = bookings));
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

  get filteredBookings(): Booking[] {
    const q = this.searchQuery.trim().toLowerCase();
    return [...this.bookings]
      .sort((a, b) => {
        const aQueue = a.queueNumber ?? Number.MAX_SAFE_INTEGER;
        const bQueue = b.queueNumber ?? Number.MAX_SAFE_INTEGER;
        if (aQueue !== bQueue) {
          return aQueue - bQueue;
        }
        return `${a.appointmentDate} ${a.slotStartTime}`.localeCompare(`${b.appointmentDate} ${b.slotStartTime}`);
      })
      .filter((booking) => (this.doctorFilter === 'all' ? true : booking.doctorId === this.doctorFilter))
      .filter((booking) => (this.statusFilter === 'all' ? true : booking.status === this.statusFilter))
      .filter((booking) => (this.dateFilter ? booking.appointmentDate === this.dateFilter : true))
      .filter((booking) => {
        if (!q) {
          return true;
        }
        const patient = this.patientName(booking.patientId).toLowerCase();
        return booking.id.toLowerCase().includes(q) || patient.includes(q);
      });
  }

  clearFilters(): void {
    this.doctorFilter = 'all';
    this.statusFilter = 'all';
    this.dateFilter = '';
    this.searchQuery = '';
  }

  openBooking(id: string): void {
    void this.router.navigate(['/staff/bookings', id]);
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

  patientName(patientId: string): string {
    const patient = this.patients.find((item) => item.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient';
  }

  doctorName(doctorId: string): string {
    return this.doctors.find((item) => item.id === doctorId)?.fullName ?? 'Unknown Doctor';
  }

  serviceName(serviceId: string): string {
    return this.services.find((item) => item.id === serviceId)?.name ?? 'Unknown Service';
  }
}
