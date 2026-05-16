import { createReducer, on } from '@ngrx/store';
import { Booking } from '../../core/models';
import { initialBookingsState, initialWizardState, WizardState } from './bookings.state';
import {
  addBooking,
  cancelBookingSuccess,
  confirmBookingSuccess,
  confirmPaymentSuccess,
  loadBookings,
  loadBookingsSuccess,
  nextStep,
  markCompleteSuccess,
  markNoShowSuccess,
  prevStep,
  resetWizard,
  rejectBookingSuccess,
  refundPaymentSuccess,
  rescheduleSuccess,
  selectDate,
  selectDoctor,
  selectPaymentMode,
  selectService,
  selectSlot,
  setStep,
  waivedPaymentSuccess,
  submitBooking,
  submitBookingFailure,
  submitBookingSuccess,
  updateBookingStatus
} from './bookings.actions';

const updateBooking = (stateBookings: Booking[], bookingId: string, updater: (booking: Booking) => Booking): Booking[] =>
  stateBookings.map((booking) => (booking.id === bookingId ? updater(booking) : booking));

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
  on(selectPaymentMode, (state, { paymentMode }) => ({
    ...state,
    wizard: {
      ...state.wizard,
      paymentMode
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
  on(submitBooking, (state, { paymentMode, proofType, proofValue }) => ({
    ...state,
    wizard: {
      ...state.wizard,
      paymentMode,
      proofType: (proofType ?? null) as WizardState['proofType'],
      proofValue: proofValue ?? null,
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
  })),
  on(confirmBookingSuccess, (state, { bookingId }) => ({
    ...state,
    bookings: updateBooking(state.bookings, bookingId, (booking) => ({
      ...booking,
      status: 'Confirmed'
    }))
  })),
  on(rejectBookingSuccess, cancelBookingSuccess, (state, { bookingId, reason }) => ({
    ...state,
    bookings: updateBooking(state.bookings, bookingId, (booking) => ({
      ...booking,
      status: 'Cancelled',
      cancellationReason: reason
    }))
  })),
  on(markCompleteSuccess, (state, { bookingId }) => ({
    ...state,
    bookings: updateBooking(state.bookings, bookingId, (booking) => ({
      ...booking,
      status: 'Completed'
    }))
  })),
  on(markNoShowSuccess, (state, { bookingId }) => ({
    ...state,
    bookings: updateBooking(state.bookings, bookingId, (booking) => ({
      ...booking,
      status: 'NoShow'
    }))
  })),
  on(rescheduleSuccess, (state, { bookingId, newDate, newSlot, newSlotEnd }) => ({
    ...state,
    bookings: updateBooking(state.bookings, bookingId, (booking) => ({
      ...booking,
      status: 'Rescheduled',
      appointmentDate: newDate,
      slotStartTime: newSlot,
      slotEndTime: newSlotEnd ?? booking.slotEndTime
    }))
  })),
  on(confirmPaymentSuccess, (state, { bookingId }) => ({
    ...state,
    bookings: updateBooking(state.bookings, bookingId, (booking) => ({
      ...booking,
      paymentStatus: 'Paid',
      status: 'Confirmed'
    }))
  })),
  on(waivedPaymentSuccess, (state, { bookingId }) => ({
    ...state,
    bookings: updateBooking(state.bookings, bookingId, (booking) => ({
      ...booking,
      paymentStatus: 'Waived'
    }))
  })),
  on(refundPaymentSuccess, (state, { bookingId }) => ({
    ...state,
    bookings: updateBooking(state.bookings, bookingId, (booking) => ({
      ...booking,
      paymentStatus: 'Refunded'
    }))
  }))
);
