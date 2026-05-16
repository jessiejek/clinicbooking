import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, map } from 'rxjs';
import { selectAllDoctors, selectDoctorsLoading } from '../../../store/doctors/doctors.selectors';
import { DoctorCardComponent } from '../../public/components/doctor-card/doctor-card.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';

@Component({
  selector: 'app-patient-doctors-page',
  standalone: true,
  imports: [AsyncPipe, NgFor, NgIf, DoctorCardComponent, EmptyStateComponent, SkeletonComponent],
  template: `
    <section class="page-shell" *ngIf="vm$ | async as vm">
      <div class="page-shell__header">
        <div>
          <h2 class="page-title">Doctors</h2>
          <p class="page-subtitle">Browse available doctors and book your next visit.</p>
        </div>
      </div>

      <div class="clinic-card" *ngIf="!vm.isLoading && vm.doctors.length > 0">
        <div class="doctors-grid">
          <app-doctor-card *ngFor="let doctor of vm.doctors" [doctor]="doctor"></app-doctor-card>
        </div>
      </div>

      <app-skeleton *ngIf="vm.isLoading" variant="card" [count]="3"></app-skeleton>

      <app-empty-state
        *ngIf="!vm.isLoading && vm.doctors.length === 0"
        icon="medical-outline"
        title="No doctors available"
        description="Please check back later for available providers."
      ></app-empty-state>
    </section>
  `,
  styleUrl: './patient-doctors.page.scss'
})
export class PatientDoctorsPage {
  private readonly store = inject(Store);

  vm$ = combineLatest([
    this.store.select(selectAllDoctors),
    this.store.select(selectDoctorsLoading)
  ]).pipe(map(([doctors, isLoading]) => ({ doctors, isLoading })));
}
