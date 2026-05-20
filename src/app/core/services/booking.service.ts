import { HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, defer, finalize, map, of, switchMap, take, tap, throwError } from 'rxjs';
import { ApiService } from './api.service';
import { Booking, BookingStatus, Payment, PaymentMode, PaymentStatus, ProofType } from '../models';

export interface BookingFilters {
  doctorId?: string;
  patientId?: string;
  status?: BookingStatus;
  paymentStatus?: PaymentStatus;
  paymentMode?: PaymentMode;
  appointmentDate?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface CreateBookingRequest {
  patientId?: string;
  doctorId: string;
  serviceId: string;
  appointmentDate: string;
  slotStartTime: string;
  slotEndTime: string;
  paymentMode: PaymentMode;
  notes?: string;
}

export interface CreateWalkInRequest extends CreateBookingRequest {}

export interface SubmitProofRequest {
  proofType: ProofType;
  proofValue: string;
}

export interface RescheduleBookingRequest {
  appointmentDate: string;
  slotStartTime: string;
  slotEndTime?: string;
  notes?: string;
}

export interface MyBookingsPageResult {
  items: Booking[];
  totalCount: number;
  page: number;
  pageSize: number;
}

const BOOKING_STATUSES: BookingStatus[] = [
  'Pending',
  'ProofSubmitted',
  'Confirmed',
  'OnHold',
  'Cancelled',
  'Completed',
  'Expired',
  'NoShow',
  'Rescheduled'
];

const PAYMENT_STATUSES: PaymentStatus[] = ['Unpaid', 'Paid', 'Waived', 'Refunded'];
const PAYMENT_MODES: PaymentMode[] = ['Online', 'PayAtClinic'];
const PROOF_TYPES: ProofType[] = ['ReferenceNumber', 'Screenshot'];

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly apiService = inject(ApiService);
  private readonly bookingsSubject = new BehaviorSubject<Booking[]>([]);
  private readonly loadingSubject = new BehaviorSubject(false);
  private loadingCounter = 0;

  readonly bookings$ = this.bookingsSubject.asObservable();
  readonly isLoading$ = this.loadingSubject.asObservable();

  get snapshot(): Booking[] {
    return this.bookingsSubject.value;
  }

  refresh(filters?: BookingFilters): void {
    const replaceCache = !hasBookingFilters(filters);
    void this.requestBookings(filters, replaceCache).subscribe();
  }

  getBookings(filters?: BookingFilters): Observable<Booking[]> {
    const replaceCache = !hasBookingFilters(filters);
    void this.requestBookings(filters, replaceCache).subscribe();
    return this.bookings$.pipe(map((bookings) => applyBookingFilters(bookings, filters)));
  }

  getBookingById(id: string): Booking | undefined {
    return this.snapshot.find((booking) => booking.id === id);
  }

  getBookingById$(id: string): Observable<Booking | undefined> {
    if (!id) {
      return of(undefined);
    }

    void this.requestBookingById(id).subscribe();
    return this.bookings$.pipe(map((bookings) => bookings.find((booking) => booking.id === id)));
  }

  getBookingsByStatus(status: BookingStatus): Observable<Booking[]> {
    return this.getBookings({ status });
  }

  getBookingsByDoctorId(doctorId: string): Observable<Booking[]> {
    return this.getBookings({ doctorId });
  }

  getBookingsByPatientId(patientId: string): Observable<Booking[]> {
    return this.getBookings({ patientId });
  }

  getTodaysBookings(): Observable<Booking[]> {
    return this.getBookings({ appointmentDate: toLocalIsoDate() });
  }

  getTodaysBookingsByDoctorId(doctorId: string): Observable<Booking[]> {
    return this.getBookings({ doctorId, appointmentDate: toLocalIsoDate() }).pipe(
      map((bookings) => [...bookings].sort((a, b) => (a.queueNumber ?? 0) - (b.queueNumber ?? 0)))
    );
  }

  getUpcomingBookingsByDoctorId(doctorId: string): Observable<Booking[]> {
    return this.getBookings({ doctorId }).pipe(
      map((bookings) =>
        bookings
          .filter((booking) => booking.appointmentDate > toLocalIsoDate())
          .sort((a, b) => bookingDateTime(a) - bookingDateTime(b))
      )
    );
  }

