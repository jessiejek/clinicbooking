import { createFeatureSelector, createSelector } from '@ngrx/store';
import { Doctor, DoctorDayStatus, DoctorSchedule } from '../../core/models';
import { DoctorsState } from './doctors.state';

export const selectDoctorsState = createFeatureSelector<DoctorsState>('doctors');

export const selectAllDoctors = createSelector(selectDoctorsState, (state) => state.doctors);

export const selectDoctorById = (id: string) =>
  createSelector(selectAllDoctors, (doctors: Doctor[]) =>
    doctors.find((doctor) => doctor.id === id)
  );

export const selectDoctorByUserId = (userId: string) =>
  createSelector(selectAllDoctors, (doctors: Doctor[]) =>
    doctors.find((doctor) => doctor.userId === userId)
  );

export const selectDoctorSchedules = (doctorId: string) =>
  createSelector(selectDoctorsState, (state) =>
    state.schedules.filter((schedule: DoctorSchedule) => schedule.doctorId === doctorId)
  );

export const selectDoctorDayStatus = (doctorId: string) =>
  createSelector(selectDoctorsState, (state): DoctorDayStatus | undefined => state.dayStatuses[doctorId]);

export const selectDoctorsLoading = createSelector(selectDoctorsState, (state) => state.isLoading);
