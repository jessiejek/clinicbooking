import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Booking, Patient } from '../../../../core/models';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-consultation-header',
  standalone: true,
  imports: [DatePipe, PageHeaderComponent],
  template: `
    <app-page-header
      title="Consultation"
      subtitle="Complete the medical record from the appointment"
      [showBackButton]="true"
      defaultBackHref="/doctor/appointments"
    >
      <div class="consultation-header">
        <div class="consultation-header__copy">
          <h2>{{ patientName }}</h2>
          <p>
            Booking {{ booking.id }} &bull; {{ booking.appointmentDate | date : 'MMM d, y' }}
            {{ booking.slotStartTime }} - {{ booking.slotEndTime }}
          </p>
        </div>
        <div class="consultation-header__actions">
          <button type="button" class="btn-ghost" [disabled]="locked" (click)="saveDraft.emit()">
            Save Draft
          </button>
          <button type="button" class="btn-primary" [disabled]="locked" (click)="complete.emit()">
            Complete Consultation
          </button>
        </div>
      </div>
    </app-page-header>
  `,
  styles: [
    `
      .consultation-header {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: var(--space-4);
        width: 100%;
        margin-top: var(--space-4);
      }

      .consultation-header__copy h2 {
        margin: 0;
      }

      .consultation-header__copy p {
        margin: 4px 0 0;
        color: var(--clinic-text-secondary);
      }

      .consultation-header__actions {
        display: flex;
        gap: var(--space-2);
        flex-wrap: wrap;
      }

      @media (max-width: 900px) {
        .consultation-header {
          display: grid;
          grid-template-columns: 1fr;
        }
      }
    `
  ]
})
export class ConsultationHeaderComponent {
  @Input({ required: true }) booking!: Booking;
  @Input({ required: true }) patient!: Patient;
  @Input() locked = false;

  @Output() saveDraft = new EventEmitter<void>();
  @Output() complete = new EventEmitter<void>();

  get patientName(): string {
    return `${this.patient.firstName} ${this.patient.lastName}`;
  }
}
