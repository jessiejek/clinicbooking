import { AsyncPipe, NgIf } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Doctor } from '../../../core/models';
import { DoctorStateService } from '../../../core/services/doctor-state.service';
import { MockDataService } from '../../../core/services/mock-data.service';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { DoctorScheduleFormComponent, DoctorScheduleDraft } from '../components/doctor-schedule-form/doctor-schedule-form.component';

@Component({
  selector: 'app-admin-doctor-form-page',
  standalone: true,
  imports: [AsyncPipe, NgIf, ReactiveFormsModule, AvatarComponent, DoctorScheduleFormComponent],
  template: `
    <section class="page-shell">
      <div class="page-shell__header">
        <div>
          <button type="button" class="btn-ghost" (click)="cancel()">← Back to Doctors</button>
          <h2 class="page-title">{{ isEditMode ? 'Edit Doctor' : 'Add Doctor' }}</h2>
          <p class="page-subtitle">Update profile, schedule, and consultation settings.</p>
        </div>
      </div>

      <form class="doctor-form clinic-card" [formGroup]="form" (ngSubmit)="submit()">
        <div class="doctor-form__hero">
          <app-avatar [name]="form.value.fullName || 'Doctor'" size="xl"></app-avatar>
          <div>
            <label class="file-input">
              <input type="file" accept="image/*" />
              <span>Choose profile photo</span>
            </label>
            <p class="page-subtitle">Photo upload is mock only for this phase.</p>
          </div>
        </div>

        <div class="form-grid">
          <label class="form-field">
            <span class="form-field__label">Full Name</span>
            <input class="filter-input" formControlName="fullName" placeholder="Full Name" />
          </label>
          <label class="form-field">
            <span class="form-field__label">Specialty</span>
            <input class="filter-input" formControlName="specialization" placeholder="Specialization" />
          </label>
          <label class="form-field">
            <span class="form-field__label">PRC Number</span>
            <input class="filter-input" formControlName="licenseNumber" placeholder="License Number" />
          </label>
          <label class="form-field">
            <span class="form-field__label">PTR Number</span>
            <input class="filter-input" formControlName="ptrNumber" placeholder="PTR Number" />
          </label>
          <label class="form-field">
            <span class="form-field__label">S2 Number</span>
            <input class="filter-input" formControlName="s2Number" placeholder="S2 Number" />
          </label>
          <label class="form-field">
            <span class="form-field__label">Consultation Fee</span>
            <input class="filter-input" type="number" formControlName="consultationFee" placeholder="Consultation Fee" />
          </label>
          <label class="form-field">
            <span class="form-field__label">Status</span>
            <select class="filter-input" formControlName="status">
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="OnLeave">On Leave</option>
            </select>
          </label>
          <label class="form-field">
            <span class="form-field__label">Slot Duration</span>
            <input class="filter-input" type="number" formControlName="slotDurationMinutes" placeholder="Slot Duration" />
          </label>
          <label class="form-field">
            <span class="form-field__label">Slot Capacity</span>
            <input class="filter-input" type="number" formControlName="slotCapacity" placeholder="Slot Capacity" />
          </label>
          <label class="form-field">
            <span class="form-field__label">Daily Patient Limit</span>
            <input class="filter-input" type="number" formControlName="dailyPatientLimit" placeholder="Daily Patient Limit" />
          </label>
        </div>

        <textarea class="textarea" formControlName="bio" placeholder="Doctor bio"></textarea>

        <div class="section-heading">Working Days</div>
        <app-doctor-schedule-form [(value)]="scheduleDraft"></app-doctor-schedule-form>

        <div class="form-actions">
          <button type="button" class="btn-ghost" (click)="cancel()">Cancel</button>
          <button type="submit" class="btn-primary" [disabled]="form.invalid">Save Doctor</button>
        </div>
      </form>
    </section>
  `,
  styleUrl: './doctor-form.page.scss'
})
export class DoctorFormPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly doctorState = inject(DoctorStateService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly mockData = inject(MockDataService);
  private readonly destroyRef = inject(DestroyRef);

  isEditMode = false;
  doctorId: string | null = null;
  scheduleDraft: DoctorScheduleDraft[] = [];
  form = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    specialization: ['', Validators.required],
    bio: [''],
    licenseNumber: [''],
    ptrNumber: [''],
    s2Number: [''],
    consultationFee: [0, [Validators.required, Validators.min(0)]],
    status: ['Active'],
    slotDurationMinutes: [30],
    slotCapacity: [1],
    dailyPatientLimit: [null as number | null]
  });

  ngOnInit(): void {
    this.doctorId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.doctorId;
    if (this.doctorId) {
      this.scheduleDraft = this.mockData
        .getDoctorSchedulesByDoctorId(this.doctorId)
        .map((schedule) => ({
          dayOfWeek: schedule.dayOfWeek,
          enabled: true,
          startTime: schedule.startTime,
          endTime: schedule.endTime
        }));
      this.doctorState
        .getDoctorById(this.doctorId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((doctor) => {
          if (doctor) {
            this.form.patchValue({
              fullName: doctor.fullName,
              specialization: doctor.specialization,
              bio: doctor.bio ?? '',
              licenseNumber: doctor.licenseNumber ?? '',
              ptrNumber: doctor.ptrNumber ?? '',
              s2Number: doctor.s2Number ?? '',
              consultationFee: doctor.consultationFee,
              status: doctor.status,
              slotDurationMinutes: doctor.slotDurationMinutes,
              slotCapacity: doctor.slotCapacity,
              dailyPatientLimit: doctor.dailyPatientLimit
            });
          }
        });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const doctor: Omit<Doctor, 'id'> = {
      userId: this.doctorId ? this.mockData.getDoctorById(this.doctorId)?.userId ?? `user-doctor-${Date.now()}` : `user-doctor-${Date.now()}`,
      fullName: value.fullName ?? '',
      specialization: value.specialization ?? '',
      bio: value.bio ?? '',
      licenseNumber: value.licenseNumber ?? '',
      ptrNumber: value.ptrNumber ?? '',
      s2Number: value.s2Number ?? '',
      consultationFee: Number(value.consultationFee ?? 0),
      status: (value.status as Doctor['status']) ?? 'Active',
      slotDurationMinutes: Number(value.slotDurationMinutes ?? 30),
      slotCapacity: Number(value.slotCapacity ?? 1),
      dailyPatientLimit: value.dailyPatientLimit ?? null
    };

    if (this.isEditMode && this.doctorId) {
      this.doctorState.updateDoctor({ ...doctor, id: this.doctorId });
    } else {
      this.doctorState.addDoctor(doctor);
    }
    void this.router.navigate(['/admin/doctors']);
  }

  cancel(): void {
    void this.router.navigate(['/admin/doctors']);
  }
}
