import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { Booking, Doctor, Patient, Service, TimeSlot } from '../../../core/models';
import { BookingService } from '../../../core/services/booking.service';
import { DoctorStateService } from '../../../core/services/doctor-state.service';
import { MockDataService } from '../../../core/services/mock-data.service';
import { PatientStateService } from '../../../core/services/patient-state.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { SlotGridComponent } from '../../../shared/components/slot-grid/slot-grid.component';

@Component({
  selector: 'app-staff-walk-in-page',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, ReactiveFormsModule, EmptyStateComponent, SlotGridComponent],
  template: `
    <section class="page-shell">
      <div class="page-shell__header">
        <div>
          <h2 class="page-title">Walk-In Booking</h2>
          <p class="page-subtitle">Create a same-day appointment in three quick steps.</p>
        </div>
      </div>

      <div class="stepper">
        <button type="button" class="stepper__step" [class.is-active]="currentWalkInStep === 1">1. Patient</button>
        <button type="button" class="stepper__step" [class.is-active]="currentWalkInStep === 2">2. Slot</button>
        <button type="button" class="stepper__step" [class.is-active]="currentWalkInStep === 3">3. Payment</button>
      </div>

      <div class="clinic-card" *ngIf="currentWalkInStep === 1">
        <div class="section-heading">Patient Search</div>
        <input class="filter-input" type="search" [formControl]="searchControl" placeholder="Search by name, code, or contact" />

        <div class="result-list" *ngIf="searchResults.length > 0">
          <button
            type="button"
            class="result-list__item"
            *ngFor="let patient of searchResults"
            (click)="selectPatient(patient)"
          >
            <strong>{{ patient.patientCode }}</strong>
            <span>{{ patient.firstName }} {{ patient.lastName }}</span>
            <span>{{ patient.dateOfBirth }} - {{ patient.contactNumber }}</span>
          </button>
        </div>

        <app-empty-state
          *ngIf="searchResults.length === 0 && searchControl.value"
          icon="person-add-outline"
          title="Patient not found"
          description="Register a new patient quickly to continue."
          ctaLabel="Quick Register"
          (ctaClick)="showQuickRegister = true"
        ></app-empty-state>

        <form *ngIf="showQuickRegister" class="quick-register" (ngSubmit)="quickRegister()">
          <input class="filter-input" name="firstName" [(ngModel)]="quickPatient.firstName" placeholder="First name" />
          <input class="filter-input" name="lastName" [(ngModel)]="quickPatient.lastName" placeholder="Last name" />
          <input class="filter-input" name="contactNumber" [(ngModel)]="quickPatient.contactNumber" placeholder="Contact number" />
          <button type="submit" class="btn-primary">Create Patient</button>
        </form>
      </div>

      <div class="clinic-card" *ngIf="currentWalkInStep === 2 && selectedPatient">
        <div class="section-heading">Slot Selection</div>
        <div class="slot-form-grid">
          <select class="filter-input" [(ngModel)]="selectedDoctorId" (ngModelChange)="onDoctorChange($event)">
            <option [ngValue]="null">Select doctor</option>
            <option *ngFor="let doctor of doctors" [value]="doctor.id">{{ doctor.fullName }}</option>
          </select>
          <input class="filter-input" type="date" [(ngModel)]="selectedDate" (ngModelChange)="onDateChange($event)" />
        </div>

        <app-slot-grid
          *ngIf="selectedDoctor && selectedDate"
          [slots]="slots"
          [selectedSlot]="selectedSlot?.time || null"
          (slotSelected)="onSlotSelected($event)"
        ></app-slot-grid>

        <div class="step-actions">
          <button type="button" class="btn-ghost" (click)="currentWalkInStep = 1">Back</button>
        </div>
      </div>

      <div class="clinic-card" *ngIf="currentWalkInStep === 3 && selectedPatient && selectedDoctor && selectedSlot">
        <div class="section-heading">Payment Mode</div>
        <label class="radio-row"><input type="radio" name="paymentMode" [(ngModel)]="paymentMode" value="PayAtClinic" /> Pay at Clinic</label>
        <label class="radio-row"><input type="radio" name="paymentMode" [(ngModel)]="paymentMode" value="Online" /> Has proof in hand (Online)</label>

        <div class="summary-box">
          <p><strong>Patient:</strong> {{ selectedPatient.firstName }} {{ selectedPatient.lastName }}</p>
          <p><strong>Doctor:</strong> {{ selectedDoctor.fullName }}</p>
          <p><strong>Date:</strong> {{ selectedDate }}</p>
          <p><strong>Time:</strong> {{ selectedSlot.time }} - {{ selectedSlot.endTime }}</p>
          <p><strong>Fee:</strong> &#8369;{{ selectedService?.price ?? selectedDoctor.consultationFee }}</p>
        </div>

        <div class="step-actions">
          <button type="button" class="btn-ghost" (click)="currentWalkInStep = 2">Back</button>
          <button type="button" class="btn-primary" (click)="createBooking()">Create Booking</button>
        </div>
      </div>
    </section>
  `,
  styleUrl: './staff-walk-in.page.scss'
})
export class StaffWalkInPage implements OnInit {
  private readonly bookingService = inject(BookingService);
  private readonly doctorState = inject(DoctorStateService);
  private readonly patientState = inject(PatientStateService);
  private readonly mockData = inject(MockDataService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  currentWalkInStep: 1 | 2 | 3 = 1;
  searchControl = new FormControl('', { nonNullable: true });
  searchResults: Patient[] = [];
  showQuickRegister = false;
  quickPatient = { firstName: '', lastName: '', contactNumber: '' };
  patients: Patient[] = [];
  bookings: Booking[] = [];
  doctors: Doctor[] = [];
  selectedPatient: Patient | null = null;
  selectedDoctorId: string | null = null;
  selectedDate: string | null = null;
  selectedSlot: TimeSlot | null = null;
  selectedDoctor: Doctor | null = null;
  selectedService: Service | null = null;
  slots: TimeSlot[] = [];
  paymentMode: 'PayAtClinic' | 'Online' = 'PayAtClinic';

  ngOnInit(): void {
    this.patientState.getPatients().subscribe((patients) => {
      this.patients = patients.length ? patients : this.mockData.getPatients();
    });
    this.bookingService.getBookings().subscribe((bookings) => (this.bookings = bookings));
    this.doctorState.getDoctors().subscribe((doctors) => {
      this.doctors = doctors.length ? doctors : this.mockData.getDoctors();
    });

    this.searchControl.valueChanges.pipe(debounceTime(300), distinctUntilChanged()).subscribe((value) => {
      this.searchResults = this.filterPatients(value);
      this.showQuickRegister = false;
    });

    const rescheduling = this.route.snapshot.queryParamMap.get('rescheduling');
    if (rescheduling) {
      this.searchControl.setValue('');
    }
  }

  selectPatient(patient: Patient): void {
    this.selectedPatient = patient;
    this.currentWalkInStep = 2;
  }

  quickRegister(): void {
    const patient: Patient = {
      id: `pat-${Date.now()}`,
      patientCode: `PT-${new Date().getFullYear()}-${String(this.patients.length + 1).padStart(5, '0')}`,
      firstName: this.quickPatient.firstName,
      lastName: this.quickPatient.lastName,
      contactNumber: this.quickPatient.contactNumber,
      dateOfBirth: '1990-01-01',
      sex: 'Unknown',
      isGuest: true,
      consentVersion: 'v1.0'
    };
    this.patientState.savePatient(patient);
    this.selectedPatient = patient;
    this.currentWalkInStep = 2;
  }

  onDoctorChange(doctorId: string | null): void {
    this.selectedDoctorId = doctorId;
    this.selectedDoctor = this.doctors.find((doctor) => doctor.id === doctorId) ?? null;
    this.selectedService = this.selectedDoctor
      ? this.mockData.getServices().find((service) => service.doctorIds.includes(this.selectedDoctor!.id)) ?? null
      : null;
    this.refreshSlots();
  }

  onDateChange(date: string | null): void {
    this.selectedDate = date;
    this.refreshSlots();
  }

  onSlotSelected(slot: { slot: string; slotEnd: string }): void {
    this.selectedSlot = { time: slot.slot, endTime: slot.slotEnd, status: 'selected' };
    this.currentWalkInStep = 3;
  }

  createBooking(): void {
    if (!this.selectedPatient || !this.selectedDoctor || !this.selectedDate || !this.selectedSlot) {
      return;
    }

    const service =
      this.selectedService ?? this.mockData.getServices().find((item) => item.doctorIds.includes(this.selectedDoctor!.id));
    const consultationFee = this.selectedDoctor.consultationFee;
    const serviceFee = service?.price ?? 0;
    const booking: Booking = {
      id: `BK-${Date.now()}`,
      patientId: this.selectedPatient.id,
      doctorId: this.selectedDoctor.id,
      serviceId: service?.id ?? this.mockData.getServices()[0].id,
      appointmentDate: this.selectedDate,
      slotStartTime: this.selectedSlot.time,
      slotEndTime: this.selectedSlot.endTime,
      status: 'Confirmed',
      paymentStatus: this.paymentMode === 'Online' ? 'Paid' : 'Unpaid',
      paymentMode: this.paymentMode,
      queueNumber: this.bookings.length + 1,
      totalFee: consultationFee + serviceFee,
      consultationFeeSnapshot: consultationFee,
      serviceFeeSnapshot: serviceFee,
      isWalkIn: true,
      proofType: this.paymentMode === 'Online' ? 'ReferenceNumber' : undefined,
      proofValue: this.paymentMode === 'Online' ? 'WALKIN-PROOF' : undefined,
      createdAt: new Date().toISOString()
    };
    this.bookingService.addBooking(booking);
    void this.router.navigate(['/staff/bookings', booking.id]);
  }

  private refreshSlots(): void {
    if (!this.selectedDoctorId || !this.selectedDate) {
      this.slots = [];
      return;
    }
    this.slots = this.mockData.generateMockSlots(this.selectedDoctorId, new Date(`${this.selectedDate}T00:00:00`));
  }

  private filterPatients(query: string): Patient[] {
    const q = query.trim().toLowerCase();
    if (!q) {
      return [];
    }
    return this.patients.filter((patient) =>
      [patient.firstName, patient.lastName, patient.patientCode, patient.contactNumber ?? ''].join(' ').toLowerCase().includes(q)
    );
  }
}
