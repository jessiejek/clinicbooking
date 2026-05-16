import { createAction, props } from '@ngrx/store';
import { Notification } from '../../core/models';

export const loadNotifications = createAction('[Notifications] Load Notifications');

export const loadNotificationsSuccess = createAction(
  '[Notifications] Load Notifications Success',
  props<{ notifications: Notification[] }>()
);

export const markNotificationRead = createAction(
  '[Notifications] Mark Notification Read',
  props<{ id: string }>()
);

export const markAllNotificationsRead = createAction(
  '[Notifications] Mark All Notifications Read',
  props<{ userId?: string }>()
);
