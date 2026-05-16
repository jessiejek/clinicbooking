import { AsyncPipe, CurrencyPipe, DatePipe, NgFor, NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Booking } from '../../../core/models';
import { MockDataService } from '../../../core/services/mock-data.service';
import { loadBookings } from '../../../store/bookings/bookings.actions';
import {
  selectBookings,
  selectBookingsLoading,
  selectPendingVerifications,
  selectTodaysBookings
} from '../../../store/bookings/bookings.selectors';
import { loadDoctors } from '../../../store/doctors/doctors.actions';
import { selectAllDoctors } from '../../../store/doctors/doctors.selectors';
import { loadNotifications } from '../../../store/notifications/notifications.actions';
import { loadPatients } from '../../../store/patients/patients.actions';
import { selectAllPatients } from '../../../store/patients/patients.selectors';
import { TodayAppointmentsTableComponent } from '../components/today-appointments-table/today-appointments-table.component';
import { StatCardComponent } from '../components/stat-card/stat-card.component';

@Component({
  selector: 'app-admin-dashboard-page',
  standalone: true,
  imports: [
    AsyncPipe,
    CurrencyPipe,
    DatePipe,
    NgFor,
    NgIf,
    StatCardComponent,
    TodayAppointmentsTableComponent
  ],
  template: `
    <section class="page-shell">
      <div class="page-shell__header">
        <div>
          <h2 class="page-title">Dashboard</h2>
          <p class="page-subtitle">Live admin overview for bookings, patients, and payments.</p>
        </div>
      </div>

      <div class="stats-grid">
        <app-stat-card color="green" icon="calendar-outline" label="Today's Appointments" [value]="todayAppointmentsCount"></app-stat-card>
        <app-stat-card color="blue" icon="stats-chart-outline" label="Monthly Appointments" [value]="monthlyAppointmentsCount"></app-stat-card>
        <app-stat-card color="amber" icon="cash-outline" label="Revenue Today" [value]="(revenueToday | currency:'PHP':'symbol-narrow':'1.0-0') || 'PHP 0'"></app-stat-card>
        <app-stat-card color="red" icon="alert-circle-outline" label="Pending Verifications" [value]="pendingVerificationCount" badgeLabel="Action Required"></app-stat-card>
        <app-stat-card color="blue" icon="time-outline" label="On Hold Bookings" [value]="onHoldCount"></app-stat-card>
        <app-stat-card color="red" icon="warning-outline" label="Unpaid Completed" [value]="unpaidCompletedCount" badgeLabel="Collect Payment"></app-stat-card>
        <app-stat-card color="gray" icon="person-remove-outline" label="No Shows Today" [value]="noShowCount"></app-stat-card>
        <app-stat-card color="amber" icon="calendar-outline" label="Follow-Ups (7 days)" [value]="followUpsCount"></app-stat-card>
      </div>

      <div class="chart-grid">
        <div class="clinic-card">
          <div class="section-heading">Most Booked Doctors</div>
          <div class="chart-card chart-card--bar">
            <div class="bar-row" *ngFor="let item of topDoctorStats">
              <div class="bar-row__label">{{ item.label }}</div>
              <div class="bar-row__track">
                <div class="bar-row__fill" [style.width.%]="item.max ? (item.value / item.max) * 100 : 0"></div>
              </div>
              <div class="bar-row__value">{{ item.value }}</div>
            </div>
          </div>
        </div>

        <div class="clinic-card">
          <div class="section-heading">Revenue This Month</div>
          <div class="chart-card chart-card--area">
            <svg viewBox="0 0 600 220" class="area-chart" aria-label="Revenue chart">
              <defs>
                <linearGradient id="revenueGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" [attr.stop-color]="chartColor" stop-opacity="0.42"></stop>
                  <stop offset="100%" [attr.stop-color]="chartColor" stop-opacity="0.06"></stop>
                </linearGradient>
              </defs>
              <path [attr.d]="areaFillPath" fill="url(#revenueGradient)"></path>
              <path
                [attr.d]="areaLinePath"
                fill="none"
                [attr.stroke]="chartColor"
                stroke-width="4"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></path>
            </svg>
            <div class="area-chart__legend">
              <span *ngFor="let point of revenueLegend">{{ point }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="clinic-card">
        <div class="section-heading">Today's Appointments</div>
        <app-today-appointments-table
          [bookings]="todaysBookings"
          [doctors]="doctors"
          [patients]="patients"
          [services]="services"
          [isLoading]="isLoading"
          (rowClicked)="openBooking($event.id)"
          (action)="handleTableAction($event)"
        ></app-today-appointments-table>
      </div>
    </section>
  `,
  styleUrl: './dashboard.page.scss'
})
export class DashboardPage implements OnInit {
  private readonly store = inject(Store);
  private readonly mockData = inject(MockDataService);
  private readonly router = inject(Router);

