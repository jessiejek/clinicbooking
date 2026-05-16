import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit, Signal, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { ToastController } from '@ionic/angular/standalone';
import { Doctor, DoctorDayStatus } from '../../../core/models';
import { loadDoctors, setDoctorDayStatus } from '../../../store/doctors/doctors.actions';
import { selectAllDoctors, selectDoctorsLoading, selectDoctorDayStatus } from '../../../store/doctors/doctors.selectors';
import { DoctorStatusCardComponent } from '../components/doctor-status-card/doctor-status-card.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';

@Component({
  selector: 'app-staff-doctor-status-page',
  standalone: true,
  imports: [NgFor, NgIf, DoctorStatusCardComponent, EmptyStateComponent, PageHeaderComponent, SkeletonComponent],
  template: `
    <div class="page-header-area">
      <app-page-header
        title="Doctor Availability"
        subtitle="Set running late or unavailable status for today"
      ></app-page-header>
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
  private readonly store = inject(Store);
  private readonly toastCtrl = inject(ToastController);

  doctors: Doctor[] = [];
  isLoading = false;
  private readonly dayStatusSignals = new Map<string, Signal<DoctorDayStatus | undefined>>();

  ngOnInit(): void {
    this.store.dispatch(loadDoctors());
    this.store.select(selectAllDoctors).subscribe((doctors) => (this.doctors = doctors));
    this.store.select(selectDoctorsLoading).subscribe((loading) => (this.isLoading = loading));
  }

  getDayStatus(doctorId: string): DoctorDayStatus | null {
    let statusSignal = this.dayStatusSignals.get(doctorId);
    if (!statusSignal) {
      statusSignal = this.store.selectSignal(selectDoctorDayStatus(doctorId));
      this.dayStatusSignals.set(doctorId, statusSignal);
    }
    return statusSignal() ?? null;
  }

  onStatusChanged(event: {
    doctorId: string;
    status: 'Available' | 'RunningLate' | 'UnavailableToday';
    runningLateMinutes?: number;
  }): void {
    this.store.dispatch(setDoctorDayStatus(event));
    const doctor = this.doctors.find((item) => item.id === event.doctorId);
    void this.presentToast(`${doctor?.fullName ?? 'Doctor'} status updated to ${this.labelForStatus(event.status)}`);
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

  private labelForStatus(status: 'Available' | 'RunningLate' | 'UnavailableToday'): string {
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
