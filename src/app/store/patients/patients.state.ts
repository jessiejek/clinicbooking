import { Patient } from '../../core/models';

export interface PatientsState {
  patients: Patient[];
  isLoading: boolean;
  error: string | null;
}

export const initialPatientsState: PatientsState = {
  patients: [],
  isLoading: false,
  error: null
};
