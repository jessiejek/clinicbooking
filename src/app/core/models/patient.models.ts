export interface Patient {
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
