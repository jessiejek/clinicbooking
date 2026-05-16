import { DatePipe, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Booking, Doctor, Service } from '../../../../core/models';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-patient-booking-card',
  standalone: true,
  imports: [NgIf, DatePipe, StatusBadgeComponent],
  template: `
    <article class="booking-card clinic-card">
      <div class="booking-card__header">
        <div>
          <div class="booking-card__id data-mono">{{ booking.id }}</div>
          <h3>{{ doctor?.fullName || 'Assigned Doctor' }}</h3>
          <p>{{ service?.name || 'Service' }}</p>
        </div>
        <div class="booking-card__badges">
          <app-status-badge [status]="booking.status"></app-status-badge>
          <app-status-badge [status]="booking.paymentStatus"></app-status-badge>
        </div>
      </div>

      <div class="booking-card__details">
        <div>
          <span>Date</span>
          <strong>{{ booking.appointmentDate | date : 'MMM d, y' }}</strong>
        </div>
        <div>
          <span>Time</span>
          <strong>{{ booking.slotStartTime }} - {{ booking.slotEndTime }}</strong>
        </div>
        <div *ngIf="booking.queueNumber !== null">
          <span>Queue</span>
          <strong>#{{ booking.queueNumber }}</strong>
        </div>
      </div>

      <div class="booking-card__actions">
        <button type="button" class="btn-outline" (click)="viewDetails.emit(booking.id)">
          View Details
        </button>
        <button *ngIf="canSubmitProof" type="button" class="btn-primary" (click)="submitProof.emit(booking.id)">
          Submit Proof
        </button>
        <button *ngIf="canCancel" type="button" class="btn-ghost" (click)="cancelBooking.emit(booking.id)">
          Cancel
        </button>
      </div>
    </article>
  `,
  styleUrl: './patient-booking-card.component.scss'
})
export class PatientBookingCardComponent {
  @Input({ required: true }) booking!: Booking;
  @Input() doctor?: Doctor;
  @Input() service?: Service;
  @Input() canSubmitProof = false;
  @Input() canCancel = false;

  @Output() viewDetails = new EventEmitter<string>();
  @Output() submitProof = new EventEmitter<string>();
  @Output() cancelBooking = new EventEmitter<string>();
}
