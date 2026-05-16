import { AsyncPipe, CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
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
  rescheduleBooking,
  waivedPayment
} from '../../../store/bookings/bookings.actions';
import { selectBookingById } from '../../../store/bookings/bookings.selectors';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

type BookingAction =
  | 'confirm'
  | 'reject'
  | 'confirm-payment'
  | 'mark-complete'
  | 'mark-no-show'
  | 'cancel'
  | 'waive'
  | 'refund';

@Component({
  selector: 'app-admin-booking-detail-page',
  standalone: true,
  imports: [AsyncPipe, CommonModule, NgFor, NgIf, AvatarComponent, ConfirmModalComponent, StatusBadgeComponent],
  template: `
    <section class="page-shell" *ngIf="booking">
      <div class="page-shell__header">
        <div>
          <button type="button" class="btn-ghost" (click)="goBack()">← Back to Bookings</button>
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
              <div *ngFor="let step of timelineSteps" class="timeline__step" [class.is-active]="isStepActive(step)" [class.is-complete]="isStepComplete(step)">
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
              <p><strong>Status:</strong> <app-status-badge [status]="booking.paymentStatus"></app-status-badge></p>
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
                <button class="btn-ghost" type="button" (click)="openConfirm('waive', true)">Waive Payment</button>
                <button class="btn-ghost" type="button" (click)="openConfirm('refund', true)">Refund Payment</button>
              </div>
              <div *ngSwitchDefault class="action-stack">
                <button class="btn-ghost" type="button" disabled>No actions available</button>
              </div>
            </ng-container>
          </div>
        </aside>
      </div>
    </section>

    <app-confirm-modal
      [isOpen]="confirmOpen"
      [title]="modalTitle"
      [message]="modalMessage"
      [confirmLabel]="modalConfirmLabel"
      [isDanger]="modalDanger"
      [requireReason]="modalReasonRequired"
      (confirmed)="runAction($event)"
      (cancelled)="confirmOpen = false"
    ></app-confirm-modal>
  `,
  styleUrl: './booking-detail.page.scss'
})
export class BookingDetailPage implements OnInit {
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly mockData = inject(MockDataService);

  booking: Booking | null = null;
  doctor: Doctor | null = null;
  patient: Patient | null = null;
  service: Service | null = null;
  timelineSteps = ['Pending', 'Proof Submitted', 'Confirmed', 'Completed'];
  confirmOpen = false;
  pendingAction: BookingAction | null = null;
  modalReasonRequired = false;
  modalDanger = false;
  modalTitle = 'Confirm Action';
  modalMessage = 'Are you sure?';
  modalConfirmLabel = 'Confirm';
  reason = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
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
    this.modalDanger = reasonRequired || action === 'reject' || action === 'cancel' || action === 'refund';
    this.modalConfirmLabel = this.modalDanger ? 'Proceed' : 'Confirm';
    const messages: Record<BookingAction, string> = {
      confirm: 'Confirm this booking?',
      reject: 'Reject this booking?',
      'confirm-payment': 'Confirm that the payment is valid?',
      'mark-complete': 'Mark this visit as completed?',
      'mark-no-show': 'Mark the patient as no-show?',
      cancel: 'Cancel this booking?',
      waive: 'Waive the outstanding payment?',
      refund: 'Refund the payment?'
    };
    this.modalTitle = 'Confirm Action';
    this.modalMessage = messages[action];
    this.confirmOpen = true;
  }

  runAction(reason?: string): void {
    if (!this.booking || !this.pendingAction) {
      return;
    }
    this.reason = reason ?? '';
    const bookingId = this.booking.id;
    switch (this.pendingAction) {
      case 'confirm':
        this.store.dispatch(confirmBooking({ bookingId }));
        break;
      case 'reject':
        this.store.dispatch(rejectBooking({ bookingId, reason: reason ?? 'Rejected by admin.' }));
        break;
      case 'confirm-payment':
        this.store.dispatch(confirmPayment({ bookingId }));
        break;
      case 'mark-complete':
        this.store.dispatch(markComplete({ bookingId }));
        break;
      case 'mark-no-show':
        this.store.dispatch(markNoShow({ bookingId }));
        break;
      case 'cancel':
        this.store.dispatch(cancelBooking({ bookingId, reason: reason ?? 'Cancelled by admin.' }));
        break;
      case 'waive':
        this.store.dispatch(waivedPayment({ bookingId, reason: reason ?? 'Payment waived by admin.' }));
        break;
      case 'refund':
        this.store.dispatch(refundPayment({ bookingId, reason: reason ?? 'Refund processed by admin.' }));
        break;
    }
    this.confirmOpen = false;
  }

  reschedule(): void {
    if (!this.booking) {
      return;
    }
    void this.router.navigate(['/admin/walk-in'], { queryParams: { rescheduling: this.booking.id } });
  }

  soon(): void {
    window.alert('PDF generation coming soon');
  }
}
