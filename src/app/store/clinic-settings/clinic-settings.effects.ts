import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, switchMap } from 'rxjs';
import { AdminSettingsService } from '../../portals/admin/services/admin-settings.service';
import {
  bumpConsentVersion,
  bumpConsentVersionSuccess,
  loadClinicSettings,
  loadClinicSettingsSuccess,
  updateClinicSettings,
  updateClinicSettingsSuccess
} from './clinic-settings.actions';

@Injectable()
export class ClinicSettingsEffects {
  private readonly actions$ = inject(Actions);
  private readonly adminSettingsService = inject(AdminSettingsService);

  loadClinicSettings$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadClinicSettings),
      switchMap(() => this.adminSettingsService.getSettings().pipe(map((settings) => loadClinicSettingsSuccess({ settings }))))
    )
  );

  updateClinicSettings$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateClinicSettings),
      switchMap(({ settings }) =>
        this.adminSettingsService
          .updateSettings(settings)
          .pipe(map((updated) => updateClinicSettingsSuccess({ settings: updated })))
      )
    )
  );

  bumpConsentVersion$ = createEffect(() =>
    this.actions$.pipe(
      ofType(bumpConsentVersion),
      switchMap(() =>
        this.adminSettingsService
          .bumpConsentVersion()
          .pipe(map((settings) => bumpConsentVersionSuccess({ settings })))
      )
    )
  );
}
