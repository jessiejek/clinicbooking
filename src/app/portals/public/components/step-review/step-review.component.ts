import { AsyncPipe, DatePipe, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { catchError, combineLatest, map, of } from 'rxjs';
import { BookingWizardService } from '../../../../core/services/booking-wizard.service';
import { PesoPipe } from '../../../../shared/pipes/peso.pipe';
import { TimeSlotPipe } from '../../../../shared/pipes/time-slot.pipe';
import { PublicService } from '../../services/public.service';

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
          <p class="wizard-subtitle">Take a moment to confirm the details before continuing.</p>
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
          <button type="button" class="btn-primary" (click)="onConfirmAndProceed()">Confirm and Proceed</button>
        </div>
      </ng-container>
    </section>
  `,
  styleUrl: './step-review.component.scss'
})
export class StepReviewComponent {
  private readonly wizardService = inject(BookingWizardService);
  private readonly publicService = inject(PublicService);

  vm$ = combineLatest([
    this.wizardService.state$,
    this.publicService.getDoctors().pipe(catchError(() => of([]))),
    this.publicService.getServices().pipe(catchError(() => of([])))
  ]).pipe(
    map(([wizard, doctors, services]) => {
      const doctor = wizard.selectedDoctorId
        ? doctors.find((item) => item.id === wizard.selectedDoctorId)
        : null;
      const service = wizard.selectedServiceId
        ? services.find((item) => item.id === wizard.selectedServiceId)
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

  onConfirmAndProceed(): void {
    this.wizardService.nextStep();
  }

  goBack(): void {
    this.wizardService.prevStep();
  }

}
