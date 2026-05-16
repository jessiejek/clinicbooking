import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ToastController } from '@ionic/angular/standalone';
import { Booking, Doctor, Patient, Service } from '../../../core/models';
import { MockDataService } from '../../../core/services/mock-data.service';
import {
  cancelBooking,
  confirmBooking,
  confirmPayment,
  markComplete,
  markNoShow,
  rejectBooking,
  refundPayment,
  waivedPayment
} from '../../../store/bookings/bookings.actions';
import { selectBookingById, selectBookingsLoading } from '../../../store/bookings/bookings.selectors';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { RefundPaymentModalComponent } from '../components/refund-payment-modal/refund-payment-modal.component';
import { WaivePaymentModalComponent } from '../components/waive-payment-modal/waive-payment-modal.component';

type BookingAction =
  | 'confirm'
  | 'reject'
  | 'confirm-payment'
  | 'mark-complete'
  | 'mark-no-show'
  | 'cancel';

@Component({
  selector: 'app-admin-booking-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    NgFor,
    NgIf,
    AvatarComponent,
    ConfirmModalComponent,
    EmptyStateComponent,
    SkeletonComponent,
    StatusBadgeComponent,
    WaivePaymentModalComponent,
    RefundPaymentModalComponent
  ],
  template: `
    <section class="page-shell" *ngIf="isLoading; else loadedTpl">
      <app-skeleton variant="card" [count]="3"></app-skeleton>
    </section>

    <ng-template #loadedTpl>
      <section class="page-shell" *ngIf="booking; else emptyTpl">
      <div class="page-shell__header">
        <div>
          <button type="button" class="btn-ghost" (click)="goBack()">Back to Bookings</button>
          <h2 class="page-title">Booking Details</h2>
          <div class="page-subtitle data-mono">{{ booking.id }}</div>
        </div>
        <app-status-badge [status]="booking.status"></app-status-badge>
      </div>

      <div class="detail-grid">
        <div class="detail-grid__main">
          <div class="clinic-card">
            <div class="section-heading">Status Timeline</div>
            <div class="timeline">
              <div
                *ngFor="let step of timelineSteps"
                class="timeline__step"
                [class.is-active]="isStepActive(step)"
                [class.is-complete]="isStepComplete(step)"
              >
                <span class="timeline__dot"></span>
                <span>{{ step }}</span>
              </div>
            </div>
          </div>

          <div class="clinic-card">
            <div class="section-heading">Patient Info</div>
            <div class="profile-card">
              <app-avatar [name]="patientName" size="lg"></app-avatar>
              <div>
                <h3>{{ patientName }}</h3>
                <p>{{ patient?.patientCode }}</p>
                <p>{{ patient?.dateOfBirth }} · {{ patient?.contactNumber }}</p>
                <p>{{ patient?.email }}</p>
              </div>
            </div>
          </div>

          <div class="clinic-card">
            <div class="section-heading">Doctor Info</div>
            <div class="profile-card">
              <app-avatar [name]="doctor?.fullName || 'Doctor'" size="lg"></app-avatar>
              <div>
                <h3>{{ doctor?.fullName }}</h3>
                <p>{{ doctor?.specialization }}</p>
              </div>
            </div>
          </div>

          <div class="detail-card-grid">
            <div class="clinic-card">
              <div class="section-heading">Appointment Details</div>
              <p><strong>Date:</strong> {{ booking.appointmentDate }}</p>
              <p><strong>Time:</strong> {{ booking.slotStartTime }} - {{ booking.slotEndTime }}</p>
              <p><strong>Queue#:</strong> {{ booking.queueNumber ?? '—' }}</p>
              <p><strong>Service:</strong> {{ service?.name }}</p>
            </div>
            <div class="clinic-card">
              <div class="section-heading">Payment Info</div>
              <p><strong>Mode:</strong> {{ booking.paymentMode }}</p>
              <p>
                <strong>Status:</strong>
                <app-status-badge [status]="booking.paymentStatus"></app-status-badge>
              </p>
              <p><strong>Total Fee:</strong> ₱{{ booking.totalFee }}</p>
              <p><strong>Consultation:</strong> ₱{{ booking.consultationFeeSnapshot }}</p>
              <p><strong>Service:</strong> ₱{{ booking.serviceFeeSnapshot }}</p>
              <p *ngIf="booking.proofType === 'ReferenceNumber'">Proof: {{ booking.proofValue }}</p>
              <p *ngIf="booking.proofType === 'Screenshot'">Screenshot: {{ booking.proofValue }}</p>
            </div>
          </div>
        </div>

        <aside class="detail-grid__side">
          <div class="clinic-card action-sidebar">
            <div class="section-heading">Actions</div>

            <ng-container [ngSwitch]="booking.status">
              <div *ngSwitchCase="'Pending'" class="action-stack">
                <button class="btn-primary" type="button" (click)="openConfirm('confirm')">Confirm Booking</button>
                <button class="btn-danger" type="button" (click)="openConfirm('reject', true)">Reject Booking</button>
              </div>

              <div *ngSwitchCase="'ProofSubmitted'" class="action-stack">
                <button class="btn-primary" type="button" (click)="openConfirm('confirm-payment')">Confirm Payment</button>
                <button class="btn-danger" type="button" (click)="openConfirm('reject', true)">Reject Proof</button>
              </div>

              <div *ngSwitchCase="'Confirmed'" class="action-stack">
                <button class="btn-primary" type="button" (click)="openConfirm('mark-complete')">Mark Complete</button>
                <button class="btn-ghost" type="button" (click)="openConfirm('mark-no-show')">Mark No Show</button>
                <button class="btn-outline" type="button" (click)="reschedule()">Reschedule</button>
                <button class="btn-danger" type="button" (click)="openConfirm('cancel', true)">Cancel Booking</button>
              </div>

              <div *ngSwitchCase="'Completed'" class="action-stack">
                <button class="btn-outline" type="button" disabled (click)="soon()">Download Receipt</button>
                <button class="btn-outline" type="button" disabled (click)="soon()">Download Visit Summary</button>
              </div>

              <div *ngSwitchDefault class="action-stack">
                <button class="btn-ghost" type="button" disabled>No actions available</button>
              </div>
            </ng-container>

            <div class="action-stack payment-actions" *ngIf="canWaive || canRefund">
              <button *ngIf="canWaive" class="btn-ghost" type="button" (click)="waiveModalOpen = true">
                Waive Payment
              </button>
              <button *ngIf="canRefund" class="btn-ghost" type="button" (click)="refundModalOpen = true">
                Refund Payment
              </button>
            </div>
          </div>
        </aside>
      </div>
    </section>
    </ng-template>

    <ng-template #emptyTpl>
      <app-empty-state
        icon="calendar-outline"
        title="Booking not found"
        description="We could not load this booking record."
        ctaLabel="Back to Bookings"
        ctaRoute="/admin/bookings"
      ></app-empty-state>
    </ng-template>

    <app-confirm-modal
      [isOpen]="confirmOpen"
      [title]="modalTitle"
      [message]="modalMessage"
      [confirmLabel]="modalConfirmLabel"
      [isDanger]="modalDanger"
      [requireReason]="modalReasonRequired"
      (confirmed)="runAction($event)"
      (cancelled)="closeConfirmModal()"
    ></app-confirm-modal>

    <app-waive-payment-modal
      *ngIf="booking"
      [booking]="booking"
      [isOpen]="waiveModalOpen"
      (confirmed)="waivePayment($event.bookingId, $event.reason)"
      (cancelled)="waiveModalOpen = false"
    ></app-waive-payment-modal>

    <app-refund-payment-modal
      *ngIf="booking"
      [booking]="booking"
      [isOpen]="refundModalOpen"
      (confirmed)="refundPaymentAction($event.bookingId, $event.reason)"
      (cancelled)="refundModalOpen = false"
    ></app-refund-payment-modal>
  `,
  styleUrl: './booking-detail.page.scss'
})
export class BookingDetailPage implements OnInit {
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly mockData = inject(MockDataService);
  private readonly toastCtrl = inject(ToastController);

