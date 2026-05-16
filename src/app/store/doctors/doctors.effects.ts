import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, switchMap } from 'rxjs';
import { timer } from 'rxjs';
import { MockDataService } from '../../core/services/mock-data.service';
import {
  addDoctor,
  addDoctorSuccess,
  loadDoctors,
  loadDoctorsSuccess,
  loadSchedules,
  loadSchedulesSuccess,
  updateDoctor,
  updateDoctorSuccess
} from './doctors.actions';

@Injectable()
export class DoctorsEffects {
  private readonly actions$ = inject(Actions);
  private readonly mockData = inject(MockDataService);

  loadDoctors$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadDoctors),
      switchMap(() =>
        timer(400).pipe(
          map(() => loadDoctorsSuccess({ doctors: this.mockData.getDoctors() }))
        )
      )
    )
  );

  loadSchedules$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadSchedules),
      switchMap(() =>
        timer(200).pipe(
          map(() => loadSchedulesSuccess({ schedules: this.mockData.getDoctorSchedules() }))
        )
      )
    )
  );

  addDoctor$ = createEffect(() =>
    this.actions$.pipe(
      ofType(addDoctor),
      switchMap(({ doctor }) =>
        timer(300).pipe(
          map(() =>
            addDoctorSuccess({
              doctor: {
                ...doctor,
                id: `doc-${Date.now()}`,
                userId: doctor.userId || `user-doctor-${Date.now()}`
              }
            })
          )
        )
      )
    )
  );

  updateDoctor$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateDoctor),
      switchMap(({ doctor }) =>
        timer(300).pipe(map(() => updateDoctorSuccess({ doctor })))
      )
    )
  );
}
