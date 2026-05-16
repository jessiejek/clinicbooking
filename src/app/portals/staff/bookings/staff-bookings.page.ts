import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Booking, Doctor, Patient } from '../../../core/models';
import { loadBookings, confirmBooking, rejectBooking, markComplete, markNoShow } from '../../../store/bookings/bookings.actions';
import { selectBookings, selectBookingsLoading } from '../../../store/bookings/bookings.selectors';
import { loadDoctors } from '../../../store/doctors/doctors.actions';
import { selectAllDoctors, selectDoctorsLoading } from '../../../store/doctors/doctors.selectors';
import { loadPatients } from '../../../store/patients/patients.actions';
import { selectAllPatients, selectPatientsLoading } from '../../../store/patients/patients.selectors';
import { QueueTableComponent } from '../components/queue-table/queue-table.component';

@Component({
  selector: 'app-staff-bookings-page',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, QueueTableComponent],
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
    </section>
  `,
  styleUrl: './staff-bookings.page.scss'
})
export class StaffBookingsPage implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

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
}
