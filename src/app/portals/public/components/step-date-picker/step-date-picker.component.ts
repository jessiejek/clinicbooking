import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { AsyncPipe, DatePipe, NgFor, NgIf } from '@angular/common';
import { Store } from '@ngrx/store';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronBackOutline, chevronForwardOutline } from 'ionicons/icons';
import { MockDataService } from '../../../../core/services/mock-data.service';
import { DayOfWeek } from '../../../../core/models';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { Subscription } from 'rxjs';
import {
  nextStep,
  prevStep,
  selectDate
} from '../../../../store/bookings/bookings.actions';
import {
  selectSelectedDate,
  selectSelectedDoctorId
} from '../../../../store/bookings/bookings.selectors';

@Component({
  selector: 'app-step-date-picker',
  standalone: true,
  imports: [NgIf, NgFor, AsyncPipe, DatePipe, IonIcon, EmptyStateComponent],
  template: `
    <section class="wizard-panel">
      <div class="wizard-panel__header">
        <div>
          <p class="section-heading">Step 2</p>
          <h2 class="wizard-title">Select your appointment date</h2>
          <p class="wizard-subtitle">Choose a working day that matches the doctor&apos;s schedule.</p>
        </div>
      </div>

      <ng-container *ngIf="selectedDoctorId$ | async as doctorId; else noDoctorState">
        <div class="calendar clinic-card">
          <div class="calendar-header">
            <button
              type="button"
              class="btn-icon"
              [disabled]="isCurrentMonth"
              (click)="prevMonth()"
            >
              <ion-icon name="chevron-back-outline"></ion-icon>
            </button>
            <div class="calendar-header__title">{{ currentMonth | date : 'MMMM yyyy' }}</div>
            <button type="button" class="btn-icon" (click)="nextMonth()">
              <ion-icon name="chevron-forward-outline"></ion-icon>
            </button>
          </div>

          <div class="calendar-grid">
            <div class="calendar-day-label" *ngFor="let label of weekdayLabels">{{ label }}</div>

            <ng-container *ngFor="let cell of calendarCells">
              <button
                *ngIf="cell.date; else emptyCell"
                type="button"
                class="calendar-cell"
                [class.calendar-cell--working]="isWorkingDay(doctorId, cell.date)"
                [class.calendar-cell--selected]="isSelected(cell.date)"
                [class.calendar-cell--today]="isToday(cell.date)"
                [class.calendar-cell--disabled]="isPast(cell.date) || !isWorkingDay(doctorId, cell.date)"
                [class.calendar-cell--blocked]="isBlocked(doctorId, cell.date)"
                [disabled]="!isSelectable(doctorId, cell.date)"
                [attr.title]="isBlocked(doctorId, cell.date) ? 'Unavailable' : ''"
                (click)="onDayClick(doctorId, cell.date)"
              >
                {{ cell.date.getDate() }}
              </button>
              <ng-template #emptyCell>
                <div class="calendar-cell calendar-cell--empty"></div>
              </ng-template>
            </ng-container>
          </div>
        </div>

        <div class="wizard-actions wizard-actions--split">
          <button type="button" class="btn-outline" (click)="goBack()">Back</button>
          <button type="button" class="btn-primary" [disabled]="!(selectedDate$ | async)" (click)="goNext()">
            Continue
          </button>
        </div>
      </ng-container>

      <ng-template #noDoctorState>
        <app-empty-state
          icon="medical-outline"
          title="Select a doctor first"
          description="Please go back and choose a doctor before picking a date."
        ></app-empty-state>
      </ng-template>
    </section>
  `,
  styleUrl: './step-date-picker.component.scss'
})
export class StepDatePickerComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);
  private readonly mockData = inject(MockDataService);
  private readonly subscriptions = new Subscription();

  currentMonth = this.startOfMonth(new Date());

  selectedDoctorId$ = this.store.select(selectSelectedDoctorId);
  selectedDate$ = this.store.select(selectSelectedDate);
  private latestSelectedDate: string | null = null;

  weekdayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  constructor() {
    addIcons({ chevronBackOutline, chevronForwardOutline });
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.selectedDate$.subscribe((selectedDate) => {
        this.latestSelectedDate = selectedDate;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  get isCurrentMonth(): boolean {
    const now = this.startOfMonth(new Date());
    return this.currentMonth.getFullYear() === now.getFullYear() && this.currentMonth.getMonth() === now.getMonth();
  }

  get calendarCells(): Array<{ date: Date | null }> {
    const firstDay = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), 1);
    const daysInMonth = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth() + 1,
      0
    ).getDate();
    const lead = (firstDay.getDay() + 6) % 7;
    const cells: Array<{ date: Date | null }> = [];

    for (let i = 0; i < lead; i++) {
      cells.push({ date: null });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      cells.push({ date: new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), day) });
    }

    return cells;
  }

  prevMonth(): void {
    if (this.isCurrentMonth) {
      return;
    }
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1);
  }

  nextMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
  }

  onDayClick(doctorId: string, date: Date): void {
    if (!this.isSelectable(doctorId, date)) {
      return;
    }

    this.store.dispatch(selectDate({ date: this.toIsoDate(date) }));
  }

  goBack(): void {
    this.store.dispatch(prevStep());
  }

  goNext(): void {
    this.store.dispatch(nextStep());
  }

  isToday(date: Date): boolean {
    const today = this.startOfDay(new Date());
    return this.toIsoDate(date) === this.toIsoDate(today);
  }

  isPast(date: Date): boolean {
    return this.startOfDay(date).getTime() < this.startOfDay(new Date()).getTime();
  }

  isWorkingDay(doctorId: string, date: Date): boolean {
    const dayOfWeek = this.dayNames()[date.getDay()];
    return this.mockData
      .getDoctorSchedules()
      .some((schedule) => schedule.doctorId === doctorId && schedule.dayOfWeek === dayOfWeek);
  }

  isBlocked(doctorId: string, date: Date): boolean {
    return this.mockData
      .getDoctorBlockedDates(doctorId)
      .some((blockedDate) => blockedDate.blockedDate === this.toIsoDate(date));
  }

  isSelected(date: Date): boolean {
    return this.latestSelectedDate === this.toIsoDate(date);
  }

  isSelectable(doctorId: string, date: Date): boolean {
    return !this.isPast(date) && this.isWorkingDay(doctorId, date) && !this.isBlocked(doctorId, date);
  }

  private startOfDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private startOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  private dayNames(): DayOfWeek[] {
    return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  }

  private toIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
