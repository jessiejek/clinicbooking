import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Doctor } from '../../../core/models';
import { MockDataService } from '../../../core/services/mock-data.service';
import { loadDoctors, loadSchedules, setDoctorStatus } from '../../../store/doctors/doctors.actions';
import { selectAllDoctors, selectDoctorsLoading } from '../../../store/doctors/doctors.selectors';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-admin-doctors-page',
  standalone: true,
  imports: [AsyncPipe, FormsModule, NgFor, NgIf, AvatarComponent, EmptyStateComponent, SkeletonComponent, StatusBadgeComponent],
  template: `
    <section class="page-shell">
      <div class="page-shell__header">
        <div>
          <h2 class="page-title">Doctors</h2>
          <p class="page-subtitle">Manage doctor profiles and availability.</p>
        </div>
        <button type="button" class="btn-primary" (click)="addDoctor()">Add Doctor</button>
      </div>

      <div class="clinic-card" *ngIf="!isLoading && doctors.length > 0">
        <table class="clinic-table">
          <thead>
            <tr>
              <th>Avatar</th>
              <th>Name</th>
              <th>Specialization</th>
              <th>Fee</th>
              <th>Working Days</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let doctor of doctors" (click)="editDoctor(doctor.id)">
              <td><app-avatar [name]="doctor.fullName"></app-avatar></td>
              <td>{{ doctor.fullName }}</td>
              <td>{{ doctor.specialization }}</td>
              <td>₱{{ doctor.consultationFee }}</td>
              <td>{{ workingDays(doctor.id) }}</td>
              <td>
                <select [ngModel]="doctor.status" (ngModelChange)="setStatus(doctor.id, $event)" (click)="$event.stopPropagation()">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="OnLeave">On Leave</option>
                </select>
              </td>
              <td><app-status-badge [status]="doctor.status"></app-status-badge></td>
            </tr>
          </tbody>
        </table>
      </div>

      <app-skeleton *ngIf="isLoading" variant="row" [count]="3"></app-skeleton>

      <app-empty-state
        *ngIf="!isLoading && doctors.length === 0"
        icon="medical-outline"
        title="No doctors found"
        description="Add the first doctor profile to start managing schedules."
        ctaLabel="Add Doctor"
        (ctaClick)="addDoctor()"
      ></app-empty-state>
    </section>
  `,
  styleUrl: './doctors.page.scss'
})
export class DoctorsPage implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly mockData = inject(MockDataService);

  doctors: Doctor[] = [];
  isLoading = false;

  ngOnInit(): void {
    this.store.dispatch(loadDoctors());
    this.store.dispatch(loadSchedules());
    this.store.select(selectAllDoctors).subscribe((doctors) => (this.doctors = doctors));
    this.store.select(selectDoctorsLoading).subscribe((loading) => (this.isLoading = loading));
  }

  addDoctor(): void {
    void this.router.navigate(['/admin/doctors/new']);
  }

  editDoctor(id: string): void {
    void this.router.navigate(['/admin/doctors', id, 'edit']);
  }

  setStatus(id: string, status: Doctor['status']): void {
    this.store.dispatch(setDoctorStatus({ doctorId: id, status }));
  }

  workingDays(doctorId: string): string {
    return this.mockData
      .getDoctorSchedulesByDoctorId(doctorId)
      .map((schedule) => schedule.dayOfWeek.slice(0, 3))
      .join(', ');
  }
}
