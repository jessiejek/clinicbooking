import { Component, inject } from '@angular/core';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  chevronForwardOutline,
  checkmarkCircleOutline
} from 'ionicons/icons';
import { MockDataService } from '../../../../core/services/mock-data.service';
import { Doctor, Service } from '../../../../core/models';
import { BookingWizardService } from '../../../../core/services/booking-wizard.service';
import { AvatarComponent } from '../../../../shared/components/avatar/avatar.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { PesoPipe } from '../../../../shared/pipes/peso.pipe';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-step-doctor-service',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    AsyncPipe,
    IonIcon,
    AvatarComponent,
    StatusBadgeComponent,
    EmptyStateComponent,
    PesoPipe
  ],
  template: `
    <section class="wizard-panel">
      <div class="wizard-panel__header">
        <div>
          <p class="section-heading">Step 1</p>
          <h2 class="wizard-title">Choose your doctor and service</h2>
          <p class="wizard-subtitle">
            Start by selecting the doctor you want to see, then pick the service you need.
          </p>
        </div>
      </div>

      <ng-container *ngIf="selectedDoctorId$ | async as selectedDoctorId; else doctorPhase">
        <div class="selected-doctor clinic-card clinic-card--accent-blue">
          <div class="selected-doctor__avatar">
            <app-avatar [name]="selectedDoctor?.fullName ?? ''" [size]="'lg'"></app-avatar>
          </div>
          <div class="selected-doctor__meta">
            <div class="selected-doctor__name">{{ selectedDoctor?.fullName }}</div>
            <div class="selected-doctor__spec">{{ selectedDoctor?.specialization }}</div>
            <app-status-badge [status]="selectedDoctor?.status ?? 'Active'"></app-status-badge>
          </div>
          <button type="button" class="btn-ghost" (click)="changeDoctor()">
            <ion-icon name="arrow-back-outline"></ion-icon>
            Change Doctor
          </button>
        </div>

        <div class="service-list">
          <div class="service-list__header">
            <h3>Select a service</h3>
          </div>

          <ng-container *ngIf="servicesForSelectedDoctor.length > 0; else noServiceState">
            <button
              *ngFor="let service of servicesForSelectedDoctor"
              type="button"
              class="service-option"
              [class.service-option--selected]="service.id === (selectedServiceId$ | async)"
              (click)="selectService(service.id)"
            >
              <div>
                <div class="service-option__name">{{ service.name }}</div>
                <div class="service-option__desc">{{ service.description || 'Included in consultation' }}</div>
              </div>
              <div class="service-option__right">
                <span class="service-option__fee">{{ service.price | peso }}</span>
                <div class="service-option__check">
                  <ion-icon
                    name="checkmark-circle-outline"
                    *ngIf="service.id === (selectedServiceId$ | async)"
                  ></ion-icon>
                </div>
              </div>
            </button>
          </ng-container>

          <ng-template #noServiceState>
            <app-empty-state
              icon="medical-outline"
              title="No services available"
              description="This doctor currently has no services assigned."
            ></app-empty-state>
          </ng-template>
        </div>
      </ng-container>

      <ng-template #doctorPhase>
        <div class="doctor-grid">
          <button
            *ngFor="let doctor of doctors"
            type="button"
            class="doctor-card clinic-card"
            [class.doctor-card--selected]="doctor.id === (selectedDoctorId$ | async)"
            (click)="selectDoctor(doctor)"
          >
            <div class="doctor-card__avatar">
              <app-avatar [name]="doctor.fullName" [size]="'xl'"></app-avatar>
            </div>
            <div class="doctor-card__name">{{ doctor.fullName }}</div>
            <div class="doctor-card__spec">{{ doctor.specialization }}</div>
            <app-status-badge [status]="doctor.status"></app-status-badge>
            <div class="doctor-card__fee">{{ doctor.consultationFee | peso }}</div>
            <div class="doctor-card__cta">
              Select Doctor
              <ion-icon name="chevron-forward-outline"></ion-icon>
            </div>
          </button>
        </div>
      </ng-template>

      <div class="wizard-actions">
        <button type="button" class="btn-primary" [disabled]="!canContinue" (click)="goNext()">
          Continue
        </button>
      </div>
    </section>
  `,
  styleUrl: './step-doctor-service.component.scss'
})
export class StepDoctorServiceComponent {
  private readonly wizardService = inject(BookingWizardService);
  private readonly mockData = inject(MockDataService);
  private readonly subscriptions = new Subscription();

  doctors: Doctor[] = this.mockData.getDoctors();

  selectedDoctorId$ = this.wizardService.selectedDoctorId$;
  selectedServiceId$ = this.wizardService.selectedServiceId$;
  private latestSelectedDoctorId: string | null = null;
  private latestSelectedServiceId: string | null = null;

  get selectedDoctor(): Doctor | undefined {
    return this.doctors.find((doctor) => doctor.id === this.latestSelectedDoctorId);
  }

  get canContinue(): boolean {
    return Boolean(this.latestSelectedDoctorId && this.latestSelectedServiceId);
  }

  get servicesForSelectedDoctor(): Service[] {
    if (!this.latestSelectedDoctorId) {
      return [];
    }
    return this.mockData
      .getServices()
      .filter((service) => service.doctorIds.includes(this.latestSelectedDoctorId as string));
  }

  constructor() {
    addIcons({ arrowBackOutline, chevronForwardOutline, checkmarkCircleOutline });

    this.subscriptions.add(
      this.selectedDoctorId$.subscribe((doctorId) => {
        this.latestSelectedDoctorId = doctorId;
      })
    );
    this.subscriptions.add(
      this.selectedServiceId$.subscribe((serviceId) => {
        this.latestSelectedServiceId = serviceId;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  selectDoctor(doctor: Doctor): void {
    this.wizardService.selectDoctor(doctor.id);
  }

  selectService(serviceId: string): void {
    this.wizardService.selectService(serviceId);
  }

  changeDoctor(): void {
    this.wizardService.selectDoctor(null);
  }

  goNext(): void {
    if (this.canContinue) {
      this.wizardService.nextStep();
    }
  }
}
