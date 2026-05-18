import { AsyncPipe, CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { informationCircleOutline } from 'ionicons/icons';
import { Booking, Doctor, Patient, Service, ReceiptData } from '../../../core/models';
import { BookingService } from '../../../core/services/booking.service';
import { DoctorStateService } from '../../../core/services/doctor-state.service';
import { MockDataService } from '../../../core/services/mock-data.service';
import { PatientStateService } from '../../../core/services/patient-state.service';
import { ClinicSettingsService } from '../../../core/services/clinic-settings.service';
import { AuthStateService } from '../../../core/services/auth-state.service';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ReceiptModalComponent } from '../../../shared/components/receipt-modal/receipt-modal.component';

type BookingAction =
  | 'confirm'
  | 'reject'
  | 'confirm-payment'
  | 'waive-pf'
  | 'mark-complete'
  | 'mark-no-show'
  | 'cancel'
  | 'reschedule';

@Component({
  selector: 'app-staff-booking-detail-page',
  standalone: true,
  imports: [
    AsyncPipe,
    CommonModule,
    NgFor,
    NgIf,
    IonIcon,
    AvatarComponent,
    ConfirmModalComponent,
    StatusBadgeComponent,
    ReceiptModalComponent
  ],
  template: `
    <section class="page-shell" *ngIf="!isLoading; else loadingTpl">
      <ng-container *ngIf="booking; else missingTpl">
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
            <div class="section-heading">Patient Info</div>
            <div class="profile-card">
              <app-avatar [name]="patientName" size="lg"></app-avatar>
              <div>
                <h3>{{ patientName }}</h3>
                <p>{{ patient?.patientCode }}</p>
                <p>{{ patient?.dateOfBirth }} - {{ patient?.contactNumber }}</p>
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
              <p><strong>Queue#:</strong> {{ booking.queueNumber ?? '-' }}</p>
              <p><strong>Service:</strong> {{ service?.name }}</p>
            </div>
            <div class="clinic-card">
              <div class="section-heading">Payment Info</div>
              <p><strong>Mode:</strong> {{ booking.paymentMode }}</p>
              <p><strong>Status:</strong> <app-status-badge [status]="booking.paymentStatus"></app-status-badge></p>
              <p><strong>Total Fee:</strong> &#8369;{{ booking.totalFee }}</p>
              <p><strong>Consultation:</strong> &#8369;{{ booking.consultationFeeSnapshot }}</p>
              <p><strong>Service:</strong> &#8369;{{ booking.serviceFeeSnapshot }}</p>
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
                <button
                  *ngIf="canMarkAsPaid(booking)"
                  class="btn-outline"
                  type="button"
                  (click)="openConfirm('confirm-payment')"
                >
                  Mark as Paid
                </button>
                <button
                  *ngIf="canWaivePf(booking)"
                  class="btn-ghost"
                  type="button"
                  (click)="openConfirm('waive-pf')"
                >
                  Waive PF
                </button>
                <button class="btn-danger" type="button" (click)="openConfirm('reject', true)">Reject Booking</button>
              </div>
              <div *ngSwitchCase="'ProofSubmitted'" class="action-stack">
                <button class="btn-primary" type="button" (click)="openConfirm('confirm-payment')">Confirm Payment</button>
                <button
                  *ngIf="canWaivePf(booking)"
                  class="btn-ghost"
                  type="button"
                  (click)="openConfirm('waive-pf')"
                >
                  Waive PF
                </button>
                <button class="btn-danger" type="button" (click)="openConfirm('reject', true)">Reject Proof</button>
              </div>
              <div *ngSwitchCase="'Confirmed'" class="action-stack">
                <button
                  *ngIf="canMarkAsPaid(booking)"
                  class="btn-outline"
                  type="button"
                  (click)="openConfirm('confirm-payment')"
                >
                  Mark as Paid
                </button>
                <button
                  *ngIf="canWaivePf(booking)"
                  class="btn-ghost"
                  type="button"
                  (click)="openConfirm('waive-pf')"
                >
                  Waive PF
                </button>
                <button class="btn-primary" type="button" (click)="openConfirm('mark-complete')">Mark Complete</button>
                <button class="btn-ghost" type="button" (click)="openConfirm('mark-no-show')">Mark No Show</button>
                <button class="btn-outline" type="button" (click)="reschedule()">Reschedule</button>
                <button class="btn-danger" type="button" (click)="openConfirm('cancel', true)">Cancel Booking</button>
              </div>
              <div *ngSwitchCase="'Completed'" class="action-stack">
                <button class="btn-primary" type="button" (click)="openReceipt(booking)">Print Receipt</button>
              </div>
              <div *ngSwitchDefault class="action-stack">
                <button class="btn-ghost" type="button" disabled>No actions available</button>
              </div>
            </ng-container>

            <div class="banner banner--info staff-disclaimer">
              <ion-icon name="information-circle-outline"></ion-icon>
              <span>Payment waiver and refund require Admin access.</span>
            </div>
          </div>
        </aside>
      </div>
      </ng-container>
    </section>

    <ng-template #loadingTpl>
      <section class="page-shell">
        <div class="clinic-card">
          <p>Loading booking details...</p>
        </div>
      </section>
    </ng-template>

    <ng-template #missingTpl>
      <section class="page-shell">
        <div class="clinic-card">
          <p>Booking not found.</p>
        </div>
      </section>
    </ng-template>

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
    <app-receipt-modal [isOpen]="receiptModalOpen" [data]="receiptData" (closed)="receiptModalOpen = false"></app-receipt-modal>
  `,
  styleUrl: './staff-booking-detail.page.scss'
})
export class StaffBookingDetailPage implements OnInit {
  private readonly bookingService = inject(BookingService);
  private readonly doctorState = inject(DoctorStateService);
  private readonly patientState = inject(PatientStateService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly mockData = inject(MockDataService);
  private readonly clinicSettings = inject(ClinicSettingsService);
  private readonly authState = inject(AuthStateService);

  booking: Booking | null = null;
  doctor: Doctor | null = null;
  patient: Patient | null = null;
  service: Service | null = null;
  doctors: Doctor[] = [];
  patients: Patient[] = [];
  bookingsLoading = false;
  doctorsLoading = false;
  patientsLoading = false;
  confirmOpen = false;
  pendingAction: BookingAction | null = null;
  modalReasonRequired = false;
  modalDanger = false;
  modalTitle = 'Confirm Action';
  modalMessage = 'Are you sure?';
  modalConfirmLabel = 'Confirm';
  receiptModalOpen = false;
  receiptData: ReceiptData | null = null;

  get isLoading(): boolean {
    return this.bookingsLoading || this.doctorsLoading || this.patientsLoading;
  }

  constructor() {
    addIcons({ informationCircleOutline });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.bookingService.getBookingById$(id).subscribe((booking) => {
      this.booking = booking ?? null;
      this.syncDetails();
      this.service = booking ? this.mockData.getServiceById(booking.serviceId) ?? null : null;
    });

    this.doctorState.getDoctors().subscribe((doctors) => {
      this.doctors = doctors;
      this.syncDetails();
    });
    this.patientState.getPatients().subscribe((patients) => {
      this.patients = patients;
      this.syncDetails();
    });
    this.bookingService.isLoading$.subscribe((loading) => {
      this.bookingsLoading = loading;
    });
    this.doctorState.isLoading$.subscribe((loading) => {
      this.doctorsLoading = loading;
    });
    this.patientState.isLoading$.subscribe((loading) => {
      this.patientsLoading = loading;
    });
  }

  get patientName(): string {
    return this.patient ? `${this.patient.firstName} ${this.patient.lastName}` : 'Unknown Patient';
  }

  canMarkAsPaid(booking: Booking): boolean {
    return (
      booking.paymentStatus === 'Unpaid' &&
      !['Cancelled', 'NoShow', 'Expired'].includes(booking.status)
    );
  }

  canWaivePf(booking: Booking): boolean {
    return this.canMarkAsPaid(booking);
  }

  goBack(): void {
    void this.router.navigate(['/staff/bookings']);
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
      'waive-pf': 'Waive the professional fee for this booking?',
      'mark-complete': 'Mark this visit as completed?',
      'mark-no-show': 'Mark the patient as no-show?',
      cancel: 'Cancel this booking?',
      reschedule: 'Open the walk-in flow to reschedule this booking?'
    };
    this.modalTitle = 'Confirm Action';
    this.modalMessage = messages[action];
    this.confirmOpen = true;
  }

