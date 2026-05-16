import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, switchMap, tap } from 'rxjs';
import { timer } from 'rxjs';
import { MockDataService } from '../../core/services/mock-data.service';
import {
  loadBookings,
  loadBookingsSuccess,
  submitBooking,
  submitBookingSuccess
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
}
