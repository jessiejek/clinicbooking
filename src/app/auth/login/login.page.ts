import { AsyncPipe, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  IonButton,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonSpinner,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { alertCircleOutline, eyeOffOutline, eyeOutline } from 'ionicons/icons';
import { environment } from '../../../environments/environment';
import { AuthLayoutComponent } from '../components/auth-layout/auth-layout.component';
import { BannerComponent } from '../../shared/components/banner/banner.component';
import { AuthStateService } from '../../core/services/auth-state.service';

@Component({
  standalone: true,
  selector: 'app-login-page',
  imports: [
    NgIf,
    AsyncPipe,
    ReactiveFormsModule,
    RouterLink,
    AuthLayoutComponent,
    BannerComponent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonIcon,
    IonSpinner
  ],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss'
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly authState = inject(AuthStateService);
  private readonly toastController = inject(ToastController);

  readonly isProduction = environment.production;
  readonly isLoading$ = this.authState.isLoading$;
  readonly error$ = this.authState.error$;

  showPassword = false;
  devExpanded = false;

  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  constructor() {
    addIcons({ alertCircleOutline, eyeOutline, eyeOffOutline });
  }

  fillCreds(email: string, password: string): void {
    this.loginForm.patchValue({ email, password });
  }

  async onSocialClick(): Promise<void> {
    const toast = await this.toastController.create({
      message: 'Social login coming soon',
      duration: 2000,
      position: 'bottom'
    });
    await toast.present();
  }

  onLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    const { email, password } = this.loginForm.getRawValue();
    this.authState.clearError();
    this.authState.login(email, password).subscribe({ error: () => undefined });
  }
}
