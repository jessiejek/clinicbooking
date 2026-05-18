import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Booking, Doctor, Patient, Service } from '../../../core/models';
import { BookingService } from '../../../core/services/booking.service';
import { DoctorStateService } from '../../../core/services/doctor-state.service';
import { MockDataService } from '../../../core/services/mock-data.service';
import { PatientStateService } from '../../../core/services/patient-state.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-admin-bookings-page',
  standalone: true,
  imports: [AsyncPipe, FormsModule, NgFor, NgIf, RouterLink, EmptyStateComponent, SkeletonComponent, StatusBadgeComponent],
  template: `
    <section class="page-shell">
      <div class="page-shell__header">
        <div>
          <h2 class="page-title">Bookings</h2>
          <p class="page-subtitle">Manage all scheduled and walk-in bookings.</p>
        </div>
        <button type="button" class="btn-primary" routerLink="/admin/walk-in">New Walk-In</button>
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
        <input class="filter-input" type="search" placeholder="Search patient or booking ID" [(ngModel)]="searchQuery" />
        <button type="button" class="btn-ghost" (click)="clearFilters()">Clear Filters</button>
      </div>

      <div class="clinic-card" *ngIf="!isLoading && filteredBookings.length > 0">
        <div class="table-desktop">
          <div class="table-wrap">
            <table class="clinic-table">
              <thead>
                <tr>
                  <th><input type="checkbox" [checked]="selectAll" (change)="toggleSelectAll($event)" /></th>
                  <th>Queue#</th>
                  <th>Patient Name</th>
                  <th>Doctor</th>
                  <th>Service</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Payment</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  *ngFor="let booking of filteredBookings"
                  tabindex="0"
                  role="button"
                  [attr.aria-label]="'Open booking ' + booking.id + ' for ' + patientName(booking.patientId)"
                  (click)="openBooking(booking.id)"
                  (keydown.enter)="openBooking(booking.id)"
                >
                  <td>
                    <input
                      type="checkbox"
                      [checked]="selectedIds.has(booking.id)"
                      (click)="$event.stopPropagation()"
                      (change)="toggleSelect(booking.id, $event)"
                    />
                  </td>
                  <td class="data-mono">{{ booking.queueNumber ?? '-' }}</td>
                  <td>{{ patientName(booking.patientId) }}</td>
                  <td>{{ doctorName(booking.doctorId) }}</td>
                  <td>{{ serviceName(booking.serviceId) }}</td>
                  <td class="data-mono">{{ booking.appointmentDate }} {{ booking.slotStartTime }}</td>
                  <td><app-status-badge [status]="booking.status"></app-status-badge></td>
                  <td><app-status-badge [status]="booking.paymentStatus"></app-status-badge></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="table-mobile">
          <article
            *ngFor="let booking of filteredBookings"
            class="mobile-card"
            tabindex="0"
            role="button"
            [attr.aria-label]="'Open booking ' + booking.id + ' for ' + patientName(booking.patientId)"
            (click)="openBooking(booking.id)"
            (keydown.enter)="openBooking(booking.id)"
          >
            <div class="mobile-card__header">
              <div>
                <div class="mobile-card__name">{{ patientName(booking.patientId) }}</div>
                <div class="mobile-card__code">Booking ID {{ booking.id }}</div>
              </div>
              <app-status-badge [status]="booking.status"></app-status-badge>
            </div>

            <div class="mobile-card__row">
              <span class="mobile-card__label">Queue</span>
              <span class="data-mono">{{ booking.queueNumber ?? '-' }}</span>
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
              <span class="data-mono">{{ booking.appointmentDate }} {{ booking.slotStartTime }}</span>
            </div>

            <div class="mobile-card__row">
              <span class="mobile-card__label">Payment</span>
              <app-status-badge [status]="booking.paymentStatus"></app-status-badge>
            </div>
          </article>
        </div>
      </div>

      <app-skeleton *ngIf="isLoading" variant="row" [count]="5"></app-skeleton>

      <app-empty-state
        *ngIf="!isLoading && filteredBookings.length === 0"
        icon="calendar-outline"
        title="No bookings found"
        description="Try adjusting the filters or create a new walk-in booking."
      ></app-empty-state>
    </section>
  `,
  styleUrl: './bookings.page.scss'
})
export class BookingsPage implements OnInit {
  private readonly bookingService = inject(BookingService);
  private readonly doctorState = inject(DoctorStateService);
  private readonly patientState = inject(PatientStateService);
  private readonly router = inject(Router);
  private readonly mockData = inject(MockDataService);

  bookings: Booking[] = [];
  doctors: Doctor[] = [];
  patients: Patient[] = [];
  services: Service[] = this.mockData.getServices();
  isLoading = false;
  doctorFilter = 'all';
  statusFilter = 'all';
  dateFilter = '';
  searchQuery = '';
  selectAll = false;
  selectedIds = new Set<string>();
  statuses = ['Pending', 'Confirmed', 'Completed', 'Cancelled', 'OnHold', 'ProofSubmitted', 'NoShow'];

  ngOnInit(): void {
    this.bookingService.getBookings().subscribe((bookings) => (this.bookings = bookings));
    this.bookingService.isLoading$.subscribe((loading) => (this.isLoading = loading));
    this.doctorState.getDoctors().subscribe((doctors) => (this.doctors = doctors.length ? doctors : this.mockData.getDoctors()));
    this.patientState.getPatients().subscribe((patients) => (this.patients = patients.length ? patients : this.mockData.getPatients()));
  }

  get filteredBookings(): Booking[] {
    const q = this.searchQuery.trim().toLowerCase();
    return [...this.bookings]
      .sort((a, b) => `${b.appointmentDate} ${b.slotStartTime}`.localeCompare(`${a.appointmentDate} ${a.slotStartTime}`))
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
    this.selectAll = false;
    this.selectedIds.clear();
  }

  toggleSelectAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.selectAll = checked;
    this.selectedIds = checked ? new Set(this.filteredBookings.map((booking) => booking.id)) : new Set();
  }

  toggleSelect(bookingId: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedIds.add(bookingId);
    } else {
      this.selectedIds.delete(bookingId);
      this.selectAll = false;
    }
  }

  openBooking(id: string): void {
    void this.router.navigate(['/admin/bookings', id]);
  }

  patientName(patientId: string): string {
    const patient = this.patients.find((item) => item.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown';
  }

  doctorName(doctorId: string): string {
    return this.doctors.find((item) => item.id === doctorId)?.fullName ?? 'Unknown';
  }

  serviceName(serviceId: string): string {
    return this.services.find((item) => item.id === serviceId)?.name ?? 'Unknown';
  }
}
