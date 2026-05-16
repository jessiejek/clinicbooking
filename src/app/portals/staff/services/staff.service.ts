import { Injectable } from '@angular/core';
import { delay, of } from 'rxjs';
import { MockDataService } from '../../../core/services/mock-data.service';

@Injectable({ providedIn: 'root' })
export class StaffService {
  constructor(private readonly mockData: MockDataService) {}

  getDoctors = () => of(this.mockData.getDoctors()).pipe(delay(300));

  getPatients = () => of(this.mockData.getPatients()).pipe(delay(300));

  getBookings = () => of(this.mockData.getBookings()).pipe(delay(400));

  getTodaysBookings = () =>
    of(
      this.mockData.getBookings().filter((booking) => {
        const today = new Date().toDateString();
        return new Date(booking.appointmentDate).toDateString() === today;
      })
    ).pipe(delay(300));
}
