import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, delay, map, of } from 'rxjs';
import { Booking, BookingStatus, ProofType } from '../models';
import { MockDataService } from './mock-data.service';

const toLocalIsoDate = (): string => {
  const date = new Date();
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
};

const toBookingDateTime = (booking: Booking): number =>
  new Date(`${booking.appointmentDate}T${booking.slotStartTime}:00`).getTime();

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly mockData = inject(MockDataService);
  private readonly bookingsSubject = new BehaviorSubject<Booking[]>(this.mockData.getBookings());
  private readonly loadingSubject = new BehaviorSubject(false);

  readonly bookings$ = this.bookingsSubject.asObservable();
  readonly isLoading$ = this.loadingSubject.asObservable();

  get snapshot(): Booking[] {
    return this.bookingsSubject.value;
  }

  refresh(): void {
    this.loadingSubject.next(true);
    of(this.mockData.getBookings())
      .pipe(delay(150))
      .subscribe((bookings) => {
        this.bookingsSubject.next(bookings);
        this.loadingSubject.next(false);
      });
  }

  getBookings(): Observable<Booking[]> {
    return this.bookings$;
  }

  getBookingById(id: string): Booking | undefined {
    return this.snapshot.find((booking) => booking.id === id);
  }

  getBookingById$(id: string): Observable<Booking | undefined> {
    return this.bookings$.pipe(map((bookings) => bookings.find((booking) => booking.id === id)));
  }

  getBookingsByStatus(status: BookingStatus): Observable<Booking[]> {
    return this.bookings$.pipe(
      map((bookings) => bookings.filter((booking) => booking.status === status))
    );
  }

  getBookingsByDoctorId(doctorId: string): Observable<Booking[]> {
    return this.bookings$.pipe(
      map((bookings) => bookings.filter((booking) => booking.doctorId === doctorId))
    );
  }

  getBookingsByPatientId(patientId: string): Observable<Booking[]> {
    return this.bookings$.pipe(
      map((bookings) => bookings.filter((booking) => booking.patientId === patientId))
    );
  }

  getTodaysBookings(): Observable<Booking[]> {
    const today = toLocalIsoDate();
    return this.bookings$.pipe(
      map((bookings) => bookings.filter((booking) => booking.appointmentDate === today))
    );
  }

  getTodaysBookingsByDoctorId(doctorId: string): Observable<Booking[]> {
    const today = toLocalIsoDate();
    return this.bookings$.pipe(
      map((bookings) =>
        bookings
          .filter((booking) => booking.doctorId === doctorId && booking.appointmentDate === today)
          .sort((a, b) => (a.queueNumber ?? 0) - (b.queueNumber ?? 0))
      )
    );
  }

  getUpcomingBookingsByDoctorId(doctorId: string): Observable<Booking[]> {
    const today = toLocalIsoDate();
    return this.bookings$.pipe(
      map((bookings) =>
        bookings
          .filter((booking) => booking.doctorId === doctorId && booking.appointmentDate > today)
          .sort((a, b) =>
            `${a.appointmentDate} ${a.slotStartTime}`.localeCompare(
              `${b.appointmentDate} ${b.slotStartTime}`
            )
          )
      )
    );
  }

  getUpcomingBookingsByPatientId(patientId: string): Observable<Booking[]> {
    return this.bookings$.pipe(
      map((bookings) =>
        bookings
          .filter(
            (booking) =>
              booking.patientId === patientId &&
              ['Pending', 'ProofSubmitted', 'Confirmed', 'OnHold'].includes(booking.status) &&
              toBookingDateTime(booking) >= Date.now()
          )
          .sort((a, b) => toBookingDateTime(a) - toBookingDateTime(b))
      )
    );
  }

  getPendingProofBookingsByPatientId(patientId: string): Observable<Booking[]> {
    return this.bookings$.pipe(
      map((bookings) =>
        bookings
          .filter(
            (booking) =>
              booking.patientId === patientId &&
              booking.paymentMode === 'Online' &&
              booking.paymentStatus === 'Unpaid' &&
              ['Pending', 'OnHold'].includes(booking.status)
          )
          .sort((a, b) => toBookingDateTime(a) - toBookingDateTime(b))
      )
    );
  }

  getPendingVerifications(): Observable<Booking[]> {
    return this.bookings$.pipe(
      map((bookings) => bookings.filter((booking) => booking.status === 'ProofSubmitted'))
    );
  }

  addBooking(booking: Booking): void {
    this.upsert(booking);
  }

  updateBookingStatus(bookingId: string, status: BookingStatus): void {
    this.updateBooking(bookingId, { status });
  }

  submitBookingProof(bookingId: string, proofType: ProofType, proofValue: string): void {
    this.updateBooking(bookingId, {
      status: 'ProofSubmitted',
      proofType,
      proofValue,
      proofSubmittedAt: new Date().toISOString()
    });
  }

  confirmBooking(bookingId: string): void {
    this.updateBooking(bookingId, { status: 'Confirmed' });
  }

  rejectBooking(bookingId: string, reason: string): void {
    this.updateBooking(bookingId, { status: 'Cancelled', cancellationReason: reason });
  }

  cancelBooking(bookingId: string, reason: string): void {
    this.updateBooking(bookingId, { status: 'Cancelled', cancellationReason: reason });
  }

  markComplete(bookingId: string): void {
    this.updateBooking(bookingId, { status: 'Completed' });
  }

  markNoShow(bookingId: string): void {
    this.updateBooking(bookingId, { status: 'NoShow' });
  }

  confirmPayment(bookingId: string): void {
    this.updateBooking(bookingId, { status: 'Confirmed', paymentStatus: 'Paid' });
  }

  waivePayment(bookingId: string, reason: string): void {
    this.mockData.addAuditLog({
      entityType: 'Payment',
      entityId: bookingId,
      action: 'Waived payment',
      performedBy: 'Dr. Grace E. Gavino',
      performedAt: new Date().toISOString(),
      details: reason
    });
    this.updateBooking(bookingId, { paymentStatus: 'Waived' });
  }

  refundPayment(bookingId: string, reason: string): void {
    this.mockData.addAuditLog({
      entityType: 'Payment',
      entityId: bookingId,
      action: 'Refunded payment',
      performedBy: 'Dr. Grace E. Gavino',
      performedAt: new Date().toISOString(),
      details: reason
    });
    this.updateBooking(bookingId, { paymentStatus: 'Refunded' });
  }

  rescheduleBooking(
    bookingId: string,
    newDate: string,
    newSlot: string,
    newSlotEnd?: string
  ): void {
    const current = this.getBookingById(bookingId);
    if (!current) {
      return;
    }

    this.upsert({
      ...current,
      status: 'Rescheduled',
      appointmentDate: newDate,
      slotStartTime: newSlot,
      slotEndTime: newSlotEnd ?? current.slotEndTime
    });
  }

  private updateBooking(bookingId: string, changes: Partial<Booking>): void {
    const current = this.getBookingById(bookingId);
    if (!current) {
      return;
    }

    this.upsert({ ...current, ...changes });
  }

  private upsert(booking: Booking): void {
    this.bookingsSubject.next([
      ...this.snapshot.filter((item) => item.id !== booking.id),
      { ...booking }
    ]);
  }
}
