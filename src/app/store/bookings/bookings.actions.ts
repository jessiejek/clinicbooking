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

export const selectPaymentMode = createAction(
  '[Wizard] Select Payment Mode',
  props<{ paymentMode: 'Online' | 'PayAtClinic' }>()
);

export const nextStep = createAction('[Wizard] Next Step');

export const prevStep = createAction('[Wizard] Prev Step');

export const setStep = createAction('[Wizard] Set Step', props<{ step: number }>());

export const submitBooking = createAction(
  '[Wizard] Submit Booking',
  props<{ proofType: string | null; proofValue: string | null }>()
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

export const confirmBooking = createAction(
  '[Bookings] Confirm Booking',
  props<{ bookingId: string }>()
);

export const confirmBookingSuccess = createAction(
  '[Bookings] Confirm Booking Success',
  props<{ bookingId: string }>()
);

export const rejectBooking = createAction(
  '[Bookings] Reject Booking',
  props<{ bookingId: string; reason: string }>()
);

export const rejectBookingSuccess = createAction(
  '[Bookings] Reject Booking Success',
  props<{ bookingId: string; reason: string }>()
);

export const cancelBooking = createAction(
  '[Bookings] Cancel Booking',
  props<{ bookingId: string; reason: string }>()
);

export const cancelBookingSuccess = createAction(
  '[Bookings] Cancel Booking Success',
  props<{ bookingId: string; reason: string }>()
);

export const markComplete = createAction(
  '[Bookings] Mark Complete',
  props<{ bookingId: string }>()
);

export const markCompleteSuccess = createAction(
  '[Bookings] Mark Complete Success',
  props<{ bookingId: string }>()
);

export const markNoShow = createAction('[Bookings] Mark No Show', props<{ bookingId: string }>());

export const markNoShowSuccess = createAction(
  '[Bookings] Mark No Show Success',
  props<{ bookingId: string }>()
);

export const rescheduleBooking = createAction(
  '[Bookings] Reschedule Booking',
  props<{ bookingId: string; newDate: string; newSlot: string; newSlotEnd?: string }>()
);

export const rescheduleSuccess = createAction(
  '[Bookings] Reschedule Success',
  props<{ bookingId: string; newDate: string; newSlot: string; newSlotEnd?: string }>()
);

export const confirmPayment = createAction(
  '[Bookings] Confirm Payment',
  props<{ bookingId: string }>()
);

export const confirmPaymentSuccess = createAction(
  '[Bookings] Confirm Payment Success',
  props<{ bookingId: string }>()
);

export const waivedPayment = createAction(
  '[Bookings] Waived Payment',
  props<{ bookingId: string; reason: string }>()
);

export const waivedPaymentSuccess = createAction(
  '[Bookings] Waived Payment Success',
  props<{ bookingId: string; reason: string }>()
);

export const refundPayment = createAction(
  '[Bookings] Refund Payment',
  props<{ bookingId: string; reason: string }>()
);

export const refundPaymentSuccess = createAction(
  '[Bookings] Refund Payment Success',
  props<{ bookingId: string; reason: string }>()
);
