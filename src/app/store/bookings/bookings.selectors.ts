import { createFeatureSelector, createSelector } from '@ngrx/store';
import { Booking } from '../../core/models';
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

export const selectBookingById = (id: string) =>
  createSelector(selectBookings, (bookings: Booking[]) => bookings.find((booking) => booking.id === id));
