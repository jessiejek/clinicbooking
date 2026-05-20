import { NgFor, NgIf } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { IonSpinner, ToastController } from '@ionic/angular/standalone';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, finalize, forkJoin, of, switchMap } from 'rxjs';
import { AvailabilityStatus, Doctor, DoctorDayStatus, DoctorSchedule } from '../../../core/models';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { DoctorStatusPanelComponent } from '../components/doctor-status-panel/doctor-status-panel.component';
import { DoctorService } from '../services/doctor.service';

@Component({
  standalone: true,
  selector: 'app-doctor-dashboard-page',
  imports: [
    NgFor,
    NgIf,
    IonSpinner,
    PageHeaderComponent,
    EmptyStateComponent,
    StatusBadgeComponent,
    DoctorStatusPanelComponent
  ],
  template: `
    <div class="page-loading" *ngIf="isLoading">
      <ion-spinner name="crescent"></ion-spinner>
    </div>

    <ng-container *ngIf="!isLoading">
      <ng-container *ngIf="doctor; else dashboardErrorState">
        <app-page-header title="Dashboard" subtitle="Doctor Portal">
          <div class="dashboard-header-copy">
            <h2>Good morning, {{ doctor.fullName }}</h2>
            <p>Here is your clinic overview for today.</p>
          </div>
        </app-page-header>

        <section class="dashboard-grid">
          <article
            class="clinic-card doctor-profile-card"
            [class.clinic-card--accent-green]="todayStatusLabel === 'Available'"
            [class.clinic-card--accent-amber]="todayStatusLabel === 'RunningLate'"
            [class.clinic-card--accent-red]="todayStatusLabel === 'UnavailableToday'"
          >
            <p class="section-label">Profile</p>
            <h3>{{ doctor.fullName }}</h3>

            <div class="profile-grid">
              <div class="profile-item">
                <span class="profile-label">Specialization</span>
                <strong>{{ doctor.specialization }}</strong>
              </div>
              <div class="profile-item">
                <span class="profile-label">Consultation Fee</span>
                <strong>PHP {{ doctor.consultationFee }}</strong>
              </div>
              <div class="profile-item">
                <span class="profile-label">Account Status</span>
                <app-status-badge [status]="doctor.status"></app-status-badge>
              </div>
              <div class="profile-item">
                <span class="profile-label">Today's Status</span>
                <app-status-badge [status]="todayStatusLabel"></app-status-badge>
              </div>
            </div>
          </article>

          <app-doctor-status-panel
            [doctor]="doctor"
            [status]="doctorDayStatus"
            (statusChanged)="updateStatus($event)"
          ></app-doctor-status-panel>

          <article class="clinic-card schedule-card">
            <div class="card-head">
              <div>
                <p class="section-label">Schedule</p>
                <h3>Working Days</h3>
              </div>
            </div>

            <ng-container *ngIf="doctorSchedule.length > 0; else noScheduleState">
              <div class="schedule-list">
                <div class="schedule-item" *ngFor="let schedule of doctorSchedule">
                  <strong>{{ schedule.dayOfWeek }}</strong>
                  <span>{{ formatTime(schedule.startTime) }} - {{ formatTime(schedule.endTime) }}</span>
                </div>
              </div>
            </ng-container>
          </article>
        </section>

        <ng-template #noScheduleState>
          <app-empty-state
            icon="time-outline"
            title="No schedule found"
            description="Your weekly schedule has not been configured yet."
          ></app-empty-state>
        </ng-template>
      </ng-container>
    </ng-container>

    <ng-template #dashboardErrorState>
      <app-empty-state
        icon="medical-outline"
        title="Unable to load dashboard"
        [description]="dashboardError ?? 'We could not load your doctor profile.'"
        ctaLabel="Retry"
        (ctaClick)="reload()"
      ></app-empty-state>
    </ng-template>
  `,
  styleUrl: './doctor-dashboard.page.scss'
})
export class DoctorDashboardPage implements OnInit {
  private readonly doctorService = inject(DoctorService);
  private readonly toastController = inject(ToastController);
  private readonly destroyRef = inject(DestroyRef);

  isLoading = true;
  dashboardError: string | null = null;
  doctor: Doctor | null = null;
  doctorSchedule: DoctorSchedule[] = [];
  doctorDayStatus: DoctorDayStatus | null = null;

