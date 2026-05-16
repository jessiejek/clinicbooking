import { createReducer, on } from '@ngrx/store';
import { AvailabilityStatus, DoctorDayStatus } from '../../core/models';
import { initialDoctorsState } from './doctors.state';
import {
  addBlockedDate,
  addDoctorSuccess,
  loadDoctors,
  loadDoctorsFailure,
  loadDoctorsSuccess,
  loadSchedulesSuccess,
  removeBlockedDate,
  setDoctorDayStatus,
  setDoctorStatus,
  updateDoctorSuccess
} from './doctors.actions';

const toLocalIsoDate = (): string => {
  const date = new Date();
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
};

const upsertDoctorDayStatus = (
  stateDayStatuses: Record<string, DoctorDayStatus>,
  doctorId: string,
  status: AvailabilityStatus,
  runningLateMinutes?: number
): Record<string, DoctorDayStatus> => ({
  ...stateDayStatuses,
  [doctorId]: {
    id: stateDayStatuses[doctorId]?.id ?? `day-${doctorId}`,
    doctorId,
    date: toLocalIsoDate(),
    status,
    runningLateMinutes
  }
});

export const doctorsReducer = createReducer(
  initialDoctorsState,
  on(loadDoctors, (state) => ({ ...state, isLoading: true, error: null })),
  on(loadDoctorsSuccess, (state, { doctors }) => ({
    ...state,
    doctors,
    isLoading: false,
    error: null
  })),
  on(loadDoctorsFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),
  on(loadSchedulesSuccess, (state, { schedules }) => ({
    ...state,
    schedules
  })),
  on(addDoctorSuccess, (state, { doctor }) => ({
    ...state,
    doctors: [...state.doctors.filter((item) => item.id !== doctor.id), doctor]
  })),
  on(updateDoctorSuccess, (state, { doctor }) => ({
    ...state,
    doctors: state.doctors.map((item) => (item.id === doctor.id ? doctor : item))
  })),
  on(setDoctorStatus, (state, { doctorId, status }) => ({
    ...state,
    doctors: state.doctors.map((doctor) => (doctor.id === doctorId ? { ...doctor, status } : doctor))
  })),
  on(setDoctorDayStatus, (state, { doctorId, status, runningLateMinutes }) => ({
    ...state,
    dayStatuses: upsertDoctorDayStatus(state.dayStatuses, doctorId, status, runningLateMinutes)
  })),
  on(addBlockedDate, (state, { blockedDate }) => ({
    ...state,
    blockedDates: [...state.blockedDates.filter((item) => item.id !== blockedDate.id), blockedDate]
  })),
  on(removeBlockedDate, (state, { id }) => ({
    ...state,
    blockedDates: state.blockedDates.filter((blockedDate) => blockedDate.id !== id)
  }))
);
