import { NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonInput } from '@ionic/angular/standalone';
import {
  AvailabilityStatus,
  Doctor,
  DoctorDayStatus
} from '../../../../core/models';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-doctor-status-panel',
  standalone: true,
  imports: [NgIf, FormsModule, IonInput, StatusBadgeComponent, ConfirmModalComponent],
  template: `
    <section class="clinic-card doctor-status-panel">
      <div class="doctor-status-panel__head">
        <div>
          <p class="section-label">Today</p>
          <h2>Availability Status</h2>
        </div>
        <app-status-badge [status]="currentStatusLabel"></app-status-badge>
      </div>

      <p class="doctor-status-panel__summary" *ngIf="status?.status === 'RunningLate'">
        Running late by {{ status?.runningLateMinutes ?? 0 }} minutes.
      </p>
      <p class="doctor-status-panel__summary" *ngIf="!status || status?.status === 'Available'">
        You are currently marked as available.
      </p>
      <p class="doctor-status-panel__summary" *ngIf="status?.status === 'UnavailableToday'">
        You are marked unavailable for today.
      </p>

      <div class="doctor-status-panel__actions">
        <button type="button" class="btn-primary" (click)="setAvailable()">Mark Available</button>

        <div class="running-late-box">
          <label>Minutes late</label>
          <ion-input
            type="number"
            min="5"
            inputmode="numeric"
            [value]="runningLateMinutes"
            (ionInput)="onMinutesChange($event)"
          ></ion-input>
          <button type="button" class="btn-ghost" [disabled]="runningLateMinutes < 5" (click)="setRunningLate()">
            Set Running Late
          </button>
        </div>

        <button type="button" class="btn-ghost" (click)="confirmUnavailable()">Mark Unavailable Today</button>
      </div>
    </section>

    <app-confirm-modal
      [isOpen]="unavailableModalOpen"
      title="Mark Unavailable Today"
      message="This will mark your status as unavailable for today."
      confirmLabel="Mark Unavailable"
      cancelLabel="Cancel"
      [isDanger]="true"
      (confirmed)="applyUnavailable()"
      (cancelled)="unavailableModalOpen = false"
    ></app-confirm-modal>
  `,
  styleUrl: './doctor-status-panel.component.scss'
})
export class DoctorStatusPanelComponent {
  @Input({ required: true }) doctor!: Doctor;
  @Input() status: DoctorDayStatus | null = null;

  @Output() statusChanged = new EventEmitter<{
    doctorId: string;
    status: AvailabilityStatus;
    runningLateMinutes?: number;
  }>();

  runningLateMinutes = 5;
  unavailableModalOpen = false;

  get currentStatusLabel(): AvailabilityStatus {
    return this.status?.status ?? 'Available';
  }

  setAvailable(): void {
    this.statusChanged.emit({
      doctorId: this.doctor.id,
      status: 'Available'
    });
  }

  setRunningLate(): void {
    const minutes = Math.max(5, Math.floor(this.runningLateMinutes || 0));
    if (minutes < 5) {
      return;
    }
    this.statusChanged.emit({
      doctorId: this.doctor.id,
      status: 'RunningLate',
      runningLateMinutes: minutes
    });
  }

  confirmUnavailable(): void {
    this.unavailableModalOpen = true;
  }

  applyUnavailable(): void {
    this.unavailableModalOpen = false;
    this.statusChanged.emit({
      doctorId: this.doctor.id,
      status: 'UnavailableToday'
    });
  }

  onMinutesChange(event: Event): void {
    const custom = event as CustomEvent<{ value?: string | number | null }>;
    const nextValue = Number(custom.detail?.value ?? 0);
    this.runningLateMinutes = Number.isFinite(nextValue) ? nextValue : 0;
  }
}
