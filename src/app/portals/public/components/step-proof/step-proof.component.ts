import { AsyncPipe, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { IonIcon, IonInput, IonItem, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cloudUploadOutline, imageOutline, receiptOutline } from 'ionicons/icons';
import { combineLatest, map } from 'rxjs';
import { PaymentMode } from '../../../../core/models';
import { prevStep, submitBooking } from '../../../../store/bookings/bookings.actions';
import { selectWizard, selectWizardLoading } from '../../../../store/bookings/bookings.selectors';
import { selectIsAuthenticated } from '../../../../store/auth/auth.selectors';

type ProofChoice = 'ReferenceNumber' | 'Screenshot';

@Component({
  selector: 'app-step-proof',
  standalone: true,
  imports: [NgIf, FormsModule, AsyncPipe, IonIcon, IonItem, IonInput, IonLabel],
  template: `
    <ng-container *ngIf="vm$ | async as vm">
      <section class="wizard-panel">
        <div class="wizard-panel__header">
          <div>
            <p class="section-heading">Step 7</p>
            <h2 class="wizard-title">{{ vm.payAtClinic ? 'Confirm your booking' : 'Submit payment proof' }}</h2>
            <p class="wizard-subtitle">
              {{
                vm.payAtClinic
                  ? 'You chose to pay at the clinic. Submit the booking to reserve your slot.'
                  : 'Upload a screenshot or enter your transaction reference number.'
              }}
            </p>
          </div>
        </div>

        <div class="clinic-card clinic-card--accent-green" *ngIf="vm.payAtClinic">
          <p class="section-heading">Pay at Clinic</p>
          <p>
            Your slot is reserved. Please settle the total fee at the clinic before your
            consultation.
          </p>
          <ul class="payment-note-list">
            <li>Available only for signed-in patients</li>
            <li>No online receipt upload required</li>
            <li>Bring your booking details to the front desk</li>
          </ul>
        </div>

        <div class="proof-type-selector" *ngIf="!vm.payAtClinic">
          <button
            type="button"
            class="proof-option"
            [class.proof-option--selected]="proofType === 'ReferenceNumber'"
            (click)="proofType = 'ReferenceNumber'"
          >
            <ion-icon name="receipt-outline"></ion-icon>
            <span>Reference Number</span>
          </button>
          <button
            type="button"
            class="proof-option"
            [class.proof-option--selected]="proofType === 'Screenshot'"
            (click)="proofType = 'Screenshot'"
          >
            <ion-icon name="image-outline"></ion-icon>
            <span>Screenshot</span>
          </button>
        </div>

        <div *ngIf="!vm.payAtClinic && proofType === 'ReferenceNumber'">
          <ion-item class="clinic-input">
            <ion-label position="floating">Transaction Reference Number</ion-label>
            <ion-input [(ngModel)]="referenceNumber" placeholder="e.g. GC1234567890"></ion-input>
          </ion-item>
          <p class="form-hint">
            Enter the reference number from your GCash, Maya, or bank transaction.
          </p>
        </div>

        <div *ngIf="!vm.payAtClinic && proofType === 'Screenshot'">
          <div class="upload-zone" (click)="fileInput.click()">
            <ion-icon name="cloud-upload-outline"></ion-icon>
            <p>Click to upload payment screenshot</p>
            <p class="form-hint" *ngIf="!screenshotFileName">Accepted: JPG, PNG, PDF</p>
            <p class="file-selected" *ngIf="screenshotFileName">&#10003; {{ screenshotFileName }}</p>
          </div>
          <input
            #fileInput
            type="file"
            accept="image/*,.pdf"
            style="display: none"
            (change)="onFileSelected($event)"
          />
        </div>

        <div class="payment-hint" *ngIf="!vm.isAuthenticated">
          Pay at clinic is available only after you sign in.
        </div>

        <div class="wizard-actions wizard-actions--split">
          <button type="button" class="btn-outline" (click)="goBack()">Back</button>
          <button
            type="button"
            class="btn-primary"
            [disabled]="(!vm.payAtClinic && !canSubmit) || (isLoading$ | async)"
            (click)="onSubmit()"
          >
            {{ vm.payAtClinic ? 'Confirm Booking' : 'Submit Booking' }}
          </button>
        </div>
      </section>
    </ng-container>
  `,
  styleUrl: './step-proof.component.scss'
})
export class StepProofComponent {
  private readonly store = inject(Store);

  proofType: ProofChoice = 'ReferenceNumber';
  referenceNumber = '';
  screenshotFileName = '';
  paymentMode: PaymentMode = 'Online';

  vm$ = combineLatest([this.store.select(selectWizard), this.store.select(selectIsAuthenticated)]).pipe(
    map(([wizard, isAuthenticated]) => {
      this.paymentMode = wizard.paymentMode;
      return {
        payAtClinic: wizard.paymentMode === 'PayAtClinic',
        isAuthenticated
      };
    })
  );

  isLoading$ = this.store.select(selectWizardLoading);

  constructor() {
    addIcons({ receiptOutline, imageOutline, cloudUploadOutline });
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.screenshotFileName = file.name;
    }
  }

  get canSubmit(): boolean {
    if (this.proofType === 'ReferenceNumber') {
      return this.referenceNumber.trim().length >= 5;
    }
    return this.screenshotFileName.length > 0;
  }

  onSubmit(): void {
    if (this.paymentMode === 'PayAtClinic') {
      this.store.dispatch(submitBooking({ paymentMode: 'PayAtClinic' }));
      return;
    }

    const value =
      this.proofType === 'ReferenceNumber' ? this.referenceNumber.trim() : this.screenshotFileName;
    this.store.dispatch(
      submitBooking({
        paymentMode: 'Online',
        proofType: this.proofType,
        proofValue: value
      })
    );
  }

  goBack(): void {
    this.store.dispatch(prevStep());
  }
}
