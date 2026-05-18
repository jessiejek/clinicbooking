import { NgFor, NgIf } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastController } from '@ionic/angular/standalone';
import { AvailabilityStatus, Doctor, DoctorDayStatus } from '../../../core/models';
import { DoctorStateService } from '../../../core/services/doctor-state.service';
import { DoctorStatusCardComponent } from '../components/doctor-status-card/doctor-status-card.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';

@Component({
  selector: 'app-staff-doctor-status-page',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    DoctorStatusCardComponent,
    EmptyStateComponent,
    PageHeaderComponent,
    SkeletonComponent
  ],
  template: `
    <div class="page-header-area">
      <app-page-header
        title="Doctor Availability"
        subtitle="Set running late or unavailable status for today"
      ></app-page-header>
    </div>

    <div class="status-summary" *ngIf="!isLoading && doctors.length > 0" aria-label="Doctor availability summary">
      <article class="status-summary__item status-summary__item--available">
        <span class="status-summary__label">Available</span>
        <strong>{{ availableCount }}</strong>
      </article>
      <article class="status-summary__item status-summary__item--late">
        <span class="status-summary__label">Running Late</span>
        <strong>{{ runningLateCount }}</strong>
      </article>
      <article class="status-summary__item status-summary__item--unavailable">
        <span class="status-summary__label">Unavailable</span>
        <strong>{{ unavailableCount }}</strong>
      </article>
    </div>

    <div class="doctor-status-grid" *ngIf="!isLoading && doctors.length > 0">
      <app-doctor-status-card
        *ngFor="let doctor of doctors"
        [doctor]="doctor"
        [dayStatus]="getDayStatus(doctor.id)"
        (statusChanged)="onStatusChanged($event)"
      ></app-doctor-status-card>
    </div>

    <app-skeleton *ngIf="isLoading" variant="card" [count]="3"></app-skeleton>

    <app-empty-state
      *ngIf="!isLoading && doctors.length === 0"
      icon="medical-outline"
      title="No doctors found"
      description="Load doctor records to manage availability."
    ></app-empty-state>
  `,
  styleUrl: './doctor-status.page.scss'
})
export class DoctorStatusPage implements OnInit {
  private readonly doctorState = inject(DoctorStateService);
  private readonly toastCtrl = inject(ToastController);
  private readonly destroyRef = inject(DestroyRef);

  doctors: Doctor[] = [];
  isLoading = false;
  private dayStatuses: Record<string, DoctorDayStatus> = {};

  ngOnInit(): void {
    this.doctorState
      .getDoctors()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((doctors) => (this.doctors = doctors));
    this.doctorState.isLoading$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((loading) => (this.isLoading = loading));
    this.doctorState.dayStatuses$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((statuses) => (this.dayStatuses = statuses));
  }

  get availableCount(): number {
    return this.countByStatus('Available');
  }

  get runningLateCount(): number {
    return this.countByStatus('RunningLate');
  }

  get unavailableCount(): number {
    return this.countByStatus('UnavailableToday');
  }

  getDayStatus(doctorId: string): DoctorDayStatus | null {
    return this.dayStatuses[doctorId] ?? null;
  }

  onStatusChanged(event: {
    doctorId: string;
    status: AvailabilityStatus;
    runningLateMinutes?: number;
  }): void {
    this.doctorState.setDoctorDayStatus(event);
    const doctor = this.doctors.find((item) => item.id === event.doctorId);
    void this.presentToast(
      `${doctor?.fullName ?? 'Doctor'} status updated to ${this.labelForStatus(event.status)}`
    );
  }

  private async presentToast(message: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2200,
      color: 'success',
      position: 'top'
    });
    await toast.present();
  }

  private countByStatus(status: AvailabilityStatus): number {
    return this.doctors.filter(
      (doctor) => (this.dayStatuses[doctor.id]?.status ?? 'Available') === status
    ).length;
  }

  private labelForStatus(status: AvailabilityStatus): string {
    switch (status) {
      case 'RunningLate':
        return 'Running Late';
      case 'UnavailableToday':
        return 'Unavailable Today';
      default:
        return 'Available';
    }
  }
}
