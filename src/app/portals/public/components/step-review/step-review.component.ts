import { Component, inject } from '@angular/core';
import { AsyncPipe, DatePipe, NgIf } from '@angular/common';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';
import { MockDataService } from '../../../../core/services/mock-data.service';
import { PesoPipe } from '../../../../shared/pipes/peso.pipe';
import { TimeSlotPipe } from '../../../../shared/pipes/time-slot.pipe';
import { nextStep, prevStep } from '../../../../store/bookings/bookings.actions';
import { selectWizard } from '../../../../store/bookings/bookings.selectors';

@Component({
  selector: 'app-step-review',
  standalone: true,
  imports: [NgIf, AsyncPipe, DatePipe, PesoPipe, TimeSlotPipe],
  template: `
    <section class="wizard-panel">
      <div class="wizard-panel__header">
        <div>
          <p class="section-heading">Step 4</p>
          <h2 class="wizard-title">Review your booking</h2>
          <p class="wizard-subtitle">
            Take a moment to confirm the details before moving to authentication.
          </p>
        </div>
      </div>

      <ng-container *ngIf="vm$ | async as vm">
        <div class="clinic-card summary-card">
          <p class="section-heading">Booking Summary</p>

          <div class="summary-row">
            <span>Doctor</span>
            <strong>{{ vm.doctorName }}</strong>
          </div>
          <div class="summary-subrow">{{ vm.doctorSpecialization }}</div>

          <div class="summary-row">
            <span>Date</span>
            <strong>{{ vm.selectedDate | date : 'EEEE, MMMM d, yyyy' }}</strong>
          </div>

          <div class="summary-row">
            <span>Time</span>
            <strong class="data-mono"
              >{{ vm.selectedSlot | timeSlot }} - {{ vm.selectedSlotEnd | timeSlot }}</strong
            >
          </div>

          <div class="summary-row">
            <span>Service</span>
            <strong>{{ vm.serviceName }}</strong>
          </div>
          <div class="summary-subrow">{{ vm.serviceDescription }}</div>

          <div class="divider"></div>

          <div class="summary-row">
            <span>Consultation Fee</span>
            <strong>{{ vm.consultationFee | peso }}</strong>
          </div>
          <div class="summary-row">
            <span>Service Fee</span>
            <strong>{{ vm.serviceFee | peso }}</strong>
          </div>
          <div class="summary-row summary-row--total">
            <span>Total Due</span>
            <strong class="fee-total">{{ vm.totalFee | peso }}</strong>
          </div>
        </div>

        <div class="wizard-actions wizard-actions--split">
          <button type="button" class="btn-outline" (click)="goBack()">Back</button>
          <button type="button" class="btn-primary" (click)="goNext()">Confirm and Proceed</button>
        </div>
      </ng-container>
    </section>
  `,
  styleUrl: './step-review.component.scss'
})
export class StepReviewComponent {
  private readonly store = inject(Store);
  private readonly mockData = inject(MockDataService);

  vm$ = this.store.select(selectWizard).pipe(
    map((wizard) => {
      const doctor = wizard.selectedDoctorId
        ? this.mockData.getDoctors().find((item) => item.id === wizard.selectedDoctorId)
        : null;
      const service = wizard.selectedServiceId
        ? this.mockData.getServices().find((item) => item.id === wizard.selectedServiceId)
        : null;
      const consultationFee = doctor?.consultationFee ?? 0;
      const serviceFee = service?.price ?? 0;

      return {
        doctorName: doctor?.fullName ?? '-',
        doctorSpecialization: doctor?.specialization ?? '',
        serviceName: service?.name ?? '-',
        serviceDescription: service?.description ?? 'Included in consultation',
        selectedDate: wizard.selectedDate,
        selectedSlot: wizard.selectedSlot,
        selectedSlotEnd: wizard.selectedSlotEnd,
        consultationFee,
        serviceFee,
        totalFee: consultationFee + serviceFee
      };
    })
  );

  goNext(): void {
    this.store.dispatch(nextStep());
  }

  goBack(): void {
    this.store.dispatch(prevStep());
  }
}