  getUpcomingBookingsByPatientId(patientId: string): Observable<Booking[]> {
    return this.getMyBookings(1, 100).pipe(
      map(({ items }) =>
        items
          .filter(
            (booking) =>
              (!booking.patientId || booking.patientId === patientId) &&
              ['Pending', 'ProofSubmitted', 'Confirmed', 'OnHold'].includes(booking.status) &&
              bookingDateTime(booking) >= Date.now()
          )
          .sort((a, b) => bookingDateTime(a) - bookingDateTime(b))
      ),
      catchError(() => of([]))
    );
  }

  getPendingProofBookingsByPatientId(patientId: string): Observable<Booking[]> {
    return this.getMyBookings(1, 100).pipe(
      map(({ items }) =>
        items
          .filter(
            (booking) =>
              (!booking.patientId || booking.patientId === patientId) &&
              booking.paymentMode === 'Online' &&
              booking.paymentStatus === 'Unpaid' &&
              ['Pending', 'OnHold'].includes(booking.status)
          )
          .sort((a, b) => bookingDateTime(a) - bookingDateTime(b))
      ),
      catchError(() => of([]))
    );
  }

  getPendingVerification(): Observable<Booking[]> {
    void this.requestBookingList('/bookings/pending-verification', undefined, false).subscribe();
    return this.bookings$.pipe(
      map((bookings) =>
        [...bookings]
          .filter((booking) => booking.status === 'ProofSubmitted')
          .sort((a, b) => bookingDateTime(a) - bookingDateTime(b))
      )
    );
  }

  getPendingVerifications(): Observable<Booking[]> {
    return this.getPendingVerification();
  }

  getDoctorTodayQueue(): Observable<Booking[]> {
    return this.requestBookingList('/bookings/doctor/today', undefined, false).pipe(
      map((bookings) =>
        [...bookings].sort((a, b) => (a.queueNumber ?? Number.MAX_SAFE_INTEGER) - (b.queueNumber ?? Number.MAX_SAFE_INTEGER))
      )
    );
  }

  getDoctorUpcoming(): Observable<Booking[]> {
    return this.requestBookingList('/bookings/doctor/upcoming', undefined, false).pipe(
      map((bookings) => [...bookings].sort((a, b) => bookingDateTime(a) - bookingDateTime(b)))
    );
  }

  getMyBookings(page = 1, pageSize = 20): Observable<MyBookingsPageResult> {
    const params = new HttpParams()
      .set('page', String(Math.max(1, page)))
      .set('pageSize', String(Math.max(1, pageSize)));

    return this.requestMyBookingsPage('/bookings/me', params);
  }

  addBooking(booking: Booking): void {
    this.upsertBooking(booking);
  }

  updateBookingStatus(bookingId: string, status: BookingStatus): void {
    const current = this.getBookingById(bookingId);
    if (current) {
      this.patchBooking(bookingId, { status });
    }
  }

  submitProof(bookingId: string, dto: SubmitProofRequest): Observable<Booking> {
    return this.requestBookingMutation('/bookings', bookingId, { proofType: dto.proofType, proofValue: dto.proofValue }, {
      proofType: dto.proofType,
      proofValue: dto.proofValue,
      status: 'ProofSubmitted',
      proofSubmittedAt: new Date().toISOString()
    });
  }

  submitBookingProof(bookingId: string, proofType: ProofType, proofValue: string): void {
    void this.submitProof(bookingId, { proofType, proofValue }).subscribe();
  }

  createBooking(dto: CreateBookingRequest): Observable<Booking> {
    return this.createBookingLike('/bookings', dto, false);
  }

  createWalkIn(dto: CreateWalkInRequest): Observable<Booking> {
    return this.createBookingLike('/bookings/walk-in', dto, true);
  }

  confirmBooking(bookingId: string): void {
    const current = this.getBookingById(bookingId);
    const optimisticPatch: Partial<Booking> = { status: 'Confirmed' };
    this.runVoidMutation(bookingId, optimisticPatch, this.apiService.patch<unknown>(`/bookings/${encodeURIComponent(bookingId)}/confirm`, {}));
  }

