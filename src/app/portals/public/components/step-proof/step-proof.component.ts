import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AsyncPipe, NgIf } from '@angular/common';
import { IonIcon, IonInput, IonItem, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cloudUploadOutline, imageOutline, receiptOutline } from 'ionicons/icons';
import { BookingWizardService } from '../../../../core/services/booking-wizard.service';

type ProofChoice = 'ReferenceNumber' | 'Screenshot';

@Component({
  selector: 'app-step-proof',
  standalone: true,
  imports: [NgIf, FormsModule, AsyncPipe, IonIcon, IonItem, IonInput, IonLabel],
  template: `
    <section class="wizard-panel">
      <div class="wizard-panel__header">
        <div>
          <p class="section-heading">Step 7</p>
          <h2 class="wizard-title">{{ (wizard$ | async)?.paymentMode === 'PayAtClinic' ? 'Confirm booking' : 'Submit payment proof' }}</h2>
          <p class="wizard-subtitle" *ngIf="(wizard$ | async)?.paymentMode === 'PayAtClinic'; else onlineHint">
            Confirm your booking. You will pay at the clinic on your appointment day.
          </p>
          <ng-template #onlineHint>
            <p class="wizard-subtitle">Upload a screenshot or enter your transaction reference number.</p>
          </ng-template>
        </div>
      </div>

      <ng-container *ngIf="wizard$ | async as wizard">
        <ng-container *ngIf="wizard.paymentMode !== 'PayAtClinic'; else payAtClinicTpl">
          <div class="proof-type-selector">
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

          <div *ngIf="proofType === 'ReferenceNumber'">
            <ion-item class="clinic-input">
              <ion-label position="floating">Transaction Reference Number</ion-label>
              <ion-input
                [(ngModel)]="referenceNumber"
                placeholder="e.g. GC1234567890"
              ></ion-input>
            </ion-item>
            <p class="form-hint">Enter the reference number from your GCash, Maya, or bank transaction.</p>
          </div>

          <div *ngIf="proofType === 'Screenshot'">
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
        </ng-container>

        <ng-template #payAtClinicTpl>
          <div class="clinic-card clinic-card--accent-green pay-at-clinic-panel">
            <p class="section-heading">Pay at Clinic</p>
            <p class="pay-at-clinic-panel__text">
              No online proof is required. Confirm this booking to reserve your slot, then pay
              at the clinic on the day of your visit.
            </p>
          </div>
        </ng-template>
      </ng-container>

      <div class="wizard-actions wizard-actions--split">
        <button type="button" class="btn-outline" (click)="goBack()">Back</button>
        <ng-container *ngIf="(wizard$ | async)?.paymentMode !== 'PayAtClinic'; else payAtClinicActions">
          <button
            type="button"
            class="btn-primary"
            [disabled]="!canSubmit || (isLoading$ | async)"
            (click)="onSubmit()"
          >
            Submit Booking
          </button>
        </ng-container>
        <ng-template #payAtClinicActions>
          <button
            type="button"
            class="btn-primary"
            [disabled]="isLoading$ | async"
            (click)="submitPayAtClinic()"
          >
            Submit Booking
          </button>
        </ng-template>
      </div>
    </section>
  `,
  styleUrl: './step-proof.component.scss'
})
export class StepProofComponent {
  private readonly wizardService = inject(BookingWizardService);

  proofType: ProofChoice = 'ReferenceNumber';
  referenceNumber = '';
  screenshotFileName = '';

  wizard$ = this.wizardService.state$;
  isLoading$ = this.wizardService.isLoading$;

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
    const value =
      this.proofType === 'ReferenceNumber' ? this.referenceNumber.trim() : this.screenshotFileName;
    this.wizardService.submitBooking(this.proofType, value);
  }

  submitPayAtClinic(): void {
    this.wizardService.submitBooking(null, null);
  }

  goBack(): void {
    this.wizardService.prevStep();
  }
}
