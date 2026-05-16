import { Component, inject } from '@angular/core';
import { AsyncPipe, DatePipe, NgIf } from '@angular/common';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';
import { MockDataService } from '../../../../core/services/mock-data.service';
import { PesoPipe } from '../../../../shared/pipes/peso.pipe';
import { TimeSlotPipe } from '../../../../shared/pipes/time-slot.pipe';
import { selectCurrentStep, selectWizard } from '../../../../store/bookings/bookings.selectors';

@Component({
  selector: 'app-booking-summary-bar',
  standalone: true,
  imports: [NgIf, AsyncPipe, DatePipe, PesoPipe, TimeSlotPipe],
  template: `
    <div class="summary-bar" *ngIf="(currentStep$ | async)! >= 2">
      <ng-container *ngIf="summary$ | async as summary">
        <div class="summary-bar__items">
          <div class="summary-bar__item" *ngIf="summary.doctorName">
            <span class="summary-bar__label">Doctor</span>
            <span class="summary-bar__value">{{ summary.doctorName }}</span>
          </div>
          <div class="summary-bar__divider" *ngIf="summary.doctorName && summary.selectedDate"></div>
          <div class="summary-bar__item" *ngIf="summary.selectedDate">
            <span class="summary-bar__label">Date</span>
            <span class="summary-bar__value">{{ summary.selectedDate | date : 'MMM d' }}</span>
          </div>
          <div class="summary-bar__divider" *ngIf="summary.selectedDate && summary.selectedSlot"></div>
          <div class="summary-bar__item" *ngIf="summary.selectedSlot">
            <span class="summary-bar__label">Time</span>
            <span class="summary-bar__value data-mono"
              >{{ summary.selectedSlot | timeSlot }} - {{ summary.selectedSlotEnd | timeSlot }}</span
            >
          </div>
          <div class="summary-bar__fee" *ngIf="summary.doctorFee">
            {{ summary.doctorFee | peso }}
          </div>
        </div>
      </ng-container>
    </div>
  `,
  styleUrl: './booking-summary-bar.component.scss'
})
export class BookingSummaryBarComponent {
  private readonly store = inject(Store);
  private readonly mockData = inject(MockDataService);

  wizard$ = this.store.select(selectWizard);
  currentStep$ = this.store.select(selectCurrentStep);

  summary$ = this.wizard$.pipe(
    map((wizard) => {
      const doctor = wizard.selectedDoctorId
        ? this.mockData.getDoctors().find((item) => item.id === wizard.selectedDoctorId)
        : null;
      const service = wizard.selectedServiceId
        ? this.mockData.getServices().find((item) => item.id === wizard.selectedServiceId)
        : null;

      return {
        doctorName: doctor?.fullName ?? '',
        serviceName: service?.name ?? '',
        doctorFee: doctor?.consultationFee ?? 0,
        selectedDate: wizard.selectedDate,
        selectedSlot: wizard.selectedSlot,
        selectedSlotEnd: wizard.selectedSlotEnd
      };
    })
  );
}