  cancelBooking(bookingId: string, reason: string): void {
    const optimisticPatch: Partial<Booking> = {
      status: 'Cancelled',
      cancellationReason: reason
    };

    this.runVoidMutation(
      bookingId,
      optimisticPatch,
      this.apiService.patch<unknown>(`/bookings/${encodeURIComponent(bookingId)}/cancel`, {
        cancellationReason: reason
      })
    );
  }

  completeBooking(bookingId: string): void {
    this.runVoidMutation(
      bookingId,
      { status: 'Completed' },
      this.apiService.patch<unknown>(`/bookings/${encodeURIComponent(bookingId)}/complete`, {})
    );
  }

  markComplete(bookingId: string): void {
    this.completeBooking(bookingId);
  }

  markNoShow(bookingId: string): void {
    this.runVoidMutation(
      bookingId,
      { status: 'NoShow' },
      this.apiService.patch<unknown>(`/bookings/${encodeURIComponent(bookingId)}/no-show`, {})
    );
  }

  rejectBooking(bookingId: string, reason: string): void {
    this.cancelBooking(bookingId, reason);
  }

  confirmPayment(bookingId: string): void {
    const previous = this.getBookingById(bookingId);
    if (previous) {
      this.patchBooking(bookingId, {
        paymentStatus: 'Paid',
        status: 'Confirmed'
      });
    }

    this.beginLoading();
    this.getPayment(bookingId)
      .pipe(
        take(1),
        switchMap((payment) => {
          if (!payment?.id) {
            return throwError(() => new Error('Payment record not found.'));
          }

          return this.apiService.patch<unknown>(`/payments/${encodeURIComponent(payment.id)}/confirm`, {});
        }),
        tap(() => {
          void this.requestBookingById(bookingId, false).subscribe();
        }),
        catchError((error: unknown) => {
          if (previous) {
            this.upsertBooking(previous);
          }
          console.error('Failed to confirm payment.', error);
          return of(null);
        }),
        finalize(() => this.endLoading())
      )
      .subscribe();
  }

  waivePayment(bookingId: string, reason: string): void {
    const previous = this.getBookingById(bookingId);
    if (previous) {
      this.patchBooking(bookingId, { paymentStatus: 'Waived' });
    }

    this.beginLoading();
    this.getPayment(bookingId)
      .pipe(
        take(1),
        switchMap((payment) => {
          if (!payment?.id) {
            return throwError(() => new Error('Payment record not found.'));
          }

          return this.apiService.patch<unknown>(`/payments/${encodeURIComponent(payment.id)}/waive`, {
            reason
          });
        }),
        tap(() => {
          void this.requestBookingById(bookingId, false).subscribe();
        }),
        catchError((error: unknown) => {
          if (previous) {
            this.upsertBooking(previous);
          }
          console.error('Failed to waive payment.', error);
          return of(null);
        }),
        finalize(() => this.endLoading())
      )
      .subscribe();
  }

  refundPayment(bookingId: string, reason: string): void {
    const previous = this.getBookingById(bookingId);
    if (previous) {
      this.patchBooking(bookingId, { paymentStatus: 'Refunded' });
    }

    this.beginLoading();
    this.getPayment(bookingId)
      .pipe(
        take(1),
        switchMap((payment) => {
          if (!payment?.id) {
            return throwError(() => new Error('Payment record not found.'));
          }

          return this.apiService.patch<unknown>(`/payments/${encodeURIComponent(payment.id)}/refund`, {
            reason
          });
        }),
        tap(() => {
          void this.requestBookingById(bookingId, false).subscribe();
        }),
        catchError((error: unknown) => {
          if (previous) {
            this.upsertBooking(previous);
          }
          console.error('Failed to refund payment.', error);
          return of(null);
        }),
        finalize(() => this.endLoading())
      )
      .subscribe();
  }

