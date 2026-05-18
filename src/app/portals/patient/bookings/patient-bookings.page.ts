import { AsyncPipe, DatePipe, NgFor, NgIf } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonModal } from '@ionic/angular/standalone';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthUser, Booking, Doctor, Patient, Service } from '../../../core/models';
import { AuthStateService } from '../../../core/services/auth-state.service';
import { BookingService } from '../../../core/services/booking.service';
import { MockDataService } from '../../../core/services/mock-data.service';
import { PatientStateService } from '../../../core/services/patient-state.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { PatientBookingCardComponent } from '../components/patient-booking-card/patient-booking-card.component';

type BookingFilter = 'all' | 'upcoming' | 'pending' | 'confirmed' | 'completed' | 'cancelled';

@Component({
  selector: 'app-patient-bookings-page',
  standalone: true,
  imports: [
    AsyncPipe,
    DatePipe,
    NgFor,
    NgIf,
    EmptyStateComponent,
    StatusBadgeComponent,
    PatientBookingCardComponent,
    ConfirmModalComponent,
    IonModal
  ],
  template: `
    <section class="page-shell">
      <div class="page-shell__header">
        <div>
          <h2 class="page-title">My Bookings</h2>
          <p class="page-subtitle">View and manage your appointment history.</p>
        </div>
      </div>

      <div class="booking-filters">
        <button
          *ngFor="let filter of filters"
          type="button"
          class="booking-filter"
          [class.active]="selectedFilter === filter.value"
          (click)="setFilter(filter.value)"
        >
          {{ filter.label }}
        </button>
      </div>

      <div class="clinic-card bookings-table-card desktop-table" *ngIf="filteredBookings.length > 0; else emptyTpl">
        <table class="clinic-table">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Doctor</th>
              <th>Service</th>
              <th>Date / Time</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let booking of filteredBookings">
              <td class="data-mono">{{ booking.id }}</td>
              <td>{{ doctorName(booking.doctorId) }}</td>
              <td>{{ serviceName(booking.serviceId) }}</td>
              <td>
                <div>{{ booking.appointmentDate | date : 'MMM d, y' }}</div>
                <div class="table-time">{{ booking.slotStartTime }} - {{ booking.slotEndTime }}</div>
              </td>
              <td><app-status-badge [status]="booking.status"></app-status-badge></td>
              <td><app-status-badge [status]="booking.paymentStatus"></app-status-badge></td>
              <td>
                <div class="table-actions">
                  <button type="button" class="btn-outline" (click)="openBooking(booking.id)">
                    View Details
                  </button>
                  <button *ngIf="canSubmitProof(booking)" type="button" class="btn-primary" (click)="openBooking(booking.id)">
                    Submit Proof
                  </button>
                  <button *ngIf="canCancelBooking(booking)" type="button" class="btn-ghost" (click)="promptCancel(booking)">
                    Cancel
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mobile-cards" *ngIf="filteredBookings.length > 0">
        <app-patient-booking-card
          *ngFor="let booking of filteredBookings"
          [booking]="booking"
          [doctor]="doctorById(booking.doctorId)"
          [service]="serviceById(booking.serviceId)"
          [canSubmitProof]="canSubmitProof(booking)"
          [canCancel]="canCancelBooking(booking)"
          (viewDetails)="openBooking($event)"
          (submitProof)="openBooking($event)"
          (cancelBooking)="promptCancelById($event)"
        ></app-patient-booking-card>
      </div>

      <ng-template #emptyTpl>
        <app-empty-state
          icon="calendar-outline"
          title="No bookings found"
          description="Try a different filter or create a new appointment."
          ctaLabel="Book an Appointment"
          ctaRoute="/public/booking"
        ></app-empty-state>
      </ng-template>

      <app-confirm-modal
        [isOpen]="cancelModalOpen"
        title="Cancel Booking"
        message="Are you sure you want to cancel this booking?"
        confirmLabel="Cancel Booking"
        cancelLabel="Keep Booking"
        [isDanger]="true"
        (confirmed)="confirmCancel()"
        (cancelled)="closeCancelModal()"
      ></app-confirm-modal>
    </section>
  `,
  styleUrl: './patient-bookings.page.scss'
})
export class PatientBookingsPage implements OnInit {
  private readonly authState = inject(AuthStateService);
  private readonly bookingService = inject(BookingService);
  private readonly patientState = inject(PatientStateService);
  private readonly router = inject(Router);
  private readonly mockData = inject(MockDataService);
  private readonly destroyRef = inject(DestroyRef);

