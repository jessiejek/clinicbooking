import { NgFor, NgIf } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { Booking, PatientDetail } from '../../../core/models';
import { BookingService } from '../../../core/services/booking.service';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { IonLabel, IonSegment, IonSegmentButton } from '@ionic/angular/standalone';
import { StaffService } from '../services/staff.service';

@Component({
  selector: 'app-staff-patient-detail-page',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    AvatarComponent,
    EmptyStateComponent,
    SkeletonComponent,
    StatusBadgeComponent,
    IonSegment,
    IonSegmentButton,
    IonLabel
  ],
  templateUrl: './staff-patient-detail.page.html',
  styleUrl: './staff-patient-detail.page.scss'
})
export class StaffPatientDetailPage implements OnInit {
  private readonly bookingService = inject(BookingService);
  private readonly staffService = inject(StaffService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  patient: PatientDetail | null = null;
  bookings: Booking[] = [];
  selectedTab: 'overview' | 'bookings' | 'records' = 'overview';
  isLoading = true;
  errorMessage = '';

  private patientId = '';
  private requestVersion = 0;

  ngOnInit(): void {
    this.patientId = this.route.snapshot.paramMap.get('id') ?? '';

    if (!this.patientId) {
      this.isLoading = false;
      this.errorMessage = 'Missing patient ID.';
      return;
    }

    this.loadPatient();
  }

  back(): void {
    void this.router.navigate(['/staff/patients']);
  }

  retry(): void {
    if (!this.patientId) {
      return;
    }

    this.loadPatient();
  }

  setSelectedTab(value: string | number | null | undefined): void {
    if (value === 'overview' || value === 'bookings' || value === 'records') {
      this.selectedTab = value;
    }
  }

  patientDisplayName(): string {
    if (!this.patient) {
      return 'Patient';
    }

    const parts = [this.patient.firstName, this.patient.middleName, this.patient.lastName]
      .map((part) => part?.trim())
      .filter((part): part is string => Boolean(part));

    return parts.length > 0 ? parts.join(' ') : 'Patient';
  }

  get patientStatusLabel(): 'LinkedAccount' | 'NoAccount' | 'AccountUnknown' {
    if (this.patient?.hasAccount === true || Boolean(this.patient?.userId?.trim())) {
      return 'LinkedAccount';
    }

    if (this.patient?.hasAccount === false) {
      return 'NoAccount';
    }

    return 'AccountUnknown';
  }

  get patientStatusLabelText(): string {
    switch (this.patientStatusLabel) {
      case 'LinkedAccount':
        return 'Account Linked';
      case 'NoAccount':
        return 'No Account';
      default:
        return 'Account Unknown';
    }
  }

  private loadPatient(): void {
    const version = ++this.requestVersion;
    this.isLoading = true;
    this.errorMessage = '';
    this.patient = null;
    this.bookings = [];
    this.selectedTab = 'overview';

    this.staffService
      .getPatientById(this.patientId)
      .pipe(
        finalize(() => {
          if (version === this.requestVersion) {
            this.isLoading = false;
          }
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (patient) => {
          if (version !== this.requestVersion) {
            return;
          }

          if (!patient) {
            this.patient = null;
            this.errorMessage = 'No patient data was returned.';
            return;
          }

          this.patient = patient;
          this.loadBookings();
        },
        error: () => {
          if (version !== this.requestVersion) {
            return;
          }

          this.patient = null;
          this.bookings = [];
          this.errorMessage = 'We could not load this patient record.';
        }
      });
  }

  private loadBookings(): void {
    if (!this.patientId) {
      return;
    }

    this.bookingService
      .getBookingsByPatientId(this.patientId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (bookings) => {
          this.bookings = bookings;
        },
        error: () => {
          this.bookings = [];
        }
      });
  }
}
