import { Component, inject } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
import { MockDataService } from '../../core/services/mock-data.service';
import { BookingStatus, DoctorStatus, PaymentStatus } from '../../core/models';
import { PesoPipe } from '../../shared/pipes/peso.pipe';
import { TimeSlotPipe } from '../../shared/pipes/time-slot.pipe';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { BannerComponent } from '../../shared/components/banner/banner.component';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

@Component({
  standalone: true,
  selector: 'app-design-system-gallery',
  imports: [
    NgFor,
    NgIf,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    PageHeaderComponent,
    SkeletonComponent,
    EmptyStateComponent,
    StatusBadgeComponent,
    ConfirmModalComponent,
    AvatarComponent,
    BannerComponent,
    PesoPipe,
    TimeSlotPipe
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Design System Gallery</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="content-container page-enter">
        <app-page-header
          title="Clinic Design System"
          subtitle="Phase 1 — tokens, components, and styling sanity-check page."
        >
          <div actions>
            <ion-button fill="clear" (click)="confirmOpen = true">Open Confirm Modal</ion-button>
          </div>
        </app-page-header>

        <div class="clinic-card" style="margin-bottom: var(--space-8)">
          <div class="section-heading">Color Palette</div>
          <div class="swatch-grid">
            <div class="swatch" *ngFor="let token of colorTokens">
              <div class="swatch__chip" [style.background]="'var(' + token + ')'"></div>
              <div class="swatch__meta">
                <div class="swatch__name">{{ token }}</div>
                <div class="swatch__value data-mono">var({{ token }})</div>
              </div>
            </div>
          </div>
        </div>

        <div class="clinic-card" style="margin-bottom: var(--space-8)">
          <div class="section-heading">Typography Scale</div>
          <div class="type-grid">
            <div class="type-row" *ngFor="let t of typographyTokens">
              <div class="type-row__label data-mono">{{ t }}</div>
              <div class="type-row__sample" [style.fontSize]="'var(' + t + ')'">
                The quick brown fox jumps over the lazy dog.
              </div>
            </div>
          </div>
        </div>

        <div class="clinic-card" style="margin-bottom: var(--space-8)">
          <div class="section-heading">Buttons</div>
          <div class="row">
            <button class="btn-primary" type="button">Primary</button>
            <button class="btn-outline" type="button">Outline</button>
            <button class="btn-ghost" type="button">Ghost</button>
            <button class="btn-danger" type="button">Danger</button>
            <button class="btn-icon" type="button" aria-label="Icon button">
              <ion-icon name="settings-outline"></ion-icon>
            </button>
          </div>
        </div>

        <div class="clinic-card" style="margin-bottom: var(--space-8)">
          <div class="section-heading">Badges</div>
          <div class="row">
            <app-status-badge kind="booking" [status]="BookingStatus.Pending"></app-status-badge>
            <app-status-badge kind="booking" [status]="BookingStatus.Confirmed"></app-status-badge>
            <app-status-badge kind="booking" [status]="BookingStatus.Completed"></app-status-badge>
            <app-status-badge kind="booking" [status]="BookingStatus.Cancelled"></app-status-badge>
            <app-status-badge kind="booking" [status]="BookingStatus.OnHold"></app-status-badge>
            <app-status-badge kind="booking" [status]="BookingStatus.ProofSubmitted"></app-status-badge>
            <app-status-badge kind="booking" [status]="BookingStatus.NoShow"></app-status-badge>
          </div>
          <div class="row" style="margin-top: var(--space-4)">
            <app-status-badge kind="payment" [status]="PaymentStatus.Paid"></app-status-badge>
            <app-status-badge kind="payment" [status]="PaymentStatus.Unpaid"></app-status-badge>
            <app-status-badge kind="payment" [status]="PaymentStatus.Waived"></app-status-badge>
            <app-status-badge kind="payment" [status]="PaymentStatus.Refunded"></app-status-badge>
          </div>
          <div class="row" style="margin-top: var(--space-4)">
            <app-status-badge kind="doctor" [status]="DoctorStatus.Active"></app-status-badge>
            <app-status-badge kind="doctor" [status]="DoctorStatus.Inactive"></app-status-badge>
            <app-status-badge kind="doctor" [status]="DoctorStatus.OnLeave" text="On Leave"></app-status-badge>
          </div>
        </div>

        <div class="clinic-card" style="margin-bottom: var(--space-8)">
          <div class="section-heading">Cards</div>
          <div class="card-grid">
            <div class="clinic-card">
              <div style="font-weight: var(--font-semibold)">Default</div>
              <div style="color: var(--clinic-text-secondary); margin-top: var(--space-2)">
                A clean elevated surface.
              </div>
            </div>
            <div class="clinic-card clinic-card--accent-green">
              <div style="font-weight: var(--font-semibold)">Accent Green</div>
              <div style="color: var(--clinic-text-secondary); margin-top: var(--space-2)">
                Status stripe variant.
              </div>
            </div>
            <div class="clinic-card clinic-card--accent-blue">
              <div style="font-weight: var(--font-semibold)">Accent Blue</div>
              <div style="color: var(--clinic-text-secondary); margin-top: var(--space-2)">
                Status stripe variant.
              </div>
            </div>
            <div class="clinic-card clinic-card--elevated">
              <div style="font-weight: var(--font-semibold)">Elevated</div>
              <div style="color: var(--clinic-text-secondary); margin-top: var(--space-2)">
                Used for important CTAs.
              </div>
            </div>
            <div class="clinic-card clinic-card--glass" style="background: var(--gradient-hero)">
              <div style="font-weight: var(--font-semibold)">Glass</div>
              <div style="opacity: 0.9; margin-top: var(--space-2)">
                Used over colored sections.
              </div>
            </div>
          </div>
        </div>

        <div class="clinic-card" style="margin-bottom: var(--space-8)">
          <div class="section-heading">Stat Cards</div>
          <div class="stat-grid">
            <div class="stat-card stat-card--green">
              <div class="stat-card__icon"><ion-icon name="calendar-outline"></ion-icon></div>
              <div class="stat-card__value">24</div>
              <div class="stat-card__label">Bookings Today</div>
              <div class="stat-card__trend">+8% vs yesterday</div>
            </div>
            <div class="stat-card stat-card--blue">
              <div class="stat-card__icon"><ion-icon name="people-outline"></ion-icon></div>
              <div class="stat-card__value">128</div>
              <div class="stat-card__label">Active Patients</div>
              <div class="stat-card__trend">+12 new this week</div>
            </div>
            <div class="stat-card stat-card--amber">
              <div class="stat-card__icon"><ion-icon name="pulse-outline"></ion-icon></div>
              <div class="stat-card__value">7</div>
              <div class="stat-card__label">Pending Reviews</div>
              <div class="stat-card__trend">Needs attention</div>
            </div>
            <div class="stat-card stat-card--red">
              <div class="stat-card__icon"><ion-icon name="alert-circle-outline"></ion-icon></div>
              <div class="stat-card__value">3</div>
              <div class="stat-card__label">Cancelled</div>
              <div class="stat-card__trend">Today</div>
            </div>
          </div>
        </div>

        <div class="clinic-card" style="margin-bottom: var(--space-8)">
          <div class="section-heading">Skeletons</div>
          <div class="card-grid">
            <div class="clinic-card">
              <app-skeleton variant="title"></app-skeleton>
              <app-skeleton variant="text" width="85%"></app-skeleton>
              <app-skeleton variant="text" width="70%"></app-skeleton>
            </div>
            <div class="clinic-card">
              <app-skeleton variant="card"></app-skeleton>
            </div>
            <div class="clinic-card">
              <app-skeleton variant="avatar"></app-skeleton>
            </div>
            <div class="clinic-card">
              <app-skeleton variant="stat"></app-skeleton>
            </div>
            <div class="clinic-card">
              <app-skeleton variant="row"></app-skeleton>
              <app-skeleton variant="row"></app-skeleton>
            </div>
          </div>
        </div>

        <div class="clinic-card" style="margin-bottom: var(--space-8)">
          <div class="section-heading">Empty State</div>
          <app-empty-state
            icon="calendar-outline"
            title="No bookings yet"
            description="When bookings exist, they will appear here with status badges and payment info."
            ctaText="Create booking (mock)"
          ></app-empty-state>
        </div>

        <div class="clinic-card" style="margin-bottom: var(--space-8)">
          <div class="section-heading">Banners</div>
          <app-banner variant="warning" title="Running late" message="Dr. Santos is running ~20 minutes behind today."></app-banner>
          <app-banner variant="danger" title="Allergy warning" message="Patient has a recorded penicillin allergy."></app-banner>
          <app-banner variant="info" title="Info" message="This is a mock-only Phase 1 environment."></app-banner>
        </div>

        <div class="clinic-card" style="margin-bottom: var(--space-8)">
          <div class="section-heading">Avatars</div>
          <div class="row">
            <app-avatar name="Dr. Maria Santos" size="xs"></app-avatar>
            <app-avatar name="Dr. Jose Reyes" size="sm"></app-avatar>
            <app-avatar name="Dr. Ana Cruz" size="md"></app-avatar>
            <app-avatar name="Juan Dela Cruz" size="lg"></app-avatar>
            <app-avatar name="Ana Ramirez" size="xl"></app-avatar>
          </div>
        </div>

        <div class="clinic-card" style="margin-bottom: var(--space-8)">
          <div class="section-heading">Form Fields (Ionic override)</div>
          <ion-item class="clinic-input">
            <ion-label position="stacked">Patient Name</ion-label>
            <ion-input placeholder="Juan Dela Cruz"></ion-input>
          </ion-item>
          <ion-item class="clinic-input">
            <ion-label position="stacked">Service</ion-label>
            <ion-select placeholder="Select service">
              <ion-select-option *ngFor="let s of mock.services" [value]="s.id">
                {{ s.name }} ({{ s.price | peso }})
              </ion-select-option>
            </ion-select>
          </ion-item>
        </div>

        <div class="clinic-card" style="margin-bottom: var(--space-8)">
          <div class="section-heading">Table</div>
          <table class="clinic-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Doctor</th>
                <th>Service</th>
                <th>Slot</th>
                <th>Status</th>
                <th>Payment</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let b of mock.bookings.slice(0, 6)">
                <td><span class="data-mono">{{ b.code }}</span></td>
                <td>{{ doctorName(b.doctorId) }}</td>
                <td>{{ serviceName(b.serviceId) }}</td>
                <td>{{ b.startTime | timeSlot: b.endTime }}</td>
                <td><app-status-badge kind="booking" [status]="b.status"></app-status-badge></td>
                <td><app-status-badge kind="payment" [status]="b.paymentStatus"></app-status-badge></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="clinic-card" style="margin-bottom: var(--space-8)">
          <div class="section-heading">Slot Grid</div>
          <div class="slot-grid">
            <div class="slot-cell slot-cell--available">
              08:00
              <div class="slot-cell__time">Available</div>
            </div>
            <div class="slot-cell slot-cell--selected">
              08:30
              <div class="slot-cell__time">Selected</div>
            </div>
            <div class="slot-cell slot-cell--pending">
              09:00
              <div class="slot-cell__time">Pending</div>
            </div>
            <div class="slot-cell slot-cell--full">
              09:30
              <div class="slot-cell__time">Full</div>
            </div>
            <div class="slot-cell slot-cell--disabled">
              10:00
              <div class="slot-cell__time">Disabled</div>
            </div>
          </div>
        </div>

        <app-confirm-modal
          [isOpen]="confirmOpen"
          title="Confirm (Preview)"
          message="This is a reusable confirm dialog component for future phases."
          confirmText="Delete"
          cancelText="Cancel"
          (confirm)="confirmOpen = false"
          (cancel)="confirmOpen = false"
          (dismiss)="confirmOpen = false"
        ></app-confirm-modal>
      </div>
    </ion-content>
  `,
  styleUrl: './design-system-gallery.page.scss'
})
export class DesignSystemGalleryPage {
  protected readonly mock = inject(MockDataService);
  protected confirmOpen = false;

  protected readonly BookingStatus = BookingStatus;
  protected readonly PaymentStatus = PaymentStatus;
  protected readonly DoctorStatus = DoctorStatus;

  protected readonly colorTokens = [
    '--ion-color-primary',
    '--ion-color-primary-shade',
    '--ion-color-primary-tint',
    '--color-primary-50',
    '--color-primary-100',
    '--color-primary-200',
    '--ion-color-secondary',
    '--ion-color-secondary-shade',
    '--ion-color-secondary-tint',
    '--color-secondary-50',
    '--color-secondary-100',
    '--ion-color-success',
    '--ion-color-warning',
    '--ion-color-danger',
    '--color-neutral-50',
    '--color-neutral-100',
    '--color-neutral-200',
    '--color-neutral-300',
    '--color-neutral-400',
    '--color-neutral-500',
    '--color-neutral-600',
    '--color-neutral-700',
    '--color-neutral-800',
    '--color-neutral-900'
  ];

  protected readonly typographyTokens = [
    '--text-xs',
    '--text-sm',
    '--text-base',
    '--text-lg',
    '--text-xl',
    '--text-2xl',
    '--text-3xl',
    '--text-4xl',
    '--text-5xl'
  ];

  protected doctorName(id: string): string {
    return this.mock.doctors.find((d) => d.id === id)?.fullName ?? id;
  }

  protected serviceName(id: string): string {
    return this.mock.services.find((s) => s.id === id)?.name ?? id;
  }
}

