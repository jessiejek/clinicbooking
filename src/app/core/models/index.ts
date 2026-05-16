// ─── ENUMS (strict string unions) ──────────────────────────────
export type Role = 'Admin' | 'Staff' | 'Doctor' | 'Patient';
export type DoctorStatus = 'Active' | 'Inactive' | 'OnLeave';
export type BookingStatus =
  | 'Pending'
  | 'ProofSubmitted'
  | 'Confirmed'
  | 'OnHold'
  | 'Cancelled'
  | 'Completed'
  | 'Expired'
  | 'NoShow'
  | 'Rescheduled';
export type PaymentStatus = 'Unpaid' | 'Paid' | 'Waived' | 'Refunded';
export type PaymentMode = 'Online' | 'PayAtClinic';
export type PaymentMethod = 'GCash' | 'Maya' | 'BankTransfer' | 'PayAtClinic';
export type ServiceCategory = 'Consultation' | 'Procedure' | 'Laboratory' | 'Diagnostic';
export type ProofType = 'ReferenceNumber' | 'Screenshot';
export type PrescriptionStatus = 'Active' | 'Filled' | 'Expired' | 'Cancelled';
export type DiagnosisType = 'Primary' | 'Secondary' | 'Comorbidity';
export type AllergenType = 'Drug' | 'Food' | 'Environmental' | 'Other';
export type AllergySeverity = 'Mild' | 'Moderate' | 'Severe';
export type AttachmentType =
  | 'CBC'
  | 'Urinalysis'
  | 'XRay'
  | 'ECG'
  | 'Ultrasound'
  | 'ReferralLetter'
  | 'MedCert'
  | 'VisitSummary'
  | 'PaymentReceipt'
  | 'Other';
export type DayOfWeek =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';
export type AvailabilityStatus = 'Available' | 'RunningLate' | 'UnavailableToday';

// ─── INTERFACES ─────────────────────────────────────────
export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  isFirstLogin: boolean;
}

export interface Doctor {
  id: string;
  userId: string;
  fullName: string;
  specialization: string;
  bio?: string;
  profilePhotoUrl?: string;
  licenseNumber?: string;
  ptrNumber?: string;
  s2Number?: string;
  consultationFee: number;
  slotDurationMinutes: number;
  slotCapacity: number;
  dailyPatientLimit: number | null;
  status: DoctorStatus;
  averageRating?: number;
  reviewCount?: number;
}

export interface DoctorSchedule {
  id: string;
  doctorId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
}

export interface DoctorBlockedDate {
  id: string;
  doctorId: string;
  blockedDate: string;
  reason?: string;
}

export interface DoctorDayStatus {
  id: string;
  doctorId: string;
  date: string;
  status: AvailabilityStatus;
  runningLateMinutes?: number;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  estimatedDurationMinutes: number;
  price: number;
  category: ServiceCategory;
  doctorIds: string[];
}

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

export interface Booking {
  id: string;
  patientId: string;
  doctorId: string;
  serviceId: string;
  appointmentDate: string;
  slotStartTime: string;
  slotEndTime: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentMode: PaymentMode;
  queueNumber: number | null;
  totalFee: number;
  consultationFeeSnapshot: number;
  serviceFeeSnapshot: number;
  isWalkIn: boolean;
  proofType?: ProofType;
  proofValue?: string;
  proofSubmittedAt?: string;
  cancellationReason?: string;
  notes?: string;
  rescheduledFromBookingId?: string;
  receiptUrl?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  proofImageUrl?: string;
  status: PaymentStatus;
  orNumber?: string;
  verifiedByUserId?: string;
  verifiedAt?: string;
  waivedByUserId?: string;
  waivedAt?: string;
  waivedReason?: string;
  refundedByUserId?: string;
  refundedAt?: string;
  refundReason?: string;
}

export interface Consultation {
  id: string;
  patientId: string;
  doctorId: string;
  bookingId?: string;
  consultationDate: string;
  consultationTime: string;
  chiefComplaint: string;
  historyOfPresentIllness?: string;
  peGeneralFindings?: string;
  assessment?: string;
  plan?: string;
  followUpDate?: string;
  isLocked: boolean;
  visitSummaryUrl?: string;
}

export interface VitalSigns {
  id: string;
  consultationId: string;
  patientId: string;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  respiratoryRate?: number;
  temperature?: number;
  oxygenSaturation?: number;
  weight?: number;
  height?: number;
  bmi?: number;
  createdAt: string;
}

export interface Diagnosis {
  id: string;
  consultationId: string;
  patientId: string;
  icd10Code: string;
  icd10Description: string;
  type: DiagnosisType;
}

export interface Prescription {
  id: string;
  consultationId?: string;
  patientId: string;
  doctorId: string;
  prescriptionDate: string;
  status: PrescriptionStatus;
  notes?: string;
  items: PrescriptionItem[];
}

export interface PrescriptionItem {
  id: string;
  prescriptionId: string;
  genericName: string;
  brandName?: string;
  dosageForm: string;
  strength: string;
  quantity: number;
  sig: string;
  isControlledSubstance: boolean;
}

export interface Allergy {
  id: string;
  patientId: string;
  allergenName: string;
  allergenType: AllergenType;
  severity: AllergySeverity;
  reaction?: string;
}

export interface PatientAttachment {
  id: string;
  patientId: string;
  consultationId?: string;
  attachmentType: AttachmentType;
  dateTaken: string;
  remarks?: string;
  fileUrl: string;
  fileName: string;
  interpretationNotes?: string;
}

export interface VaccinationRecord {
  id: string;
  patientId: string;
  vaccineName: string;
  brandName?: string;
  doseNumber?: number;
  lotNumber?: string;
  dateAdministered: string;
  administeredByUserId: string;
  nextDoseDate?: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Review {
  id: string;
  bookingId: string;
  doctorId: string;
  patientId: string;
  rating: number;
  comment?: string;
  patientName: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  navigateTo?: string;
}

export interface ClinicSettings {
  id: string;
  clinicName: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  address?: string;
  phone?: string;
  email?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  operatingHours: OperatingHours;
  cancellationDeadlineHours: number;
  patientPortalEnabled: boolean;
  vaccinationReminderEnabled: boolean;
  followUpReminderEnabled: boolean;
  isPayAtClinicMode: boolean;
  payAtClinicNoShowWindowMinutes: number;
  privacyPolicyText?: string;
  consentVersion: string;
}

export interface OperatingHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export interface PaymentSettings {
  gcashQrImageUrl?: string;
  gcashAccountName?: string;
  gcashNumber?: string;
  mayaQrImageUrl?: string;
  mayaAccountName?: string;
  mayaNumber?: string;
  bankName?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
}

export interface TimeSlot {
  time: string;
  endTime: string;
  status: 'available' | 'full' | 'pending' | 'selected' | 'disabled';
}

export interface NavItem {
  label: string;
  route: string;
  icon: string;
  badgeCount?: number;
  section?: string;
}

export interface AuditLog {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  oldValues?: string;
  newValues?: string;
  performedByUserId?: string;
  performedByName: string;
  performedByRole: string;
  performedAt: string;
  ipAddress?: string;
}

export interface AdminDashboardStats {
  todayAppointments: number;
  monthAppointments: number;
  revenueToday: number;
  pendingVerifications: number;
  onHoldBookings: number;
  unpaidCompleted: number;
  noShowsToday: number;
  upcomingFollowUps: number;
}
