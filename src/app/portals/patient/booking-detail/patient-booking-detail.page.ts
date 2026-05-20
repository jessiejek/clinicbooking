import { AsyncPipe, DatePipe, NgIf } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonModal, ToastController } from '@ionic/angular/standalone';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, combineLatest, of, switchMap } from 'rxjs';
import { Booking, Doctor, Patient, ProofType, Service, ReceiptData } from '../../../core/models';
import { AuthStateService } from '../../../core/services/auth-state.service';
import { BookingService } from '../../../core/services/booking.service';
import { MockDataService } from '../../../core/services/mock-data.service';
import { ClinicSettingsService } from '../../../core/services/clinic-settings.service';
import { BannerComponent } from '../../../shared/components/banner/banner.component';
import { BookingTimelineComponent } from '../components/booking-timeline/booking-timeline.component';
import { ProofSubmissionFormComponent } from '../components/proof-submission-form/proof-submission-form.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { BookingTimerComponent } from '../../../shared/components/booking-timer/booking-timer.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { ReceiptModalComponent } from '../../../shared/components/receipt-modal/receipt-modal.component';
import { PatientService } from '../services/patient.service';

@Component({
  selector: 'app-patient-booking-detail-page',
  standalone: true,
  imports: [
    AsyncPipe,
    DatePipe,
    NgIf,
    BannerComponent,
    BookingTimelineComponent,
    ProofSubmissionFormComponent,
    ConfirmModalComponent,
    BookingTimerComponent,
    StatusBadgeComponent,
    EmptyStateComponent,
    AvatarComponent,
    IonModal,
    ReceiptModalComponent
  ],
  template: `
    <section class="page-shell" *ngIf="booking; else emptyTpl">
      <div class="page-shell__header">
        <div>
          <button type="button" class="btn-ghost" (click)="back()">Back to Bookings</button>
          <h2 class="page-title">Booking Detail</h2>
          <p class="page-subtitle data-mono">{{ booking.id }}</p>
        </div>
      </div>

      <div class="booking-detail-grid">
        <div class="booking-detail-main">
          <div class="clinic-card booking-summary">
            <div class="booking-summary__top">
              <div>
                <div class="section-heading">Summary</div>
                <h3>{{ serviceDisplayName }}</h3>
                <p>{{ doctorDisplayName }}</p>
              </div>
              <div class="booking-summary__badges">
                <app-status-badge [status]="booking.status"></app-status-badge>
                <app-status-badge [status]="booking.paymentStatus"></app-status-badge>
              </div>
            </div>

            <div class="summary-grid">
              <div><span>Appointment Date</span><strong>{{ booking.appointmentDate | date : 'EEEE, MMMM d, y' }}</strong></div>
              <div><span>Time</span><strong>{{ timeRangeLabel }}</strong></div>
              <div><span>Queue Number</span><strong>{{ booking.queueNumber !== null ? '#' + booking.queueNumber : 'Not assigned' }}</strong></div>
              <div><span>Payment Mode</span><strong>{{ booking.paymentMode }}</strong></div>
              <div><span>Total Fee</span><strong>PHP {{ booking.totalFee }}</strong></div>
              <div><span>Created</span><strong>{{ booking.createdAt | date : 'MMM d, y h:mm a' }}</strong></div>
            </div>

            <app-booking-timer *ngIf="showBookingTimer" [durationSeconds]="proofTimerSeconds"></app-booking-timer>
          </div>

          <app-booking-timeline [booking]="booking"></app-booking-timeline>

          <div class="clinic-card payment-panel">
            <div class="section-heading">Payment Details</div>
            <div class="summary-grid summary-grid--compact">
              <div><span>Payment Status</span><strong>{{ booking.paymentStatus }}</strong></div>
              <div><span>Proof Type</span><strong>{{ booking.proofType || 'None' }}</strong></div>
              <div><span>Proof Submitted</span><strong>{{ booking.proofSubmittedAt ? (booking.proofSubmittedAt | date : 'MMM d, y h:mm a') : 'Not yet submitted' }}</strong></div>
            </div>
          </div>

          <div class="clinic-card" *ngIf="booking.status === 'Completed'">
            <div class="section-heading">Official Receipt</div>
            <p>Your payment has been processed and your official receipt is available.</p>
            <button type="button" class="btn-primary" (click)="openReceipt()">View Receipt</button>
          </div>

          <app-proof-submission-form
            *ngIf="canSubmitProof"
            [booking]="booking"
            (proofSubmitted)="handleProofSubmitted($event.bookingId, $event.proofType, $event.proofValue)"
          ></app-proof-submission-form>

          <div class="clinic-card" *ngIf="!canSubmitProof && booking.paymentMode === 'Online' && booking.status === 'ProofSubmitted'">
            <app-banner variant="info" message="Your proof has been submitted and is waiting for review."></app-banner>
          </div>

          <div class="clinic-card" *ngIf="canLeaveReview">
            <div class="section-heading">Review Your Visit</div>
            <p>Share feedback about your completed appointment.</p>
            <button type="button" class="btn-outline" (click)="leaveReview()">Leave Review</button>
          </div>

          <div class="clinic-card cancellation-panel" *ngIf="canCancelOnline; else cannotCancelTpl">
            <div class="section-heading">Cancellation</div>
            <p>This booking can still be cancelled online.</p>
            <button type="button" class="btn-danger" (click)="openCancelModal()">Cancel Booking</button>
          </div>
          <ng-template #cannotCancelTpl>
            <app-banner
              variant="danger"
              message="This booking can no longer be cancelled online. Please contact the clinic."
            ></app-banner>
          </ng-template>
        </div>

        <div class="booking-detail-side">
          <div class="clinic-card">
            <div class="section-heading">Doctor Info</div>
            <div class="side-profile">
              <app-avatar [name]="doctorDisplayName" size="lg"></app-avatar>
              <div>
                <h3>{{ doctorDisplayName }}</h3>
                <p>{{ doctor?.specialization || 'Specialization' }}</p>
              </div>
            </div>
          </div>

          <div class="clinic-card">
            <div class="section-heading">Service Info</div>
            <p class="detail-copy">{{ service?.description || 'Clinic service description not available.' }}</p>
            <div class="detail-meta">
              <div><span>Estimated Duration</span><strong>{{ service?.estimatedDurationMinutes || 0 }} mins</strong></div>
              <div><span>Price</span><strong>PHP {{ service?.price || 0 }}</strong></div>
            </div>
          </div>
        </div>
      </div>

      <app-confirm-modal
        [isOpen]="cancelModalOpen"
        title="Cancel Booking"
        message="Confirm cancellation for this appointment?"
        confirmLabel="Cancel Booking"
        cancelLabel="Keep Booking"
        [isDanger]="true"
        (confirmed)="confirmCancel()"
        (cancelled)="cancelModalOpen = false"
      ></app-confirm-modal>
      <app-receipt-modal [isOpen]="receiptModalOpen" [data]="receiptData" (closed)="receiptModalOpen = false"></app-receipt-modal>
    </section>

    <ng-template #emptyTpl>
      <app-empty-state
        icon="calendar-outline"
        title="Booking not found"
        description="We could not load this booking or it does not belong to your account."
        ctaLabel="Back to Bookings"
        ctaRoute="/patient/bookings"
      ></app-empty-state>
    </ng-template>
  `,
  styleUrl: './patient-booking-detail.page.scss'
})
export class PatientBookingDetailPage implements OnInit {
  private readonly authState = inject(AuthStateService);
  private readonly bookingService = inject(BookingService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly mockData = inject(MockDataService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toastCtrl = inject(ToastController);
  private readonly clinicSettings = inject(ClinicSettingsService);
  private readonly patientService = inject(PatientService);


  receiptModalOpen = false;
  receiptData: ReceiptData | null = null;

  booking: Booking | null = null;
  doctor: Doctor | undefined;
  service: Service | undefined;
  currentPatient: Patient | null = null;
  cancelModalOpen = false;

  get canSubmitProof(): boolean {
    return !!this.booking && this.booking.paymentMode === 'Online' && ['Pending', 'OnHold'].includes(this.booking.status) && this.booking.paymentStatus === 'Unpaid';
  }

  get proofTimerSeconds(): number {
    if (!this.booking) {
      return 0;
    }
    const deadline = new Date(this.booking.createdAt);
    deadline.setHours(deadline.getHours() + 24);
    return Math.max(0, Math.floor((deadline.getTime() - Date.now()) / 1000));
  }

  get showBookingTimer(): boolean {
    return this.canSubmitProof && this.proofTimerSeconds > 0;
  }

  get canCancelOnline(): boolean {
    if (!this.booking || ['Cancelled', 'Completed', 'NoShow', 'Expired'].includes(this.booking.status)) {
      return false;
    }
    const appointmentDateTime = new Date(`${this.booking.appointmentDate}T${this.booking.slotStartTime}:00`);
    const cancellationWindow = this.mockData.getClinicSettings().cancellationDeadlineHours * 3600000;
    return appointmentDateTime.getTime() - Date.now() > cancellationWindow;
  }

  get canLeaveReview(): boolean {
    return !!this.booking && this.booking.status === 'Completed' && !this.mockData.getReviews().some((review) => review.bookingId === this.booking?.id);
  }

  get doctorDisplayName(): string {
    return this.booking?.doctorName?.trim() || this.doctor?.fullName?.trim() || 'Doctor';
  }

  get serviceDisplayName(): string {
    return this.booking?.serviceName?.trim() || this.service?.name?.trim() || 'Service';
  }

  get timeRangeLabel(): string {
    if (!this.booking) {
      return 'Time not available';
    }

    return this.timeRangeLabelFor(this.booking);
  }

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const bookingId = params.get('id') ?? '';
          return combineLatest([
            this.patientService.getMyProfile().pipe(catchError(() => of(undefined))),
            this.bookingService.getBookingById$(bookingId)
          ]);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(([patient, booking]) => {
        this.currentPatient = patient ?? null;

        if (!booking || !this.currentPatient || (booking.patientId && booking.patientId !== this.currentPatient.id)) {
          this.booking = null;
          this.doctor = undefined;
          this.service = undefined;
          return;
        }

        this.booking = booking;
        this.doctor = this.mockData.getDoctorById(booking.doctorId);
        this.service = this.mockData.getServiceById(booking.serviceId);
      });
  }

  handleProofSubmitted(bookingId: string, proofType: ProofType, proofValue: string): void {
    if (!this.booking || this.booking.id !== bookingId) {
      return;
    }

    this.bookingService.submitBookingProof(bookingId, proofType, proofValue);
    this.booking = {
      ...this.booking,
      status: 'ProofSubmitted',
      proofType,
      proofValue,
      proofSubmittedAt: new Date().toISOString()
    };
    void this.presentToast('Payment proof submitted for review.');
  }

  openCancelModal(): void {
    if (!this.canCancelOnline) {
      return;
    }
    this.cancelModalOpen = true;
  }

  confirmCancel(): void {
    if (!this.booking) {
      return;
    }

    this.bookingService.cancelBooking(this.booking.id, 'Cancelled by patient.');
    this.booking = {
      ...this.booking,
      status: 'Cancelled',
      cancellationReason: 'Cancelled by patient.'
    };
    this.cancelModalOpen = false;
    void this.presentToast('Booking cancelled.');
  }

  back(): void {
    void this.router.navigate(['/patient/bookings']);
  }

  leaveReview(): void {
    if (!this.booking) {
      return;
    }
    void this.router.navigate(['/patient/reviews', this.booking.id]);
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
  openReceipt(): void {
    if (!this.booking) {
      return;
    }
    const receipt = this.buildReceiptData(this.booking);
    this.receiptData = {
      ...receipt,
      patientName:
        this.booking.patientName?.trim() ||
        (this.currentPatient ? `${this.currentPatient.firstName} ${this.currentPatient.lastName}` : receipt.patientName),
      patientCode: this.currentPatient?.patientCode ?? receipt.patientCode,
      doctorName: this.booking.doctorName?.trim() || this.doctor?.fullName?.trim() || receipt.doctorName,
      serviceName: this.booking.serviceName?.trim() || this.service?.name?.trim() || receipt.serviceName,
      slotTime: this.timeRangeLabelFor(this.booking)
    };
    this.receiptModalOpen = true;
  }

  private buildReceiptData(booking: Booking): ReceiptData {
    const patient =
      this.currentPatient && this.currentPatient.id === booking.patientId
        ? this.currentPatient
        : this.mockData.getPatients().find((p) => p.id === booking.patientId);
    const doctor = this.mockData.getDoctors().find((d) => d.id === booking.doctorId);
    const service = this.mockData.getServices().find((s) => s.id === booking.serviceId);
    const settings = this.clinicSettings.load();
    const currentUser = this.authState.snapshot;

    return {
      orNumber: booking.orNumber ?? '—',
      clinicName: settings.clinicName,
      clinicAddress: settings.address ?? '',
      clinicPhone: settings.phone ?? '',
      clinicEmail: settings.email ?? '',
      patientName: patient ? `${patient.firstName} ${patient.lastName}` : '—',
      patientCode: patient?.patientCode ?? '—',
      doctorName: doctor?.fullName ?? '—',
      serviceName: service?.name ?? '—',
      appointmentDate: new Date(booking.appointmentDate).toLocaleDateString('en-PH', {
        year: 'numeric', month: 'long', day: 'numeric'
      }),
      slotTime: booking.slotStartTime,
      queueNumber: booking.queueNumber,
      consultationFee: booking.consultationFeeSnapshot,
      serviceFee: booking.serviceFeeSnapshot,
      totalFee: booking.totalFee,
      paymentMethod: booking.paymentMode === 'PayAtClinic' ? 'Pay at Clinic' : 'Online',
      paymentStatus: booking.paymentStatus,
      waivedReason: undefined,
      isWalkIn: booking.isWalkIn,
      printedBy: currentUser?.fullName ?? 'Patient',
      printedAt: new Date().toLocaleDateString('en-PH', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      })
    };
  }

  private timeRangeLabelFor(booking: Booking): string {
    const start = booking.slotStartTime?.trim() ?? '';
    const end = booking.slotEndTime?.trim() ?? '';

    if (!start) {
      return 'Time not available';
    }

    if (!end || end === start) {
      return start;
    }

    return `${start} - ${end}`;
  }
}
