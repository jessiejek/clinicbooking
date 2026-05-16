import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { Booking, Consultation, Patient, Prescription } from '../../../core/models';
import { MockDataService } from '../../../core/services/mock-data.service';

@Injectable({ providedIn: 'root' })
export class PatientService {
  constructor(private readonly mockData: MockDataService) {}

  getCurrentPatient(userId: string): Observable<Patient | undefined> {
    return of(this.mockData.getPatients().find((patient) => patient.userId === userId)).pipe(
      delay(200)
    );
  }

  getPatientBookings(patientId: string): Observable<Booking[]> {
    return of(
      this.mockData
        .getBookings()
        .filter((booking) => booking.patientId === patientId)
        .sort(
          (a, b) =>
            new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime()
        )
    ).pipe(delay(300));
  }

  getUpcomingBookings(patientId: string): Observable<Booking[]> {
    const now = new Date();

    return of(
      this.mockData
        .getBookings()
        .filter(
          (booking) =>
            booking.patientId === patientId &&
            new Date(`${booking.appointmentDate}T${booking.slotStartTime}:00`) >= now &&
            ['Pending', 'ProofSubmitted', 'Confirmed', 'OnHold'].includes(booking.status)
        )
        .sort(
          (a, b) =>
            new Date(`${a.appointmentDate}T${a.slotStartTime}:00`).getTime() -
            new Date(`${b.appointmentDate}T${b.slotStartTime}:00`).getTime()
        )
    ).pipe(delay(300));
  }

  getPatientConsultations(patientId: string): Observable<Consultation[]> {
    return of(
      this.mockData
        .getConsultations()
        .filter((consultation) => consultation.patientId === patientId)
        .sort(
          (a, b) =>
            new Date(b.consultationDate).getTime() - new Date(a.consultationDate).getTime()
        )
    ).pipe(delay(300));
  }

  getPatientPrescriptions(patientId: string): Observable<Prescription[]> {
    return of(
      this.mockData
        .getPrescriptions()
        .filter((prescription) => prescription.patientId === patientId)
        .sort(
          (a, b) =>
            new Date(b.issuedAt ?? b.prescriptionDate ?? '').getTime() -
            new Date(a.issuedAt ?? a.prescriptionDate ?? '').getTime()
        )
    ).pipe(delay(300));
  }
}
