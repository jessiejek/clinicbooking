import { NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Booking, Patient, Service } from '../../../../core/models';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-doctor-appointment-card',
  standalone: true,
  imports: [NgIf, StatusBadgeComponent],
  template: `
    <article class="clinic-card appointment-card">
      <div class="appointment-card__head">
        <div>
          <div class="appointment-card__patient">{{ patientName }}</div>
          <div class="appointment-card__sub">{{ patientCode }}</div>
        </div>
        <app-status-badge [status]="booking.status"></app-status-badge>
      </div>

      <div class="appointment-card__meta">
        <div>
          <span class="label">Service</span>
          <strong>{{ serviceName }}</strong>
        </div>
        <div>
          <span class="label">Schedule</span>
          <strong>{{ booking.appointmentDate }} {{ booking.slotStartTime }}</strong>
        </div>
        <div>
          <span class="label">Queue #</span>
          <strong class="data-mono">{{ booking.queueNumber ?? '-' }}</strong>
        </div>
        <div>
          <span class="label">Payment</span>
          <app-status-badge [status]="booking.paymentStatus"></app-status-badge>
        </div>
      </div>

      <div class="appointment-card__actions">
        <button type="button" class="btn-ghost" (click)="openBooking.emit(booking.id)">View</button>
        <button
          *ngIf="canStartConsultation(booking.status)"
          type="button"
          class="btn-primary"
          (click)="startConsultation.emit(booking.id)"
        >
          Start Consultation
        </button>
      </div>
    </article>
  `,
  styleUrl: './doctor-appointment-card.component.scss'
})
export class DoctorAppointmentCardComponent {
  @Input({ required: true }) booking!: Booking;
  @Input() patient: Patient | undefined;
  @Input() service: Service | undefined;

  @Output() openBooking = new EventEmitter<string>();
  @Output() startConsultation = new EventEmitter<string>();

  get patientName(): string {
    return this.patient ? `${this.patient.firstName} ${this.patient.lastName}` : 'Unknown Patient';
  }

  get patientCode(): string {
    return this.patient?.patientCode ?? '';
  }

  get serviceName(): string {
    return this.service?.name ?? 'Unknown Service';
  }

  canStartConsultation(status: string): boolean {
    return status === 'Confirmed' || status === 'InProgress';
  }
}
