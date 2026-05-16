import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, switchMap } from 'rxjs';
import { timer } from 'rxjs';
import { MockDataService } from '../../core/services/mock-data.service';
import {
  addPatient,
  addPatientSuccess,
  loadPatients,
  loadPatientsSuccess,
  updatePatient,
  updatePatientSuccess
} from './patients.actions';

const toPatientCode = (count: number): string =>
  `PT-${new Date().getFullYear()}-${String(count).padStart(5, '0')}`;

@Injectable()
export class PatientsEffects {
  private readonly actions$ = inject(Actions);
  private readonly mockData = inject(MockDataService);

  loadPatients$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadPatients),
      switchMap(() =>
        timer(400).pipe(
          map(() => loadPatientsSuccess({ patients: this.mockData.getPatients() }))
        )
      )
    )
  );

  addPatient$ = createEffect(() =>
    this.actions$.pipe(
      ofType(addPatient),
      switchMap(({ patient }) =>
        timer(300).pipe(
          map(() =>
            addPatientSuccess({
              patient: {
                ...patient,
                id: `pat-${Date.now()}`,
                patientCode: toPatientCode(this.mockData.getPatients().length + 1)
              }
            })
          )
        )
      )
    )
  );

  updatePatient$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updatePatient),
      switchMap(({ patient }) =>
        timer(300).pipe(map(() => updatePatientSuccess({ patient })))
      )
    )
  );
}
