import { NgClass, NgFor } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Booking } from '../../../../core/models';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';

type TimelineState = 'completed' | 'current' | 'upcoming';

interface TimelineStep {
  label: string;
  description: string;
}

@Component({
  selector: 'app-booking-timeline',
  standalone: true,
  imports: [NgFor, NgClass, StatusBadgeComponent],
  template: `
    <div class="timeline clinic-card">
      <div class="section-heading">Booking Timeline</div>
      <div class="timeline__track">
        <div
          *ngFor="let step of steps; let index = index"
          class="timeline__step"
          [ngClass]="stateClass(index)"
        >
          <div class="timeline__marker"></div>
          <div class="timeline__content">
            <div class="timeline__label">{{ step.label }}</div>
            <div class="timeline__description">{{ step.description }}</div>
          </div>
        </div>
      </div>
      <div class="timeline__footer">
        <app-status-badge [status]="booking.status"></app-status-badge>
        <app-status-badge [status]="booking.paymentStatus"></app-status-badge>
      </div>
    </div>
  `,
  styleUrl: './booking-timeline.component.scss'
})
export class BookingTimelineComponent {
  @Input({ required: true }) booking!: Booking;

  readonly steps: TimelineStep[] = [
    { label: 'Booking Created', description: 'Patient request submitted.' },
    { label: 'Payment Pending', description: 'Waiting for payment proof or verification.' },
    { label: 'Proof Submitted', description: 'Payment proof sent for review.' },
    { label: 'Confirmed', description: 'Clinic confirmed the schedule.' },
    { label: 'Completed', description: 'Appointment and consultation completed.' }
  ];

  stateClass(index: number): TimelineState {
    const current = this.currentStepIndex;
    if (index < current) {
      return 'completed';
    }
    if (index === current) {
      return 'current';
    }
    return 'upcoming';
  }

  get currentStepIndex(): number {
    switch (this.booking.status) {
      case 'Completed':
        return 4;
      case 'Confirmed':
        return 3;
      case 'ProofSubmitted':
        return 2;
      case 'Pending':
      case 'OnHold':
        return this.booking.paymentStatus === 'Paid' ? 3 : 1;
      case 'Cancelled':
      case 'NoShow':
      case 'Expired':
      case 'Rescheduled':
        return 0;
      default:
        return 1;
    }
  }
}
