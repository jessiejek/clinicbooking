import { NgFor, NgIf } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs';
import { PatientSummary } from '../../../core/models';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { StaffService } from '../services/staff.service';

@Component({
  selector: 'app-staff-patients-page',
  standalone: true,
  imports: [NgFor, NgIf, ReactiveFormsModule, EmptyStateComponent, SkeletonComponent, StatusBadgeComponent],
  template: `
    <section class="page-shell">
      <div class="page-shell__header">
        <div>
          <h2 class="page-title">Patients</h2>
          <p class="page-subtitle">Search records and review patient profiles.</p>
        </div>
      </div>

      <input
        class="filter-input"
        [formControl]="searchControl"
        placeholder="Search by name, code, contact, or email"
        aria-label="Search patients"
      />

      <div class="patients-meta" *ngIf="!isLoading">
        <span>{{ countLabel }}</span>
      </div>

      <div class="clinic-card patients-card" *ngIf="!isLoading && patients.length > 0">
        <div class="patients-table-wrap">
          <table class="clinic-table patients-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Full Name</th>
                <th>Sex</th>
                <th>DOB</th>
                <th>Contact</th>
                <th>Email</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr
                *ngFor="let patient of patients"
                tabindex="0"
                role="button"
                [attr.aria-label]="'Open patient record for ' + patientDisplayName(patient)"
                (click)="openDetail(patient.id)"
                (keydown.enter)="openDetail(patient.id)"
              >
                <td class="data-mono">{{ patient.patientCode }}</td>
                <td>{{ patientDisplayName(patient) }}</td>
                <td>{{ patient.sex }}</td>
                <td>{{ patient.dateOfBirth }}</td>
                <td>{{ patient.contactNumber || 'No phone provided' }}</td>
                <td>{{ patient.email || 'No email provided' }}</td>
                <td>
                  <app-status-badge [status]="patientAccountStatus(patient)"></app-status-badge>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="patients-mobile-list">
          <article
            class="patient-mobile-card"
            *ngFor="let patient of patients"
            tabindex="0"
            role="button"
            [attr.aria-label]="'Open patient record for ' + patientDisplayName(patient)"
            (click)="openDetail(patient.id)"
            (keydown.enter)="openDetail(patient.id)"
          >
            <div class="patient-mobile-card__header">
              <div>
                <strong>{{ patientDisplayName(patient) }}</strong>
                <span class="data-mono">{{ patient.patientCode }}</span>
              </div>
              <app-status-badge [status]="patientAccountStatus(patient)"></app-status-badge>
            </div>

            <dl class="patient-mobile-card__details">
              <div>
                <dt>Sex</dt>
                <dd>{{ patient.sex }}</dd>
              </div>
              <div>
                <dt>DOB</dt>
                <dd>{{ patient.dateOfBirth }}</dd>
              </div>
              <div>
                <dt>Contact</dt>
                <dd>{{ patient.contactNumber || 'No phone provided' }}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{{ patient.email || 'No email provided' }}</dd>
              </div>
            </dl>
          </article>
        </div>
      </div>

      <app-skeleton *ngIf="isLoading" variant="row" [count]="5"></app-skeleton>

      <app-empty-state
        *ngIf="!isLoading && patients.length === 0"
        icon="people-outline"
        title="No patients found"
        description="Try a different search term."
      ></app-empty-state>
    </section>
  `,
  styleUrl: './staff-patients.page.scss'
})
export class StaffPatientsPage implements OnInit {
  private readonly staffService = inject(StaffService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly pageSize = 20;
  searchControl = new FormControl('', { nonNullable: true });
  patients: PatientSummary[] = [];
  total = 0;
  currentPage = 1;
  totalPages = 1;
  isLoading = false;

  private searchTerm = '';
  private loadToken = 0;

  ngOnInit(): void {
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((query) => {
        this.searchTerm = query.trim();
        this.loadPatients(1);
      });

    this.loadPatients(1);
  }

  get rangeStart(): number {
    if (this.total === 0) {
      return 0;
    }

    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get rangeEnd(): number {
    if (this.total === 0) {
      return 0;
    }

    return Math.min(this.total, this.rangeStart + this.patients.length - 1);
  }

  get countLabel(): string {
    if (this.total === 0) {
      return 'Showing 0 of 0 patients';
    }

    return `Showing ${this.rangeStart}-${this.rangeEnd} of ${this.total} patients`;
  }

  openDetail(id: string): void {
    void this.router.navigate(['/staff/patients', id]);
  }

  patientDisplayName(patient: PatientSummary): string {
    return patient.fullName || [patient.firstName, patient.middleName, patient.lastName].filter(Boolean).join(' ') || 'Patient';
  }

  patientAccountStatus(patient: PatientSummary): 'LinkedAccount' | 'Guest' | 'NoAccount' {
    if (patient.userId) {
      return 'LinkedAccount';
    }

    if (patient.isGuest) {
      return 'Guest';
    }

    return 'NoAccount';
  }

  private loadPatients(page: number): void {
    const nextPage = Math.max(1, page);
    const token = ++this.loadToken;
    this.isLoading = true;

    this.staffService
      .getPatients(nextPage, this.pageSize, this.searchTerm)
      .pipe(
        finalize(() => {
          if (token === this.loadToken) {
            this.isLoading = false;
          }
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (result) => {
          if (token !== this.loadToken) {
            return;
          }

          this.patients = result.items;
          this.total = result.total;
          this.currentPage = Math.max(1, result.page || nextPage);
          this.totalPages = Math.max(1, result.totalPages || 1);
        },
        error: () => {
          if (token !== this.loadToken) {
            return;
          }

          this.patients = [];
          this.total = 0;
          this.currentPage = 1;
          this.totalPages = 1;
        }
      });
  }
}
