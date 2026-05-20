import { DatePipe, NgFor, NgIf } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { Booking, Doctor, Service } from '../../../core/models';
import { BookingService, MyBookingsPageResult } from '../../../core/services/booking.service';
import { MockDataService } from '../../../core/services/mock-data.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { PatientBookingCardComponent } from '../components/patient-booking-card/patient-booking-card.component';

type BookingFilter = 'all' | 'upcoming' | 'pending' | 'confirmed' | 'completed' | 'cancelled';

@Component({
  selector: 'app-patient-bookings-page',
  standalone: true,
  imports: [
    DatePipe,
    NgFor,
    NgIf,
    EmptyStateComponent,
    SkeletonComponent,
    StatusBadgeComponent,
    PatientBookingCardComponent,
    ConfirmModalComponent
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

      <div class="bookings-meta" *ngIf="!isLoading && !loadError">
        <span>{{ countLabel }}</span>
        <div class="bookings-pagination" *ngIf="totalPages > 1">
          <button class="btn-ghost bookings-pagination__button" type="button" (click)="previousPage()" [disabled]="!canPreviousPage">
            Previous
          </button>
          <span class="bookings-pagination__page">Page {{ currentPage }} of {{ totalPages }}</span>
          <button class="btn-ghost bookings-pagination__button" type="button" (click)="nextPage()" [disabled]="!canNextPage">
            Next
          </button>
        </div>
      </div>

      <div class="bookings-loading" *ngIf="isLoading">
        <app-skeleton variant="row" [count]="5"></app-skeleton>
      </div>

      <div *ngIf="!isLoading && !loadError">
        <div class="clinic-card bookings-table-card desktop-table" *ngIf="filteredBookings.length > 0">
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
                <td>{{ bookingDoctorName(booking) }}</td>
                <td>{{ bookingServiceName(booking) }}</td>
                <td>
                  <div>{{ booking.appointmentDate | date : 'MMM d, y' }}</div>
                  <div class="table-time">{{ formatTimeRange(booking) }}</div>
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

        <app-empty-state
          *ngIf="filteredBookings.length === 0"
          icon="calendar-outline"
          title="No bookings found"
          [description]="emptyDescription"
          [ctaLabel]="emptyCtaLabel"
          [ctaRoute]="emptyCtaRoute"
          (ctaClick)="retry()"
        ></app-empty-state>
      </div>

      <app-empty-state
        *ngIf="!isLoading && loadError"
        icon="calendar-outline"
        title="Unable to load bookings"
        [description]="loadError"
        ctaLabel="Retry"
        (ctaClick)="retry()"
      ></app-empty-state>

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
  private readonly bookingService = inject(BookingService);
  private readonly mockData = inject(MockDataService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly filters: Array<{ label: string; value: BookingFilter }> = [
    { label: 'All', value: 'all' },
    { label: 'Upcoming', value: 'upcoming' },
    { label: 'Pending Payment', value: 'pending' },
    { label: 'Confirmed', value: 'confirmed' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' }
  ];

  bookings: Booking[] = [];
  filteredBookings: Booking[] = [];
  selectedFilter: BookingFilter = 'all';
  cancelModalOpen = false;
  bookingToCancel: Booking | null = null;
  isLoading = false;
  loadError = '';
  currentPage = 1;
  totalPages = 1;
  totalCount = 0;
  pageSize = 20;
  private loadRequestVersion = 0;
  doctors = this.mockData.getDoctors();
  services = this.mockData.getServices();

  ngOnInit(): void {
    this.loadBookings(this.currentPage || 1);
  }

  ionViewWillEnter(): void {
    this.loadBookings(this.currentPage || 1);
  }

  get canPreviousPage(): boolean {
    return this.currentPage > 1 && !this.isLoading;
  }

  get canNextPage(): boolean {
    return this.currentPage < this.totalPages && !this.isLoading;
  }

  get rangeStart(): number {
    if (this.totalCount === 0) {
      return 0;
    }

    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get countLabel(): string {
    if (this.totalCount === 0) {
      return 'Showing 0 of 0 bookings';
    }

    if (this.selectedFilter !== 'all') {
      return `Showing ${this.filteredBookings.length} filtered bookings on this page`;
    }

    if (this.bookings.length === 0) {
      return `Showing 0 of ${this.totalCount} bookings`;
    }

    const end = Math.min(this.totalCount, this.rangeStart + this.bookings.length - 1);
    return `Showing ${this.rangeStart}-${end} of ${this.totalCount} bookings`;
  }

  get emptyDescription(): string {
    if (this.selectedFilter === 'all') {
      return this.totalCount === 0 ? 'You do not have any bookings yet.' : 'No bookings are visible on this page.';
    }

    return 'No bookings match this filter on the current page.';
  }

  get emptyCtaLabel(): string | undefined {
    return this.selectedFilter === 'all' && this.totalCount === 0 ? 'Book an Appointment' : undefined;
  }

  get emptyCtaRoute(): string | undefined {
    return this.selectedFilter === 'all' && this.totalCount === 0 ? '/public/booking' : undefined;
  }

  setFilter(filter: BookingFilter): void {
    this.selectedFilter = filter;
    this.refreshFilteredBookings();
  }

  previousPage(): void {
    if (this.canPreviousPage) {
      this.loadBookings(this.currentPage - 1);
    }
  }

  nextPage(): void {
    if (this.canNextPage) {
      this.loadBookings(this.currentPage + 1);
    }
  }

  retry(): void {
    this.loadBookings(this.currentPage || 1);
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
    this.bookings = this.bookings.map((booking) =>
      booking.id === this.bookingToCancel?.id
        ? { ...booking, status: 'Cancelled', cancellationReason: 'Cancelled by patient.' }
        : booking
    );
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

  bookingDoctorName(booking: Booking): string {
    if (booking.doctorName?.trim()) {
      return booking.doctorName.trim();
    }

    return this.doctorById(booking.doctorId)?.fullName ?? 'Doctor';
  }

  bookingServiceName(booking: Booking): string {
    if (booking.serviceName?.trim()) {
      return booking.serviceName.trim();
    }

    return this.serviceById(booking.serviceId)?.name ?? 'Service';
  }

  formatTimeRange(booking: Booking): string {
    const start = booking.slotStartTime?.trim() ?? '';
    const end = booking.slotEndTime?.trim() ?? '';

    if (!start) {
      return 'Time not available';
    }

    if (!end || end === start) {
      return start;
    }

    return `${start} - ${end}`;
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

  private loadBookings(page: number): void {
    const nextPage = Math.max(1, page);
    const requestVersion = ++this.loadRequestVersion;
    this.isLoading = true;
    this.loadError = '';

    this.bookingService
      .getMyBookings(nextPage, this.pageSize)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          if (this.loadRequestVersion === requestVersion) {
            this.isLoading = false;
          }
        })
      )
      .subscribe({
        next: (result: MyBookingsPageResult) => {
          if (requestVersion !== this.loadRequestVersion) {
            return;
          }

          this.bookings = result.items;
          this.currentPage = Math.max(1, result.page || nextPage);
          this.pageSize = Math.max(1, result.pageSize || this.pageSize);
          this.totalCount = Math.max(0, result.totalCount || 0);
          this.totalPages = Math.max(1, Math.ceil(this.totalCount / this.pageSize));
          this.refreshFilteredBookings();
        },
        error: (error) => {
          if (requestVersion !== this.loadRequestVersion) {
            return;
          }

          this.bookings = [];
          this.filteredBookings = [];
          this.totalCount = 0;
          this.totalPages = 1;
          this.currentPage = 1;
          this.loadError = extractErrorMessage(error, 'We could not load your bookings right now.');
        }
      });
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
}

function extractErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }

  if (typeof error === 'string' && error.trim()) {
    return error.trim();
  }

  return fallback;
}
