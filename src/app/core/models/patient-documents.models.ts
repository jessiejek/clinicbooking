export interface PatientMedicalRecord {
  id: string;
  bookingId: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  appointmentDate: string;
  diagnosis?: string;
  soapNotes?: string;
  doctorNotes?: string;
  followUpInstructions?: string;
  followUpDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PatientPrescriptionItem {
  id: string;
  medicineName: string;
  genericName?: string;
  dosageForm?: string;
  strength?: string;
  sig?: string;
  quantity: number;
  frequency?: string;
  duration?: string;
  instructions?: string;
  isControlledSubstance?: boolean;
  route?: string;
  routeDescription?: string;
  unitOfMeasure?: string;
  unitOfMeasureDescription?: string;
  brandName?: string;
  frequencyCode?: string;
}

export interface PatientPrescription {
  id: string;
  bookingId: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  appointmentDate: string;
  medicineName?: string;
  genericName?: string;
  strength?: string;
  unit?: string;
  route?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
  createdAt: string;
  items: PatientPrescriptionItem[];
}

export interface PatientFollowUp {
  id: string;
  bookingId: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  appointmentDate: string;
  followUpDate?: string;
  followUpInstructions?: string;
  notes?: string;
  createdAt: string;
}
