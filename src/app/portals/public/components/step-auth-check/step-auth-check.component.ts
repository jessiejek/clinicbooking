import { NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { lockClosedOutline } from 'ionicons/icons';
import { AuthStateService } from '../../../../core/services/auth-state.service';
import { BookingWizardService } from '../../../../core/services/booking-wizard.service';

@Component({
  selector: 'app-step-auth-check',
  standalone: true,
  imports: [NgIf, IonIcon],
  template: `
    <section class="wizard-panel">
      <div class="auth-check-card clinic-card">
        <div class="empty-state__icon">
          <ion-icon name="lock-closed-outline"></ion-icon>
        </div>
        <h3>{{ isAuthenticated ? 'Account ready' : 'Continue as guest' }}</h3>
        <p *ngIf="isAuthenticated; else guestTpl">
          You are signed in. Continue to payment to finish your booking.
        </p>
        <ng-template #guestTpl>
          <p>
            You can book now as a guest. Create an account later to track and manage your
            bookings.
          </p>
        </ng-template>
      </div>

      <div class="wizard-actions wizard-actions--split">
        <button type="button" class="btn-outline" (click)="goBack()">Back</button>
        <button type="button" class="btn-primary" (click)="continue()">Continue to Payment</button>
      </div>
    </section>
  `,
  styleUrl: './step-auth-check.component.scss'
})
export class StepAuthCheckComponent {
  private readonly authState = inject(AuthStateService);
  private readonly wizardService = inject(BookingWizardService);
  readonly isAuthenticated = !!this.authState.snapshot;

  constructor() {
    addIcons({ lockClosedOutline });
  }

  continue(): void {
    this.wizardService.nextStep();
  }

  goBack(): void {
    this.wizardService.prevStep();
  }
}
