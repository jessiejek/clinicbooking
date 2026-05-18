import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, OperatorFunction, distinctUntilChanged, map, timer } from 'rxjs';
import { PaymentMode, ProofType } from '../models';
import { BookingService } from './booking.service';

export interface BookingWizardState {
  currentStep: number;
  selectedDoctorId: string | null;
  selectedServiceId: string | null;
  selectedDate: string | null;
  selectedSlot: string | null;
  selectedSlotEnd: string | null;
  paymentMode: PaymentMode;
  proofType: ProofType | null;
  proofValue: string | null;
  bookingId: string | null;
  queueNumber: number | null;
  isLoading: boolean;
  error: string | null;
}

export const initialBookingWizardState: BookingWizardState = {
  currentStep: 1,
  selectedDoctorId: null,
  selectedServiceId: null,
  selectedDate: null,
  selectedSlot: null,
  selectedSlotEnd: null,
  paymentMode: 'Online',
  proofType: null,
  proofValue: null,
  bookingId: null,
  queueNumber: null,
  isLoading: false,
  error: null
};

@Injectable({ providedIn: 'root' })
export class BookingWizardService {
  private readonly bookingService = inject(BookingService);
  private readonly router = inject(Router);
  private readonly stateSubject = new BehaviorSubject<BookingWizardState>({
    ...initialBookingWizardState
  });

  readonly state$ = this.stateSubject.asObservable();
  readonly currentStep$ = this.state$.pipe(mapWizard((state) => state.currentStep));
  readonly isLoading$ = this.state$.pipe(mapWizard((state) => state.isLoading));
  readonly selectedDoctorId$ = this.state$.pipe(mapWizard((state) => state.selectedDoctorId));
  readonly selectedServiceId$ = this.state$.pipe(mapWizard((state) => state.selectedServiceId));
  readonly selectedDate$ = this.state$.pipe(mapWizard((state) => state.selectedDate));
  readonly selectedSlot$ = this.state$.pipe(mapWizard((state) => state.selectedSlot));

  get snapshot(): BookingWizardState {
    return this.stateSubject.value;
  }

  patchState(partial: Partial<BookingWizardState>): void {
    this.stateSubject.next({ ...this.stateSubject.value, ...partial });
  }

  selectDoctor(doctorId: string | null): void {
    this.patchState({
      selectedDoctorId: doctorId,
      selectedServiceId: null,
      selectedDate: null,
      selectedSlot: null,
      selectedSlotEnd: null
    });
  }

  selectService(serviceId: string | null): void {
    this.patchState({ selectedServiceId: serviceId });
  }

  selectDate(date: string | null): void {
    this.patchState({ selectedDate: date, selectedSlot: null, selectedSlotEnd: null });
  }

  selectSlot(slot: string | null, slotEnd: string | null): void {
    this.patchState({ selectedSlot: slot, selectedSlotEnd: slotEnd });
  }

  selectPaymentMode(paymentMode: PaymentMode): void {
    this.patchState({ paymentMode });
  }

  nextStep(): void {
    this.patchState({ currentStep: Math.min(this.snapshot.currentStep + 1, 7) });
  }

  prevStep(): void {
    this.patchState({ currentStep: Math.max(this.snapshot.currentStep - 1, 1) });
  }

  setStep(step: number): void {
    this.patchState({ currentStep: Math.min(Math.max(step, 1), 7) });
  }

  submitBooking(proofType: ProofType | null, proofValue: string | null): void {
    const state = this.snapshot;
    this.patchState({ proofType, proofValue, isLoading: true, error: null });

    timer(600).subscribe(() => {
      if (!state.selectedDoctorId || !state.selectedServiceId || !state.selectedDate || !state.selectedSlot) {
        this.patchState({ isLoading: false, error: 'Please complete all booking steps.' });
        return;
      }

      const bookingId = `BK-${Date.now()}`;
      const queueNumber = Math.floor(Math.random() * 8) + 2;
      this.bookingService.addBooking({
        id: bookingId,
        patientId: 'pat-1',
        doctorId: state.selectedDoctorId,
        serviceId: state.selectedServiceId,
        appointmentDate: state.selectedDate,
        slotStartTime: state.selectedSlot,
        slotEndTime: state.selectedSlotEnd ?? state.selectedSlot,
        status: proofType ? 'ProofSubmitted' : 'Pending',
        paymentStatus: 'Unpaid',
        paymentMode: state.paymentMode,
        queueNumber,
        totalFee: 0,
        consultationFeeSnapshot: 0,
        serviceFeeSnapshot: 0,
        isWalkIn: false,
        proofType: proofType ?? undefined,
        proofValue: proofValue ?? undefined,
        proofSubmittedAt: proofType ? new Date().toISOString() : undefined,
        createdAt: new Date().toISOString()
      });

      this.patchState({ bookingId, queueNumber, isLoading: false, error: null, currentStep: 7 });
      void this.router.navigate(['/public/booking-confirmation', bookingId]);
    });
  }

  reset(): void {
    this.stateSubject.next({ ...initialBookingWizardState });
  }
}

const mapWizard = <T>(project: (state: BookingWizardState) => T): OperatorFunction<BookingWizardState, T> =>
  (source) => source.pipe(map(project), distinctUntilChanged());
