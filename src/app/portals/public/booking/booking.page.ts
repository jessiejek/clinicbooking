import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { calendarOutline } from 'ionicons/icons';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-booking-stub-page',
  standalone: true,
  imports: [EmptyStateComponent],
  template: `
    <div class="stub-wrap content-container">
      <app-empty-state
        icon="calendar-outline"
        title="Booking Wizard"
        description="The booking wizard is being built in Phase 4."
        ctaLabel="Back to Home"
        (ctaClick)="goHome()"
      />
    </div>
  `,
  styles: [
    `
      .stub-wrap {
        padding: var(--space-24) var(--space-4);
      }
    `
  ]
})
export class BookingStubPage {
  private readonly router = inject(Router);

  constructor() {
    addIcons({ calendarOutline });
  }

  goHome(): void {
    this.router.navigate(['/public']);
  }
}
