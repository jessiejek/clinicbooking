import { NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { IonInput, IonItem, IonLabel, ToastController } from '@ionic/angular/standalone';
import { timer } from 'rxjs';
import { AuthUser } from '../../core/models';
import { AuthService } from '../../core/services/auth.service';
import { ClinicSettingsService } from '../../core/services/clinic-settings.service';
import { passwordStrengthValidator } from '../../shared/validators/password-strength.validator';
import { setUser } from '../../store/auth/auth.actions';
import { selectCurrentUser } from '../../store/auth/auth.selectors';
import { AuthLayoutComponent } from '../components/auth-layout/auth-layout.component';

function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const pw = group.get('newPassword')?.value;
  const cpw = group.get('confirmPassword')?.value;
  return pw === cpw ? null : { passwordMismatch: true };
}

@Component({
  standalone: true,
  selector: 'app-set-password-page',
  imports: [NgIf, ReactiveFormsModule, AuthLayoutComponent, IonItem, IonLabel, IonInput],
  templateUrl: './set-password.page.html',
  styleUrl: './set-password.page.scss'
})
export class SetPasswordPage {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);
  private readonly authService = inject(AuthService);
  private readonly clinicSettings = inject(ClinicSettingsService);
  private readonly toast = inject(ToastController);
  private readonly currentUser = this.store.selectSignal(selectCurrentUser);

  readonly clinicName = this.clinicSettings.load().clinicName;
  saving = false;

  form = this.fb.nonNullable.group(
    {
      newPassword: ['', [Validators.required, passwordStrengthValidator]],
      confirmPassword: ['', Validators.required]
    },
    { validators: passwordMatchValidator }
  );

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const user = this.currentUser();
    if (!user) {
      return;
    }
    this.saving = true;
    timer(800).subscribe(async () => {
      const updated: AuthUser = { ...user, isFirstLogin: false };
      this.store.dispatch(setUser({ user: updated }));
      this.saving = false;
      const t = await this.toast.create({
        message: 'Password set successfully. Welcome!',
        duration: 2500,
        color: 'success'
      });
      await t.present();
      this.authService.navigateByRole(updated);
    });
  }
}
