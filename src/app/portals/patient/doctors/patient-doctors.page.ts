import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { addIcons } from 'ionicons';
import { personOutline } from 'ionicons/icons';
import { Doctor } from '../../../core/models';
import { PublicService } from '../../public/services/public.service';
import { DoctorCardComponent } from '../../public/components/doctor-card/doctor-card.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';

@Component({
  selector: 'app-patient-doctors-page',
  standalone: true,
  imports: [NgIf, NgFor, DoctorCardComponent, EmptyStateComponent, SkeletonComponent],
  template: `
    <section class="page-shell">
      <div class="page-shell__header">
        <div>
          <h2 class="page-title">Choose a Doctor</h2>
          <p class="page-subtitle">Browse available clinicians and start a booking from your portal.</p>
        </div>
      </div>

      <div class="filter-row" *ngIf="specializations.length">
        <button
          type="button"
          *ngFor="let spec of specializations"
          class="filter-pill"
          [class.filter-pill--active]="spec === selectedSpecialization"
          (click)="selectedSpecialization = spec"
        >
          {{ spec }}
        </button>
      </div>

      <div class="doctor-hint">
        Tap a doctor card to book an appointment or open the full profile for details.
      </div>

      <div class="skeleton-grid" *ngIf="isLoading">
        <app-skeleton *ngFor="let _ of skeletonPlaceholders" variant="card"></app-skeleton>
      </div>

      <div *ngIf="!isLoading && !filteredDoctors.length" class="empty-wrap">
        <app-empty-state
          icon="person-outline"
          title="No doctors match this filter"
          description="Try a different specialty filter to see more clinicians."
        ></app-empty-state>
      </div>

      <div class="doctors-grid" *ngIf="!isLoading && filteredDoctors.length">
        <app-doctor-card
          *ngFor="let doc of filteredDoctors"
          [doctor]="doc"
          profileRouteBase="/patient/doctors"
        ></app-doctor-card>
      </div>
    </section>
  `,
  styleUrl: './patient-doctors.page.scss'
})
export class PatientDoctorsPage implements OnInit {
  private readonly publicService = inject(PublicService);

  isLoading = true;
  doctors: Doctor[] = [];
  selectedSpecialization = 'All';
  readonly skeletonPlaceholders = [0, 1, 2];

  get specializations(): string[] {
    const uniq = [...new Set(this.doctors.map((d) => d.specialization))].sort();
    return ['All', ...uniq];
  }

  get filteredDoctors(): Doctor[] {
    if (this.selectedSpecialization === 'All') {
      return this.doctors;
    }
    return this.doctors.filter((d) => d.specialization === this.selectedSpecialization);
  }

  constructor() {
    addIcons({ personOutline });
  }

  ngOnInit(): void {
    this.publicService.getDoctors().subscribe((list) => {
      this.doctors = list;
      this.isLoading = false;
    });
  }
}
