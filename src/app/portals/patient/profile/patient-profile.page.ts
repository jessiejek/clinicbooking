import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { IonButton, IonCheckbox, IonInput, IonItem, IonLabel, IonSelect, IonSelectOption, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { lockClosedOutline } from 'ionicons/icons';
import { AuthUser, Patient } from '../../../core/models';
import { AuthStateService } from '../../../core/services/auth-state.service';
import { PatientStateService } from '../../../core/services/patient-state.service';
import { passwordStrengthValidator, getPasswordStrength } from '../../../shared/validators/password-strength.validator';

function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('newPassword')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;
  return password === confirmPassword ? null : { passwordMismatch: true };
}

interface PatientProfileDraft {
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  sex: string;
  contactNumber: string;
  email: string;
  street: string;
  barangay: string;
  city: string;
  province: string;
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactNumber: string;
  hmoProvider: string;
  hmoCardNumber: string;
  philHealthNumber: string;
}

@Component({
  selector: 'app-patient-profile-page',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    NgClass,
    ReactiveFormsModule,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonCheckbox
  ],
  template: `
    <section class="page-shell" *ngIf="currentPatient">
      <div class="page-shell__header">
        <div>
          <h2 class="page-title">My Profile</h2>
          <p class="page-subtitle">Keep your patient details up to date.</p>
        </div>
      </div>

      <div class="profile-grid">
        <form class="clinic-card profile-card" [formGroup]="profileForm" (ngSubmit)="saveProfile()">
          <div class="section-heading">Personal Information</div>
          <div class="profile-grid__fields">
            <ion-item class="clinic-input" lines="none">
              <ion-label position="stacked">First Name</ion-label>
              <ion-input formControlName="firstName"></ion-input>
            </ion-item>
            <ion-item class="clinic-input" lines="none">
              <ion-label position="stacked">Middle Name</ion-label>
              <ion-input formControlName="middleName"></ion-input>
            </ion-item>
            <ion-item class="clinic-input" lines="none">
              <ion-label position="stacked">Last Name</ion-label>
              <ion-input formControlName="lastName"></ion-input>
            </ion-item>
            <ion-item class="clinic-input" lines="none">
              <ion-label position="stacked">Birthdate</ion-label>
              <ion-input type="date" formControlName="dateOfBirth"></ion-input>
            </ion-item>
            <ion-item class="clinic-input" lines="none">
              <ion-label position="stacked">Gender</ion-label>
              <ion-select formControlName="sex">
                <ion-select-option value="Male">Male</ion-select-option>
                <ion-select-option value="Female">Female</ion-select-option>
                <ion-select-option value="Other">Other</ion-select-option>
              </ion-select>
            </ion-item>
            <ion-item class="clinic-input" lines="none">
              <ion-label position="stacked">Contact Number</ion-label>
              <ion-input formControlName="contactNumber"></ion-input>
            </ion-item>
            <ion-item class="clinic-input" lines="none">
              <ion-label position="stacked">Email</ion-label>
              <ion-input formControlName="email" readonly="true"></ion-input>
            </ion-item>
          </div>

          <div class="section-heading">Address</div>
          <div class="profile-grid__fields">
            <ion-item class="clinic-input" lines="none">
              <ion-label position="stacked">Street</ion-label>
              <ion-input formControlName="street"></ion-input>
            </ion-item>
            <ion-item class="clinic-input" lines="none">
              <ion-label position="stacked">Barangay</ion-label>
              <ion-input formControlName="barangay"></ion-input>
            </ion-item>
            <ion-item class="clinic-input" lines="none">
              <ion-label position="stacked">City</ion-label>
              <ion-input formControlName="city"></ion-input>
            </ion-item>
            <ion-item class="clinic-input" lines="none">
              <ion-label position="stacked">Province</ion-label>
              <ion-input formControlName="province"></ion-input>
            </ion-item>
          </div>

          <div class="section-heading">Emergency Contact</div>
          <div class="profile-grid__fields">
            <ion-item class="clinic-input" lines="none">
              <ion-label position="stacked">Name</ion-label>
              <ion-input formControlName="emergencyContactName"></ion-input>
            </ion-item>
            <ion-item class="clinic-input" lines="none">
              <ion-label position="stacked">Relationship</ion-label>
              <ion-input formControlName="emergencyContactRelationship"></ion-input>
            </ion-item>
            <ion-item class="clinic-input" lines="none">
              <ion-label position="stacked">Contact Number</ion-label>
              <ion-input formControlName="emergencyContactNumber"></ion-input>
            </ion-item>
          </div>

          <div class="section-heading">HMO / PhilHealth</div>
          <div class="profile-grid__fields">
            <ion-item class="clinic-input" lines="none">
              <ion-label position="stacked">HMO Provider</ion-label>
              <ion-input formControlName="hmoProvider"></ion-input>
            </ion-item>
            <ion-item class="clinic-input" lines="none">
              <ion-label position="stacked">HMO Number</ion-label>
              <ion-input formControlName="hmoCardNumber"></ion-input>
            </ion-item>
            <ion-item class="clinic-input" lines="none">
              <ion-label position="stacked">PhilHealth Number</ion-label>
              <ion-input formControlName="philHealthNumber"></ion-input>
            </ion-item>
          </div>

          <div class="profile-actions">
            <ion-button type="submit" expand="block" color="primary">Save Changes</ion-button>
          </div>
        </form>

        <form class="clinic-card profile-card" [formGroup]="passwordForm" (ngSubmit)="changePassword()">
          <div class="section-heading">Change Password</div>
          <div class="profile-grid__fields">
            <ion-item class="clinic-input" lines="none">
              <ion-label position="stacked">Current Password</ion-label>
              <ion-input type="password" formControlName="currentPassword"></ion-input>
            </ion-item>
            <ion-item class="clinic-input" lines="none">
              <ion-label position="stacked">New Password</ion-label>
              <ion-input type="password" formControlName="newPassword"></ion-input>
            </ion-item>
            <div class="password-strength">
              <span
                *ngFor="let index of strengthIndexes"
                class="password-strength__bar"
                [class.is-active]="index < passwordStrength"
                [ngClass]="{
                  'password-strength__bar--weak': passwordStrength === 1,
                  'password-strength__bar--fair': passwordStrength === 2,
                  'password-strength__bar--good': passwordStrength === 3,
                  'password-strength__bar--strong': passwordStrength === 4
                }"
              ></span>
            </div>
            <p class="password-strength__label" *ngIf="strengthLabel">{{ strengthLabel }}</p>
            <ion-item class="clinic-input" lines="none">
              <ion-label position="stacked">Confirm Password</ion-label>
              <ion-input type="password" formControlName="confirmPassword"></ion-input>
            </ion-item>
          </div>

          <div class="form-error-message" *ngIf="passwordForm.touched && passwordForm.hasError('passwordMismatch')">
            Passwords do not match.
          </div>

          <div class="profile-actions">
            <ion-button type="submit" expand="block" color="primary" [disabled]="changingPassword">
              Update Password
            </ion-button>
          </div>
        </form>
      </div>
    </section>
  `,
  styleUrl: './patient-profile.page.scss'
})
export class PatientProfilePage implements OnInit {
  private readonly authState = inject(AuthStateService);
  private readonly patientState = inject(PatientStateService);
  private readonly fb = inject(FormBuilder);
  private readonly toastCtrl = inject(ToastController);