  rescheduleBooking(
    bookingId: string,
    dtoOrDate: RescheduleBookingRequest | string,
    newSlot?: string,
    newSlotEnd?: string
  ): void {
    const dto: RescheduleBookingRequest =
      typeof dtoOrDate === 'string'
        ? {
            appointmentDate: dtoOrDate,
            slotStartTime: newSlot ?? '',
            slotEndTime: newSlotEnd ?? newSlot
          }
        : dtoOrDate;

    const previous = this.getBookingById(bookingId);
    if (previous) {
      this.patchBooking(bookingId, {
        status: 'Rescheduled',
        appointmentDate: dto.appointmentDate,
        slotStartTime: dto.slotStartTime,
        slotEndTime: dto.slotEndTime ?? previous.slotEndTime
      });
    }

    this.beginLoading();
    this.apiService
      .patch<unknown>(`/bookings/${encodeURIComponent(bookingId)}/reschedule`, dto)
      .pipe(
        tap(() => {
          void this.requestBookingById(bookingId, false).subscribe();
        }),
        catchError((error: unknown) => {
          if (previous) {
            this.upsertBooking(previous);
          }
          console.error('Failed to reschedule booking.', error);
          return of(null);
        }),
        finalize(() => this.endLoading())
      )
      .subscribe();
  }

  getPayment(bookingId: string): Observable<Payment | undefined> {
    if (!bookingId) {
      return of(undefined);
    }

    return this.requestPaymentByBookingId(bookingId);
  }

  private requestBookings(filters?: BookingFilters, replaceCache = false): Observable<Booking[]> {
    const params = buildBookingParams(filters);

    return defer(() => {
      this.beginLoading();
      return this.apiService.get<unknown>('/bookings', params ? { params } : undefined).pipe(
        map((payload) => this.normalizeBookingList(payload)),
        tap((bookings) => {
          if (replaceCache) {
            this.replaceBookings(bookings);
          } else {
            this.mergeBookings(bookings);
          }
        }),
        catchError((error: unknown) => {
          console.error('Failed to load bookings.', error);
          return of([]);
        }),
        finalize(() => this.endLoading())
      );
    });
  }

  private requestBookingById(id: string, trackLoading = true): Observable<Booking | undefined> {
    if (!id) {
      return of(undefined);
    }

    return defer(() => {
      if (trackLoading) {
        this.beginLoading();
      }

      return this.apiService.get<unknown>(`/bookings/${encodeURIComponent(id)}`).pipe(
        map((payload) => this.normalizeBooking(payload)),
        tap((booking) => {
          if (booking) {
            this.upsertBooking(booking);
          }
        }),
        catchError((error: unknown) => {
          console.error(`Failed to load booking ${id}.`, error);
          return of(undefined);
        }),
        finalize(() => {
          if (trackLoading) {
            this.endLoading();
          }
        })
      );
    });
  }

  private requestBookingList(
    url: string,
    params?: HttpParams,
    replaceCache = false
  ): Observable<Booking[]> {
    return defer(() => {
      this.beginLoading();
      return this.apiService.get<unknown>(url, params ? { params } : undefined).pipe(
        map((payload) => this.normalizeBookingList(payload)),
        tap((bookings) => {
          if (replaceCache) {
            this.replaceBookings(bookings);
          } else {
            this.mergeBookings(bookings);
          }
        }),
        catchError((error: unknown) => {
          console.error(`Failed to load bookings from ${url}.`, error);
          return of([]);
        }),
        finalize(() => this.endLoading())
      );
    });
  }

  private requestMyBookingsPage(url: string, params?: HttpParams): Observable<MyBookingsPageResult> {
    return defer(() => {
      this.beginLoading();
      return this.apiService.get<unknown>(url, params ? { params } : undefined).pipe(
        map((payload) => this.normalizeMyBookingsPage(payload)),
        catchError((error: unknown) => {
          return throwError(() => new Error(extractApiErrorMessage(error, 'Failed to load bookings.')));
        }),
        finalize(() => this.endLoading())
      );
    });
  }

  private requestPaymentByBookingId(bookingId: string): Observable<Payment | undefined> {
    return defer(() => {
      this.beginLoading();
      return this.apiService.get<unknown>(`/payments/booking/${encodeURIComponent(bookingId)}`).pipe(
        map((payload) => this.normalizePayment(payload)),
        catchError((error: unknown) => {
          console.error(`Failed to load payment for booking ${bookingId}.`, error);
          return of(undefined);
        }),
        finalize(() => this.endLoading())
      );
    });
  }

