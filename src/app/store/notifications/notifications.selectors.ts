import { createFeatureSelector, createSelector } from '@ngrx/store';
import { Notification } from '../../core/models';
import { selectCurrentUser } from '../auth/auth.selectors';
import { NotificationsState } from './notifications.state';

export const selectNotificationsState =
  createFeatureSelector<NotificationsState>('notifications');

export const selectNotificationsLoading = createSelector(
  selectNotificationsState,
  (state) => state.isLoading
);

export const selectAllNotifications = createSelector(
  selectNotificationsState,
  (state) => state.notifications
);

export const selectCurrentUserNotifications = createSelector(
  selectAllNotifications,
  selectCurrentUser,
  (notifications, currentUser) =>
    currentUser ? notifications.filter((notification) => notification.userId === currentUser.id) : []
);

export const selectUnreadNotifications = createSelector(
  selectCurrentUserNotifications,
  (notifications: Notification[]) => notifications.filter((notification) => !notification.isRead)
);

export const selectUnreadCount = createSelector(
  selectUnreadNotifications,
  (notifications) => notifications.length
);
