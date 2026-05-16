import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { AsyncPipe, NgIf, NgSwitch, NgSwitchCase } from '@angular/common';
import { Store } from '@ngrx/store';
import { ToastController } from '@ionic/angular';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { copyOutline } from 'ionicons/icons';
import { combineLatest, map } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MockDataService } from '../../../../core/services/mock-data.service';
import { nextStep, prevStep, selectPaymentMode } from '../../../../store/bookings/bookings.actions';
import { selectWizard } from '../../../../store/bookings/bookings.selectors';
import { selectIsAuthenticated } from '../../../../store/auth/auth.selectors';

type PaymentTab = 'gcash' | 'maya' | 'bank' | 'clinic';

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
          <p class="wizard-subtitle">Complete your payment, then submit proof in the next step.</p>
        </div>
      </div>

      <ng-container *ngIf="vm$ | async as vm">
        <div class="amount-due clinic-card clinic-card--accent-green">
          <p class="amount-label">Amount Due</p>
          <p class="amount-value">&#8369;{{ vm.totalDue }}</p>
          <p class="amount-note">
            {{
              vm.paymentMode === 'PayAtClinic'
                ? 'You will settle this at the clinic on the day of your visit.'
                : 'Complete payment then submit proof in the next step.'
            }}
          </p>
        </div>

        <div class="payment-tabs">
          <button
            type="button"
            [class.active]="activeTab === 'gcash'"
            (click)="selectTab('gcash')"
          >
            GCash
          </button>
          <button
            type="button"
            [class.active]="activeTab === 'maya'"
            (click)="selectTab('maya')"
          >
            Maya
          </button>
          <button
            type="button"
            [class.active]="activeTab === 'bank'"
            (click)="selectTab('bank')"
          >
            Bank Transfer
          </button>
          <button
            *ngIf="vm.isAuthenticated"
            type="button"
            [class.active]="activeTab === 'clinic'"
            (click)="selectTab('clinic')"
          >
            Pay at Clinic
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

          <div *ngSwitchCase="'clinic'" class="payment-content clinic-card">
            <div class="clinic-pay-hero">
              <div class="clinic-pay-hero__icon">₱</div>
              <div>
                <h3>Pay at Clinic</h3>
                <p>
                  Your appointment is reserved now. Please pay the clinic on the day of your visit
                  before consultation.
                </p>
              </div>
            </div>
            <ul class="clinic-pay-list">
              <li>Available to signed-in patients only</li>
              <li>Bring your appointment details to the front desk</li>
              <li>No online proof upload is needed</li>
            </ul>
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

      <div class="payment-hint" *ngIf="!(vm$ | async)?.isAuthenticated">
        Pay at clinic is available only after you sign in.
      </div>

      <div class="wizard-actions wizard-actions--split">
        <button type="button" class="btn-outline" (click)="goBack()">Back</button>
        <button type="button" class="btn-primary" (click)="goNext()">
          {{ (vm$ | async)?.paymentMode === 'PayAtClinic' ? 'Continue to Confirmation' : 'Continue to Proof' }}
        </button>
      </div>
    </section>
  `,
  styleUrl: './step-payment.component.scss'
})
export class StepPaymentComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly toastCtrl = inject(ToastController);
  private readonly mockData = inject(MockDataService);
  private readonly destroyRef = inject(DestroyRef);

  activeTab: PaymentTab = 'gcash';

  vm$ = combineLatest([this.store.select(selectWizard), this.store.select(selectIsAuthenticated)]).pipe(
    map(([wizard, isAuthenticated]) => {
      const doctor = wizard.selectedDoctorId
        ? this.mockData.getDoctors().find((item) => item.id === wizard.selectedDoctorId)
        : null;
      const service = wizard.selectedServiceId
        ? this.mockData.getServices().find((item) => item.id === wizard.selectedServiceId)
        : null;

      return {
        paymentMode: wizard.paymentMode,
        isAuthenticated,
        totalDue: (doctor?.consultationFee ?? 0) + (service?.price ?? 0),
        paymentSettings: this.mockData.getPaymentSettings()
      };
    })
  );

  constructor() {
    addIcons({ copyOutline });
  }

  ngOnInit(): void {
    this.store
      .select(selectWizard)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((wizard) => {
        if (wizard.paymentMode === 'PayAtClinic') {
          this.activeTab = 'clinic';
        } else if (this.activeTab === 'clinic') {
          this.activeTab = 'gcash';
        }
      });
  }

  selectTab(tab: PaymentTab): void {
    if (tab === 'clinic') {
      this.store.dispatch(selectPaymentMode({ paymentMode: 'PayAtClinic' }));
    } else {
      this.store.dispatch(selectPaymentMode({ paymentMode: 'Online' }));
    }

    this.activeTab = tab;
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