  private createBookingLike(
    url: string,
    dto: CreateBookingRequest,
    isWalkIn: boolean
  ): Observable<Booking> {
    const payload = this.normalizeCreateBookingRequest(dto, isWalkIn);

    return defer(() => {
      this.beginLoading();
      return this.apiService.post<unknown>(url, payload).pipe(
        map((response) => {
          const booking = this.normalizeBooking(response, {
            ...payload,
            isWalkIn
          });

          if (!booking) {
            throw new Error('Booking response did not include a valid booking record.');
          }

          return booking;
        }),
        tap((booking) => {
          this.upsertBooking(booking);
        }),
        catchError((error: unknown) =>
          throwError(() => new Error(extractApiErrorMessage(error, 'Failed to create booking.')))
        ),
        finalize(() => this.endLoading())
      );
    });
  }

  private requestBookingMutation(
    url: string,
    bookingId: string,
    body: unknown,
    optimisticPatch: Partial<Booking>
  ): Observable<Booking> {
    const fallbackBooking = this.getBookingById(bookingId) ?? ({ id: bookingId, ...optimisticPatch } as Partial<Booking>);

    return defer(() => {
      this.beginLoading();
      return this.apiService.post<unknown>(url.includes('/proof') ? url : `${url}/${encodeURIComponent(bookingId)}/proof`, body).pipe(
        map((response) => {
          const booking = this.normalizeBooking(response, fallbackBooking);
          if (!booking) {
            throw new Error('Booking response did not include a valid booking record.');
          }
          return booking;
        }),
        tap((booking) => {
          this.upsertBooking(booking);
        }),
        catchError((error: unknown) =>
          throwError(() => new Error(extractApiErrorMessage(error, 'Failed to submit proof.')))
        ),
        finalize(() => this.endLoading())
      );
    });
  }

  private runVoidMutation(bookingId: string, optimisticPatch: Partial<Booking>, request$: Observable<unknown>): void {
    const previous = this.getBookingById(bookingId);
    if (previous) {
      this.patchBooking(bookingId, optimisticPatch);
    }

    this.beginLoading();
    request$
      .pipe(
        tap(() => {
          void this.requestBookingById(bookingId, false).subscribe();
        }),
        catchError((error: unknown) => {
          if (previous) {
            this.upsertBooking(previous);
          }
          console.error('Booking update failed.', error);
          return of(null);
        }),
        finalize(() => this.endLoading())
      )
      .subscribe();
  }

  private normalizeCreateBookingRequest(dto: CreateBookingRequest, isWalkIn: boolean): Record<string, unknown> {
    const payload: Record<string, unknown> = {
      doctorId: trimRequiredString(dto.doctorId),
      serviceId: trimRequiredString(dto.serviceId),
      appointmentDate: trimRequiredString(dto.appointmentDate),
      slotStartTime: trimRequiredString(dto.slotStartTime),
      slotEndTime: trimRequiredString(dto.slotEndTime),
      paymentMode: dto.paymentMode,
      isWalkIn
    };

    const patientId = trimOptionalString(dto.patientId);
    if (patientId) {
      payload['patientId'] = patientId;
    }

    const notes = trimOptionalString(dto.notes);
    if (notes) {
      payload['notes'] = notes;
    }

    return payload;
  }

