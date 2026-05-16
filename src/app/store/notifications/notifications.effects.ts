import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, switchMap, timer } from 'rxjs';
import { MockDataService } from '../../core/services/mock-data.service';
import { loadNotifications, loadNotificationsSuccess } from './notifications.actions';

@Injectable()
export class NotificationsEffects {
  private readonly actions$ = inject(Actions);
  private readonly mockData = inject(MockDataService);

  loadNotifications$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadNotifications),
      switchMap(() =>
        timer(400).pipe(
          map(() =>
            loadNotificationsSuccess({ notifications: this.mockData.getNotifications() })
          )
        )
      )
    )
  );
}
