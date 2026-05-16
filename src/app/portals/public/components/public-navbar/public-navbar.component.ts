import { NgClass, NgIf } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Store } from '@ngrx/store';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline, menuOutline } from 'ionicons/icons';
import { ClinicSettingsService } from '../../../../core/services/clinic-settings.service';
import { selectCurrentUser, selectIsAuthenticated } from '../../../../store/auth/auth.selectors';

@Component({
  selector: 'app-public-navbar',
  standalone: true,
  imports: [NgClass, NgIf, RouterLink, RouterLinkActive, IonIcon],
  template: `
    <nav class="public-navbar" [ngClass]="{ scrolled: navScrolled }">
      <a routerLink="/public" class="navbar__logo" (click)="closeMobile()">
        <img *ngIf="settings.logoUrl" [src]="settings.logoUrl" alt="" />
        <span>{{ settings.clinicName }}</span>
      </a>

      <div class="navbar__links">
        <a
          routerLink="/public"
          routerLinkActive="active"
          [routerLinkActiveOptions]="{ exact: true }"
          >Home</a
        >
        <a routerLink="/public/doctors" routerLinkActive="active">Doctors</a>
        <a routerLink="/public/services" routerLinkActive="active">Services</a>
        <a routerLink="/public/announcements" routerLinkActive="active">Announcements</a>
      </div>

      <div class="navbar__auth">
        <a *ngIf="!isAuthenticated(); else portalLink" routerLink="/auth/login" class="navbar-login-btn">Login</a>
        <ng-template #portalLink>
          <a routerLink="/patient/dashboard" class="navbar-portal-btn">My Portal</a>
        </ng-template>
      </div>

      <div class="navbar__cta">
        <a routerLink="/public/booking" class="navbar-book-btn">Book Appointment</a>
      </div>

      <button
        type="button"
        class="navbar__hamburger"
        [attr.aria-expanded]="menuOpen"
        aria-label="Toggle menu"
        (click)="menuOpen = !menuOpen"
      >
        <ion-icon [name]="menuOpen ? 'close-outline' : 'menu-outline'"></ion-icon>
      </button>
    </nav>

    <div class="mobile-menu" [class.open]="menuOpen">
      <a
        routerLink="/public"
        routerLinkActive="active"
        [routerLinkActiveOptions]="{ exact: true }"
        (click)="closeMobile()"
        >Home</a
      >
      <a routerLink="/public/doctors" routerLinkActive="active" (click)="closeMobile()">Doctors</a>
      <a routerLink="/public/services" routerLinkActive="active" (click)="closeMobile()">Services</a>
      <a routerLink="/public/announcements" routerLinkActive="active" (click)="closeMobile()"
        >Announcements</a
      >
      <a routerLink="/public/booking" class="navbar-book-btn mobile-cta" (click)="closeMobile()"
        >Book Appointment</a
      >
      <a
        *ngIf="!isAuthenticated(); else mobilePortalLink"
        routerLink="/auth/login"
        class="navbar-login-btn mobile-login"
        (click)="closeMobile()"
        >Login</a
      >
      <ng-template #mobilePortalLink>
        <a
          routerLink="/patient/dashboard"
          class="navbar-portal-btn mobile-portal"
          (click)="closeMobile()"
          >My Portal</a
        >
      </ng-template>
    </div>
  `,
  styleUrl: './public-navbar.component.scss'
})
export class PublicNavbarComponent {
  /** Vertical scroll position of `.public-main` (body/window does not scroll with Ionic defaults). */
  @Input() mainScrollTop = 0;

  private readonly store = inject(Store);
  private readonly clinicSettings = inject(ClinicSettingsService);
  readonly settings = this.clinicSettings.load();
  readonly isAuthenticated = this.store.selectSignal(selectIsAuthenticated);
  readonly currentUser = this.store.selectSignal(selectCurrentUser);

  menuOpen = false;

  get navScrolled(): boolean {
    return this.mainScrollTop > 10;
  }

  constructor() {
    addIcons({ menuOutline, closeOutline });
  }

  closeMobile(): void {
    this.menuOpen = false;
  }
}
