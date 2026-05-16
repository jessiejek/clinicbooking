import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, switchMap, tap, timer } from 'rxjs';
import { MockDataService } from '../../core/services/mock-data.service';
import {
  cancelBooking,
  cancelBookingSuccess,
  confirmBooking,
  confirmBookingSuccess,
  confirmPayment,
  confirmPaymentSuccess,
  loadBookings,
  loadBookingsSuccess,
  markComplete,
  markCompleteSuccess,
  markNoShow,
  markNoShowSuccess,
  rejectBooking,
  rejectBookingSuccess,
  refundPayment,
  refundPaymentSuccess,
  rescheduleBooking,
  rescheduleSuccess,
  submitBooking,
  submitBookingSuccess,
  waivedPayment,
  waivedPaymentSuccess
} from './bookings.actions';

@Injectable()
export class BookingsEffects {
  private readonly actions$ = inject(Actions);
  private readonly router = inject(Router);
  private readonly mockData = inject(MockDataService);

  submitBooking$ = createEffect(() =>
    this.actions$.pipe(
      ofType(submitBooking),
      switchMap(() =>
        timer(1200).pipe(
          map(() => {
            const bookingId = `BK-${Date.now()}`;
            const queueNumber = Math.floor(Math.random() * 8) + 2;
            return submitBookingSuccess({ bookingId, queueNumber });
          })
        )
      )
    )
  );

  submitBookingSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(submitBookingSuccess),
        tap(({ bookingId }) => this.router.navigate(['/public/booking-confirmation', bookingId]))
      ),
    { dispatch: false }
  );

  loadBookings$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadBookings),
      switchMap(() =>
        timer(400).pipe(map(() => loadBookingsSuccess({ bookings: this.mockData.getBookings() })))
      )
    )
  );

  confirmBooking$ = createEffect(() =>
    this.actions$.pipe(
      ofType(confirmBooking),
      switchMap(({ bookingId }) =>
        timer(500).pipe(map(() => confirmBookingSuccess({ bookingId })))
      )
    )
  );

  rejectBooking$ = createEffect(() =>
    this.actions$.pipe(
      ofType(rejectBooking),
      switchMap(({ bookingId, reason }) =>
        timer(500).pipe(map(() => rejectBookingSuccess({ bookingId, reason })))
      )
    )
  );

  cancelBooking$ = createEffect(() =>
    this.actions$.pipe(
      ofType(cancelBooking),
      switchMap(({ bookingId, reason }) =>
        timer(500).pipe(map(() => cancelBookingSuccess({ bookingId, reason })))
      )
    )
  );

  markComplete$ = createEffect(() =>
    this.actions$.pipe(
      ofType(markComplete),
      switchMap(({ bookingId }) =>
        timer(500).pipe(map(() => markCompleteSuccess({ bookingId })))
      )
    )
  );

  markNoShow$ = createEffect(() =>
    this.actions$.pipe(
      ofType(markNoShow),
      switchMap(({ bookingId }) =>
        timer(500).pipe(map(() => markNoShowSuccess({ bookingId })))
      )
    )
  );

  rescheduleBooking$ = createEffect(() =>
    this.actions$.pipe(
      ofType(rescheduleBooking),
      switchMap(({ bookingId, newDate, newSlot, newSlotEnd }) =>
        timer(500).pipe(
          map(() => rescheduleSuccess({ bookingId, newDate, newSlot, newSlotEnd }))
        )
      )
    )
  );

  confirmPayment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(confirmPayment),
      switchMap(({ bookingId }) =>
        timer(500).pipe(map(() => confirmPaymentSuccess({ bookingId })))
      )
    )
  );

  waivedPayment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(waivedPayment),
      switchMap(({ bookingId, reason }) =>
        timer(500).pipe(map(() => waivedPaymentSuccess({ bookingId, reason })))
      )
    )
  );

  refundPayment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(refundPayment),
      switchMap(({ bookingId, reason }) =>
        timer(500).pipe(map(() => refundPaymentSuccess({ bookingId, reason })))
      )
    )
  );
}
