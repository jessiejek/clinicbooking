import { AsyncPipe, NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { lockClosedOutline } from 'ionicons/icons';
import { filter, take } from 'rxjs';
import { AuthStateService } from '../../../../core/services/auth-state.service';
import { BookingWizardService } from '../../../../core/services/booking-wizard.service';

@Component({
  selector: 'app-step-auth-check',
  standalone: true,
  imports: [NgIf, AsyncPipe, IonIcon],
  template: `
    <section class="wizard-panel" *ngIf="isAuthenticated$ | async; else authRequiredTpl">
      <div class="auth-check-card clinic-card">
        <div class="empty-state__icon">
          <ion-icon name="lock-closed-outline"></ion-icon>
        </div>
        <h3>Account verified</h3>
        <p>Taking you to payment instructions...</p>
      </div>
    </section>

    <ng-template #authRequiredTpl>
      <section class="wizard-panel">
        <div class="auth-check-card clinic-card">
          <div class="empty-state__icon">
            <ion-icon name="lock-closed-outline"></ion-icon>
          </div>
          <h3>Login Required</h3>
          <p>
            Please log in or create an account to complete your booking. Patients must have an
            account before booking.
          </p>

          <div class="auth-check-actions">
            <button type="button" class="btn-primary" (click)="goToLogin()">Sign In</button>
            <button type="button" class="btn-outline" (click)="goToRegister()">Create Account</button>
          </div>
        </div>

        <div class="wizard-actions wizard-actions--split">
          <button type="button" class="btn-outline" (click)="goBack()">Back</button>
        </div>
      </section>
    </ng-template>
  `,
  styleUrl: './step-auth-check.component.scss'
})
export class StepAuthCheckComponent implements OnInit {
  private readonly authState = inject(AuthStateService);
  private readonly wizardService = inject(BookingWizardService);
  private readonly router = inject(Router);

  isAuthenticated$ = this.authState.isAuthenticated$;

  constructor() {
    addIcons({ lockClosedOutline });
  }

  ngOnInit(): void {
    this.isAuthenticated$.pipe(filter(Boolean), take(1)).subscribe(() => {
      queueMicrotask(() => {
        if (this.wizardService.snapshot.currentStep === 5) {
          this.wizardService.setStep(6);
        }
      });
    });
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login'], { queryParams: { returnUrl: '/public/booking' } });
  }

  goToRegister(): void {
    this.router.navigate(['/auth/register'], { queryParams: { returnUrl: '/public/booking' } });
  }

  goBack(): void {
    this.wizardService.prevStep();
  }
}
