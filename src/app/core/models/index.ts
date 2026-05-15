export enum Role {
  Admin = 'Admin',
  Staff = 'Staff',
  Doctor = 'Doctor',
  Patient = 'Patient'
}

export enum DoctorStatus {
  Active = 'Active',
  Inactive = 'Inactive',
  OnLeave = 'OnLeave'
}

export enum BookingStatus {
  Pending = 'Pending',
  Confirmed = 'Confirmed',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
  Expired = 'Expired',
  OnHold = 'OnHold',
  ProofSubmitted = 'ProofSubmitted',
  Rescheduled = 'Rescheduled',
  NoShow = 'NoShow'
}

export enum PaymentStatus {
  Unpaid = 'Unpaid',
  Paid = 'Paid',
  Waived = 'Waived',
  Refunded = 'Refunded'
}

export enum PaymentMode {
  PayOnline = 'PayOnline',
  PayAtClinic = 'PayAtClinic'
}

export enum PaymentMethod {
  GCash = 'GCash',
  Maya = 'Maya',
  BankTransfer = 'BankTransfer',
  Cash = 'Cash'
}

export enum ServiceCategory {
  Consultation = 'Consultation',
  Procedure = 'Procedure',
  Laboratory = 'Laboratory',
  Diagnostic = 'Diagnostic'
}

export enum ProofType {
  ReferenceNumber = 'ReferenceNumber',
  Screenshot = 'Screenshot'
}

export enum PrescriptionStatus {
  Draft = 'Draft',
  Finalized = 'Finalized',
  Cancelled = 'Cancelled'
}

export type ISODateString = string; // YYYY-MM-DD
export type ISODateTimeString = string; // ISO 8601
export type DayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export interface AuthUser {
  id: string;
  role: Role;
  email: string;
  fullName: string;
  isActive: boolean;
  isFirstLogin: boolean;
}

export interface DoctorScheduleDay {
  day: DayOfWeek;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

export interface DoctorSchedule {
  doctorId: string;
  days: DoctorScheduleDay[];
  slotDurationMinutes: number;
  slotCapacity: number;
  dailyPatientLimit: number | null;
}

export interface DoctorBlockedDate {
  id: string;
  doctorId: string;
  date: ISODateString;
  reason: string;
}

export interface Doctor {
  id: string;
  fullName: string;
  specialization: string;
  bio: string;
  profilePhotoUrl: string | null;
  consultationFee: number;
  licenseNumber: string;
  ptrNumber: string;
  s2Number: string | null;
  status: DoctorStatus;
  schedule: DoctorSchedule;
  serviceIds: string[];
}

export interface Service {
  id: string;
  name: string;
  description: string;
  estimatedDurationMinutes: number;
  price: number;
  category: ServiceCategory;
  doctorIds: string[];
}

export interface PaymentProof {
  type: ProofType;
  referenceNumber?: string;
  screenshotUrl?: string;
  submittedAt: ISODateTimeString;
}

export interface Payment {
  id: string;
  bookingId: string;
  mode: PaymentMode;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  proof: PaymentProof | null;
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}

export interface Booking {
  id: string;
  code: string;
  patientId: string;
  doctorId: string;
  serviceId: string;
  date: ISODateString;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentMode: PaymentMode;
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
  notes?: string;
}

export type Sex = 'Male' | 'Female';
export type CivilStatus = 'Single' | 'Married' | 'Separated' | 'Widowed';

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface Patient {
  id: string;
  code: string; // PT-YYYY-00000
  fullName: string;
  email: string | null;
  phone: string;
  dateOfBirth: ISODateString;
  sex: Sex;
  civilStatus: CivilStatus;
  address: string;
  bloodType: string | null;
  philHealthNumber: string | null;
  hmoProvider: string | null;
  emergencyContact: EmergencyContact | null;
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}

export interface VitalSigns {
  heightCm: number | null;
  weightKg: number | null;
  temperatureC: number | null;
  bloodPressure: string | null;
  heartRateBpm: number | null;
  respiratoryRate: number | null;
  oxygenSaturation: number | null;
}

export interface Diagnosis {
  id: string;
  code: string; // ICD-10 or internal
  description: string;
}

export interface Allergy {
  id: string;
  patientId: string;
  name: string;
  reaction: string | null;
  severity: 'Mild' | 'Moderate' | 'Severe';
}

export interface Consultation {
  id: string;
  bookingId: string | null;
  patientId: string;
  doctorId: string;
  consultedAt: ISODateTimeString;
  chiefComplaint: string;
  notes: string;
  vitalSigns: VitalSigns | null;
  diagnoses: Diagnosis[];
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}

export interface PrescriptionItem {
  id: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string | null;
}

export interface Prescription {
  id: string;
  consultationId: string;
  patientId: string;
  doctorId: string;
  status: PrescriptionStatus;
  items: PrescriptionItem[];
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  imageUrl: string | null;
  publishedAt: ISODateTimeString;
}

export interface ClinicOperatingHours {
  label: string; // e.g. "Mon-Fri 8AM-6PM"
  details: string;
}

export interface ClinicSettings {
  clinicName: string;
  logoUrl: string | null;
  primaryColor: string;
  operatingHours: ClinicOperatingHours[];
  consentVersion: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  createdAt: ISODateTimeString;
  readAt: ISODateTimeString | null;
}