  bookings: Booking[] = [];
  doctors = this.mockData.getDoctors();
  patients = this.mockData.getPatients();
  services = this.mockData.getServices();
  todaysBookings: Booking[] = [];
  isLoading = false;

  todayAppointmentsCount = 0;
  monthlyAppointmentsCount = 0;
  revenueToday = 0;
  pendingVerificationCount = 0;
  onHoldCount = 0;
  unpaidCompletedCount = 0;
  noShowCount = 0;
  followUpsCount = 0;
  topDoctorStats: Array<{ label: string; value: number; max: number }> = [];
  revenueLegend: string[] = [];
  areaLinePath = '';
  areaFillPath = '';
  chartColor = '#5d3e8e';

  ngOnInit(): void {
    this.chartColor = this.resolveBrandColor();
    this.revenueLegend = this.buildRevenueLegend();
    this.store.dispatch(loadBookings());
    this.store.dispatch(loadDoctors());
    this.store.dispatch(loadPatients());
    this.store.dispatch(loadNotifications());

    this.store.select(selectBookingsLoading).subscribe((isLoading) => (this.isLoading = isLoading));
    this.store.select(selectBookings).subscribe((bookings) => {
      this.bookings = bookings;
      this.refreshStats();
    });
    this.store.select(selectTodaysBookings).subscribe((bookings) => {
      this.todaysBookings = bookings;
      this.refreshCharts();
    });
    this.store.select(selectPendingVerifications).subscribe((bookings) => {
      this.pendingVerificationCount = bookings.length;
    });
    this.store.select(selectAllDoctors).subscribe((doctors) => {
      this.doctors = doctors.length ? doctors : this.mockData.getDoctors();
      this.refreshCharts();
    });
    this.store.select(selectAllPatients).subscribe((patients) => {
      this.patients = patients.length ? patients : this.mockData.getPatients();
    });
  }

  handleTableAction(action: string): void {
    if (action === 'view') {
      void this.openBooking(this.todaysBookings[0]?.id ?? '');
    }
  }

  openBooking(id: string): void {
    if (!id) {
      return;
    }
    void this.router.navigate(['/admin/bookings', id]);
  }

  private refreshStats(): void {
    const today = this.localIsoDate();
    const monthKey = today.slice(0, 7);
    this.todayAppointmentsCount = this.bookings.filter((booking) => booking.appointmentDate === today).length;
    this.monthlyAppointmentsCount = this.bookings.filter((booking) => booking.appointmentDate.startsWith(monthKey)).length;
    this.revenueToday = this.bookings
      .filter((booking) => booking.appointmentDate === today && booking.paymentStatus === 'Paid')
      .reduce((total, booking) => total + booking.totalFee, 0);
    this.onHoldCount = this.bookings.filter((booking) => booking.status === 'OnHold').length;
    this.unpaidCompletedCount = this.bookings.filter(
      (booking) => booking.status === 'Completed' && booking.paymentStatus === 'Unpaid'
    ).length;
    this.noShowCount = this.bookings.filter(
      (booking) => booking.status === 'NoShow' && booking.appointmentDate === today
    ).length;
    this.followUpsCount = this.mockData.getAdminDashboardStats().upcomingFollowUps;
  }

  private refreshCharts(): void {
    const doctorStats = this.doctors.slice(0, 3).map((doctor) => ({
      label: doctor.fullName,
      value: this.bookings.filter((booking) => booking.doctorId === doctor.id).length
    }));
    const maxCount = Math.max(...doctorStats.map((item) => item.value), 1);
    this.topDoctorStats = doctorStats.map((item) => ({ ...item, max: maxCount }));

    const revenueData = Array.from({ length: 30 }, () => Math.floor(Math.random() * 3000) + 500);
    const points = revenueData.map((value, index) => {
      const x = (index / (revenueData.length - 1)) * 560 + 20;
      const y = 190 - ((value - 500) / 3000) * 150;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    this.areaLinePath = `M ${points.join(' L ')}`;
    this.areaFillPath = `${this.areaLinePath} L 580,200 L 20,200 Z`;
  }

  private buildRevenueLegend(): string[] {
    const now = new Date();
    return Array.from({ length: 6 }, (_, index) =>
      new Date(now.getFullYear(), now.getMonth() - (5 - index), 1).toLocaleString(undefined, {
        month: 'short'
      })
    );
  }

  private localIsoDate(): string {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offset).toISOString().slice(0, 10);
  }

  private resolveBrandColor(): string {
    if (typeof document === 'undefined') {
      return this.chartColor;
    }

    const c = getComputedStyle(document.documentElement)
      .getPropertyValue('--ion-color-primary')
      .trim();

    return c || this.chartColor;
  }
}
