import { createReducer, on } from '@ngrx/store';
import { initialNotificationsState } from './notifications.state';
import {
  loadNotifications,
  loadNotificationsSuccess,
  markAllNotificationsRead,
  markNotificationRead
} from './notifications.actions';

export const notificationsReducer = createReducer(
  initialNotificationsState,
  on(loadNotifications, (state) => ({ ...state, isLoading: true })),
  on(loadNotificationsSuccess, (state, { notifications }) => ({
    ...state,
    notifications,
    isLoading: false
  })),
  on(markNotificationRead, (state, { id }) => ({
    ...state,
    notifications: state.notifications.map((notification) =>
      notification.id === id ? { ...notification, isRead: true } : notification
    )
  })),
  on(markAllNotificationsRead, (state) => ({
    ...state,
    notifications: state.notifications.map((notification) => ({ ...notification, isRead: true }))
  }))
);
