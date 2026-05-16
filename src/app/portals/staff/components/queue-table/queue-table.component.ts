import { NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { ellipsisVertical } from 'ionicons/icons';
import { Booking, Doctor, Patient, Service } from '../../../../core/models';
import { MockDataService } from '../../../../core/services/mock-data.service';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { SkeletonComponent } from '../../../../shared/components/skeleton/skeleton.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-queue-table',
  standalone: true,
  imports: [NgFor, NgIf, IonIcon, EmptyStateComponent, SkeletonComponent, StatusBadgeComponent],
  template: `
    <div class="queue-table-shell">
      <div class="table-wrap" *ngIf="!isLoading && sortedBookings.length > 0">
        <table class="clinic-table queue-table">
          <thead>
            <tr>
              <th>Queue#</th>
              <th>Patient Name</th>
              <th>Doctor</th>
              <th>Service</th>
              <th>Time</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              *ngFor="let booking of sortedBookings"
              tabindex="0"
              role="button"
              [attr.aria-label]="'Open booking ' + (booking.queueNumber ?? booking.id) + ' for ' + patientName(booking.patientId)"
              (click)="rowClicked.emit(booking.id)"
              (keydown.enter)="rowClicked.emit(booking.id)"
            >
              <td class="data-mono">{{ booking.queueNumber ?? '-' }}</td>
              <td>{{ patientName(booking.patientId) }}</td>
              <td>{{ doctorName(booking.doctorId) }}</td>
              <td>{{ serviceName(booking.serviceId) }}</td>
              <td class="data-mono">{{ booking.slotStartTime }} - {{ booking.slotEndTime }}</td>
              <td><app-status-badge [status]="booking.status"></app-status-badge></td>
              <td><app-status-badge [status]="booking.paymentStatus"></app-status-badge></td>
              <td>
                <div class="queue-actions">
                  <button
                    type="button"
                    class="btn-icon queue-actions__toggle"
                    (click)="toggleMenu(booking.id, $event)"
                    aria-label="Open booking actions"
                  >
                    <ion-icon name="ellipsis-vertical"></ion-icon>
                  </button>

                  <div class="queue-actions__menu" *ngIf="activeMenuBookingId === booking.id">
                    <button type="button" class="queue-actions__item" (click)="takeAction('confirm', booking.id, $event)">
                      Confirm
                    </button>
                    <button type="button" class="queue-actions__item" (click)="takeAction('reject', booking.id, $event)">
                      Reject
                    </button>
                    <button type="button" class="queue-actions__item" (click)="takeAction('complete', booking.id, $event)">
                      Mark Complete
                    </button>
                    <button type="button" class="queue-actions__item" (click)="takeAction('noshow', booking.id, $event)">
                      Mark No Show
                    </button>
                    <ng-container *ngIf="showWaiveRefund">
                      <button type="button" class="queue-actions__item" (click)="takeAction('waive', booking.id, $event)">
                        Waive
                      </button>
                      <button type="button" class="queue-actions__item" (click)="takeAction('refund', booking.id, $event)">
                        Refund
                      </button>
                    </ng-container>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <app-skeleton *ngIf="isLoading" variant="row" [count]="5"></app-skeleton>

      <app-empty-state
        *ngIf="!isLoading && sortedBookings.length === 0"
        icon="calendar-outline"
        title="No appointments scheduled for today."
        description="The queue will appear here when bookings are created."
      ></app-empty-state>
    </div>
  `,
  styleUrl: './queue-table.component.scss'
})
export class QueueTableComponent {
  private readonly mockData = inject(MockDataService);

  @Input() bookings: Booking[] = [];
  @Input() doctors: Doctor[] = [];
  @Input() patients: Patient[] = [];
  @Input() isLoading = false;
  @Input() showWaiveRefund = false;

  @Output() actionTaken = new EventEmitter<{ action: string; bookingId: string; reason?: string }>();
  @Output() rowClicked = new EventEmitter<string>();

  activeMenuBookingId: string | null = null;

  constructor() {
    addIcons({ ellipsisVertical });
  }

  get sortedBookings(): Booking[] {
    return [...this.bookings].sort((a, b) => {
      const aQueue = a.queueNumber ?? Number.MAX_SAFE_INTEGER;
      const bQueue = b.queueNumber ?? Number.MAX_SAFE_INTEGER;
      if (aQueue !== bQueue) {
        return aQueue - bQueue;
      }
      return `${a.appointmentDate} ${a.slotStartTime}`.localeCompare(`${b.appointmentDate} ${b.slotStartTime}`);
    });
  }

  patientName(patientId: string): string {
    const patient = this.patients.find((item) => item.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient';
  }

  doctorName(doctorId: string): string {
    return this.doctors.find((item) => item.id === doctorId)?.fullName ?? 'Unknown Doctor';
  }

  serviceName(serviceId: string): string {
    const service = this.mockData.getServiceById(serviceId) as Service | undefined;
    return service?.name ?? 'Unknown Service';
  }

  toggleMenu(bookingId: string, event: Event): void {
    event.stopPropagation();
    this.activeMenuBookingId = this.activeMenuBookingId === bookingId ? null : bookingId;
  }

  takeAction(action: string, bookingId: string, event: Event): void {
    event.stopPropagation();
    this.activeMenuBookingId = null;
    this.actionTaken.emit({ action, bookingId });
  }
}
