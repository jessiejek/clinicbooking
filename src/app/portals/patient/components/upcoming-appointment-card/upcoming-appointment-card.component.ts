import { DatePipe, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonIcon, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarOutline, timeOutline } from 'ionicons/icons';
import { Booking, Doctor, Service } from '../../../../core/models';
import { BookingTimerComponent } from '../../../../shared/components/booking-timer/booking-timer.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-upcoming-appointment-card',
  standalone: true,
  imports: [NgIf, DatePipe, RouterLink, IonIcon, BookingTimerComponent, StatusBadgeComponent],
  template: `
    <article class="upcoming-card clinic-card">
      <div class="upcoming-card__header">
        <div>
          <div class="section-heading">Upcoming Appointment</div>
          <h3 class="upcoming-card__title">{{ doctor?.fullName || 'Assigned Doctor' }}</h3>
          <p class="upcoming-card__subtitle">{{ service?.name || 'Service' }}</p>
        </div>
        <div class="upcoming-card__badges">
          <app-status-badge [status]="booking.status"></app-status-badge>
          <app-status-badge [status]="booking.paymentStatus"></app-status-badge>
        </div>
      </div>

      <div class="upcoming-card__details">
        <div class="upcoming-card__detail">
          <ion-icon name="calendar-outline"></ion-icon>
          <div>
            <span>Date</span>
            <strong>{{ booking.appointmentDate | date : 'EEEE, MMMM d, y' }}</strong>
          </div>
        </div>
        <div class="upcoming-card__detail">
          <ion-icon name="time-outline"></ion-icon>
          <div>
            <span>Time</span>
            <strong>{{ booking.slotStartTime }} - {{ booking.slotEndTime }}</strong>
          </div>
        </div>
        <div class="upcoming-card__detail" *ngIf="booking.queueNumber !== null">
          <ion-icon name="grid-outline"></ion-icon>
          <div>
            <span>Queue</span>
            <strong>#{{ booking.queueNumber }}</strong>
          </div>
        </div>
      </div>

      <app-booking-timer
        *ngIf="showTimer"
        [durationSeconds]="proofTimerSeconds"
      ></app-booking-timer>

      <div class="upcoming-card__actions">
        <button type="button" class="btn-outline" (click)="viewDetails.emit(booking.id)">
          View Details
        </button>
        <button
          *ngIf="canSubmitProof"
          type="button"
          class="btn-primary"
          (click)="submitProof.emit(booking.id)"
        >
          Submit Proof
        </button>
        <button
          *ngIf="canCancel"
          type="button"
          class="btn-ghost"
          (click)="cancelBooking.emit(booking.id)"
        >
          Cancel
        </button>
      </div>
    </article>
  `,
  styleUrl: './upcoming-appointment-card.component.scss'
})
export class UpcomingAppointmentCardComponent {
  @Input({ required: true }) booking!: Booking;
  @Input() doctor?: Doctor;
  @Input() service?: Service;
  @Input() canSubmitProof = false;
  @Input() canCancel = false;

  @Output() viewDetails = new EventEmitter<string>();
  @Output() submitProof = new EventEmitter<string>();
  @Output() cancelBooking = new EventEmitter<string>();

  constructor() {
    addIcons({ calendarOutline, timeOutline });
  }

  get proofTimerSeconds(): number {
    const deadline = new Date(this.booking.createdAt);
    deadline.setHours(deadline.getHours() + 24);
    return Math.max(0, Math.floor((deadline.getTime() - Date.now()) / 1000));
  }

  get showTimer(): boolean {
    return this.canSubmitProof && this.proofTimerSeconds > 0;
  }
}
