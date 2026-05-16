import { createAction, props } from '@ngrx/store';
import { Booking, BookingStatus } from '../../core/models';

export const selectDoctor = createAction(
  '[Wizard] Select Doctor',
  props<{ doctorId: string | null }>()
);

export const selectService = createAction(
  '[Wizard] Select Service',
  props<{ serviceId: string | null }>()
);

export const selectDate = createAction('[Wizard] Select Date', props<{ date: string | null }>());

export const selectSlot = createAction(
  '[Wizard] Select Slot',
  props<{ slot: string | null; slotEnd: string | null }>()
);

export const nextStep = createAction('[Wizard] Next Step');

export const prevStep = createAction('[Wizard] Prev Step');

export const setStep = createAction('[Wizard] Set Step', props<{ step: number }>());

export const submitBooking = createAction(
  '[Wizard] Submit Booking',
  props<{ proofType: string; proofValue: string }>()
);

export const submitBookingSuccess = createAction(
  '[Wizard] Submit Success',
  props<{ bookingId: string; queueNumber: number }>()
);

export const submitBookingFailure = createAction(
  '[Wizard] Submit Failure',
  props<{ error: string }>()
);

export const resetWizard = createAction('[Wizard] Reset');

export const loadBookings = createAction('[Bookings] Load');

export const loadBookingsSuccess = createAction(
  '[Bookings] Load Success',
  props<{ bookings: Booking[] }>()
);

export const updateBookingStatus = createAction(
  '[Bookings] Update Status',
  props<{ bookingId: string; status: BookingStatus }>()
);

export const addBooking = createAction('[Bookings] Add', props<{ booking: Booking }>());
