import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ToastController } from '@ionic/angular/standalone';
import { of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Booking, Patient, Service } from '../../../core/models';
import { MockDataService } from '../../../core/services/mock-data.service';
import { loadBookings, markComplete, markNoShow } from '../../../store/bookings/bookings.actions';
import {
  selectTodaysBookingsByDoctorId,
  selectUpcomingBookingsByDoctorId
} from '../../../store/bookings/bookings.selectors';
import { selectAllPatients } from '../../../store/patients/patients.selectors';
import { selectCurrentUser } from '../../../store/auth/auth.selectors';
import { selectDoctorByUserId, selectDoctorDayStatus } from '../../../store/doctors/doctors.selectors';
import { loadDoctors, loadSchedules, setDoctorDayStatus } from '../../../store/doctors/doctors.actions';
import { loadPatients } from '../../../store/patients/patients.actions';
import { DoctorQueueTableComponent } from '../components/doctor-queue-table/doctor-queue-table.component';
import { DoctorStatusPanelComponent } from '../components/doctor-status-panel/doctor-status-panel.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

interface DashboardSummary {
  todayQueue: number;
  waiting: number;
  completed: number;
  noShow: number;
}

@Component({
  standalone: true,
  selector: 'app-doctor-dashboard-page',
  imports: [
    AsyncPipe,
    NgFor,
    NgIf,
    PageHeaderComponent,
    EmptyStateComponent,
    DoctorStatusPanelComponent,
    DoctorQueueTableComponent
  ],
  template: `
    <ng-container *ngIf="doctor$ | async as doctor">
      <app-page-header title="Dashboard" subtitle="Doctor Portal">
        <div class="dashboard-header-copy">
          <h2>Good morning, {{ doctor.fullName }}</h2>
          <p>Here is your queue and schedule for today.</p>
        </div>
      </app-page-header>

      <app-doctor-status-panel
        [doctor]="doctor"
        [status]="(doctorDayStatus$ | async) ?? null"
        (statusChanged)="updateStatus($event)"
      ></app-doctor-status-panel>

      <ng-container *ngIf="summary$ | async as summary">
        <section class="stat-grid">
          <article class="clinic-card stat-card stat-card--blue">
            <span class="stat-card__label">Today's Queue</span>
            <strong class="stat-card__value">{{ summary.todayQueue }}</strong>
          </article>
          <article class="clinic-card stat-card stat-card--amber">
            <span class="stat-card__label">Waiting</span>
            <strong class="stat-card__value">{{ summary.waiting }}</strong>
          </article>
          <article class="clinic-card stat-card stat-card--green">
            <span class="stat-card__label">Completed Today</span>
            <strong class="stat-card__value">{{ summary.completed }}</strong>
          </article>
          <article class="clinic-card stat-card stat-card--red">
            <span class="stat-card__label">No Show Today</span>
            <strong class="stat-card__value">{{ summary.noShow }}</strong>
          </article>
        </section>
      </ng-container>

      <section class="content-grid">
        <div class="content-grid__main">
          <ng-container *ngIf="todayBookings$ | async as todayBookings">
            <ng-container *ngIf="doctorPatients$ | async as doctorPatients">
              <app-doctor-queue-table
                [bookings]="todayBookings"
                [patients]="doctorPatients"
                [services]="services"
                (openBooking)="openAppointment($event)"
                (startConsultation)="startConsultation($event)"
                (markComplete)="completeBooking($event)"
                (markNoShow)="noShowBooking($event)"
              ></app-doctor-queue-table>
            </ng-container>
          </ng-container>
        </div>

        <aside class="content-grid__aside">
          <div class="clinic-card upcoming-card">
            <div class="card-head">
              <div>
                <p class="section-label">Upcoming</p>
                <h3>Next 3 Appointments</h3>
              </div>
            </div>

            <ng-container *ngIf="upcomingBookings$ | async as upcomingBookings">
              <ng-container *ngIf="doctorPatients$ | async as doctorPatients">
              <app-empty-state
                *ngIf="upcomingBookings.length === 0"
                icon="calendar-outline"
                title="No upcoming appointments"
                description="You do not have any future bookings assigned to you yet."
              ></app-empty-state>

              <div class="upcoming-list" *ngIf="upcomingBookings.length > 0">
                <article class="upcoming-item" *ngFor="let booking of upcomingBookings">
                  <div>
                    <strong>{{ patientName(booking.patientId, doctorPatients) }}</strong>
                    <p>{{ serviceName(booking.serviceId) }}</p>
                    <span>{{ booking.appointmentDate }} {{ booking.slotStartTime }}</span>
                  </div>
                  <button type="button" class="btn-ghost" (click)="openAppointment(booking.id)">Open</button>
                </article>
              </div>
              </ng-container>
            </ng-container>
          </div>
        </aside>
      </section>
    </ng-container>
  `,
  styleUrl: './doctor-dashboard.page.scss'
})
export class DoctorDashboardPage implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly toastController = inject(ToastController);
  private readonly mockData = inject(MockDataService);

  readonly services: Service[] = this.mockData.getServices();

  readonly doctor$ = this.store.select(selectCurrentUser).pipe(
    switchMap((user) => (user ? this.store.select(selectDoctorByUserId(user.id)) : of(undefined)))
  );

  readonly doctorDayStatus$ = this.doctor$.pipe(
    switchMap((doctor) => (doctor ? this.store.select(selectDoctorDayStatus(doctor.id)) : of(null)))
  );

  readonly todayBookings$ = this.doctor$.pipe(
    switchMap((doctor) => (doctor ? this.store.select(selectTodaysBookingsByDoctorId(doctor.id)) : of([])))
  );

  readonly upcomingBookings$ = this.doctor$.pipe(
    switchMap((doctor) => (doctor ? this.store.select(selectUpcomingBookingsByDoctorId(doctor.id)) : of([]))),
    map((bookings) => bookings.slice(0, 3))
  );

  readonly doctorPatients$ = this.doctor$.pipe(
    switchMap((doctor) =>
      doctor
        ? this.store.select(selectAllPatients).pipe(
            map((patients) => {
              const patientIds = new Set(
                this.mockData.getBookings().filter((booking) => booking.doctorId === doctor.id).map((booking) => booking.patientId)
              );
              return patients.filter((patient) => patientIds.has(patient.id));
            })
          )
        : of([])
    )
  );

  readonly summary$ = this.todayBookings$.pipe(map((todayBookings) => this.buildSummary(todayBookings)));

  ngOnInit(): void {
    this.store.dispatch(loadBookings());
    this.store.dispatch(loadDoctors());
    this.store.dispatch(loadSchedules());
    this.store.dispatch(loadPatients());
  }

  updateStatus(event: {
    doctorId: string;
    status: 'Available' | 'RunningLate' | 'UnavailableToday';
    runningLateMinutes?: number;
  }): void {
    this.store.dispatch(
      setDoctorDayStatus({
        doctorId: event.doctorId,
        status: event.status,
        runningLateMinutes: event.runningLateMinutes
      })
    );
    void this.presentToast(`Status updated to ${event.status}.`);
  }

  openAppointment(bookingId: string): void {
    void this.router.navigate(['/doctor/appointments', bookingId]);
  }

  startConsultation(bookingId: string): void {
    void this.router.navigate(['/doctor/consultation', bookingId]);
  }

  completeBooking(bookingId: string): void {
    this.store.dispatch(markComplete({ bookingId }));
  }

  noShowBooking(bookingId: string): void {
    this.store.dispatch(markNoShow({ bookingId }));
  }

  patientName(patientId: string, patients: Patient[]): string {
    const patient = patients.find((item) => item.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient';
  }

  serviceName(serviceId: string): string {
    return this.services.find((service) => service.id === serviceId)?.name ?? 'Unknown Service';
  }

  private buildSummary(bookings: Booking[]): DashboardSummary {
    return {
      todayQueue: bookings.length,
      waiting: bookings.filter((booking) => booking.status === 'Confirmed' || booking.status === 'Pending').length,
      completed: bookings.filter((booking) => booking.status === 'Completed').length,
      noShow: bookings.filter((booking) => booking.status === 'NoShow').length
    };
  }

  private async presentToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 1800,
      color: 'success',
      position: 'top'
    });
    await toast.present();
  }
}
