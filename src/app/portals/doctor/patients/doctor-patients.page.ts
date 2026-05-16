import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { BehaviorSubject, combineLatest, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Booking, Patient } from '../../../core/models';
import { loadBookings } from '../../../store/bookings/bookings.actions';
import { selectBookingsByDoctorId } from '../../../store/bookings/bookings.selectors';
import { selectCurrentUser } from '../../../store/auth/auth.selectors';
import { selectDoctorByUserId } from '../../../store/doctors/doctors.selectors';
import { loadDoctors, loadSchedules } from '../../../store/doctors/doctors.actions';
import { loadPatients } from '../../../store/patients/patients.actions';
import { selectAllPatients } from '../../../store/patients/patients.selectors';
import { DoctorPatientCardComponent } from '../components/doctor-patient-card/doctor-patient-card.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

interface PatientListItem {
  patient: Patient;
  lastVisit: string;
  upcomingAppointmentsCount: number;
}

@Component({
  standalone: true,
  selector: 'app-doctor-patients-page',
  imports: [AsyncPipe, NgFor, NgIf, PageHeaderComponent, EmptyStateComponent, DoctorPatientCardComponent],
  template: `
    <app-page-header title="Patients" subtitle="Only patients who have booked with you"></app-page-header>

    <section class="clinic-card filter-card">
      <label class="search-field">
        <span>Search</span>
        <input
          type="search"
          [value]="search"
          (input)="setSearch($any($event.target).value)"
          placeholder="Patient code, name, contact, email"
        />
      </label>
    </section>

    <ng-container *ngIf="patients$ | async as patients">
      <app-empty-state
        *ngIf="patients.length === 0"
        icon="people-outline"
        title="No patients found"
        description="No patients are assigned to your bookings yet."
      ></app-empty-state>

      <section class="patients-list" *ngIf="patients.length > 0">
        <app-doctor-patient-card
          *ngFor="let item of patients"
          [patient]="item.patient"
          [lastVisit]="item.lastVisit"
          [upcomingAppointmentsCount]="item.upcomingAppointmentsCount"
          (viewPatient)="openPatient($event)"
        ></app-doctor-patient-card>
      </section>
    </ng-container>
  `,
  styleUrl: './doctor-patients.page.scss'
})
export class DoctorPatientsPage implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  search = '';
  private readonly search$ = new BehaviorSubject<string>('');

  readonly currentDoctor$ = this.store.select(selectCurrentUser).pipe(
    switchMap((user) => (user ? this.store.select(selectDoctorByUserId(user.id)) : of(undefined)))
  );

  readonly patients$ = this.currentDoctor$.pipe(
    switchMap((doctor) => {
      if (!doctor) {
        return of([] as PatientListItem[]);
      }
      return combineLatest([
        this.store.select(selectBookingsByDoctorId(doctor.id)),
        this.store.select(selectAllPatients),
        this.search$
      ]).pipe(
        map(([bookings, allPatients, search]) => {
          const doctorPatientIds = new Set(bookings.map((booking) => booking.patientId));
          const query = search.trim().toLowerCase();
          return allPatients
            .filter((patient) => doctorPatientIds.has(patient.id))
            .filter((patient) => {
              if (!query) {
                return true;
              }
              const haystack = [
                patient.patientCode,
                `${patient.firstName} ${patient.lastName}`,
                patient.contactNumber ?? '',
                patient.email ?? ''
              ]
                .join(' ')
                .toLowerCase();
              return haystack.includes(query);
            })
            .map((patient) => ({
              patient,
              lastVisit: this.lastVisit(bookings, patient.id),
              upcomingAppointmentsCount: this.upcomingCount(bookings, patient.id)
            }));
        })
      );
    })
  );

  ngOnInit(): void {
    this.store.dispatch(loadBookings());
    this.store.dispatch(loadDoctors());
    this.store.dispatch(loadSchedules());
    this.store.dispatch(loadPatients());
  }

  setSearch(value: string): void {
    this.search = value;
    this.search$.next(value);
  }

  openPatient(patientId: string): void {
    void this.router.navigate(['/doctor/patients', patientId]);
  }

  private lastVisit(bookings: Booking[], patientId: string): string {
    const completed = bookings
      .filter((booking) => booking.patientId === patientId && booking.status === 'Completed')
      .sort((a, b) => `${b.appointmentDate} ${b.slotStartTime}`.localeCompare(`${a.appointmentDate} ${a.slotStartTime}`));
    return completed[0]?.appointmentDate ?? '';
  }

  private upcomingCount(bookings: Booking[], patientId: string): number {
    const today = new Date().toISOString().slice(0, 10);
    return bookings.filter(
      (booking) =>
        booking.patientId === patientId &&
        booking.appointmentDate >= today &&
        booking.status !== 'Cancelled' &&
        booking.status !== 'NoShow'
    ).length;
  }
}
