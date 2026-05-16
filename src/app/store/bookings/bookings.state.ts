import { Booking } from '../../core/models';

export interface WizardState {
  currentStep: number;
  selectedDoctorId: string | null;
  selectedServiceId: string | null;
  selectedDate: string | null;
  selectedSlot: string | null;
  selectedSlotEnd: string | null;
  paymentMode: 'Online' | 'PayAtClinic';
  proofType: 'ReferenceNumber' | 'Screenshot' | null;
  proofValue: string | null;
  bookingId: string | null;
  queueNumber: number | null;
  isLoading: boolean;
  error: string | null;
}

export const initialWizardState: WizardState = {
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

export interface BookingsState {
  wizard: WizardState;
  bookings: Booking[];
  isLoading: boolean;
  error: string | null;
}

export const initialBookingsState: BookingsState = {
  wizard: initialWizardState,
  bookings: [],
  isLoading: false,
  error: null
};
