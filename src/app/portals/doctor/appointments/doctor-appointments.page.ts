import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject, combineLatest, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Booking } from '../../../core/models';
import { AuthStateService } from '../../../core/services/auth-state.service';
import { BookingService } from '../../../core/services/booking.service';
import { DoctorStateService } from '../../../core/services/doctor-state.service';
import { DoctorAppointmentCardComponent } from '../components/doctor-appointment-card/doctor-appointment-card.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

interface AppointmentFilters {
  appointmentDate: string;
  status: string;
  paymentStatus: string;
  search: string;
}

@Component({
  standalone: true,
  selector: 'app-doctor-appointments-page',
  imports: [
    AsyncPipe,
    FormsModule,
    NgFor,
    NgIf,
    PageHeaderComponent,
    EmptyStateComponent,
    DoctorAppointmentCardComponent,
    StatusBadgeComponent
  ],
  template: `
    <app-page-header title="Appointments" subtitle="All appointments assigned to you"></app-page-header>

    <section class="clinic-card filters-card">
      <div class="filters-grid">
        <label>
          <span>Date</span>
          <input type="date" [value]="filters.appointmentDate" (input)="setDate($any($event.target).value)" />
        </label>
        <label>
          <span>Status</span>
          <select [value]="filters.status" (change)="setStatus($any($event.target).value)">
            <option value="">All</option>
            <option value="Pending">Pending</option>
            <option value="ProofSubmitted">Proof Submitted</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="NoShow">No Show</option>
          </select>
        </label>
        <label>
          <span>Payment</span>
          <select [value]="filters.paymentStatus" (change)="setPayment($any($event.target).value)">
            <option value="">All</option>
            <option value="Unpaid">Unpaid</option>
            <option value="Paid">Paid</option>
            <option value="Waived">Waived</option>
            <option value="Refunded">Refunded</option>
          </select>
        </label>
        <label class="filters-grid__search">
          <span>Search patient name</span>
          <input type="search" [value]="filters.search" (input)="setSearch($any($event.target).value)" placeholder="Search patient" />
        </label>
      </div>
    </section>

    <ng-container *ngIf="filteredBookings$ | async as bookings">
      <app-empty-state
        *ngIf="bookings.length === 0"
        icon="calendar-outline"
        title="No matching appointments"
        description="No appointments match the selected filters."
      ></app-empty-state>

      <section class="appointments-desktop clinic-card" *ngIf="bookings.length > 0">
        <table class="clinic-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Service</th>
              <th>Date / Time</th>
              <th>Queue #</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let booking of bookings">
              <td>
                <strong>{{ patientName(booking) }}</strong>
              </td>
              <td>{{ serviceName(booking) }}</td>
              <td>{{ appointmentDateTimeLabel(booking) }}</td>
              <td class="data-mono">{{ booking.queueNumber ?? '-' }}</td>
              <td><app-status-badge [status]="booking.status"></app-status-badge></td>
              <td><app-status-badge [status]="booking.paymentStatus"></app-status-badge></td>
              <td>
                <div class="action-row">
                  <button type="button" class="btn-ghost" (click)="view(booking.id)">View</button>
                  <button
                    *ngIf="canStartConsultation(booking.status)"
                    type="button"
                    class="btn-primary"
                    (click)="consult(booking.id)"
                  >
                    Start Consultation
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="appointments-mobile" *ngIf="bookings.length > 0">
        <app-doctor-appointment-card
          *ngFor="let booking of bookings"
          [booking]="booking"
          [patientName]="patientName(booking)"
          [serviceName]="serviceName(booking)"
          (openBooking)="view($event)"
          (startConsultation)="consult($event)"
        ></app-doctor-appointment-card>
      </section>
    </ng-container>
  `,
  styleUrl: './doctor-appointments.page.scss'
})
export class DoctorAppointmentsPage implements OnInit {
  private readonly authState = inject(AuthStateService);
  private readonly bookingService = inject(BookingService);
  private readonly doctorState = inject(DoctorStateService);
  private readonly router = inject(Router);

  filters: AppointmentFilters = {
    appointmentDate: '',
    status: '',
    paymentStatus: '',
    search: ''
  };

  private readonly filters$ = new BehaviorSubject<AppointmentFilters>(this.filters);

  readonly currentDoctor$ = this.authState.currentUser$.pipe(
    switchMap((user) => (user ? this.doctorState.getDoctorByUserId(user.id) : of(undefined)))
  );

  readonly doctorBookings$ = combineLatest([
    this.bookingService.getDoctorTodayQueue(),
    this.bookingService.getDoctorUpcoming()
  ]).pipe(
    map(([todayQueue, upcoming]) => {
      const merged = new Map<string, Booking>();
      [...todayQueue, ...upcoming].forEach((booking) => {
        merged.set(booking.id, booking);
      });

      return [...merged.values()].sort((a, b) => `${a.appointmentDate} ${a.slotStartTime}`.localeCompare(`${b.appointmentDate} ${b.slotStartTime}`));
    })
  );

  readonly filteredBookings$ = combineLatest([
    this.doctorBookings$,
    this.filters$
  ]).pipe(
    map(([bookings, filters]) => {
      const normalizedSearch = filters.search.trim().toLowerCase();
      return bookings.filter((booking) => {
        if (filters.appointmentDate && booking.appointmentDate !== filters.appointmentDate) {
          return false;
        }
        if (filters.status && booking.status !== filters.status) {
          return false;
        }
        if (filters.paymentStatus && booking.paymentStatus !== filters.paymentStatus) {
          return false;
        }

        if (!normalizedSearch) {
          return true;
        }

        const haystack = [
          booking.patientName ?? '',
          booking.serviceName ?? '',
          booking.appointmentDate ?? '',
          booking.slotStartTime ?? '',
          booking.queueNumber?.toString() ?? ''
        ]
          .join(' ')
          .toLowerCase();
        return haystack.includes(normalizedSearch);
      });
    })
  );

  ngOnInit(): void {
    this.doctorState.refresh();
  }

  setDate(value: string): void {
    this.filters = { ...this.filters, appointmentDate: value };
    this.filters$.next(this.filters);
  }

  setStatus(value: string): void {
    this.filters = { ...this.filters, status: value };
    this.filters$.next(this.filters);
  }

  setPayment(value: string): void {
    this.filters = { ...this.filters, paymentStatus: value };
    this.filters$.next(this.filters);
  }

  setSearch(value: string): void {
    this.filters = { ...this.filters, search: value };
    this.filters$.next(this.filters);
  }

  view(bookingId: string): void {
    void this.router.navigate(['/doctor/appointments', bookingId]);
  }

  consult(bookingId: string): void {
    void this.router.navigate(['/doctor/consultation', bookingId]);
  }

  patientName(booking: Booking): string {
    return booking.patientName?.trim() || 'Unknown Patient';
  }

  serviceName(booking: Booking): string {
    return booking.serviceName?.trim() || 'Unknown Service';
  }

  appointmentDateTimeLabel(booking: Booking): string {
    const date = booking.appointmentDate?.trim() ?? '';
    const time = booking.slotStartTime?.trim() ?? '';

    if (!date) {
      return time || '-';
    }

    if (!time) {
      return date;
    }

    return `${date} ${time}`;
  }

  canStartConsultation(status: string): boolean {
    return status === 'Confirmed' || status === 'InProgress';
  }
}
