import { NgFor, NgIf } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, forkJoin, of } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Booking } from '../../../core/models';
import { BookingService } from '../../../core/services/booking.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

interface PatientEntry {
  id: string;
  patientName: string;
  latestDate: string;
  latestTime: string;
  services: string;
  status: string;
  queueNumber: number | null;
  source: 'today' | 'upcoming';
  latestBookingId: string;
}

@Component({
  standalone: true,
  selector: 'app-doctor-patients-page',
  imports: [NgFor, NgIf, FormsModule, RouterLink, EmptyStateComponent, SkeletonComponent, StatusBadgeComponent],
  template: `
    <div class="ps">
      <div class="psh">
        <div>
          <h2 class="pt">My Patients</h2>
          <p class="psub">Patients linked to your consultations and upcoming appointments.</p>
        </div>
      </div>

      <div class="search-row">
        <input class="si" [(ngModel)]="searchQuery" placeholder="Search by patient name..." />
      </div>

      <div class="fc">
        <button class="fb" [class.fb-a]="activeFilter === 'all'" (click)="activeFilter = 'all'">All ({{ patients.length }})</button>
        <button class="fb" [class.fb-a]="activeFilter === 'today'" (click)="activeFilter = 'today'">Today ({{ todayCount }})</button>
        <button class="fb" [class.fb-a]="activeFilter === 'upcoming'" (click)="activeFilter = 'upcoming'">Upcoming ({{ upcomingCount }})</button>
      </div>

      <app-skeleton *ngIf="loading" variant="card" [count]="4"></app-skeleton>

      <ng-container *ngIf="!loading && filteredPatients.length > 0">
        <div class="pc">
          <div class="pi" *ngFor="let p of filteredPatients" tabindex="0" role="button" (click)="openDetail(p.latestBookingId)" (keydown.enter)="openDetail(p.latestBookingId)" [attr.aria-label]="'View patient ' + p.patientName">
            <div class="pih">
              <div class="pii">
                <strong class="pin">{{ p.patientName }}</strong>
                <span class="pis">{{ p.services }}</span>
              </div>
              <div class="pib">
                <span class="qp" *ngIf="p.queueNumber != null">#{{ p.queueNumber }}</span>
                <app-status-badge [status]="p.status"></app-status-badge>
                <button class="vb" (click)="$event.stopPropagation(); openDetail(p.latestBookingId)">View Patient</button>
              </div>
            </div>
            <div class="pim">
              <span class="pid">{{ p.latestDate }} {{ p.latestTime }}</span>
              <span class="pisrc" [class.src-today]="p.source === 'today'" [class.src-upcoming]="p.source === 'upcoming'">{{ p.source === 'today' ? 'Today' : 'Upcoming' }}</span>
            </div>
          </div>
        </div>
      </ng-container>

      <app-empty-state
        *ngIf="!loading && filteredPatients.length === 0"
        icon="people-outline"
        title="No patients found yet"
        description="Patients will appear here once they have appointments with you."
      ></app-empty-state>
    </div>
  `,
  styleUrl: './doctor-patients.page.scss'
})
export class DoctorPatientsPage implements OnInit {
  private readonly bookingService = inject(BookingService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  patients: PatientEntry[] = [];
  loading = true;
  searchQuery = '';
  activeFilter: 'all' | 'today' | 'upcoming' = 'all';
  todayCount = 0;
  upcomingCount = 0;

  get filteredPatients(): PatientEntry[] {
    const q = this.searchQuery.toLowerCase().trim();
    let list = this.patients;
    if (this.activeFilter === 'today') list = list.filter((p) => p.source === 'today');
    else if (this.activeFilter === 'upcoming') list = list.filter((p) => p.source === 'upcoming');
    if (q) list = list.filter((p) => p.patientName.toLowerCase().includes(q));
    return list;
  }

  ngOnInit(): void {
    this.loadPatients();
  }

  private loadPatients(): void {
    this.loading = true;
    forkJoin({
      today: this.bookingService.getDoctorTodaySummary().pipe(catchError(() => of(null))),
      upcoming: this.bookingService.getDoctorUpcoming().pipe(catchError(() => of(null)))
    }).pipe(
      finalize(() => (this.loading = false)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(({ today, upcoming }) => {
      const map = new Map<string, PatientEntry>();

      if (today?.items) {
        for (const b of today.items) {
          const name = b.patientName || 'Patient';
          if (!map.has(b.patientId)) {
            map.set(b.patientId, {
              id: b.patientId,
              patientName: name,
              latestDate: b.appointmentDate,
              latestTime: b.slotStartTime || '',
              services: b.serviceNames?.join(', ') || b.serviceName || 'Service',
              status: b.status,
              queueNumber: b.queueNumber,
              source: 'today',
              latestBookingId: b.id
            });
          }
        }
      }

      if (upcoming && upcoming.length > 0) {
        for (const b of upcoming) {
          const name = b.patientName || 'Patient';
          if (!map.has(b.patientId)) {
            map.set(b.patientId, {
              id: b.patientId,
              patientName: name,
              latestDate: b.appointmentDate,
              latestTime: b.slotStartTime || '',
              services: b.serviceNames?.join(', ') || b.serviceName || 'Service',
              status: b.status,
              queueNumber: b.queueNumber,
              source: 'upcoming',
              latestBookingId: b.id
            });
          }
        }
      }

      const entries = Array.from(map.values());
      this.todayCount = entries.filter((e) => e.source === 'today').length;
      this.upcomingCount = entries.filter((e) => e.source === 'upcoming').length;
      this.patients = entries.sort((a, b) => a.patientName.localeCompare(b.patientName));
    });
  }

  openDetail(id: string): void {
    if (!id) return;
    this.router.navigate(['/doctor/appointments', id]);
  }
}
