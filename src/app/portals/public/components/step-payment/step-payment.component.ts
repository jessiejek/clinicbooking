import { Component, inject } from '@angular/core';
import { AsyncPipe, NgIf, NgSwitch, NgSwitchCase } from '@angular/common';
import { Store } from '@ngrx/store';
import { ToastController } from '@ionic/angular';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { copyOutline } from 'ionicons/icons';
import { map } from 'rxjs';
import { MockDataService } from '../../../../core/services/mock-data.service';
import { nextStep, prevStep, selectPaymentMode } from '../../../../store/bookings/bookings.actions';
import { selectWizard } from '../../../../store/bookings/bookings.selectors';

type PaymentTab = 'gcash' | 'maya' | 'bank';
type BookingPaymentMode = 'Online' | 'PayAtClinic';

@Component({
  selector: 'app-step-payment',
  standalone: true,
  imports: [NgIf, AsyncPipe, NgSwitch, NgSwitchCase, IonIcon],
  template: `
    <section class="wizard-panel">
      <div class="wizard-panel__header">
        <div>
          <p class="section-heading">Step 6</p>
          <h2 class="wizard-title">Payment instructions</h2>
          <p class="wizard-subtitle">
            Choose how you want to settle the bill for this appointment.
          </p>
        </div>
      </div>

      <ng-container *ngIf="vm$ | async as vm">
        <div class="payment-mode-tabs">
          <button
            type="button"
            [class.active]="vm.paymentMode === 'Online'"
            (click)="setPaymentMode('Online')"
          >
            Online Payment
          </button>
          <button
            type="button"
            [class.active]="vm.paymentMode === 'PayAtClinic'"
            (click)="setPaymentMode('PayAtClinic')"
          >
            Pay at Clinic
          </button>
        </div>

        <ng-container *ngIf="vm.paymentMode === 'Online'; else payAtClinicTpl">
          <div class="amount-due clinic-card clinic-card--accent-green">
            <p class="amount-label">Amount Due</p>
            <p class="amount-value">&#8369;{{ vm.totalDue }}</p>
            <p class="amount-note">Complete payment then submit proof in the next step</p>
          </div>

          <div class="payment-tabs">
            <button type="button" [class.active]="activeTab === 'gcash'" (click)="activeTab = 'gcash'">
              GCash
            </button>
            <button type="button" [class.active]="activeTab === 'maya'" (click)="activeTab = 'maya'">
              Maya
            </button>
            <button type="button" [class.active]="activeTab === 'bank'" (click)="activeTab = 'bank'">
              Bank Transfer
            </button>
          </div>

          <div class="payment-method-content" [ngSwitch]="activeTab">
            <div *ngSwitchCase="'gcash'" class="payment-content clinic-card">
              <div class="qr-placeholder">
                <div class="qr-box">
                  QR Code Placeholder
                  <small>Scan with GCash app</small>
                </div>
              </div>
              <p class="payment-account">
                <strong>Account Name:</strong> {{ vm.paymentSettings.gcashAccountName }}
              </p>
              <div class="payment-number-row">
                <strong>Number:</strong>
                <span class="data-mono">{{ vm.paymentSettings.gcashNumber }}</span>
                <button
                  type="button"
                  class="btn-icon"
                  (click)="copyToClipboard(vm.paymentSettings.gcashNumber || '')"
                >
                  <ion-icon name="copy-outline"></ion-icon>
                </button>
              </div>
            </div>

            <div *ngSwitchCase="'maya'" class="payment-content clinic-card">
              <div class="qr-placeholder">
                <div class="qr-box">
                  QR Code Placeholder
                  <small>Scan with Maya app</small>
                </div>
              </div>
              <p class="payment-account">
                <strong>Account Name:</strong> {{ vm.paymentSettings.mayaAccountName }}
              </p>
              <div class="payment-number-row">
                <strong>Number:</strong>
                <span class="data-mono">{{ vm.paymentSettings.mayaNumber }}</span>
                <button
                  type="button"
                  class="btn-icon"
                  (click)="copyToClipboard(vm.paymentSettings.mayaNumber || '')"
                >
                  <ion-icon name="copy-outline"></ion-icon>
                </button>
              </div>
            </div>

            <div *ngSwitchCase="'bank'" class="payment-content clinic-card">
              <p><strong>Bank:</strong> {{ vm.paymentSettings.bankName }}</p>
              <p><strong>Account Name:</strong> {{ vm.paymentSettings.bankAccountName }}</p>
              <div class="payment-number-row">
                <strong>Account No.:</strong>
                <span class="data-mono">{{ vm.paymentSettings.bankAccountNumber }}</span>
                <button
                  type="button"
                  class="btn-icon"
                  (click)="copyToClipboard(vm.paymentSettings.bankAccountNumber || '')"
                >
                  <ion-icon name="copy-outline"></ion-icon>
                </button>
              </div>
            </div>
          </div>
        </ng-container>

        <ng-template #payAtClinicTpl>
          <div class="payment-mode-panel clinic-card clinic-card--accent-green">
            <p class="section-heading">Pay at Clinic</p>
            <p class="payment-mode-message">
              You can settle the total due at the clinic on your appointment day. No online
              payment proof is required.
            </p>
            <ul class="payment-mode-list">
              <li>Please bring the exact amount due.</li>
              <li>Staff will mark your payment when you arrive.</li>
              <li>Your slot remains reserved until your visit.</li>
            </ul>
          </div>
        </ng-template>
      </ng-container>

      <div class="wizard-actions wizard-actions--split">
        <button type="button" class="btn-outline" (click)="goBack()">Back</button>
        <button type="button" class="btn-primary" (click)="goNext()">
          {{ (vm$ | async)?.paymentMode === 'PayAtClinic' ? 'Continue' : 'Continue to Proof' }}
        </button>
      </div>
    </section>
  `,
  styleUrl: './step-payment.component.scss'
})
export class StepPaymentComponent {
  private readonly store = inject(Store);
  private readonly toastCtrl = inject(ToastController);
  private readonly mockData = inject(MockDataService);

  activeTab: PaymentTab = 'gcash';

  vm$ = this.store.select(selectWizard).pipe(
    map((wizard) => {
      const doctor = wizard.selectedDoctorId
        ? this.mockData.getDoctors().find((item) => item.id === wizard.selectedDoctorId)
        : null;
      const service = wizard.selectedServiceId
        ? this.mockData.getServices().find((item) => item.id === wizard.selectedServiceId)
        : null;

      return {
        totalDue: (doctor?.consultationFee ?? 0) + (service?.price ?? 0),
        paymentSettings: this.mockData.getPaymentSettings(),
        paymentMode: wizard.paymentMode as BookingPaymentMode
      };
    })
  );

  constructor() {
    addIcons({ copyOutline });
  }

  setPaymentMode(paymentMode: BookingPaymentMode): void {
    this.store.dispatch(selectPaymentMode({ paymentMode }));
  }

  async copyToClipboard(value: string): Promise<void> {
    if (!value) {
      return;
    }

    await navigator.clipboard.writeText(value);
    const toast = await this.toastCtrl.create({
      message: 'Copied to clipboard!',
      duration: 1500,
      color: 'success',
      position: 'top'
    });
    await toast.present();
  }

  goNext(): void {
    this.store.dispatch(nextStep());
  }

  goBack(): void {
    this.store.dispatch(prevStep());
  }
}