  get todayStatusLabel(): AvailabilityStatus {
    return this.doctorDayStatus?.status ?? 'Available';
  }

  ngOnInit(): void {
    this.loadDashboard();
  }

  reload(): void {
    this.loadDashboard();
  }

  updateStatus(event: {
    doctorId: string;
    status: AvailabilityStatus;
    runningLateMinutes?: number;
  }): void {
    if (!this.doctor) {
      return;
    }

    const date = this.getTodayLocalDateString();

    this.doctorService
      .setDayStatus(event.doctorId, {
        date,
        status: event.status,
        runningLateMinutes: event.status === 'RunningLate' ? event.runningLateMinutes ?? null : null
      })
      .pipe(
        catchError((error: unknown) => {
          void this.presentToast(extractApiErrorMessage(error, 'Failed to update availability status.'));
          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((status) => {
        if (!status) {
          return;
        }

        this.doctorDayStatus = { ...status };
        void this.presentToast(`Status updated to ${this.formatAvailabilityStatus(status.status)}.`, 'success');
      });
  }

  formatTime(time: string): string {
    const [hourPart, minutePart = '00'] = time.split(':');
    const hour24 = Number(hourPart);

    if (!Number.isFinite(hour24)) {
      return time;
    }

    const suffix = hour24 >= 12 ? 'PM' : 'AM';
    const hour12 = hour24 % 12 || 12;
    return `${String(hour12).padStart(2, '0')}:${minutePart.padStart(2, '0')} ${suffix}`;
  }

  private loadDashboard(): void {
    this.isLoading = true;
    this.dashboardError = null;
    this.doctor = null;
    this.doctorSchedule = [];
    this.doctorDayStatus = null;

    this.doctorService
      .getMyProfile()
      .pipe(
        switchMap((doctor) => {
          if (!doctor) {
            this.dashboardError = 'Doctor profile not found.';
            return of(null);
          }

          return forkJoin({
            doctor: of(doctor),
            schedule: this.doctorService.getDoctorSchedules(doctor.id).pipe(
              catchError((error: unknown) => {
                void this.presentToast(extractApiErrorMessage(error, 'Failed to load schedule.'));
                return of([] as DoctorSchedule[]);
              })
            ),
            dayStatus: this.doctorService.getDayStatus(doctor.id).pipe(
              catchError((error: unknown) => {
                void this.presentToast(extractApiErrorMessage(error, 'Failed to load today\'s status.'));
                return of(null as DoctorDayStatus | null);
              })
            )
          });
        }),
        catchError((error: unknown) => {
          this.dashboardError = extractApiErrorMessage(error, 'Failed to load doctor dashboard.');
          void this.presentToast(this.dashboardError);
          return of(null);
        }),
        finalize(() => {
          this.isLoading = false;
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((result) => {
        if (!result) {
          return;
        }

        this.doctor = result.doctor;
        this.doctorSchedule = result.schedule;
        this.doctorDayStatus = result.dayStatus ? { ...result.dayStatus } : null;
      });
  }

  private formatAvailabilityStatus(status: AvailabilityStatus): string {
    switch (status) {
      case 'RunningLate':
        return 'Running Late';
      case 'UnavailableToday':
        return 'Unavailable Today';
      default:
        return 'Available';
    }
  }

  private getTodayLocalDateString(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private async presentToast(message: string, color: 'danger' | 'success' = 'danger'): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 1800,
      color,
      position: 'top'
    });
    await toast.present();
  }
}

function extractApiErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null && 'error' in error) {
    const body = (error as { error?: unknown }).error;

    const message = extractFirstMessage(body);
    if (message) {
      return message;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}

function extractFirstMessage(body: unknown): string | null {
  if (typeof body === 'string' && body.trim()) {
    return body.trim();
  }

  if (typeof body !== 'object' || body === null) {
    return null;
  }

  const record = body as Record<string, unknown>;
  for (const key of ['message', 'detail', 'error', 'title']) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  const errors = record['errors'];
  if (Array.isArray(errors)) {
    for (const entry of errors) {
      const nested = extractFirstMessage(entry);
      if (nested) {
        return nested;
      }
    }
  }

  return null;
}
