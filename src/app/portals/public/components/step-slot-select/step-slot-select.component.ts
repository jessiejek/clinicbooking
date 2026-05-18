import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { AsyncPipe, DatePipe, NgIf } from '@angular/common';
import { combineLatest, filter, map, Subscription, switchMap, timer } from 'rxjs';
import { MockDataService } from '../../../../core/services/mock-data.service';
import { BookingWizardService } from '../../../../core/services/booking-wizard.service';
import { BookingTimerComponent } from '../../../../shared/components/booking-timer/booking-timer.component';
import { SlotGridComponent } from '../../../../shared/components/slot-grid/slot-grid.component';
import { TimeSlot } from '../../../../core/models';

@Component({
  selector: 'app-step-slot-select',
  standalone: true,
  imports: [NgIf, AsyncPipe, DatePipe, BookingTimerComponent, SlotGridComponent],
  template: `
    <section class="wizard-panel">
      <div class="wizard-panel__header">
        <div>
          <p class="section-heading">Step 3</p>
          <h2 class="wizard-title">Select your preferred time</h2>
          <p class="wizard-subtitle">Choose an available slot to reserve it for 10 minutes.</p>
        </div>
      </div>

      <ng-container *ngIf="selectedDate$ | async as selectedDate">
        <h3 class="slot-heading">Available Slots for {{ selectedDate | date : 'MMMM d, yyyy' }}</h3>

        <app-booking-timer
          *ngIf="timerVisible && timerStarted"
          [durationSeconds]="600"
          (timerExpired)="onTimerExpired()"
        ></app-booking-timer>

        <app-slot-grid
          [slots]="slots"
          [selectedSlot]="selectedSlot$ | async"
          [isLoading]="isLoading"
          (slotSelected)="onSlotSelected($event)"
        ></app-slot-grid>
      </ng-container>

      <div class="wizard-actions wizard-actions--split">
        <button type="button" class="btn-outline" (click)="goBack()">Back</button>
        <button
          type="button"
          class="btn-primary"
          [disabled]="!(selectedSlot$ | async)"
          (click)="goNext()"
        >
          Continue
        </button>
      </div>
    </section>
  `,
  styleUrl: './step-slot-select.component.scss'
})
export class StepSlotSelectComponent implements OnInit, OnDestroy {
  private readonly wizardService = inject(BookingWizardService);
  private readonly mockData = inject(MockDataService);

  selectedDoctorId$ = this.wizardService.selectedDoctorId$;
  selectedDate$ = this.wizardService.selectedDate$;
  selectedSlot$ = this.wizardService.selectedSlot$;

  slots: TimeSlot[] = [];
  isLoading = true;
  timerStarted = false;
  timerVisible = false;

  private subscription?: Subscription;

  ngOnInit(): void {
    this.subscription = combineLatest([this.selectedDoctorId$, this.selectedDate$])
      .pipe(
        filter(([doctorId, selectedDate]) => Boolean(doctorId) && Boolean(selectedDate)),
        switchMap(([doctorId, selectedDate]) => {
          const resolvedDoctorId = doctorId as string;
          const resolvedSelectedDate = selectedDate as string;
          this.isLoading = true;
          this.slots = [];
          return timer(300).pipe(
            map(() => ({
              doctorId: resolvedDoctorId,
              selectedDate: resolvedSelectedDate
            }))
          );
        })
      )
      .subscribe(({ doctorId, selectedDate }) => {
        this.slots = this.mockData.generateMockSlots(doctorId, new Date(selectedDate));
        this.isLoading = false;
      });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  onSlotSelected(event: { slot: string; slotEnd: string }): void {
    this.wizardService.selectSlot(event.slot, event.slotEnd);
    this.timerStarted = true;
    this.timerVisible = false;
    window.setTimeout(() => {
      this.timerVisible = true;
    }, 0);
  }

  onTimerExpired(): void {
    this.wizardService.selectSlot(null, null);
  }

  goBack(): void {
    this.wizardService.prevStep();
  }

  goNext(): void {
    this.wizardService.nextStep();
  }
}
