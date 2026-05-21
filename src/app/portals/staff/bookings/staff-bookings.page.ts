import { DatePipe, NgFor, NgIf } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ToastController } from '@ionic/angular/standalone';
import { Booking } from '../../../core/models';
import {
  BookingService,
  PagedResult,
  StaffTodayBookingsFilters
} from '../../../core/services/booking.service';
import { ClinicDashboardRealtimeService } from '../../../core/services/clinic-dashboard-realtime.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { PublicService } from '../../public/services/public.service';

type StaffTodayStatus = 'all' | 'Confirmed' | 'CheckedIn' | 'Completed' | 'NoShow' | 'Cancelled';

@Component({
  selector: 'app-staff-bookings-page',
  standalone: true,
  imports: [DatePipe, NgFor, NgIf, FormsModule, PageHeaderComponent, EmptyStateComponent, StatusBadgeComponent],
  template: `
    <app-page-header title="Today Bookings" subtitle="Check in confirmed patients and monitor today’s queue"></app-page-header>

    <section class="clinic-card filter-bar">
      <select class="filter-input" [(ngModel)]="doctorFilter" (ngModelChange)="onFiltersChanged()">
        <option value="">All Doctors</option>
        <option *ngFor="let doctor of doctors" [value]="doctor.id">{{ doctor.fullName }}</option>
      </select>

      <select class="filter-input" [(ngModel)]="statusFilter" (ngModelChange)="onFiltersChanged()">
        <option *ngFor="let status of statuses" [value]="status.value">{{ status.label }}</option>
      </select>

      <button type="button" class="btn-ghost" (click)="refresh()" [disabled]="isLoading">Refresh</button>
    </section>

    <div class="clinic-card" *ngIf="isLoading">Loading today’s bookings...</div>

    <ng-container *ngIf="!isLoading">
      <section class="clinic-card" *ngIf="bookings.length > 0; else emptyState">
        <table class="clinic-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Services</th>
              <th>Date / Time</th>
              <th>Queue</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Mode</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let booking of bookings">
              <td>{{ booking.patientName || 'Patient' }}</td>
              <td>{{ booking.doctorName || 'Doctor' }}</td>
              <td>{{ servicesLabel(booking) }}</td>
              <td>
                <div>{{ booking.appointmentDate | date : 'MMM d, y' }}</div>
                <div class="table-time">{{ timeRangeLabel(booking) }}</div>
              </td>
              <td>{{ booking.queueNumber !== null ? '#' + booking.queueNumber : '-' }}</td>
              <td><app-status-badge [status]="booking.status"></app-status-badge></td>
              <td><app-status-badge [status]="booking.paymentStatus"></app-status-badge></td>
              <td>{{ booking.paymentMode }}</td>
              <td>
                <div class="action-row">
                  <button
                    *ngIf="booking.status === 'Confirmed'"
                    type="button"
                    class="btn-primary"
                    (click)="checkIn(booking)"
                    [disabled]="actionBookingId === booking.id"
                  >
                    Check In
                  </button>
                  <button
                    *ngIf="booking.status === 'CheckedIn'"
                    type="button"
                    class="btn-outline"
                    (click)="undoCheckIn(booking)"
                    [disabled]="actionBookingId === booking.id"
                  >
                    Undo Check-In
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="bookings-pagination" *ngIf="totalPages > 1">
          <button class="btn-ghost bookings-pagination__button" type="button" (click)="previousPage()" [disabled]="currentPage <= 1 || isLoading">
            Previous
          </button>
          <span class="bookings-pagination__page">Page {{ currentPage }} of {{ totalPages }}</span>
          <button class="btn-ghost bookings-pagination__button" type="button" (click)="nextPage()" [disabled]="currentPage >= totalPages || isLoading">
            Next
          </button>
        </div>
      </section>
    </ng-container>

    <ng-template #emptyState>
      <app-empty-state
        icon="calendar-outline"
        title="No bookings found"
        description="There are no today bookings for the selected filters."
      ></app-empty-state>
    </ng-template>
  `,
  styleUrl: './staff-bookings.page.scss'
})
export class StaffBookingsPage implements OnInit {
  private readonly bookingService = inject(BookingService);
  private readonly realtime = inject(ClinicDashboardRealtimeService);
  private readonly publicService = inject(PublicService);
  private readonly route = inject(ActivatedRoute);
  private readonly toastCtrl = inject(ToastController);
  private readonly destroyRef = inject(DestroyRef);

