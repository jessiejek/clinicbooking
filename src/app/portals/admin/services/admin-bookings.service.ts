import { Injectable, inject } from '@angular/core';
import { map, Observable, timer } from 'rxjs';
import { Booking, BookingStatus } from '../../../core/models';
import { MockDataService } from '../../../core/services/mock-data.service';

@Injectable({ providedIn: 'root' })
export class AdminBookingsService {
  private readonly mockData = inject(MockDataService);

  getBookings(): Observable<Booking[]> {
    return timer(300).pipe(map(() => this.mockData.getBookings()));
  }

  getBookingById(id: string): Observable<Booking | undefined> {
    return timer(300).pipe(map(() => this.mockData.getBookingById(id)));
  }

  updateBookingStatus(id: string, status: BookingStatus): Observable<Booking | undefined> {
    return timer(300).pipe(
      map(() => {
        const booking = this.mockData.getBookingById(id);
        return booking ? { ...booking, status } : undefined;
      })
    );
  }
}