  currentUser: AuthUser | null = null;
  currentPatient: Patient | null = null;
  strengthIndexes = [0, 1, 2, 3];
  passwordStrength: 0 | 1 | 2 | 3 | 4 = 0;
  changingPassword = false;

  profileForm = this.fb.nonNullable.group({
    firstName: [''],
    middleName: [''],
    lastName: [''],
    dateOfBirth: [''],
    sex: ['Male'],
    contactNumber: [''],
    email: [{ value: '', disabled: true }],
    street: [''],
    barangay: [''],
    city: [''],
    province: [''],
    emergencyContactName: [''],
    emergencyContactRelationship: [''],
    emergencyContactNumber: [''],
    hmoProvider: [''],
    hmoCardNumber: [''],
    philHealthNumber: ['']
  });

  passwordForm = this.fb.nonNullable.group(
    {
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, passwordStrengthValidator]],
      confirmPassword: ['', Validators.required]
    },
    { validators: passwordMatchValidator }
  );

  constructor() {
    addIcons({ lockClosedOutline });
    this.passwordForm.controls.newPassword.valueChanges.subscribe((value) => {
      this.passwordStrength = getPasswordStrength(String(value ?? ''));
    });
  }

  ngOnInit(): void {
    this.authState.currentUser$.subscribe((user) => {
      this.currentUser = user;
      if (user) {
        this.patientState.getPatientByUserId(user.id).subscribe((patient) => {
          this.currentPatient = patient ?? null;
          if (patient) {
            const [street = '', barangay = '', province = ''] = (patient.address || '').split(',').map((part) => part.trim());
            this.profileForm.patchValue({
              firstName: patient.firstName,
              middleName: patient.middleName ?? '',
              lastName: patient.lastName,
              dateOfBirth: patient.dateOfBirth,
              sex: patient.sex,
              contactNumber: patient.contactNumber ?? '',
              email: patient.email ?? '',
              street,
              barangay,
              city: patient.city ?? '',
              province,
              emergencyContactName: patient.emergencyContactName ?? '',
              emergencyContactRelationship: patient.emergencyContactRelationship ?? '',
              emergencyContactNumber: patient.emergencyContactNumber ?? '',
              hmoProvider: patient.hmoProvider ?? '',
              hmoCardNumber: patient.hmoCardNumber ?? '',
              philHealthNumber: patient.philHealthNumber ?? ''
            });
          }
        });
      }
    });
  }

  get strengthLabel(): string {
    switch (this.passwordStrength) {
      case 1:
        return 'Weak';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
        return 'Strong';
      default:
        return '';
    }
  }

  saveProfile(): void {
    if (!this.currentPatient || this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const value = this.profileForm.getRawValue();
    const address = [value.street, value.barangay, value.province]
      .map((part) => String(part ?? '').trim())
      .filter(Boolean)
      .join(', ');
    const updated: Patient = {
      ...this.currentPatient,
      firstName: value.firstName,
      middleName: value.middleName,
      lastName: value.lastName,
      dateOfBirth: value.dateOfBirth,
      sex: value.sex,
      contactNumber: value.contactNumber,
      email: value.email,
      address,
      city: value.city,
      emergencyContactName: value.emergencyContactName,
      emergencyContactRelationship: value.emergencyContactRelationship,
      emergencyContactNumber: value.emergencyContactNumber,
      hmoProvider: value.hmoProvider,
      hmoCardNumber: value.hmoCardNumber,
      philHealthNumber: value.philHealthNumber
    };

    this.patientState.savePatient(updated);

    if (this.currentUser) {
      this.authState.setUser({
            ...this.currentUser,
            fullName: `${updated.firstName} ${updated.middleName ? `${updated.middleName} ` : ''}${updated.lastName}`.trim()
          });
    }

    void this.presentToast('Profile updated successfully.');
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.changingPassword = true;
    setTimeout(async () => {
      this.changingPassword = false;
      this.passwordForm.reset({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      this.passwordStrength = 0;
      await this.presentToast('Password updated successfully.');
    }, 800);
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
}
