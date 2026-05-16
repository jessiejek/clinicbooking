import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import {
  Announcement,
  ClinicSettings,
  Doctor,
  DoctorSchedule,
  Review,
  Service
} from '../../../core/models';
import { MockDataService } from '../../../core/services/mock-data.service';

@Injectable({ providedIn: 'root' })
export class PublicService {
  constructor(private mockData: MockDataService) {}

  getDoctors(): Observable<Doctor[]> {
    return of(this.mockData.doctors).pipe(delay(300));
  }

  getDoctorById(id: string): Observable<Doctor | undefined> {
    return of(this.mockData.doctors.find((d) => d.id === id)).pipe(delay(200));
  }

  getServices(): Observable<Service[]> {
    return of(this.mockData.services).pipe(delay(300));
  }

  getAnnouncements(): Observable<Announcement[]> {
    return of(this.mockData.announcements.filter((a) => a.isActive)).pipe(delay(300));
  }

  getClinicSettings(): Observable<ClinicSettings> {
    return of(this.mockData.clinicSettings).pipe(delay(100));
  }

  getDoctorReviews(doctorId: string): Observable<Review[]> {
    return of(this.mockData.reviews.filter((r) => r.doctorId === doctorId)).pipe(delay(200));
  }

  getDoctorServices(doctorId: string): Observable<Service[]> {
    return of(this.mockData.services.filter((s) => s.doctorIds.includes(doctorId))).pipe(delay(200));
  }

  getDoctorSchedules(doctorId: string): Observable<DoctorSchedule[]> {
    return of(this.mockData.doctorSchedules.filter((s) => s.doctorId === doctorId)).pipe(delay(200));
  }
}
