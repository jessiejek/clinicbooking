import { createReducer, on } from '@ngrx/store';
import { initialBookingsState, initialWizardState, WizardState } from './bookings.state';
import {
  addBooking,
  loadBookings,
  loadBookingsSuccess,
  nextStep,
  prevStep,
  resetWizard,
  selectDate,
  selectDoctor,
  selectService,
  selectSlot,
  setStep,
  submitBooking,
  submitBookingFailure,
  submitBookingSuccess,
  updateBookingStatus
} from './bookings.actions';

export const bookingsReducer = createReducer(
  initialBookingsState,
  on(loadBookings, (state) => ({ ...state, isLoading: true, error: null })),
  on(selectDoctor, (state, { doctorId }) => ({
    ...state,
    wizard: {
      ...state.wizard,
      selectedDoctorId: doctorId,
      selectedServiceId: null,
      selectedDate: null,
      selectedSlot: null,
      selectedSlotEnd: null
    }
  })),
  on(selectService, (state, { serviceId }) => ({
    ...state,
    wizard: {
      ...state.wizard,
      selectedServiceId: serviceId
    }
  })),
  on(selectDate, (state, { date }) => ({
    ...state,
    wizard: {
      ...state.wizard,
      selectedDate: date,
      selectedSlot: null,
      selectedSlotEnd: null
    }
  })),
  on(selectSlot, (state, { slot, slotEnd }) => ({
    ...state,
    wizard: {
      ...state.wizard,
      selectedSlot: slot,
      selectedSlotEnd: slotEnd
    }
  })),
  on(nextStep, (state) => ({
    ...state,
    wizard: {
      ...state.wizard,
      currentStep: Math.min(state.wizard.currentStep + 1, 7)
    }
  })),
  on(prevStep, (state) => ({
    ...state,
    wizard: {
      ...state.wizard,
      currentStep: Math.max(state.wizard.currentStep - 1, 1)
    }
  })),
  on(setStep, (state, { step }) => ({
    ...state,
    wizard: {
      ...state.wizard,
      currentStep: Math.min(Math.max(step, 1), 7)
    }
  })),
  on(submitBooking, (state, { proofType, proofValue }) => ({
    ...state,
    wizard: {
      ...state.wizard,
      proofType: proofType as WizardState['proofType'],
      proofValue,
      isLoading: true,
      error: null
    }
  })),
  on(submitBookingSuccess, (state, { bookingId, queueNumber }) => ({
    ...state,
    wizard: {
      ...state.wizard,
      bookingId,
      queueNumber,
      isLoading: false,
      error: null,
      currentStep: 7
    }
  })),
  on(submitBookingFailure, (state, { error }) => ({
    ...state,
    wizard: {
      ...state.wizard,
      isLoading: false,
      error
    }
  })),
  on(resetWizard, (state) => ({
    ...state,
    wizard: { ...initialWizardState }
  })),
  on(loadBookingsSuccess, (state, { bookings }) => ({
    ...state,
    bookings,
    isLoading: false,
    error: null
  })),
  on(updateBookingStatus, (state, { bookingId, status }) => ({
    ...state,
    bookings: state.bookings.map((booking) =>
      booking.id === bookingId ? { ...booking, status } : booking
    )
  })),
  on(addBooking, (state, { booking }) => ({
    ...state,
    bookings: [...state.bookings, booking]
  }))
);
