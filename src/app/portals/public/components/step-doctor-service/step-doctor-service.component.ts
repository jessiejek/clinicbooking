import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { IonIcon, IonSpinner, ToastController } from '@ionic/angular/standalone';
import { Subscription, catchError, distinctUntilChanged, finalize, of, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  chevronForwardOutline,
  checkmarkCircleOutline
} from 'ionicons/icons';
import { BookingWizardService } from '../../../../core/services/booking-wizard.service';
import { Doctor } from '../../../../core/models/doctor.models';
import { DoctorDetail, DoctorSummary, PublicService } from '../../services/public.service';
import { AvatarComponent } from '../../../../shared/components/avatar/avatar.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { PesoPipe } from '../../../../shared/pipes/peso.pipe';

@Component({
  selector: 'app-step-doctor-service',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    AsyncPipe,
    IonIcon,
    IonSpinner,
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

      <div class="wizard-loading" *ngIf="isLoading">
        <ion-spinner name="crescent"></ion-spinner>
      </div>

      <ng-container *ngIf="!isLoading">
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

          <div class="wizard-loading wizard-loading--compact" *ngIf="selectedDoctorLoading">
            <ion-spinner name="crescent"></ion-spinner>
          </div>

          <div class="service-list" *ngIf="!selectedDoctorLoading">
            <div class="service-list__header">
              <h3>Select a service</h3>
            </div>

            <ng-container *ngIf="selectedDoctorServices.length > 0; else noServiceState">
              <button
                *ngFor="let service of selectedDoctorServices"
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
                title="No data found"
                description="This doctor currently has no services assigned."
              ></app-empty-state>
            </ng-template>
          </div>
        </ng-container>

        <ng-template #doctorPhase>
          <ng-container *ngIf="doctors.length > 0; else emptyState">
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
          </ng-container>

          <ng-template #emptyState>
            <app-empty-state
              icon="medical-outline"
              title="No data found"
              description="No doctors are available right now."
            ></app-empty-state>
          </ng-template>
        </ng-template>

        <div class="wizard-actions">
          <button type="button" class="btn-primary" [disabled]="!canContinue" (click)="goNext()">
            Continue
          </button>
        </div>
      </ng-container>
    </section>
  `,
  styleUrl: './step-doctor-service.component.scss'
})
export class StepDoctorServiceComponent implements OnInit {
  private readonly wizardService = inject(BookingWizardService);
  private readonly publicService = inject(PublicService);
  private readonly toastCtrl = inject(ToastController);
  private readonly destroyRef = inject(DestroyRef);
  private readonly subscriptions = new Subscription();

  doctors: DoctorSummary[] = [];
  isLoading = true;
  selectedDoctorLoading = false;
  selectedDoctorDetail: DoctorDetail = undefined;

  selectedDoctorId$ = this.wizardService.selectedDoctorId$;
  selectedServiceId$ = this.wizardService.selectedServiceId$;
  private latestSelectedDoctorId: string | null = null;
  private latestSelectedServiceId: string | null = null;

  get selectedDoctor(): DoctorSummary | undefined {
    return this.doctors.find((doctor) => doctor.id === this.latestSelectedDoctorId);
  }

  get canContinue(): boolean {
    return Boolean(this.latestSelectedDoctorId && this.latestSelectedServiceId);
  }

  get selectedDoctorServices() {
    return this.selectedDoctorDetail?.services ?? [];
  }

  constructor() {
    addIcons({ arrowBackOutline, chevronForwardOutline, checkmarkCircleOutline });

    this.subscriptions.add(
      this.selectedDoctorId$
        .pipe(
          distinctUntilChanged(),
          switchMap((doctorId) => {
            this.latestSelectedDoctorId = doctorId;
            this.selectedDoctorDetail = undefined;

            if (!doctorId) {
              this.selectedDoctorLoading = false;
              return of(undefined);
            }

            this.selectedDoctorLoading = true;
            return this.publicService.getDoctorById(doctorId).pipe(
              catchError((error: unknown) => {
                void this.presentToast(extractApiErrorMessage(error, 'Failed to load doctor services.'));
                return of(undefined);
              }),
              finalize(() => {
                this.selectedDoctorLoading = false;
              })
            );
          }),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe((doctor) => {
          this.selectedDoctorDetail = doctor;
        })
    );
    this.subscriptions.add(
      this.selectedServiceId$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((serviceId) => {
        this.latestSelectedServiceId = serviceId;
      })
    );
  }

  ngOnInit(): void {
    this.publicService
      .getDoctors()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (doctors) => {
          this.doctors = doctors;
          this.isLoading = false;
        },
        error: (error: unknown) => {
          this.doctors = [];
          this.isLoading = false;
          void this.presentToast(extractApiErrorMessage(error, 'Failed to load doctors.'));
        }
      });
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

  private async presentToast(message: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2400,
      color: 'danger',
      position: 'top'
    });
    await toast.present();
  }
}

function extractApiErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null && 'error' in error) {
    const body = (error as { error?: unknown }).error;
    if (typeof body === 'string' && body.trim()) {
      return body;
    }
    if (typeof body === 'object' && body !== null && 'message' in body) {
      const message = (body as { message?: unknown }).message;
      if (typeof message === 'string' && message.trim()) {
        return message;
      }
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}