  private normalizeBooking(payload: unknown, fallback?: Partial<Booking>): Booking | undefined {
    const record = extractBookingRecord(payload);
    if (!record) {
      return undefined;
    }

    const source = record as Record<string, unknown>;
    const fallbackRecord = fallback ?? {};

    const id = trimOptionalString(source['id']) ?? trimOptionalString(fallbackRecord.id);
    if (!id) {
      return undefined;
    }

    const appointmentDate = trimOptionalString(source['appointmentDate']) ?? trimOptionalString(fallbackRecord.appointmentDate) ?? '';
    const slotStartTime = trimOptionalString(source['slotStartTime']) ?? trimOptionalString(fallbackRecord.slotStartTime) ?? '';
    const slotEndTime =
      trimOptionalString(source['slotEndTime']) ??
      trimOptionalString(fallbackRecord.slotEndTime) ??
      slotStartTime;

    return {
      id,
      patientId: trimOptionalString(source['patientId']) ?? trimOptionalString(fallbackRecord.patientId) ?? '',
      patientName: trimOptionalString(source['patientName']) ?? trimOptionalString(fallbackRecord.patientName),
      doctorId: trimOptionalString(source['doctorId']) ?? trimOptionalString(fallbackRecord.doctorId) ?? '',
      doctorName: trimOptionalString(source['doctorName']) ?? trimOptionalString(fallbackRecord.doctorName),
      serviceId: trimOptionalString(source['serviceId']) ?? trimOptionalString(fallbackRecord.serviceId) ?? '',
      serviceName: trimOptionalString(source['serviceName']) ?? trimOptionalString(fallbackRecord.serviceName),
      appointmentDate,
      slotStartTime,
      slotEndTime,
      status: normalizeBookingStatus(source['status']) ?? fallbackRecord.status ?? 'Pending',
      paymentStatus: normalizePaymentStatus(source['paymentStatus']) ?? fallbackRecord.paymentStatus ?? 'Unpaid',
      paymentMode: normalizePaymentMode(source['paymentMode']) ?? fallbackRecord.paymentMode ?? 'PayAtClinic',
      queueNumber: normalizeNullableNumber(source['queueNumber']) ?? fallbackRecord.queueNumber ?? null,
      totalFee: normalizeNumber(source['totalFee'], fallbackRecord.totalFee ?? 0),
      consultationFeeSnapshot: normalizeNumber(source['consultationFeeSnapshot'], fallbackRecord.consultationFeeSnapshot ?? 0),
      serviceFeeSnapshot: normalizeNumber(source['serviceFeeSnapshot'], fallbackRecord.serviceFeeSnapshot ?? 0),
      isWalkIn: normalizeBoolean(source['isWalkIn'], fallbackRecord.isWalkIn ?? false),
      proofType: normalizeProofType(source['proofType']) ?? fallbackRecord.proofType,
      proofValue: trimOptionalString(source['proofValue']) ?? fallbackRecord.proofValue,
      proofSubmittedAt: trimOptionalString(source['proofSubmittedAt']) ?? fallbackRecord.proofSubmittedAt,
      cancellationReason: trimOptionalString(source['cancellationReason']) ?? fallbackRecord.cancellationReason,
      notes: trimOptionalString(source['notes']) ?? fallbackRecord.notes,
      rescheduledFromBookingId:
        trimOptionalString(source['rescheduledFromBookingId']) ?? fallbackRecord.rescheduledFromBookingId,
      receiptUrl: trimOptionalString(source['receiptUrl']) ?? fallbackRecord.receiptUrl,
      createdAt: trimOptionalString(source['createdAt']) ?? trimOptionalString(fallbackRecord.createdAt) ?? new Date().toISOString(),
      orNumber: trimOptionalString(source['orNumber']) ?? fallbackRecord.orNumber
    };
  }

  private normalizeBookingList(payload: unknown): Booking[] {
    const records = extractBookingArray(payload);
    return records
      .map((record) => this.normalizeBooking(record))
      .filter((booking): booking is Booking => Boolean(booking));
  }

  private normalizeMyBookingsPage(payload: unknown): MyBookingsPageResult {
    const items = this.normalizeBookingList(payload);
    const source = isRecord(payload) ? payload : undefined;

    return {
      items,
      totalCount: normalizeNumber(source?.['totalCount'] ?? source?.['total'] ?? items.length, items.length),
      page: normalizeNumber(source?.['page'], 1) || 1,
      pageSize: normalizeNumber(source?.['pageSize'], items.length || 20) || (items.length || 20)
    };
  }

