import { AsyncPipe, DatePipe, NgFor, NgIf } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { IonSpinner, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarOutline } from 'ionicons/icons';
import { catchError, combineLatest, distinctUntilChanged, finalize, of, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BookingWizardService } from '../../../../core/services/booking-wizard.service';
import { TimeSlotPipe } from '../../../../shared/pipes/time-slot.pipe';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { AvailableSlot, PublicService } from '../../services/public.service';

@Component({
  selector: 'app-step-slot-select',
  standalone: true,
  imports: [NgIf, NgFor, AsyncPipe, DatePipe, IonSpinner, TimeSlotPipe, EmptyStateComponent],
  template: `
    <section class="wizard-panel">
      <div class="wizard-panel__header">
        <div>
          <p class="section-heading">Step 3</p>
          <h2 class="wizard-title">Select your preferred time</h2>
          <p class="wizard-subtitle">Choose an available slot to reserve it for 10 minutes.</p>
        </div>
      </div>

      <ng-container *ngIf="selectedDate$ | async as selectedDate; else noDateState">
        <div class="slot-loading" *ngIf="isLoading">
          <ion-spinner name="crescent"></ion-spinner>
        </div>

        <ng-container *ngIf="!isLoading">
          <h3 class="slot-heading">Available Slots for {{ selectedDate | date : 'MMMM d, yyyy' }}</h3>

          <ng-container *ngIf="slots.length > 0; else noSlotsState">
            <div class="slot-chip-grid">
              <button
                *ngFor="let slot of slots"
                type="button"
                class="slot-chip"
                [class.slot-chip--selected]="slot.slotStartTime === latestSelectedSlot"
                [class.slot-chip--full]="!slot.isAvailable"
                [disabled]="!slot.isAvailable"
                (click)="selectSlot(slot)"
              >
                <span class="slot-chip__time"
                  >{{ slot.slotStartTime | timeSlot }} - {{ slot.slotEndTime | timeSlot }}</span
                >
                <span class="slot-chip__label" *ngIf="!slot.isAvailable">Full</span>
              </button>
            </div>
          </ng-container>

          <ng-template #noSlotsState>
            <div class="slot-empty">No available slots for this date.</div>
          </ng-template>
        </ng-container>
      </ng-container>

      <div class="wizard-actions wizard-actions--split">
        <button type="button" class="btn-outline" (click)="goBack()">Back</button>
        <button type="button" class="btn-primary" [disabled]="!latestSelectedSlot" (click)="goNext()">
          Continue
        </button>
      </div>

      <ng-template #noDateState>
        <app-empty-state
          icon="calendar-outline"
          title="Select a date first"
          description="Please go back and choose a doctor and appointment date before picking a time."
        ></app-empty-state>
      </ng-template>
    </section>
  `,
  styleUrl: './step-slot-select.component.scss'
})
export class StepSlotSelectComponent implements OnInit {
  private readonly wizardService = inject(BookingWizardService);
  private readonly publicService = inject(PublicService);
  private readonly toastCtrl = inject(ToastController);
  private readonly destroyRef = inject(DestroyRef);

  selectedDoctorId$ = this.wizardService.selectedDoctorId$;
  selectedDate$ = this.wizardService.selectedDate$;
  selectedSlot$ = this.wizardService.selectedSlot$;

  slots: AvailableSlot[] = [];
  isLoading = false;
  latestSelectedSlot: string | null = null;

  constructor() {
    addIcons({ calendarOutline });
  }

  ngOnInit(): void {
    this.selectedSlot$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((selectedSlot) => {
      this.latestSelectedSlot = selectedSlot;
    });

    combineLatest([this.selectedDoctorId$, this.selectedDate$])
      .pipe(
        distinctUntilChanged(
          ([prevDoctorId, prevDate], [doctorId, date]) => prevDoctorId === doctorId && prevDate === date
        ),
        switchMap(([doctorId, date]) => {
          if (!doctorId || !date) {
            this.slots = [];
            this.isLoading = false;
            return of([] as AvailableSlot[]);
          }

          this.isLoading = true;
          return this.publicService.getAvailableSlots(doctorId, date).pipe(
            catchError((error: unknown) => {
              void this.presentToast(extractApiErrorMessage(error, 'Failed to load available slots.'));
              return of([] as AvailableSlot[]);
            }),
            finalize(() => {
              this.isLoading = false;
            })
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((slots) => {
        this.slots = slots;
      });
  }

  selectSlot(slot: AvailableSlot): void {
    if (!slot.isAvailable) {
      return;
    }

    this.wizardService.selectSlot(slot.slotStartTime, slot.slotEndTime);
  }

  goBack(): void {
    this.wizardService.prevStep();
  }

  goNext(): void {
    this.wizardService.nextStep();
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