  runAction(reason?: string): void {
    if (!this.booking || !this.pendingAction) {
      return;
    }

    const bookingId = this.booking.id;
    switch (this.pendingAction) {
      case 'confirm':
        this.bookingService.confirmBooking(bookingId);
        break;
      case 'reject':
        this.bookingService.rejectBooking(bookingId, reason ?? 'Rejected by staff.');
        break;
      case 'confirm-payment':
        this.bookingService.confirmPayment(bookingId);
        break;
      case 'waive-pf':
        this.bookingService.waivePayment(bookingId, reason ?? 'Professional fee waived by staff.');
        break;
      case 'mark-complete':
        this.bookingService.markComplete(bookingId);
        break;
      case 'mark-no-show':
        this.bookingService.markNoShow(bookingId);
        break;
      case 'cancel':
        this.bookingService.cancelBooking(bookingId, reason ?? 'Cancelled by staff.');
        break;
      case 'reschedule':
        this.reschedule();
        break;
    }
    this.confirmOpen = false;
  }

  reschedule(): void {
    if (!this.booking) {
      return;
    }
    void this.router.navigate(['/staff/walk-in'], { queryParams: { rescheduling: this.booking.id } });
  }

  private syncDetails(): void {
    const booking = this.booking;
    if (!booking) {
      this.doctor = null;
      this.patient = null;
      return;
    }

    this.doctor =
      this.doctors.find((doctor) => doctor.id === booking.doctorId) ??
      this.mockData.getDoctorById(booking.doctorId) ??
      null;
    this.patient =
      this.patients.find((patient) => patient.id === booking.patientId) ??
      this.mockData.getPatientById(booking.patientId) ??
      null;
  }
  openReceipt(booking: Booking): void {
    this.receiptData = this.buildReceiptData(booking);
    this.receiptModalOpen = true;
  }

  private buildReceiptData(booking: Booking): ReceiptData {
    const patient = this.mockData.getPatients().find((p) => p.id === booking.patientId);
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
      printedBy: currentUser?.fullName ?? 'System',
      printedAt: new Date().toLocaleDateString('en-PH', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      })
    };
  }
}
