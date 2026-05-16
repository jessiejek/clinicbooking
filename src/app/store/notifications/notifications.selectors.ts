import { createFeatureSelector, createSelector } from '@ngrx/store';
import { Notification } from '../../core/models';
import { NotificationsState } from './notifications.state';

export const selectNotificationsState =
  createFeatureSelector<NotificationsState>('notifications');

export const selectAllNotifications = createSelector(
  selectNotificationsState,
  (state) => state.notifications
);

export const selectUnreadNotifications = createSelector(
  selectAllNotifications,
  (notifications: Notification[]) => notifications.filter((notification) => !notification.isRead)
);

export const selectUnreadCount = createSelector(
  selectUnreadNotifications,
  (notifications) => notifications.length
);
