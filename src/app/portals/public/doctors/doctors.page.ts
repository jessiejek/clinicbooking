import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Doctor } from '../../../core/models';
import { PublicService } from '../services/public.service';
import { DoctorCardComponent } from '../components/doctor-card/doctor-card.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';

@Component({
  selector: 'app-doctors-page',
  standalone: true,
  imports: [NgIf, NgFor, DoctorCardComponent, SkeletonComponent],
  template: `
    <div class="page-wrap">
      <div class="content-container">
        <header class="page-header">
          <h1 class="page-title">Our Doctors</h1>
          <p class="page-subtitle">Find the right specialist for you</p>
        </header>

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

        <div class="skeleton-grid" *ngIf="isLoading">
          <app-skeleton *ngFor="let _ of skeletonPlaceholders" variant="card" />
        </div>

        <div *ngIf="!isLoading && !filteredDoctors.length" class="empty-hint">
          No doctors match this filter.
        </div>

        <div class="doctors-grid" *ngIf="!isLoading && filteredDoctors.length">
          <app-doctor-card *ngFor="let doc of filteredDoctors" [doctor]="doc" />
        </div>
      </div>
    </div>
  `,
  styleUrl: './doctors.page.scss'
})
export class DoctorsPage implements OnInit {
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

  ngOnInit(): void {
    this.publicService.getDoctors().subscribe((list) => {
      this.doctors = list;
      this.isLoading = false;
    });
  }
}
