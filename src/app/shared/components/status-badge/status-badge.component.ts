import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';
import { BookingStatus, DoctorStatus, PaymentStatus } from '../../../core/models';

type StatusBadgeKind = 'booking' | 'payment' | 'doctor';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [NgClass],
  template: `
    <span class="badge" [ngClass]="badgeClass">{{ label }}</span>
  `,
  styleUrl: './status-badge.component.scss'
})
export class StatusBadgeComponent {
  @Input({ required: true }) kind!: StatusBadgeKind;
  @Input({ required: true }) status!: BookingStatus | PaymentStatus | DoctorStatus | string;
  @Input() text?: string;

  get badgeClass(): string {
    const raw = String(this.status);
    const normalized = raw
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/_/g, '-')
      .toLowerCase();
    return `badge--${normalized}`;
  }

  get label(): string {
    if (this.text) return this.text;
    const raw = String(this.status);
    return raw
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/_/g, ' ')
      .trim();
  }
}

