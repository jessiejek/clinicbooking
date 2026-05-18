import { AsyncPipe, CurrencyPipe, NgIf } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular/standalone';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthUser, Doctor } from '../../../core/models';
import { AuthStateService } from '../../../core/services/auth-state.service';
import { DoctorStateService } from '../../../core/services/doctor-state.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  standalone: true,
  selector: 'app-doctor-profile-page',
  imports: [AsyncPipe, CurrencyPipe, NgIf, ReactiveFormsModule, PageHeaderComponent, EmptyStateComponent],
  template: `
    <ng-container *ngIf="doctor$ | async as doctor; else notFound">
      <app-page-header title="My Profile" subtitle="Manage your professional profile"></app-page-header>

      <section class="profile-grid">
        <form class="clinic-card profile-form" [formGroup]="profileForm" (ngSubmit)="save(doctor)">
          <h3>Professional Profile</h3>

          <label>
            <span>Full Name</span>
            <input type="text" formControlName="fullName" />
          </label>

          <label>
            <span>Specialization</span>
            <input type="text" formControlName="specialization" />
          </label>

          <label>
            <span>Bio</span>
            <textarea rows="4" formControlName="bio"></textarea>
          </label>

          <div class="grid-2">
            <label>
              <span>Consultation Fee</span>
              <input type="number" formControlName="consultationFee" />
            </label>
            <label>
              <span>License Number</span>
              <input type="text" formControlName="licenseNumber" />
            </label>
            <label>
              <span>PTR Number</span>
              <input type="text" formControlName="ptrNumber" />
            </label>
            <label>
              <span>S2 Number</span>
              <input type="text" formControlName="s2Number" />
            </label>
          </div>

          <h3>Account Info</h3>
          <label>
            <span>Email</span>
            <input type="email" [value]="currentUser?.email ?? ''" readonly />
          </label>

          <label>
            <span>Contact Number</span>
            <input type="text" formControlName="contactNumber" />
          </label>

          <div class="grid-2">
            <label>
              <span>New Password</span>
              <input type="password" formControlName="newPassword" />
            </label>
            <label>
              <span>Confirm Password</span>
              <input type="password" formControlName="confirmPassword" />
            </label>
          </div>

          <div class="actions">
            <button type="submit" class="btn-primary" [disabled]="profileForm.invalid">Save Changes</button>
          </div>
        </form>

        <aside class="profile-preview">
          <section class="clinic-card preview-card">
            <p class="section-label">Public Listing Preview</p>
            <h3>{{ profileForm.value.fullName || doctor.fullName }}</h3>
            <p>{{ profileForm.value.specialization || doctor.specialization }}</p>
            <p class="bio">{{ profileForm.value.bio || doctor.bio || 'No bio provided.' }}</p>
            <div class="preview-meta">
              <span>Fee: {{ (profileForm.value.consultationFee ?? doctor.consultationFee) | currency:'PHP':'symbol-narrow':'1.0-0' }}</span>
              <span>License: {{ profileForm.value.licenseNumber || doctor.licenseNumber || 'N/A' }}</span>
              <span>PTR: {{ profileForm.value.ptrNumber || doctor.ptrNumber || 'N/A' }}</span>
              <span>S2: {{ profileForm.value.s2Number || doctor.s2Number || 'N/A' }}</span>
            </div>
          </section>
        </aside>
      </section>
    </ng-container>

    <ng-template #notFound>
      <app-empty-state
        icon="person-outline"
        title="Profile unavailable"
        description="The doctor profile could not be loaded."
      ></app-empty-state>
    </ng-template>
  `,
  styleUrl: './doctor-profile.page.scss'
})
export class DoctorProfilePage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authState = inject(AuthStateService);
  private readonly doctorState = inject(DoctorStateService);
  private readonly toastController = inject(ToastController);
  private readonly destroyRef = inject(DestroyRef);

  currentUser: AuthUser | null = null;

  readonly currentUser$ = this.authState.currentUser$;
  readonly doctor$ = this.currentUser$.pipe(
    switchMap((user) => (user ? this.doctorState.getDoctorByUserId(user.id) : of(undefined)))
  );

  profileForm = this.fb.nonNullable.group({
    fullName: ['', Validators.required],
    specialization: ['', Validators.required],
    bio: [''],
    consultationFee: [0, [Validators.required, Validators.min(0)]],
    licenseNumber: [''],
    ptrNumber: [''],
    s2Number: [''],
    contactNumber: [''],
    newPassword: [''],
    confirmPassword: ['']
  });

  ngOnInit(): void {
    this.doctorState.refresh();

    this.currentUser$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((user) => {
      this.currentUser = user;
    });

    this.doctor$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((doctor) => {
      if (!doctor) {
        return;
      }
      this.profileForm.patchValue({
        fullName: doctor.fullName,
        specialization: doctor.specialization,
        bio: doctor.bio ?? '',
        consultationFee: doctor.consultationFee,
        licenseNumber: doctor.licenseNumber ?? '',
        ptrNumber: doctor.ptrNumber ?? '',
        s2Number: doctor.s2Number ?? '',
        contactNumber: ''
      });
    });
  }

  save(doctor: Doctor): void {
    const values = this.profileForm.getRawValue();
    if (values.newPassword && values.newPassword !== values.confirmPassword) {
      void this.presentToast('Passwords do not match.');
      return;
    }

    this.doctorState.updateDoctor({
          ...doctor,
          fullName: values.fullName,
          specialization: values.specialization,
          bio: values.bio,
          consultationFee: values.consultationFee,
          licenseNumber: values.licenseNumber || undefined,
          ptrNumber: values.ptrNumber || undefined,
          s2Number: values.s2Number || undefined
        });

    this.profileForm.patchValue({
      newPassword: '',
      confirmPassword: ''
    });

    void this.presentToast('Profile updated locally.');
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
