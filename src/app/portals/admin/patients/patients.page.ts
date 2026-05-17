import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { IonModal } from '@ionic/angular/standalone';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { Patient } from '../../../core/models';
import { loadPatients, addPatient } from '../../../store/patients/patients.actions';
import { selectAllPatients, selectPatientsLoading } from '../../../store/patients/patients.selectors';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-admin-patients-page',
  standalone: true,
  imports: [AsyncPipe, NgFor, NgIf, ReactiveFormsModule, EmptyStateComponent, SkeletonComponent, StatusBadgeComponent, IonModal],
  template: `
    <section class="page-shell">
      <div class="page-shell__header">
        <div>
          <h2 class="page-title">Patients</h2>
          <p class="page-subtitle">Search records and register new patients.</p>
        </div>
        <button class="btn-primary" type="button" (click)="openModal()">Add Patient</button>
      </div>

      <input class="filter-input" [formControl]="searchControl" placeholder="Search by name, code, contact, or email" />

      <div class="clinic-card" *ngIf="!isLoading && filteredPatients.length > 0">
        <div class="table-desktop">
          <table class="clinic-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Sex</th>
                <th>DOB</th>
                <th>Contact</th>
                <th>Email</th>
                <th>Registered</th>
              </tr>
            </thead>
            <tbody>
              <tr
                *ngFor="let patient of filteredPatients"
                tabindex="0"
                role="button"
                [attr.aria-label]="'Open patient record for ' + patient.firstName + ' ' + patient.lastName"
                (click)="openDetail(patient.id)"
                (keydown.enter)="openDetail(patient.id)"
              >
                <td class="data-mono">{{ patient.patientCode }}</td>
                <td>{{ patient.firstName }} {{ patient.lastName }}</td>
                <td>{{ patient.sex }}</td>
                <td>{{ patient.dateOfBirth }}</td>
                <td>{{ patient.contactNumber }}</td>
                <td>{{ patient.email }}</td>
                <td><app-status-badge status="Active"></app-status-badge></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="table-mobile">
          <article
            *ngFor="let patient of filteredPatients"
            class="mobile-card"
            tabindex="0"
            role="button"
            [attr.aria-label]="'Open patient record for ' + patient.firstName + ' ' + patient.lastName"
            (click)="openDetail(patient.id)"
            (keydown.enter)="openDetail(patient.id)"
          >
            <div class="mobile-card__header">
              <div>
                <div class="mobile-card__name">{{ patient.firstName }} {{ patient.lastName }}</div>
                <div class="mobile-card__code">Patient Code {{ patient.patientCode }}</div>
              </div>
              <app-status-badge status="Active"></app-status-badge>
            </div>

            <div class="mobile-card__row">
              <span class="mobile-card__label">Sex</span>
              <span>{{ patient.sex }}</span>
            </div>

            <div class="mobile-card__row">
              <span class="mobile-card__label">DOB</span>
              <span class="data-mono">{{ patient.dateOfBirth }}</span>
            </div>

            <div class="mobile-card__row">
              <span class="mobile-card__label">Contact</span>
              <span>{{ patient.contactNumber }}</span>
            </div>

            <div class="mobile-card__row">
              <span class="mobile-card__label">Email</span>
              <span>{{ patient.email }}</span>
            </div>
          </article>
        </div>
      </div>

        <app-skeleton *ngIf="isLoading" variant="row" [count]="5"></app-skeleton>

        <app-empty-state
          *ngIf="!isLoading && filteredPatients.length === 0"
          icon="people-outline"
          title="No patients found"
          description="Try a different search or add a new patient."
          ctaLabel="Add Patient"
          (ctaClick)="openModal()"
        ></app-empty-state>
    </section>

    <ion-modal [isOpen]="isModalOpen" (didDismiss)="isModalOpen = false">
      <ng-template>
        <div class="modal-shell">
          <h3>Add Patient</h3>
          <form class="modal-form" [formGroup]="form" (ngSubmit)="submit()">
            <input class="filter-input" formControlName="firstName" placeholder="First Name" />
            <input class="filter-input" formControlName="lastName" placeholder="Last Name" />
            <select class="filter-input" formControlName="sex">
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            <input class="filter-input" type="date" formControlName="dateOfBirth" />
            <input class="filter-input" formControlName="contactNumber" placeholder="Contact Number" />
            <input class="filter-input" formControlName="email" placeholder="Email" />
            <div class="modal-actions">
              <button type="button" class="btn-ghost" (click)="isModalOpen = false">Cancel</button>
              <button type="submit" class="btn-primary">Save Patient</button>
            </div>
          </form>
        </div>
      </ng-template>
    </ion-modal>
  `,
  styleUrl: './patients.page.scss'
})
export class PatientsPage implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  searchControl = new FormControl('', { nonNullable: true });
  patients: Patient[] = [];
  filteredPatients: Patient[] = [];
  isLoading = false;
  isModalOpen = false;
  form = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    sex: ['Male', Validators.required],
    dateOfBirth: ['1990-01-01', Validators.required],
    contactNumber: ['', Validators.required],
    email: ['', Validators.email]
  });

  ngOnInit(): void {
    this.store.dispatch(loadPatients());
    this.store.select(selectAllPatients).subscribe((patients) => {
      this.patients = patients;
      this.filteredPatients = patients;
    });
    this.store.select(selectPatientsLoading).subscribe((loading) => (this.isLoading = loading));
    this.searchControl.valueChanges.pipe(debounceTime(300), distinctUntilChanged()).subscribe((query) => {
      const q = query.trim().toLowerCase();
      this.filteredPatients = !q
        ? this.patients
        : this.patients.filter((patient) =>
            [patient.firstName, patient.lastName, patient.patientCode, patient.contactNumber ?? '', patient.email ?? '']
              .join(' ')
              .toLowerCase()
              .includes(q)
          );
    });
  }

  openDetail(id: string): void {
    void this.router.navigate(['/admin/patients', id]);
  }

  openModal(): void {
    this.isModalOpen = true;
    this.form.reset({
      firstName: '',
      lastName: '',
      sex: 'Male',
      dateOfBirth: '1990-01-01',
      contactNumber: '',
      email: ''
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.store.dispatch(
      addPatient({
        patient: {
          firstName: this.form.value.firstName ?? '',
          lastName: this.form.value.lastName ?? '',
          sex: this.form.value.sex ?? 'Male',
          dateOfBirth: this.form.value.dateOfBirth ?? '1990-01-01',
          contactNumber: this.form.value.contactNumber ?? '',
          email: this.form.value.email ?? '',
          isGuest: false,
          consentVersion: 'v1.0'
        }
      })
    );
    this.isModalOpen = false;
  }
}
