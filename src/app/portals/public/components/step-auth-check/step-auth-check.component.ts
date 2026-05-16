import { AsyncPipe, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { lockClosedOutline } from 'ionicons/icons';
import { filter, take } from 'rxjs';
import { nextStep, prevStep } from '../../../../store/bookings/bookings.actions';
import { selectIsAuthenticated } from '../../../../store/auth/auth.selectors';

@Component({
  selector: 'app-step-auth-check',
  standalone: true,
  imports: [NgIf, AsyncPipe, IonIcon],
  template: `
    <section class="wizard-panel" *ngIf="!(isAuthenticated$ | async)">
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
  `,
  styleUrl: './step-auth-check.component.scss'
})
export class StepAuthCheckComponent {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  isAuthenticated$ = this.store.select(selectIsAuthenticated);

  constructor() {
    addIcons({ lockClosedOutline });

    this.isAuthenticated$.pipe(filter(Boolean), take(1)).subscribe(() => {
      this.store.dispatch(nextStep());
    });
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login'], { queryParams: { returnUrl: '/public/booking' } });
  }

  goToRegister(): void {
    this.router.navigate(['/auth/register'], { queryParams: { returnUrl: '/public/booking' } });
  }

  goBack(): void {
    this.store.dispatch(prevStep());
  }
}
