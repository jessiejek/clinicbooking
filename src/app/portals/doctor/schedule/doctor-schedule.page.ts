import { AsyncPipe, NgIf } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { ToastController } from '@ionic/angular/standalone';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  DoctorBlockedDate,
  DayOfWeek,
  TimeSlot
} from '../../../core/models';
import { MockDataService } from '../../../core/services/mock-data.service';
import { loadBookings } from '../../../store/bookings/bookings.actions';
import { selectCurrentUser } from '../../../store/auth/auth.selectors';
import { selectDoctorByUserId, selectDoctorSchedules } from '../../../store/doctors/doctors.selectors';
import { addBlockedDate, loadDoctors, loadSchedules, removeBlockedDate } from '../../../store/doctors/doctors.actions';
import { loadPatients } from '../../../store/patients/patients.actions';
import { DoctorService } from '../services/doctor.service';
import {
  DoctorScheduleEditorComponent,
  DoctorWeeklyScheduleDraft
} from '../components/doctor-schedule-editor/doctor-schedule-editor.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

const DAY_NAMES: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

@Component({
  standalone: true,
  selector: 'app-doctor-schedule-page',
  imports: [AsyncPipe, NgIf, PageHeaderComponent, DoctorScheduleEditorComponent],
  template: `
    <app-page-header title="Schedule" subtitle="Weekly availability and blocked dates"></app-page-header>

    <ng-container *ngIf="doctorReady">
      <app-doctor-schedule-editor
        [schedules]="draftSchedules"
        [blockedDates]="blockedDates"
        [previewSlots]="previewSlots"
        [previewDate]="previewDate"
        [isSaving]="isSaving"
        (schedulesSaved)="saveSchedules($event)"
        (blockedDateAdded)="addBlockedDate($event.blockedDate, $event.reason)"
        (blockedDateRemoved)="removeBlockedDate($event)"
        (previewDateChanged)="updatePreviewDate($event)"
      ></app-doctor-schedule-editor>
    </ng-container>
  `,
  styleUrl: './doctor-schedule.page.scss'
})
export class DoctorSchedulePage implements OnInit {
  private readonly store = inject(Store);
  private readonly doctorService = inject(DoctorService);
  private readonly mockData = inject(MockDataService);
  private readonly toastController = inject(ToastController);
  private readonly destroyRef = inject(DestroyRef);

  doctorReady = false;
  isSaving = false;
  previewDate = new Date().toISOString().slice(0, 10);
  previewSlots: TimeSlot[] = [];
  draftSchedules: DoctorWeeklyScheduleDraft[] = [];
  blockedDates: DoctorBlockedDate[] = [];
  private doctorId = '';

  ngOnInit(): void {
    this.store.dispatch(loadBookings());
    this.store.dispatch(loadDoctors());
    this.store.dispatch(loadSchedules());
    this.store.dispatch(loadPatients());

    this.store
      .select(selectCurrentUser)
      .pipe(
        switchMap((user) => (user ? this.store.select(selectDoctorByUserId(user.id)) : of(undefined))),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((doctor) => {
        if (!doctor) {
          this.doctorReady = false;
          return;
        }

        this.doctorReady = true;
        this.doctorId = doctor.id;

        this.store
          .select(selectDoctorSchedules(doctor.id))
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((schedules) => {
            this.draftSchedules = this.buildDraftSchedules(schedules);
            this.refreshPreview();
          });

        this.doctorService
          .getDoctorBlockedDates(doctor.id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((blockedDates) => {
            this.blockedDates = blockedDates;
            this.previewSlots = this.generatePreviewSlots(this.previewDate);
            blockedDates.forEach((blockedDate) =>
              this.store.dispatch(
                addBlockedDate({
                  blockedDate
                })
              )
            );
          });
      });
  }

  saveSchedules(drafts: DoctorWeeklyScheduleDraft[]): void {
    this.draftSchedules = drafts.map((draft) => ({ ...draft }));
    this.refreshPreview();
    void this.presentToast('Schedule saved locally.');
  }

  addBlockedDate(blockedDate: string, reason: string): void {
    if (!this.doctorId) {
      return;
    }
    const record: DoctorBlockedDate = {
      id: `blocked-${this.doctorId}-${Date.now()}`,
      doctorId: this.doctorId,
      blockedDate,
      reason
    };
    this.blockedDates = [...this.blockedDates.filter((item) => item.blockedDate !== blockedDate), record];
    this.store.dispatch(addBlockedDate({ blockedDate: record }));
    this.refreshPreview();
    void this.presentToast('Blocked date added.');
  }

  removeBlockedDate(id: string): void {
    this.blockedDates = this.blockedDates.filter((item) => item.id !== id);
    this.store.dispatch(removeBlockedDate({ id }));
    this.refreshPreview();
    void this.presentToast('Blocked date removed.');
  }

  updatePreviewDate(date: string): void {
    this.previewDate = date;
    this.refreshPreview();
  }

  private buildDraftSchedules(schedules: { dayOfWeek: DayOfWeek; startTime: string; endTime: string }[]): DoctorWeeklyScheduleDraft[] {
    const doctor = this.mockData.getDoctorById(this.doctorId);
    return DAY_NAMES.map((dayOfWeek) => {
      const schedule = schedules.find((item) => item.dayOfWeek === dayOfWeek);
      return {
        dayOfWeek,
        startTime: schedule?.startTime ?? '08:00',
        endTime: schedule?.endTime ?? '17:00',
        isActive: !!schedule,
        slotDurationMinutes: doctor?.slotDurationMinutes ?? 30,
        slotCapacity: doctor?.slotCapacity ?? 1
      };
    });
  }

  private refreshPreview(): void {
    this.previewSlots = this.generatePreviewSlots(this.previewDate);
  }

  private generatePreviewSlots(date: string): TimeSlot[] {
    if (!this.doctorId || !date) {
      return [];
    }

    const previewDate = new Date(`${date}T00:00:00`);
    if (Number.isNaN(previewDate.getTime())) {
      return [];
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (previewDate < today) {
      return [];
    }

    if (this.blockedDates.some((blockedDate) => blockedDate.blockedDate === date)) {
      return [];
    }

    const dayName = DAY_NAMES[previewDate.getDay()];
    const schedule = this.draftSchedules.find((item) => item.dayOfWeek === dayName && item.isActive);
    if (!schedule) {
      return [];
    }

    const startMinutes = this.minutesFromTime(schedule.startTime);
    const endMinutes = this.minutesFromTime(schedule.endTime);
    const duration = Math.max(5, schedule.slotDurationMinutes);
    const slots: TimeSlot[] = [];

    for (let current = startMinutes; current + duration <= endMinutes; current += duration) {
      const time = this.timeFromMinutes(current);
      const endTime = this.timeFromMinutes(current + duration);
      slots.push({
        time,
        endTime,
        status: 'available'
      });
    }

    return slots;
  }

  private minutesFromTime(time: string): number {
    const [hours, minutes] = time.split(':').map((value) => Number(value));
    return hours * 60 + minutes;
  }

  private timeFromMinutes(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  private async presentToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 1800,
      color: 'success',
      position: 'top'
    });
    await toast.present();
  }
}