  private normalizePayment(payload: unknown): Payment | undefined {
    const record = extractPaymentRecord(payload);
    if (!record) {
      return undefined;
    }

    const source = record as Record<string, unknown>;
    const id = trimOptionalString(source['id']);
    const bookingId = trimOptionalString(source['bookingId']);
    if (!id || !bookingId) {
      return undefined;
    }

    return {
      id,
      bookingId,
      amount: normalizeNumber(source['amount']),
      paymentMethod: normalizePaymentMethod(source['paymentMethod']) ?? 'PayAtClinic',
      referenceNumber: trimOptionalString(source['referenceNumber']),
      proofImageUrl: trimOptionalString(source['proofImageUrl']),
      status: normalizePaymentStatus(source['status']) ?? 'Unpaid',
      orNumber: trimOptionalString(source['orNumber']),
      verifiedByUserId: trimOptionalString(source['verifiedByUserId']),
      verifiedAt: trimOptionalString(source['verifiedAt']),
      waivedByUserId: trimOptionalString(source['waivedByUserId']),
      waivedAt: trimOptionalString(source['waivedAt']),
      waivedReason: trimOptionalString(source['waivedReason']),
      refundedByUserId: trimOptionalString(source['refundedByUserId']),
      refundedAt: trimOptionalString(source['refundedAt']),
      refundReason: trimOptionalString(source['refundReason'])
    };
  }

  private replaceBookings(bookings: Booking[]): void {
    this.bookingsSubject.next(bookings.map((booking) => ({ ...booking })));
  }

  private mergeBookings(bookings: Booking[]): void {
    bookings.forEach((booking) => this.upsertBooking(booking));
  }

  private patchBooking(bookingId: string, changes: Partial<Booking>): void {
    const current = this.getBookingById(bookingId);
    if (!current) {
      return;
    }

    this.upsertBooking({ ...current, ...changes });
  }

  private upsertBooking(booking: Booking): void {
    const current = this.bookingsSubject.value;
    const exists = current.some((item) => item.id === booking.id);
    const next = exists
      ? current.map((item) => (item.id === booking.id ? { ...item, ...booking } : item))
      : [...current, { ...booking }];

    this.bookingsSubject.next(next);
  }

  private beginLoading(): void {
    this.loadingCounter += 1;
    this.loadingSubject.next(true);
  }

  private endLoading(): void {
    this.loadingCounter = Math.max(0, this.loadingCounter - 1);
    this.loadingSubject.next(this.loadingCounter > 0);
  }
}

function hasBookingFilters(filters?: BookingFilters): boolean {
  if (!filters) {
    return false;
  }

  return Object.values(filters).some((value) => {
    if (typeof value === 'string') {
      return value.trim().length > 0;
    }

    return typeof value === 'number' && Number.isFinite(value);
  });
}

function buildBookingParams(filters?: BookingFilters): HttpParams | undefined {
  if (!filters) {
    return undefined;
  }

  let params = new HttpParams();
  let hasValue = false;

  const add = (key: string, value: string | number | undefined): void => {
    if (value === undefined || value === null) {
      return;
    }

    const text = String(value).trim();
    if (!text) {
      return;
    }

    params = params.set(key, text);
    hasValue = true;
  };

  add('doctorId', filters.doctorId);
  add('patientId', filters.patientId);
  add('status', filters.status);
  add('paymentStatus', filters.paymentStatus);
  add('paymentMode', filters.paymentMode);
  add('appointmentDate', filters.appointmentDate);
  add('fromDate', filters.fromDate);
  add('toDate', filters.toDate);
  add('search', filters.search);
  add('page', filters.page);
  add('pageSize', filters.pageSize);

  return hasValue ? params : undefined;
}

