export interface PatientSummary {
  id: string;
  patientCode: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  fullName: string;
  dateOfBirth: string;
  sex: string;
  contactNumber?: string;
  email?: string;
  isGuest: boolean;
}

export interface PatientDetail {
  id: string;
  patientCode: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  sex: string;
  civilStatus?: string;
  address?: string;
  city?: string;
  zipCode?: string;
  contactNumber?: string;
  email?: string;
  emergencyContactName?: string;
  emergencyContactNumber?: string;
  emergencyContactRelationship?: string;
  bloodType?: string;
  philHealthNumber?: string;
  hmoProvider?: string;
  hmoCardNumber?: string;
  userId?: string;
  isEmailVerified?: boolean;
  isGuest: boolean;
  consentedAt?: string;
  consentVersion?: string;
}

export interface CreatePatientRequest {
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  sex: string;
  civilStatus?: string;
  address?: string;
  city?: string;
  zipCode?: string;
  contactNumber?: string;
  email?: string;
  emergencyContactName?: string;
  emergencyContactNumber?: string;
  emergencyContactRelationship?: string;
  bloodType?: string;
  philHealthNumber?: string;
  hmoProvider?: string;
  hmoCardNumber?: string;
}

export type UpdatePatientRequest = Partial<CreatePatientRequest>;

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type Patient = PatientDetail;
