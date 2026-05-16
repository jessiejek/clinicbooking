import {
  AvailabilityStatus,
  Doctor,
  DoctorBlockedDate,
  DoctorDayStatus,
  DoctorSchedule
} from '../../core/models';

export interface DoctorDayStatusMap {
  [doctorId: string]: DoctorDayStatus;
}

export interface DoctorsState {
  doctors: Doctor[];
  schedules: DoctorSchedule[];
  blockedDates: DoctorBlockedDate[];
  dayStatuses: DoctorDayStatusMap;
  isLoading: boolean;
  error: string | null;
}

export const initialDoctorsState: DoctorsState = {
  doctors: [],
  schedules: [],
  blockedDates: [],
  dayStatuses: {},
  isLoading: false,
  error: null
};

export type DoctorDayAvailability = AvailabilityStatus;
