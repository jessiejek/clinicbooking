import { createAction, props } from '@ngrx/store';
import {
  AvailabilityStatus,
  Doctor,
  DoctorBlockedDate,
  DoctorSchedule,
  DoctorStatus
} from '../../core/models';

export const loadDoctors = createAction('[Doctors] Load Doctors');

export const loadDoctorsSuccess = createAction(
  '[Doctors] Load Doctors Success',
  props<{ doctors: Doctor[] }>()
);

export const loadDoctorsFailure = createAction(
  '[Doctors] Load Doctors Failure',
  props<{ error: string }>()
);

export const addDoctor = createAction(
  '[Doctors] Add Doctor',
  props<{ doctor: Omit<Doctor, 'id'> }>()
);

export const addDoctorSuccess = createAction(
  '[Doctors] Add Doctor Success',
  props<{ doctor: Doctor }>()
);

export const updateDoctor = createAction('[Doctors] Update Doctor', props<{ doctor: Doctor }>());

export const updateDoctorSuccess = createAction(
  '[Doctors] Update Doctor Success',
  props<{ doctor: Doctor }>()
);

export const setDoctorStatus = createAction(
  '[Doctors] Set Doctor Status',
  props<{ doctorId: string; status: DoctorStatus }>()
);

export const setDoctorDayStatus = createAction(
  '[Doctors] Set Doctor Day Status',
  props<{ doctorId: string; status: AvailabilityStatus; runningLateMinutes?: number }>()
);

export const loadSchedules = createAction('[Doctors] Load Schedules');

export const loadSchedulesSuccess = createAction(
  '[Doctors] Load Schedules Success',
  props<{ schedules: DoctorSchedule[] }>()
);

export const addBlockedDate = createAction(
  '[Doctors] Add Blocked Date',
  props<{ blockedDate: DoctorBlockedDate }>()
);

export const removeBlockedDate = createAction(
  '[Doctors] Remove Blocked Date',
  props<{ id: string }>()
);
