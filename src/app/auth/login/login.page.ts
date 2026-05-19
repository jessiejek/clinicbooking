import { AsyncPipe, NgIf } from '@angular/common';
import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  ViewChild,
  inject
} from '@angular/core';
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
import { finalize } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthLayoutComponent } from '../components/auth-layout/auth-layout.component';
import { BannerComponent } from '../../shared/components/banner/banner.component';
import { AuthStateService } from '../../core/services/auth-state.service';

interface GoogleCredentialResponse {
  credential?: string;
}

interface GoogleAccountsId {
  initialize(config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
  }): void;
  renderButton(
    parent: HTMLElement,
    options: {
      theme?: 'outline' | 'filled_blue' | 'filled_black';
      size?: 'large' | 'medium' | 'small';
      type?: 'standard' | 'icon';
      shape?: 'rectangular' | 'pill' | 'circle' | 'square';
      text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
      width?: number;
    }
  ): void;
}

interface GoogleWindow extends Window {
  google?: {
    accounts?: {
      id?: GoogleAccountsId;
    };
  };
}

const googleIdentityScriptId = 'google-identity-services-sdk';
const googleIdentityScriptSrc = 'https://accounts.google.com/gsi/client';
let googleIdentityLoadPromise: Promise<GoogleAccountsId> | null = null;

function getGoogleIdentity(): GoogleAccountsId | undefined {
  return (window as GoogleWindow).google?.accounts?.id;
}

function waitForGoogleIdentityApi(timeoutMs = 15000): Promise<GoogleAccountsId> {
  const existing = getGoogleIdentity();
  if (existing) {
    return Promise.resolve(existing);
  }

  return new Promise((resolve, reject) => {
    const startedAt = Date.now();

    const poll = () => {
      const google = getGoogleIdentity();
      if (google) {
        resolve(google);
        return;
      }

      if (Date.now() - startedAt >= timeoutMs) {
        reject(new Error('Google sign-in script loaded, but Google Identity Services did not initialize.'));
        return;
      }

      window.setTimeout(poll, 50);
    };

    poll();
  });
}

function loadGoogleIdentityScript(timeoutMs = 15000): Promise<GoogleAccountsId> {
  if (getGoogleIdentity()) {
    return Promise.resolve(getGoogleIdentity() as GoogleAccountsId);
  }

  if (googleIdentityLoadPromise) {
    return googleIdentityLoadPromise;
  }

  googleIdentityLoadPromise = new Promise((resolve, reject) => {
    let script = document.getElementById(googleIdentityScriptId) as HTMLScriptElement | null;
    const timeout = window.setTimeout(() => {
      googleIdentityLoadPromise = null;
      reject(new Error('Google sign-in script timed out while loading.'));
    }, timeoutMs);

    const finish = () => {
      window.clearTimeout(timeout);
      if (!script) {
        googleIdentityLoadPromise = null;
        reject(new Error('Google sign-in script element was not available.'));
        return;
      }

      script.setAttribute('data-loaded', 'true');
      waitForGoogleIdentityApi(timeoutMs)
        .then((google) => resolve(google))
        .catch((error) => {
          googleIdentityLoadPromise = null;
          reject(error);
        });
    };

    const fail = () => {
      window.clearTimeout(timeout);
      googleIdentityLoadPromise = null;
      reject(new Error('Google sign-in script was blocked or failed to load.'));
    };

    if (!script) {
      script = document.createElement('script');
      script.id = googleIdentityScriptId;
      script.src = googleIdentityScriptSrc;
      script.async = true;
      script.defer = true;
      script.addEventListener('load', finish, { once: true });
      script.addEventListener('error', fail, { once: true });
      document.head.appendChild(script);
      return;
    }

    if (script.getAttribute('data-loaded') === 'true') {
      finish();
      return;
    }

    script.addEventListener('load', finish, { once: true });
    script.addEventListener('error', fail, { once: true });
  });

  return googleIdentityLoadPromise;
}

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
export class LoginPage implements AfterViewInit {
  @ViewChild('googleButton', { static: false }) private googleButton?: ElementRef<HTMLElement>;

  private readonly fb = inject(FormBuilder);
  private readonly authState = inject(AuthStateService);
  private readonly toastController = inject(ToastController);
  private readonly ngZone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);

  readonly isProduction = environment.production;
  readonly googleClientId = environment.googleClientId;
  readonly isLoading$ = this.authState.isLoading$;
  readonly error$ = this.authState.error$;

  showPassword = false;
  devExpanded = false;
  googleLoading = false;
  googleSdkError: string | null = null;
  private destroyed = false;

  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  constructor() {
    addIcons({ alertCircleOutline, eyeOutline, eyeOffOutline });
    this.destroyRef.onDestroy(() => {
      this.destroyed = true;
    });
  }

  fillCreds(email: string, password: string): void {
    this.loginForm.patchValue({ email, password });
  }

  ngAfterViewInit(): void {
    void this.initializeGoogleButton();
  }

  get canUseGoogleLogin(): boolean {
    return this.googleClientId.trim().length > 0;
  }

  async onGoogleFallbackClick(): Promise<void> {
    if (!this.canUseGoogleLogin) {
      await this.presentErrorToast('Google sign-in is not configured yet.');
      return;
    }

    if (this.googleSdkError) {
      this.googleSdkError = null;
      await new Promise<void>((resolve) => window.setTimeout(resolve, 0));
      await this.initializeGoogleButton();
      if (!this.googleSdkError) {
        return;
      }
    }

    await this.presentErrorToast(
      this.googleSdkError ??
        'Google sign-in is still loading. If this keeps happening, check that the browser can open accounts.google.com.'
    );
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

  private async initializeGoogleButton(): Promise<void> {
    if (!this.canUseGoogleLogin || !this.googleButton?.nativeElement || this.destroyed) {
      return;
    }

    try {
      const google = await loadGoogleIdentityScript();
      if (this.destroyed || !this.googleButton?.nativeElement) {
        return;
      }

      google.initialize({
        client_id: this.googleClientId.trim(),
        callback: (response) =>
          this.ngZone.run(() => {
            if (this.destroyed) {
              return;
            }

            void this.handleGoogleCredential(response);
          }),
        auto_select: false,
        cancel_on_tap_outside: true
      });

      const buttonContainer = this.googleButton.nativeElement;
      buttonContainer.replaceChildren();

      google.renderButton(buttonContainer, {
        theme: 'outline',
        size: 'large',
        type: 'standard',
        shape: 'rectangular',
        text: 'continue_with',
        width: Math.max(240, Math.min(buttonContainer.clientWidth || 320, 400))
      });
    } catch (error) {
      if (this.destroyed) {
        return;
      }

      this.googleSdkError = error instanceof Error ? error.message : 'Google sign-in failed to initialize.';
    }
  }

  private async handleGoogleCredential(response: GoogleCredentialResponse): Promise<void> {
    if (this.destroyed) {
      return;
    }

    if (!response.credential) {
      await this.presentErrorToast('Google sign-in did not return a token.');
      return;
    }

    this.googleLoading = true;
    this.authState.loginWithGoogle(response.credential).pipe(
      finalize(() => {
        this.googleLoading = false;
      })
    ).subscribe({ error: () => undefined });
  }

  private async presentErrorToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 2200,
      position: 'bottom',
      color: 'danger'
    });
    await toast.present();
  }
}