  doctors: Array<{ id: string; fullName: string }> = [];
  bookings: Booking[] = [];
  isLoading = false;
  actionBookingId: string | null = null;
  doctorFilter = '';
  statusFilter: StaffTodayStatus = 'all';
  currentPage = 1;
  pageSize = 20;
  totalPages = 1;

  readonly statuses: Array<{ label: string; value: StaffTodayStatus }> = [
    { label: 'All Statuses', value: 'all' },
    { label: 'Confirmed', value: 'Confirmed' },
    { label: 'Checked In', value: 'CheckedIn' },
    { label: 'Completed', value: 'Completed' },
    { label: 'No Show', value: 'NoShow' },
    { label: 'Cancelled', value: 'Cancelled' }
  ];

  ngOnInit(): void {
    const initialStatus = this.route.snapshot.queryParamMap.get('status');
    if (initialStatus && this.statuses.some((status) => status.value === initialStatus)) {
      this.statusFilter = initialStatus as StaffTodayStatus;
    }

    this.publicService.getDoctors().subscribe({
      next: (doctors) => {
        this.doctors = doctors.map((doctor) => ({ id: doctor.id, fullName: doctor.fullName }));
      },
      error: () => {
        this.doctors = [];
      }
    });

    this.loadBookings();
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
            'PaymentCompleted'
          ].includes(event.eventName)
        ) {
          this.loadBookings();
        }
      });
  }

  onFiltersChanged(): void {
    this.currentPage = 1;
    this.loadBookings();
  }

  refresh(): void {
    this.loadBookings();
  }

  previousPage(): void {
    if (this.currentPage <= 1 || this.isLoading) {
      return;
    }

    this.currentPage -= 1;
    this.loadBookings();
  }

  nextPage(): void {
    if (this.currentPage >= this.totalPages || this.isLoading) {
      return;
    }

    this.currentPage += 1;
    this.loadBookings();
  }

  checkIn(booking: Booking): void {
    this.actionBookingId = booking.id;
    this.bookingService.checkInBooking(booking.id, {}).subscribe({
      next: async () => {
        this.actionBookingId = null;
        this.loadBookings();
        await this.presentToast('Patient checked in.', 'success');
      },
      error: async (error) => {
        this.actionBookingId = null;
        await this.presentToast(extractApiErrorMessage(error, 'Failed to check in booking.'), 'danger');
      }
    });
  }

  undoCheckIn(booking: Booking): void {
    this.actionBookingId = booking.id;
    this.bookingService.undoCheckInBooking(booking.id).subscribe({
      next: async () => {
        this.actionBookingId = null;
        this.loadBookings();
        await this.presentToast('Check-in undone.', 'success');
      },
      error: async (error) => {
        this.actionBookingId = null;
        await this.presentToast(extractApiErrorMessage(error, 'Failed to undo check-in.'), 'danger');
      }
    });
  }

  servicesLabel(booking: Booking): string {
    return servicesLabel(booking);
  }

  timeRangeLabel(booking: Booking): string {
    return timeRangeLabel(booking);
  }

  private loadBookings(): void {
    const filters: StaffTodayBookingsFilters = {
      doctorId: this.doctorFilter || undefined,
      status: this.statusFilter === 'all' ? undefined : this.statusFilter,
      page: this.currentPage,
      pageSize: this.pageSize
    };

    this.isLoading = true;
    this.bookingService.getStaffTodayBookings(filters).subscribe({
      next: (result: PagedResult<Booking>) => {
        this.bookings = result.items;
        this.currentPage = result.page;
        this.pageSize = result.pageSize;
        this.totalPages = Math.max(1, Math.ceil(result.totalCount / result.pageSize));
        this.isLoading = false;
      },
      error: async (error) => {
        this.bookings = [];
        this.totalPages = 1;
        this.isLoading = false;
        await this.presentToast(extractApiErrorMessage(error, 'Failed to load today bookings.'), 'danger');
      }
    });
  }

  private async presentToast(
    message: string,
    color: 'success' | 'danger' | 'warning' = 'success'
  ): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2200,
      color,
      position: 'top'
    });
    await toast.present();
  }
}

function servicesLabel(booking: Booking): string {
  if (booking.serviceNames?.length) {
    return booking.serviceNames.join(', ');
  }

  const names = booking.services?.map((service) => service.name).filter((name) => name.trim().length > 0) ?? [];
  if (names.length > 0) {
    return names.join(', ');
  }

  return booking.serviceName?.trim() || 'Service';
}

function timeRangeLabel(booking: Booking): string {
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

function extractApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  }

  return fallback;
}
