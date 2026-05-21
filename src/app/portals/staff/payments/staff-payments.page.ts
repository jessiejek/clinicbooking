import { DatePipe, NgFor, NgIf } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonModal,
  IonTitle,
  IonToolbar,
  ToastController
} from '@ionic/angular/standalone';
import {
  BookingService,
  ConfirmPaymentRequest,
  PagedResult,
  StaffForPaymentItem
} from '../../../core/services/booking.service';
import { ClinicDashboardRealtimeService } from '../../../core/services/clinic-dashboard-realtime.service';
import { ReceiptData } from '../../../core/models';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { ReceiptModalComponent } from '../../../shared/components/receipt-modal/receipt-modal.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

type CollectPaymentMethod = 'Cash' | 'GCash' | 'Maya' | 'BankTransfer';

@Component({
  selector: 'app-staff-payments-page',
  standalone: true,
  imports: [
    DatePipe,
    NgFor,
    NgIf,
    FormsModule,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonModal,
    IonTitle,
    IonToolbar,
    PageHeaderComponent,
    EmptyStateComponent,
    ReceiptModalComponent
  ],
  template: `
    <app-page-header title="Payment Queue" subtitle="Collect payment for completed consultations with an amount due"></app-page-header>

    <div class="clinic-card" *ngIf="isLoading">Loading payment queue...</div>

    <ng-container *ngIf="!isLoading">
      <section class="clinic-card" *ngIf="items.length > 0; else emptyState">
        <table class="clinic-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Services</th>
              <th>Date / Time</th>
              <th>Queue</th>
              <th>Amount Due</th>
              <th>Doctor Completed</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of items">
              <td>{{ item.patientName }}</td>
              <td>{{ item.doctorName }}</td>
              <td>{{ servicesLabel(item) }}</td>
              <td>
                <div>{{ item.appointmentDate | date : 'MMM d, y' }}</div>
                <div class="table-time">{{ item.slotStartTime }}</div>
              </td>
              <td>{{ item.queueNumber !== null ? '#' + item.queueNumber : '-' }}</td>
              <td>PHP {{ item.amountDue }}</td>
              <td>{{ item.doctorCompletedAt ? (item.doctorCompletedAt | date : 'MMM d, y h:mm a') : '-' }}</td>
              <td>
                <button type="button" class="btn-primary" (click)="openPaymentModal(item)">
                  Collect Payment
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="bookings-pagination" *ngIf="totalPages > 1">
          <button class="btn-ghost bookings-pagination__button" type="button" (click)="previousPage()" [disabled]="currentPage <= 1 || isLoading">
            Previous
          </button>
          <span class="bookings-pagination__page">Page {{ currentPage }} of {{ totalPages }}</span>
          <button class="btn-ghost bookings-pagination__button" type="button" (click)="nextPage()" [disabled]="currentPage >= totalPages || isLoading">
            Next
          </button>
        </div>
      </section>
    </ng-container>

    <ng-template #emptyState>
      <app-empty-state
        icon="cash-outline"
        title="No payments waiting"
        description="Completed bookings with an unpaid professional fee will appear here."
      ></app-empty-state>
    </ng-template>

    <ion-modal [isOpen]="paymentModalOpen" (didDismiss)="closePaymentModal()">
      <ng-template>
        <ion-header>
          <ion-toolbar>
            <ion-title>Collect Payment</ion-title>
            <ion-buttons slot="end">
              <ion-button fill="clear" (click)="closePaymentModal()">Close</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <div class="clinic-card" *ngIf="selectedItem">
            <div class="section-heading">{{ selectedItem.patientName }}</div>
            <p>{{ selectedItem.doctorName }}</p>
            <p>{{ servicesLabel(selectedItem) }}</p>
            <p><strong>Amount Due:</strong> PHP {{ selectedItem.amountDue }}</p>
          </div>

          <div class="clinic-card">
            <label class="form-label">Payment Method</label>
            <select class="filter-input" [(ngModel)]="paymentMethod">
              <option *ngFor="let method of paymentMethods" [value]="method">{{ method }}</option>
            </select>
          </div>

          <div class="clinic-card">
            <label class="form-label">Amount Received</label>
            <input class="filter-input" type="number" min="0" [(ngModel)]="amountReceived" />
          </div>

          <div class="clinic-card">
            <label class="form-label">Reference Number</label>
            <input class="filter-input" type="text" [(ngModel)]="referenceNumber" />
          </div>

          <div class="clinic-card">
            <label class="form-label">Notes</label>
            <textarea class="filter-input" rows="3" [(ngModel)]="notes"></textarea>
          </div>

          <div class="wizard-actions wizard-actions--split">
            <button type="button" class="btn-outline" (click)="closePaymentModal()">Cancel</button>
            <button type="button" class="btn-primary" [disabled]="isSubmitting" (click)="confirmPayment()">
              {{ isSubmitting ? 'Collecting...' : 'Confirm Payment' }}
            </button>
          </div>
        </ion-content>
      </ng-template>
    </ion-modal>

    <app-receipt-modal [isOpen]="receiptModalOpen" [data]="receiptData" (closed)="receiptModalOpen = false"></app-receipt-modal>
  `,
  styleUrl: './staff-payments.page.scss'
})
export class StaffPaymentsPage implements OnInit {
  private readonly bookingService = inject(BookingService);
  private readonly realtime = inject(ClinicDashboardRealtimeService);
  private readonly toastCtrl = inject(ToastController);
  private readonly destroyRef = inject(DestroyRef);

