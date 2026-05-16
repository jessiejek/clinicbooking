import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import {
  Booking,
  Doctor,
  DoctorBlockedDate,
  DoctorSchedule,
  Patient
} from '../../../core/models';
import { MockDataService } from '../../../core/services/mock-data.service';

@Injectable({ providedIn: 'root' })
export class DoctorService {
  constructor(private readonly mockData: MockDataService) {}

  getCurrentDoctor(userId: string): Observable<Doctor | undefined> {
    return of(this.mockData.getDoctors().find((doctor) => doctor.userId === userId)).pipe(delay(200));
  }

  getDoctorBookings(doctorId: string): Observable<Booking[]> {
    return of(this.mockData.getBookings().filter((booking) => booking.doctorId === doctorId)).pipe(delay(300));
  }

  getTodaysDoctorBookings(doctorId: string): Observable<Booking[]> {
    const today = new Date().toDateString();

    return of(
      this.mockData
        .getBookings()
        .filter(
          (booking) =>
            booking.doctorId === doctorId && new Date(booking.appointmentDate).toDateString() === today
        )
        .sort((a, b) => (a.queueNumber ?? 0) - (b.queueNumber ?? 0))
    ).pipe(delay(300));
  }

  getDoctorPatients(doctorId: string): Observable<Patient[]> {
    const doctorBookings = this.mockData.getBookings().filter((booking) => booking.doctorId === doctorId);
    const patientIds = [...new Set(doctorBookings.map((booking) => booking.patientId))];

    return of(this.mockData.getPatients().filter((patient) => patientIds.includes(patient.id))).pipe(delay(300));
  }

  getDoctorSchedules(doctorId: string): Observable<DoctorSchedule[]> {
    return of(this.mockData.getDoctorSchedules().filter((schedule) => schedule.doctorId === doctorId)).pipe(
      delay(200)
    );
  }

  getDoctorBlockedDates(doctorId: string): Observable<DoctorBlockedDate[]> {
    return of(this.mockData.getDoctorBlockedDates(doctorId)).pipe(delay(200));
  }
}