function applyBookingFilters(bookings: Booking[], filters?: BookingFilters): Booking[] {
  if (!filters) {
    return [...bookings];
  }

  const normalizedSearch = filters.search?.trim().toLowerCase() ?? '';
  const filtered = bookings.filter((booking) => {
    if (filters.doctorId && booking.doctorId !== filters.doctorId) {
      return false;
    }

    if (filters.patientId && booking.patientId !== filters.patientId) {
      return false;
    }

    if (filters.status && booking.status !== filters.status) {
      return false;
    }

    if (filters.paymentStatus && booking.paymentStatus !== filters.paymentStatus) {
      return false;
    }

    if (filters.paymentMode && booking.paymentMode !== filters.paymentMode) {
      return false;
    }

    if (filters.appointmentDate && booking.appointmentDate !== filters.appointmentDate) {
      return false;
    }

    if (filters.fromDate && booking.appointmentDate < filters.fromDate) {
      return false;
    }

    if (filters.toDate && booking.appointmentDate > filters.toDate) {
      return false;
    }

    if (!normalizedSearch) {
      return true;
    }

    const haystack = [
      booking.id,
      booking.patientId,
      booking.patientName ?? '',
      booking.doctorId,
      booking.doctorName ?? '',
      booking.serviceId,
      booking.serviceName ?? '',
      booking.notes ?? '',
      booking.cancellationReason ?? '',
      booking.proofValue ?? ''
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(normalizedSearch);
  });

  const pageSize = typeof filters.pageSize === 'number' && Number.isFinite(filters.pageSize)
    ? Math.max(1, Math.floor(filters.pageSize))
    : null;
  if (!pageSize) {
    return filtered;
  }

  const page = typeof filters.page === 'number' && Number.isFinite(filters.page)
    ? Math.max(1, Math.floor(filters.page))
    : 1;
  const start = (page - 1) * pageSize;
  return filtered.slice(start, start + pageSize);
}

function extractBookingArray(payload: unknown): unknown[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!isRecord(payload)) {
    return [];
  }

  for (const key of ['items', 'data', 'results']) {
    const value = payload[key];
    if (Array.isArray(value)) {
      return value;
    }
  }

  const single = extractBookingRecord(payload);
  return single ? [single] : [];
}

function extractBookingRecord(payload: unknown): unknown | undefined {
  if (!isRecord(payload)) {
    return undefined;
  }

  for (const key of ['booking', 'item', 'data', 'result']) {
    const candidate = payload[key];
    if (isRecord(candidate)) {
      return candidate;
    }
  }

  if (typeof payload['id'] === 'string') {
    return payload;
  }

  return undefined;
}

function extractPaymentRecord(payload: unknown): unknown | undefined {
  if (!isRecord(payload)) {
    return undefined;
  }

  for (const key of ['payment', 'item', 'data', 'result']) {
    const candidate = payload[key];
    if (isRecord(candidate)) {
      return candidate;
    }
  }

  if (typeof payload['id'] === 'string' && typeof payload['bookingId'] === 'string') {
    return payload;
  }

  return undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function bookingDateTime(booking: Booking): number {
  return new Date(`${booking.appointmentDate}T${booking.slotStartTime}:00`).getTime();
}

function toLocalIsoDate(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function normalizeBookingStatus(value: unknown): BookingStatus | undefined {
  return normalizeEnum(value, BOOKING_STATUSES);
}

function normalizePaymentStatus(value: unknown): PaymentStatus | undefined {
  return normalizeEnum(value, PAYMENT_STATUSES);
}

function normalizePaymentMode(value: unknown): PaymentMode | undefined {
  return normalizeEnum(value, PAYMENT_MODES);
}

function normalizeProofType(value: unknown): ProofType | undefined {
  return normalizeEnum(value, PROOF_TYPES);
}

function normalizePaymentMethod(value: unknown): Payment['paymentMethod'] | undefined {
  return normalizeEnum(value, ['GCash', 'Maya', 'BankTransfer', 'PayAtClinic']);
}

function normalizeEnum<T extends string>(value: unknown, allowed: readonly T[]): T | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();
  return allowed.find((item) => item.toLowerCase() === normalized);
}

function trimRequiredString(value: string): string {
  return value.trim();
}

function trimOptionalString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function normalizeBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === 'boolean') {
    return value;
  }

  return fallback;
}

function normalizeNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
}

function normalizeNullableNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

function extractApiErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof HttpErrorResponse) {
    const errorBody = err.error as {
      message?: string;
      errors?: Record<string, string[] | string>;
    } | null;

    if (typeof errorBody?.message === 'string' && errorBody.message.trim()) {
      return errorBody.message;
    }

    if (errorBody?.errors) {
      for (const value of Object.values(errorBody.errors)) {
        const values = Array.isArray(value) ? value : [value];
        const firstValidationError = values.find((item) => typeof item === 'string' && item.trim().length > 0);
        if (typeof firstValidationError === 'string') {
          return firstValidationError;
        }
      }
    }

    if (typeof err.message === 'string' && err.message.trim()) {
      return err.message;
    }
  }

  if (err instanceof Error && err.message.trim()) {
    return err.message;
  }

  return fallback;
}