  items: StaffForPaymentItem[] = [];
  isLoading = false;
  currentPage = 1;
  pageSize = 20;
  totalPages = 1;

  paymentModalOpen = false;
  selectedItem: StaffForPaymentItem | null = null;
  paymentMethod: CollectPaymentMethod = 'Cash';
  amountReceived = 0;
  referenceNumber = '';
  notes = '';
  isSubmitting = false;

  receiptModalOpen = false;
  receiptData: ReceiptData | null = null;

  readonly paymentMethods: CollectPaymentMethod[] = ['Cash', 'GCash', 'Maya', 'BankTransfer'];

  ngOnInit(): void {
    this.loadQueue();
    void this.realtime.ensureConnected();
    this.realtime.events$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        if (
          ['DoctorCompletedConsultation', 'PaymentCompleted', 'PaymentWaived'].includes(event.eventName)
        ) {
          this.loadQueue();
        }
      });
  }

  previousPage(): void {
    if (this.currentPage <= 1 || this.isLoading) {
      return;
    }

    this.currentPage -= 1;
    this.loadQueue();
  }

  nextPage(): void {
    if (this.currentPage >= this.totalPages || this.isLoading) {
      return;
    }

    this.currentPage += 1;
    this.loadQueue();
  }

  openPaymentModal(item: StaffForPaymentItem): void {
    this.selectedItem = item;
    this.paymentModalOpen = true;
    this.paymentMethod = 'Cash';
    this.amountReceived = item.amountDue;
    this.referenceNumber = '';
    this.notes = '';
  }

  closePaymentModal(): void {
    this.paymentModalOpen = false;
    this.selectedItem = null;
    this.isSubmitting = false;
  }

  confirmPayment(): void {
    if (!this.selectedItem || this.isSubmitting) {
      return;
    }

    if (this.amountReceived < this.selectedItem.amountDue) {
      void this.presentToast('Amount received must be equal to or greater than the amount due.', 'warning');
      return;
    }

    const payload: ConfirmPaymentRequest = {
      paymentMethod: this.paymentMethod,
      amountReceived: this.amountReceived,
      referenceNumber: this.referenceNumber.trim(),
      notes: this.notes.trim()
    };

    this.isSubmitting = true;
    this.bookingService.confirmPayment(this.selectedItem.paymentId, payload).subscribe({
      next: async (receipt) => {
        this.receiptData = receipt;
        this.receiptModalOpen = true;
        this.closePaymentModal();
        this.loadQueue();
        await this.presentToast('Payment confirmed.', 'success');
      },
      error: async (error) => {
        this.isSubmitting = false;
        await this.presentToast(extractApiErrorMessage(error, 'Failed to confirm payment.'), 'danger');
      }
    });
  }

  servicesLabel(item: StaffForPaymentItem): string {
    if (item.serviceNames.length > 0) {
      return item.serviceNames.join(', ');
    }

    const names = item.services.map((service) => service.name).filter((name) => name.trim().length > 0);
    if (names.length > 0) {
      return names.join(', ');
    }

    return item.serviceName ?? 'Service';
  }

  private loadQueue(): void {
    this.isLoading = true;
    this.bookingService.getStaffForPayment(this.currentPage, this.pageSize).subscribe({
      next: (result: PagedResult<StaffForPaymentItem>) => {
        this.items = result.items;
        this.currentPage = result.page;
        this.pageSize = result.pageSize;
        this.totalPages = Math.max(1, Math.ceil(result.totalCount / result.pageSize));
        this.isLoading = false;
      },
      error: async (error) => {
        this.items = [];
        this.totalPages = 1;
        this.isLoading = false;
        await this.presentToast(extractApiErrorMessage(error, 'Failed to load payment queue.'), 'danger');
      }
    });
  }

  private async presentToast(
    message: string,
    color: 'success' | 'danger' | 'warning' = 'success'
  ): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2200,
      color,
      position: 'top'
    });
    await toast.present();
  }
}

function extractApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  }

  return fallback;
}