  booking: Booking | null = null;
  doctor: Doctor | null = null;
  patient: Patient | null = null;
  service: Service | null = null;
  timelineSteps = ['Pending', 'Proof Submitted', 'Confirmed', 'Completed'];
  isLoading = true;
  confirmOpen = false;
  waiveModalOpen = false;
  refundModalOpen = false;
  pendingAction: BookingAction | null = null;
  modalReasonRequired = false;
  modalDanger = false;
  modalTitle = 'Confirm Action';
  modalMessage = 'Are you sure?';
  modalConfirmLabel = 'Confirm';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.store.select(selectBookingsLoading).subscribe((loading) => (this.isLoading = loading));
    this.store.select(selectBookingById(id)).subscribe((booking) => {
      this.booking = booking ?? null;
      this.doctor = booking ? this.mockData.getDoctorById(booking.doctorId) ?? null : null;
      this.patient = booking ? this.mockData.getPatientById(booking.patientId) ?? null : null;
      this.service = booking ? this.mockData.getServiceById(booking.serviceId) ?? null : null;
    });
  }

  get patientName(): string {
    return this.patient ? `${this.patient.firstName} ${this.patient.lastName}` : 'Unknown Patient';
  }

  get canWaive(): boolean {
    return !!this.booking && this.booking.paymentStatus === 'Unpaid';
  }

  get canRefund(): boolean {
    return !!this.booking && this.booking.paymentStatus === 'Paid';
  }

  goBack(): void {
    void this.router.navigate(['/admin/bookings']);
  }

  isStepActive(step: string): boolean {
    const map: Record<string, Booking['status']> = {
      Pending: 'Pending',
      'Proof Submitted': 'ProofSubmitted',
      Confirmed: 'Confirmed',
      Completed: 'Completed'
    };
    return this.booking?.status === map[step];
  }

  isStepComplete(step: string): boolean {
    const order = ['Pending', 'Proof Submitted', 'Confirmed', 'Completed'];
    const current = order.findIndex((item) => this.isStepActive(item));
    return order.indexOf(step) < current;
  }

  openConfirm(action: BookingAction, reasonRequired = false): void {
    this.pendingAction = action;
    this.modalReasonRequired = reasonRequired;
    this.modalDanger = reasonRequired || action === 'reject' || action === 'cancel';
    this.modalConfirmLabel = this.modalDanger ? 'Proceed' : 'Confirm';
    const messages: Record<BookingAction, string> = {
      confirm: 'Confirm this booking?',
      reject: 'Reject this booking?',
      'confirm-payment': 'Confirm that the payment is valid?',
      'mark-complete': 'Mark this visit as completed?',
      'mark-no-show': 'Mark the patient as no-show?',
      cancel: 'Cancel this booking?'
    };
    this.modalTitle = 'Confirm Action';
    this.modalMessage = messages[action];
    this.confirmOpen = true;
  }

  closeConfirmModal(): void {
    this.confirmOpen = false;
    this.pendingAction = null;
  }

  runAction(reason?: string): void {
    if (!this.booking || !this.pendingAction) {
      return;
    }
    const bookingId = this.booking.id;
    switch (this.pendingAction) {
      case 'confirm':
        this.mockData.confirmBooking(bookingId);
        this.store.dispatch(confirmBooking({ bookingId }));
        this.addAuditLog('Booking', bookingId, 'Confirmed booking', reason);
        break;
      case 'reject':
        this.store.dispatch(rejectBooking({ bookingId, reason: reason ?? 'Rejected by admin.' }));
        this.mockData.cancelBooking(bookingId, reason ?? 'Rejected by admin.');
        this.addAuditLog('Booking', bookingId, 'Rejected booking', reason);
        break;
      case 'confirm-payment':
        this.mockData.confirmPayment(bookingId);
        this.store.dispatch(confirmPayment({ bookingId }));
        this.addAuditLog('Payment', bookingId, 'Confirmed payment', reason);
        break;
      case 'mark-complete':
        this.mockData.markComplete(bookingId);
        this.store.dispatch(markComplete({ bookingId }));
        this.addAuditLog('Booking', bookingId, 'Marked booking completed', reason);
        break;
      case 'mark-no-show':
        this.mockData.markNoShow(bookingId);
        this.store.dispatch(markNoShow({ bookingId }));
        this.addAuditLog('Booking', bookingId, 'Marked no-show', reason);
        break;
      case 'cancel':
        this.store.dispatch(cancelBooking({ bookingId, reason: reason ?? 'Cancelled by admin.' }));
        this.mockData.cancelBooking(bookingId, reason ?? 'Cancelled by admin.');
        this.addAuditLog('Booking', bookingId, 'Cancelled booking', reason);
        break;
    }
    this.closeConfirmModal();
    void this.presentToast('Action completed.');
  }

  waivePayment(bookingId: string, reason: string): void {
    const updated = this.mockData.waivePayment(bookingId, reason);
    if (updated) {
      this.store.dispatch(waivedPayment({ bookingId, reason }));
      this.addAuditLog('Payment', bookingId, 'Waived payment', reason);
      void this.presentToast('Payment waived.');
    }
    this.waiveModalOpen = false;
  }

  refundPaymentAction(bookingId: string, reason: string): void {
    const updated = this.mockData.refundPayment(bookingId, reason);
    if (updated) {
      this.store.dispatch(refundPayment({ bookingId, reason }));
      this.addAuditLog('Payment', bookingId, 'Refunded payment', reason);
      void this.presentToast('Payment refunded.');
    }
    this.refundModalOpen = false;
  }

  reschedule(): void {
    if (!this.booking) {
      return;
    }
    void this.router.navigate(['/admin/walk-in'], { queryParams: { rescheduling: this.booking.id } });
  }

  soon(): void {
    void this.presentToast('PDF download is mocked for demo mode.');
  }

  private addAuditLog(
    entityType: 'Booking' | 'Patient' | 'Doctor' | 'Payment' | 'Settings' | 'Consultation',
    entityId: string,
    action: string,
    reason?: string
  ): void {
    this.mockData.addAuditLog({
      entityType,
      entityId,
      action,
      performedBy: 'Dr. Grace E. Gavino',
      performedAt: new Date().toISOString(),
      details: reason
    });
  }

  private async presentToast(message: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2200,
      color: 'success',
      position: 'top'
    });
    await toast.present();
  }
}