  readonly filters: Array<{ label: string; value: BookingFilter }> = [
    { label: 'All', value: 'all' },
    { label: 'Upcoming', value: 'upcoming' },
    { label: 'Pending Payment', value: 'pending' },
    { label: 'Confirmed', value: 'confirmed' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' }
  ];

  currentUser: AuthUser | null = null;
  currentPatient: Patient | null = null;
  bookings: Booking[] = [];
  filteredBookings: Booking[] = [];
  selectedFilter: BookingFilter = 'all';
  cancelModalOpen = false;
  bookingToCancel: Booking | null = null;
  doctors = this.mockData.getDoctors();
  services = this.mockData.getServices();

  ngOnInit(): void {
    this.authState.currentUser$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((user) => {
        this.currentUser = user;
        if (!user) {
          this.currentPatient = null;
          this.bookings = [];
          this.refreshFilteredBookings();
          return;
        }

        this.patientState
          .getPatientByUserId(user.id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((patient) => {
            this.currentPatient = patient ?? null;
            this.refreshFilteredBookings();
          });
      });

    this.authState.currentUser$
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((user) => {
        if (!user) {
          this.bookings = [];
          this.refreshFilteredBookings();
          return;
        }

        this.bookingService
          .getBookingsByPatientId(this.patientId(user))
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((bookings) => {
            this.bookings = bookings;
            this.refreshFilteredBookings();
          });
      });
  }

  setFilter(filter: BookingFilter): void {
    this.selectedFilter = filter;
    this.refreshFilteredBookings();
  }

  openBooking(id: string): void {
    void this.router.navigate(['/patient/bookings', id]);
  }

  promptCancelById(bookingId: string): void {
    const booking = this.bookings.find((item) => item.id === bookingId) ?? null;
    if (!booking) {
      return;
    }
    this.promptCancel(booking);
  }

  promptCancel(booking: Booking): void {
    if (!this.canCancelBooking(booking)) {
      return;
    }
    this.bookingToCancel = booking;
    this.cancelModalOpen = true;
  }

  confirmCancel(): void {
    if (!this.bookingToCancel) {
      return;
    }
    this.bookingService.cancelBooking(this.bookingToCancel.id, 'Cancelled by patient.');
    this.cancelModalOpen = false;
    this.bookingToCancel = null;
    this.refreshFilteredBookings();
  }

  closeCancelModal(): void {
    this.cancelModalOpen = false;
    this.bookingToCancel = null;
  }

  canSubmitProof(booking: Booking): boolean {
    return (
      booking.paymentMode === 'Online' &&
      booking.paymentStatus === 'Unpaid' &&
      ['Pending', 'OnHold'].includes(booking.status)
    );
  }

  canCancelBooking(booking: Booking): boolean {
    if (['Cancelled', 'Completed', 'NoShow', 'Expired'].includes(booking.status)) {
      return false;
    }

    const appointmentDateTime = new Date(`${booking.appointmentDate}T${booking.slotStartTime}:00`);
    const cancellationWindow = this.mockData.getClinicSettings().cancellationDeadlineHours * 3600000;
    return appointmentDateTime.getTime() - Date.now() > cancellationWindow;
  }

  doctorById(doctorId: string): Doctor | undefined {
    return this.doctors.find((doctor) => doctor.id === doctorId);
  }

  doctorName(doctorId: string): string {
    return this.doctorById(doctorId)?.fullName ?? 'Doctor';
  }

  serviceById(serviceId: string): Service | undefined {
    return this.services.find((service) => service.id === serviceId);
  }

  serviceName(serviceId: string): string {
    return this.serviceById(serviceId)?.name ?? 'Service';
  }

  private refreshFilteredBookings(): void {
    const now = Date.now();
    this.filteredBookings = this.bookings.filter((booking) => {
      const bookingTime = new Date(`${booking.appointmentDate}T${booking.slotStartTime}:00`).getTime();
      switch (this.selectedFilter) {
        case 'upcoming':
          return (
            bookingTime >= now &&
            ['Pending', 'ProofSubmitted', 'Confirmed', 'OnHold'].includes(booking.status)
          );
        case 'pending':
          return booking.paymentMode === 'Online' && booking.paymentStatus === 'Unpaid' && ['Pending', 'OnHold'].includes(booking.status);
        case 'confirmed':
          return booking.status === 'Confirmed';
        case 'completed':
          return booking.status === 'Completed';
        case 'cancelled':
          return booking.status === 'Cancelled';
        default:
          return true;
      }
    });
  }

  private patientId(user: AuthUser): string {
    return this.currentPatient?.id ?? this.mockData.getPatients().find((patient) => patient.userId === user.id)?.id ?? '';
  }
}
