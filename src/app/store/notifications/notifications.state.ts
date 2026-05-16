import { Notification } from '../../core/models';

export interface NotificationsState {
  notifications: Notification[];
  isLoading: boolean;
}

export const initialNotificationsState: NotificationsState = {
  notifications: [],
  isLoading: false
};
