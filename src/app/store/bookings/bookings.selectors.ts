import { createFeatureSelector, createSelector } from '@ngrx/store';
import { Booking, BookingStatus } from '../../core/models';
import { BookingsState } from './bookings.state';

export const selectBookingsState = createFeatureSelector<BookingsState>('bookings');

export const selectWizard = createSelector(selectBookingsState, (state) => state.wizard);

export const selectCurrentStep = createSelector(selectWizard, (wizard) => wizard.currentStep);

export const selectSelectedDoctorId = createSelector(
  selectWizard,
  (wizard) => wizard.selectedDoctorId
);

export const selectSelectedServiceId = createSelector(
  selectWizard,
  (wizard) => wizard.selectedServiceId
);

export const selectSelectedDate = createSelector(selectWizard, (wizard) => wizard.selectedDate);

export const selectSelectedSlot = createSelector(selectWizard, (wizard) => wizard.selectedSlot);

export const selectWizardLoading = createSelector(selectWizard, (wizard) => wizard.isLoading);

export const selectBookings = createSelector(selectBookingsState, (state) => state.bookings);

export const selectBookingsLoading = createSelector(selectBookingsState, (state) => state.isLoading);

export const selectBookingById = (id: string) =>
  createSelector(selectBookings, (bookings: Booking[]) =>
    bookings.find((booking) => booking.id === id)
  );

const toLocalIsoDate = (): string => {
  const date = new Date();
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
};

export const selectBookingsByStatus = (status: BookingStatus) =>
  createSelector(selectBookings, (bookings: Booking[]) =>
    bookings.filter((booking) => booking.status === status)
  );

export const selectBookingsByDoctor = (doctorId: string) =>
  createSelector(selectBookings, (bookings: Booking[]) =>
    bookings.filter((booking) => booking.doctorId === doctorId)
  );

export const selectBookingsByDoctorId = (doctorId: string) =>
  createSelector(selectBookings, (bookings: Booking[]) =>
    bookings.filter((booking) => booking.doctorId === doctorId)
  );

export const selectBookingsByPatient = (patientId: string) =>
  createSelector(selectBookings, (bookings: Booking[]) =>
    bookings.filter((booking) => booking.patientId === patientId)
  );

export const selectTodaysBookings = createSelector(selectBookings, (bookings: Booking[]) => {
  const today = toLocalIsoDate();
  return bookings.filter((booking) => booking.appointmentDate === today);
});

export const selectTodaysBookingsByDoctorId = (doctorId: string) =>
  createSelector(selectBookings, (bookings: Booking[]) => {
    const today = toLocalIsoDate();
    return bookings
      .filter((booking) => booking.doctorId === doctorId && booking.appointmentDate === today)
      .sort((a, b) => (a.queueNumber ?? 0) - (b.queueNumber ?? 0));
  });

export const selectUpcomingBookingsByDoctorId = (doctorId: string) =>
  createSelector(selectBookings, (bookings: Booking[]) => {
    const today = toLocalIsoDate();
    return bookings
      .filter((booking) => booking.doctorId === doctorId && booking.appointmentDate > today)
      .sort((a, b) =>
        `${a.appointmentDate} ${a.slotStartTime}`.localeCompare(`${b.appointmentDate} ${b.slotStartTime}`)
      );
  });

export const selectPendingVerifications = createSelector(selectBookings, (bookings: Booking[]) =>
  bookings.filter((booking) => booking.status === 'ProofSubmitted')
);
