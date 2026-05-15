import { Component, Input } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { BookingStatus, DoctorStatus, PaymentStatus } from '../../../core/models';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [NgClass],
  template: `
    <span class="badge" [ngClass]="cssClass">{{ displayLabel }}</span>
  `,
  styleUrl: './status-badge.component.scss'
})
export class StatusBadgeComponent {
  @Input({ required: true }) status!: BookingStatus | PaymentStatus | DoctorStatus | string;

  get cssClass(): string {
    const raw = String(this.status);
    const kebab = raw
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/_/g, '-')
      .toLowerCase();
    return `badge--${kebab}`;
  }

  get displayLabel(): string {
    const raw = String(this.status);
    const map: Record<string, string> = {
      ProofSubmitted: 'Proof Submitted',
      OnHold: 'On Hold',
      NoShow: 'No Show',
      OnLeave: 'On Leave'
    };
    if (map[raw]) {
      return map[raw];
    }
    return raw
      .replace(/([A-Z])/g, ' $1')
      .replace(/^\s+/, '')
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  }
}
