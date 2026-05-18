import { Injectable } from '@angular/core';
import {
  AdminDashboardStats,
  Announcement,
  Booking,
  BookingStatus,
  Allergy,
  ClinicSettings,
  AuditLog,
  DayOfWeek,
  Consultation,
  DoctorBlockedDate,
  Doctor,
  DoctorSchedule,
  DoctorStatus,
  FollowUp,
  LabRequest,
  LabResult,
  Patient,
  Notification,
  PaymentMode,
  PaymentSettings,
  PaymentStatus,
  MockDrug,
  Prescription,
  PrescriptionItem,
  ProofType,
  Review,
  Role,
  Service,
  VaccinationRecord,
  TimeSlot
} from '../models';

interface SeedUser {
  id: string;
  fullName: string;
  email: string;
  password: string;
  role: Role;
  isFirstLogin: boolean;
}

@Injectable({ providedIn: 'root' })
export class MockDataService {
  private readonly today = new Date();

  private _clinicSettings: ClinicSettings = {
    id: 'settings-1',
    clinicName: 'Dr. Grace E. Gavino Medical Clinic',
    logoUrl: undefined,
    primaryColor: '#5D3E8E',
    secondaryColor: '#2563EB',
    address: 'Zone 1, 3 M.L. Quezon National Highway, Buaya, Lapu-Lapu, 6015 Cebu',
    phone: '0928 561 2976',
    email: 'info@gavino.clinic',
    facebookUrl: 'https://facebook.com/gavinoclinic',
    instagramUrl: 'https://instagram.com/gavinoclinic',
    operatingHours: {
      monday: { isOpen: true, openTime: '08:00', closeTime: '18:00' },
      tuesday: { isOpen: true, openTime: '08:00', closeTime: '18:00' },
      wednesday: { isOpen: true, openTime: '08:00', closeTime: '18:00' },
      thursday: { isOpen: true, openTime: '08:00', closeTime: '18:00' },
      friday: { isOpen: true, openTime: '08:00', closeTime: '18:00' },
      saturday: { isOpen: true, openTime: '08:00', closeTime: '12:00' },
      sunday: { isOpen: false, openTime: '00:00', closeTime: '00:00' }
    },
    cancellationDeadlineHours: 24,
    patientPortalEnabled: true,
    vaccinationReminderEnabled: true,
    followUpReminderEnabled: true,
    isPayAtClinicMode: false,
    payAtClinicNoShowWindowMinutes: 60,
    privacyPolicyText:
      'This clinic collects and processes your personal health information in accordance with Republic Act No. 10173 (Data Privacy Act of 2012)...',
    consentVersion: 'v1.0',
    paymentSettings: {
      gcashAccountName: 'Dr. Grace E. Gavino',
      gcashNumber: '09285612976',
      mayaAccountName: 'Dr. Grace E. Gavino',
      mayaNumber: '09285612976',
      bankName: 'BDO Unibank',
      bankAccountName: 'Grace E. Gavino',
      bankAccountNumber: '00123456789'
    }
  };

  private _paymentSettings: PaymentSettings = {
    ...this._clinicSettings.paymentSettings
  };

  private readonly _seedUsers: SeedUser[] = [
    {
      id: 'user-admin-1',
      fullName: 'Dr. Grace E. Gavino',
      email: 'admin@gavino.clinic',
      password: 'Admin@123456',
      role: 'Admin',
      isFirstLogin: false
    },
    {
      id: 'user-admin-2',
      fullName: 'Maria Fernandez',
      email: 'admin2@gavino.clinic',
      password: 'Admin@123456',
      role: 'Admin',
      isFirstLogin: false
    },
    {
      id: 'user-staff-1',
      fullName: 'Ana Gomez',
      email: 'staff@gavino.clinic',
      password: 'Staff@123456',
      role: 'Staff',
      isFirstLogin: false
    },
    {
      id: 'user-doctor-1',
      fullName: 'Dr. Santos',
      email: 'dr.santos@gavino.clinic',
      password: 'Doctor@123456',
      role: 'Doctor',
      isFirstLogin: false
    },
    {
      id: 'user-doctor-2',
      fullName: 'Dr. Jose Reyes',
      email: 'dr.reyes@gavino.clinic',
      password: 'Doctor@123456',
      role: 'Doctor',
      isFirstLogin: true
    },
    {
      id: 'user-doctor-3',
      fullName: 'Dr. Ana Cruz',
      email: 'dr.cruz@gavino.clinic',
      password: 'Doctor@123456',
      role: 'Doctor',
      isFirstLogin: false
    },
    {
      id: 'user-patient-1',
      fullName: 'Juan dela Cruz',
      email: 'patient@gavino.clinic',
      password: 'Patient@123456',
      role: 'Patient',
      isFirstLogin: false
    }
  ];

  private readonly _doctors: Doctor[] = [
    {
      id: 'doc-1',
      userId: 'user-doctor-1',
      fullName: 'Dr. Santos',
      specialization: 'Family Medicine / Adult & Pedia',
      bio: 'Dr. Santos is a dedicated specialist in Family Medicine, providing comprehensive healthcare for both adults and children with over 15 years of clinical experience.',
      consultationFee: 500,
      slotDurationMinutes: 30,
      slotCapacity: 1,
      dailyPatientLimit: 15,
      status: 'Active',
      licenseNumber: 'PRC-12345',
      ptrNumber: 'PTR-54321',
      s2Number: 'S2-11111',
      averageRating: 4.9,
      reviewCount: 42
    },
    {
      id: 'doc-2',
      userId: 'user-doctor-2',
      fullName: 'Dr. Jose Reyes',
      specialization: 'Pediatrics',
      bio: 'Specializing in pediatric care for infants, children, and adolescents...',
      consultationFee: 600,
      slotDurationMinutes: 30,
      slotCapacity: 1,
      dailyPatientLimit: 8,
      status: 'Active',
      licenseNumber: 'PRC-67890',
      ptrNumber: 'PTR-09876',
      s2Number: 'S2-22222',
      averageRating: 4.9,
      reviewCount: 31
    },
    {
      id: 'doc-3',
      userId: 'user-doctor-3',
      fullName: 'Dr. Ana Cruz',
      specialization: 'OB-Gynecology',
      bio: 'Board-certified OB-Gynecologist with expertise in maternal-fetal medicine...',
      consultationFee: 700,
      slotDurationMinutes: 30,
      slotCapacity: 1,
      dailyPatientLimit: 8,
      status: 'Active',
      licenseNumber: 'PRC-11223',
      ptrNumber: 'PTR-33221',
      s2Number: 'S2-33333',
      averageRating: 4.7,
      reviewCount: 18
    },
    {
      id: 'doc-4',
      userId: 'user-doctor-4',
      fullName: 'Dr. Miguel Tan',
      specialization: 'Internal Medicine',
      bio: 'Internist focused on adult primary care, hypertension, diabetes, and preventive health planning.',
      consultationFee: 650,
      slotDurationMinutes: 30,
      slotCapacity: 1,
      dailyPatientLimit: 12,
      status: 'Active',
      licenseNumber: 'PRC-44551',
      ptrNumber: 'PTR-44551',
      s2Number: 'S2-44551',
      averageRating: 4.8,
      reviewCount: 27
    },
    {
      id: 'doc-5',
      userId: 'user-doctor-5',
      fullName: 'Dr. Liza Mercado',
      specialization: 'Dermatology',
      bio: 'Dermatologist providing care for acne, eczema, rashes, skin allergies, and routine skin checks.',
      consultationFee: 750,
      slotDurationMinutes: 30,
      slotCapacity: 1,
      dailyPatientLimit: 10,
      status: 'Active',
      licenseNumber: 'PRC-44552',
      ptrNumber: 'PTR-44552',
      s2Number: 'S2-44552',
      averageRating: 4.6,
      reviewCount: 22
    },
    {
      id: 'doc-6',
      userId: 'user-doctor-6',
      fullName: 'Dr. Carlo Lim',
      specialization: 'Cardiology',
      bio: 'Cardiologist handling blood pressure control, heart risk screening, and follow-up cardiac care.',
      consultationFee: 900,
      slotDurationMinutes: 30,
      slotCapacity: 1,
      dailyPatientLimit: 10,
      status: 'Active',
      licenseNumber: 'PRC-44553',
      ptrNumber: 'PTR-44553',
      s2Number: 'S2-44553',
      averageRating: 4.9,
      reviewCount: 35
    },
    {
      id: 'doc-7',
      userId: 'user-doctor-7',
      fullName: 'Dr. Patricia Uy',
      specialization: 'ENT',
      bio: 'ENT specialist for ear infections, sinus concerns, throat problems, and hearing-related consults.',
      consultationFee: 700,
      slotDurationMinutes: 30,
      slotCapacity: 1,
      dailyPatientLimit: 12,
      status: 'Active',
      licenseNumber: 'PRC-44554',
      ptrNumber: 'PTR-44554',
      s2Number: 'S2-44554',
      averageRating: 4.7,
      reviewCount: 19
    },
    {
      id: 'doc-8',
      userId: 'user-doctor-8',
      fullName: 'Dr. Ramon Villanueva',
      specialization: 'Orthopedics',
      bio: 'Orthopedic doctor for joint pain, sports injuries, back pain, and mobility concerns.',
      consultationFee: 850,
      slotDurationMinutes: 30,
      slotCapacity: 1,
      dailyPatientLimit: 10,
      status: 'Active',
      licenseNumber: 'PRC-44555',
      ptrNumber: 'PTR-44555',
      s2Number: 'S2-44555',
      averageRating: 4.8,
      reviewCount: 24
    },
    {
      id: 'doc-9',
      userId: 'user-doctor-9',
      fullName: 'Dr. Bianca Navarro',
      specialization: 'Endocrinology',
      bio: 'Endocrinologist specializing in diabetes, thyroid disease, and hormone-related conditions.',
      consultationFee: 850,
      slotDurationMinutes: 30,
      slotCapacity: 1,
      dailyPatientLimit: 10,
      status: 'Active',
      licenseNumber: 'PRC-44556',
      ptrNumber: 'PTR-44556',
      s2Number: 'S2-44556',
      averageRating: 4.7,
      reviewCount: 21
    },
    {
      id: 'doc-10',
      userId: 'user-doctor-10',
      fullName: 'Dr. Enrico Bautista',
      specialization: 'Pulmonology',
      bio: 'Pulmonologist for asthma, chronic cough, respiratory infections, and lung health follow-ups.',
      consultationFee: 800,
      slotDurationMinutes: 30,
      slotCapacity: 1,
      dailyPatientLimit: 11,
      status: 'Active',
      licenseNumber: 'PRC-44557',
      ptrNumber: 'PTR-44557',
      s2Number: 'S2-44557',
      averageRating: 4.6,
      reviewCount: 16
    },
    {
      id: 'doc-11',
      userId: 'user-doctor-11',
      fullName: 'Dr. Camille Garcia',
      specialization: 'Neurology',
      bio: 'Neurologist managing headaches, dizziness, nerve pain, seizures, and stroke follow-up visits.',
      consultationFee: 950,
      slotDurationMinutes: 30,
      slotCapacity: 1,
      dailyPatientLimit: 9,
      status: 'Active',
      licenseNumber: 'PRC-44558',
      ptrNumber: 'PTR-44558',
      s2Number: 'S2-44558',
      averageRating: 4.9,
      reviewCount: 29
    },
    {
      id: 'doc-12',
      userId: 'user-doctor-12',
      fullName: 'Dr. Sofia Ramos',
      specialization: 'Psychiatry',
      bio: 'Psychiatrist offering consults for anxiety, depression, sleep concerns, and medication management.',
      consultationFee: 900,
      slotDurationMinutes: 45,
      slotCapacity: 1,
      dailyPatientLimit: 8,
      status: 'Active',
      licenseNumber: 'PRC-44559',
      ptrNumber: 'PTR-44559',
      s2Number: 'S2-44559',
      averageRating: 4.8,
      reviewCount: 20
    },
    {
      id: 'doc-13',
      userId: 'user-doctor-13',
      fullName: 'Dr. Victor Chua',
      specialization: 'Ophthalmology',
      bio: 'Ophthalmologist for eye exams, blurry vision, dry eyes, infections, and diabetic eye screening.',
      consultationFee: 800,
      slotDurationMinutes: 30,
      slotCapacity: 1,
      dailyPatientLimit: 11,
      status: 'Active',
      licenseNumber: 'PRC-44560',
      ptrNumber: 'PTR-44560',
      s2Number: 'S2-44560',
      averageRating: 4.7,
      reviewCount: 17
    }
  ];

  private readonly _doctorSchedules: DoctorSchedule[] = [
    ['doc-1', 'Monday', '08:00', '17:00'],
    ['doc-1', 'Tuesday', '08:00', '17:00'],
    ['doc-1', 'Wednesday', '08:00', '17:00'],
    ['doc-1', 'Thursday', '08:00', '17:00'],
    ['doc-1', 'Friday', '08:00', '17:00'],
    ['doc-2', 'Monday', '09:00', '16:00'],
    ['doc-2', 'Wednesday', '09:00', '16:00'],
    ['doc-2', 'Friday', '09:00', '16:00'],
    ['doc-3', 'Tuesday', '08:00', '15:00'],
    ['doc-3', 'Thursday', '08:00', '15:00'],
    ['doc-4', 'Monday', '08:30', '16:30'],
    ['doc-4', 'Thursday', '08:30', '16:30'],
    ['doc-5', 'Tuesday', '10:00', '17:00'],
    ['doc-5', 'Friday', '10:00', '17:00'],
    ['doc-6', 'Monday', '09:00', '15:00'],
    ['doc-6', 'Wednesday', '09:00', '15:00'],
    ['doc-7', 'Tuesday', '08:00', '14:00'],
    ['doc-7', 'Thursday', '08:00', '14:00'],
    ['doc-8', 'Wednesday', '10:00', '17:00'],
    ['doc-8', 'Saturday', '09:00', '12:00'],
    ['doc-9', 'Monday', '11:00', '17:00'],
    ['doc-9', 'Friday', '11:00', '17:00'],
    ['doc-10', 'Tuesday', '09:00', '16:00'],
    ['doc-10', 'Thursday', '09:00', '16:00'],
    ['doc-11', 'Wednesday', '08:00', '15:00'],
    ['doc-11', 'Friday', '08:00', '15:00'],
    ['doc-12', 'Monday', '10:00', '16:00'],
    ['doc-12', 'Saturday', '09:00', '13:00'],
    ['doc-13', 'Tuesday', '10:00', '17:00'],
    ['doc-13', 'Thursday', '10:00', '17:00']
  ].map(([doctorId, dayOfWeek, startTime, endTime], index) => ({
    id: `sch-${index + 1}`,
    doctorId: doctorId as string,
    dayOfWeek: dayOfWeek as DayOfWeek,
    startTime,
    endTime
  }));

  private _doctorBlockedDates: DoctorBlockedDate[] = [];

  private readonly _services: Service[] = [
    {
      id: 'svc-1',
      name: 'General Consultation',
      category: 'Consultation',
      price: 0,
      estimatedDurationMinutes: 30,
      doctorIds: ['doc-1', 'doc-4', 'doc-5', 'doc-6', 'doc-7', 'doc-8', 'doc-9', 'doc-10', 'doc-11', 'doc-12', 'doc-13']
    },
    {
      id: 'svc-2',
      name: 'Pediatric Checkup',
      category: 'Consultation',
      price: 0,
      estimatedDurationMinutes: 30,
      doctorIds: ['doc-2']
    },
    {
      id: 'svc-3',
      name: 'Prenatal Checkup',
      category: 'Consultation',
      price: 0,
      estimatedDurationMinutes: 30,
      doctorIds: ['doc-3']
    },
    {
      id: 'svc-4',
      name: 'Annual Physical Exam',
      category: 'Procedure',
      price: 1000,
      estimatedDurationMinutes: 60,
      doctorIds: ['doc-1', 'doc-4', 'doc-6', 'doc-9', 'doc-10']
    },
    {
      id: 'svc-5',
      name: 'Wound Dressing',
      category: 'Procedure',
      price: 200,
      estimatedDurationMinutes: 15,
      doctorIds: ['doc-1', 'doc-2']
    },
    {
      id: 'svc-6',
      name: 'CBC',
      category: 'Laboratory',
      price: 350,
      estimatedDurationMinutes: 15,
      doctorIds: ['doc-1', 'doc-2', 'doc-3', 'doc-4', 'doc-6', 'doc-9', 'doc-10']
    },
    {
      id: 'svc-7',
      name: 'Urinalysis',
      category: 'Laboratory',
      price: 150,
      estimatedDurationMinutes: 15,
      doctorIds: ['doc-1', 'doc-2', 'doc-3', 'doc-4', 'doc-6', 'doc-9', 'doc-10']
    },
    {
      id: 'svc-8',
      name: 'Fasting Blood Sugar',
      category: 'Laboratory',
      price: 200,
      estimatedDurationMinutes: 15,
      doctorIds: ['doc-1', 'doc-3', 'doc-4', 'doc-9']
    },
    {
      id: 'svc-9',
      name: 'Chest X-Ray',
      category: 'Diagnostic',
      price: 500,
      estimatedDurationMinutes: 20,
      doctorIds: ['doc-1', 'doc-10']
    },
    {
      id: 'svc-10',
      name: 'Abdominal Ultrasound',
      category: 'Diagnostic',
      price: 800,
      estimatedDurationMinutes: 30,
      doctorIds: ['doc-1', 'doc-3']
    }
  ];

  private _patients: Patient[] = [
    {
      id: 'pat-1',
      patientCode: 'PT-2025-00001',
      firstName: 'Juan',
      middleName: 'Santos',
      lastName: 'dela Cruz',
      dateOfBirth: '1990-05-15',
      sex: 'Male',
      address: '123 Mango Street, Buaya',
      city: 'Lapu-Lapu City',
      zipCode: '6015',
      contactNumber: '09171234567',
      email: 'patient@gavino.clinic',
      emergencyContactName: 'Maria dela Cruz',
      emergencyContactNumber: '09171230000',
      emergencyContactRelationship: 'Spouse',
      bloodType: 'O+',
      hmoProvider: 'Maxicare',
      hmoCardNumber: 'HMO-2025-0001',
      philHealthNumber: '12-345678901-2',
      consentedAt: '2025-03-01T08:30:00Z',
      consentVersion: 'v0.9',
      isEmailVerified: false,
      isGuest: false,
      userId: 'user-patient-1'
    },
    {
      id: 'pat-2',
      patientCode: 'PT-2025-00002',
      firstName: 'Maria',
      lastName: 'Santos',
      dateOfBirth: '1985-11-22',
      sex: 'Female',
      contactNumber: '09182345678',
      email: 'maria@example.com',
      bloodType: 'A+',
      isGuest: false,
      consentVersion: 'v1.0'
    },
    {
      id: 'pat-3',
      patientCode: 'PT-2025-00003',
      firstName: 'Pedro',
      lastName: 'Reyes',
      dateOfBirth: '2010-03-08',
      sex: 'Male',
      contactNumber: '09193456789',
      email: 'pedro@example.com',
      bloodType: 'B+',
      isGuest: false,
      consentVersion: 'v1.0'
    },
    {
      id: 'pat-4',
      patientCode: 'PT-2025-00004',
      firstName: 'Ana',
      lastName: 'Gomez',
      dateOfBirth: '1995-07-30',
      sex: 'Female',
      contactNumber: '09204567890',
      email: 'ana@example.com',
      bloodType: 'AB+',
      isGuest: false,
      consentVersion: 'v1.0'
    },
    {
      id: 'pat-5',
      patientCode: 'PT-2025-00005',
      firstName: 'Carlos',
      lastName: 'Mendoza',
      dateOfBirth: '1978-12-01',
      sex: 'Male',
      contactNumber: '09215678901',
      email: 'carlos@example.com',
      bloodType: 'O-',
      isGuest: false,
      consentVersion: 'v1.0'
    }
  ];

  private readonly _announcements: Announcement[] = [
    {
      id: 'ann-1',
      title: 'Holiday Schedule Notice',
      body: 'Our clinic will be closed on June 12 (Independence Day). Regular schedule resumes on June 13.',
      isActive: true,
      createdAt: '2025-06-01T09:00:00Z'
    },
    {
      id: 'ann-2',
      title: 'New Pediatric Services Available',
      body: 'We are pleased to announce that Dr. Reyes is now offering adolescent health consultations...',
      isActive: true,
      createdAt: '2025-05-20T10:00:00Z'
    },
    {
      id: 'ann-3',
      title: 'COVID-19 Vaccination Drive',
      body: 'Free COVID-19 booster shots will be available every Saturday morning...',
      isActive: true,
      createdAt: '2025-05-10T08:00:00Z'
    },
    {
      id: 'ann-4',
      title: 'New Online Booking System',
      body: 'You can now book your appointments online through our patient portal...',
      isActive: true,
      createdAt: '2025-04-15T09:00:00Z'
    },
    {
      id: 'ann-5',
      title: 'Clinic Renovation Complete',
      body: 'We have finished our clinic renovation. Enjoy our new, modern facility!',
      isActive: false,
      createdAt: '2025-03-01T09:00:00Z'
    }
  ];

  private readonly _notifications: Notification[] = [
    {
      id: 'n1',
      userId: 'user-admin-1',
      title: 'New Proof Submitted',
      message: 'Juan dela Cruz submitted payment proof for booking BK-003.',
      isRead: false,
      createdAt: new Date(Date.now() - 300000).toISOString(),
      navigateTo: '/admin/bookings/BK-003'
    },
    {
      id: 'n2',
      userId: 'user-admin-1',
      title: 'Booking Confirmed',
      message: 'Dr. Santos confirmed booking BK-001.',
      isRead: false,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      navigateTo: '/admin/bookings/BK-001'
    },
    {
      id: 'n3',
      userId: 'user-admin-1',
      title: 'Walk-in Added',
      message: 'Staff added a walk-in booking for Pedro Reyes.',
      isRead: false,
      createdAt: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: 'n4',
      userId: 'user-admin-1',
      title: 'No Show Recorded',
      message: 'Carlos Mendoza marked as no-show.',
      isRead: true,
      createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'n5',
      userId: 'user-admin-1',
      title: 'Unpaid Completed Visit',
      message: 'Maria Santos has an unpaid completed visit.',
      isRead: true,
      createdAt: new Date(Date.now() - 172800000).toISOString()
    },
    {
      id: 'n6',
      userId: 'user-admin-1',
      title: 'Doctor Schedule Updated',
      message: 'Dr. Reyes schedule was updated for next week.',
      isRead: true,
      createdAt: new Date(Date.now() - 259200000).toISOString()
    },
    {
      id: 'n7',
      userId: 'user-admin-1',
      title: 'Service Created',
      message: 'A new laboratory service is now available.',
      isRead: true,
      createdAt: new Date(Date.now() - 345600000).toISOString()
    },
    {
      id: 'n8',
      userId: 'user-admin-1',
      title: 'Patient Registered',
      message: 'Ana Gomez registered a new patient account.',
      isRead: true,
      createdAt: new Date(Date.now() - 432000000).toISOString()
    },
    {
      id: 'n9',
      userId: 'user-admin-1',
      title: 'Announcement Published',
      message: 'Holiday schedule notice is now active.',
      isRead: true,
      createdAt: new Date(Date.now() - 518400000).toISOString()
    },
    {
      id: 'n10',
      userId: 'user-admin-1',
      title: 'Follow-up Reminder',
      message: 'Three patients are due for follow-up this week.',
      isRead: true,
      createdAt: new Date(Date.now() - 604800000).toISOString()
    }
  ];

  private _reviews: Review[] = [
    {
      id: 'rev-1',
      bookingId: 'bk-1',
      doctorId: 'doc-1',
      patientId: 'pat-2',
      rating: 5,
      comment: 'Very thorough and compassionate.',
      patientName: 'Maria S.',
      createdAt: '2025-04-01T10:00:00Z'
    },
    {
      id: 'rev-2',
      bookingId: 'bk-2',
      doctorId: 'doc-1',
      patientId: 'pat-3',
      rating: 4,
      comment: 'Efficient and knowledgeable.',
      patientName: 'Pedro R.',
      createdAt: '2025-04-05T11:00:00Z'
    },
    {
      id: 'rev-3',
      bookingId: 'bk-3',
      doctorId: 'doc-1',
      patientId: 'pat-4',
      rating: 5,
      comment: 'Best GP in Cebu.',
      patientName: 'Ana G.',
      createdAt: '2025-04-10T12:00:00Z'
    },
    {
      id: 'rev-4',
      bookingId: 'bk-4',
      doctorId: 'doc-2',
      patientId: 'pat-1',
      rating: 5,
      comment: 'My kids love him!',
      patientName: 'Juan C.',
      createdAt: '2025-04-02T09:00:00Z'
    },
    {
      id: 'rev-5',
      bookingId: 'bk-5',
      doctorId: 'doc-2',
      patientId: 'pat-3',
      rating: 5,
      comment: 'Very patient with children.',
      patientName: 'Pedro R.',
      createdAt: '2025-04-06T14:00:00Z'
    },
    {
      id: 'rev-6',
      bookingId: 'bk-6',
      doctorId: 'doc-2',
      patientId: 'pat-5',
      rating: 4,
      comment: 'Professional and caring.',
      patientName: 'Carlos M.',
      createdAt: '2025-04-08T15:00:00Z'
    },
    {
      id: 'rev-7',
      bookingId: 'bk-7',
      doctorId: 'doc-3',
      patientId: 'pat-2',
      rating: 5,
      comment: 'Excellent prenatal care.',
      patientName: 'Maria S.',
      createdAt: '2025-04-03T08:00:00Z'
    },
    {
      id: 'rev-8',
      bookingId: 'bk-8',
      doctorId: 'doc-3',
      patientId: 'pat-1',
      rating: 4,
      comment: 'Very reassuring doctor.',
      patientName: 'Juan C.',
      createdAt: '2025-04-07T13:00:00Z'
    },
    {
      id: 'rev-9',
      bookingId: 'bk-9',
      doctorId: 'doc-3',
      patientId: 'pat-4',
      rating: 5,
      comment: 'Highly recommended OB.',
      patientName: 'Ana G.',
      createdAt: '2025-04-11T16:00:00Z'
    }
  ];

  private _auditLogs: AuditLog[] = [];

  private readonly _unpaidCompletedVisitReportRows: Array<{
    bookingId: string;
    patient: string;
    doctor: string;
    service: string;
    visitDate: string;
    amount: number;
    paymentStatus: string;
  }> = [
    {
      bookingId: 'BK-101',
      patient: 'Juan Dela Cruz',
      doctor: 'Dr. Santos',
      service: 'General Consultation',
      visitDate: new Date(this.today.getTime() - 86400000).toISOString().slice(0, 10),
      amount: 500,
      paymentStatus: 'Unpaid'
    },
    {
      bookingId: 'BK-102',
      patient: 'Maria Santos',
      doctor: 'Dr. Jose Reyes',
      service: 'Pediatric Checkup',
      visitDate: new Date(this.today.getTime() - 172800000).toISOString().slice(0, 10),
      amount: 600,
      paymentStatus: 'Unpaid'
    },
    {
      bookingId: 'BK-103',
      patient: 'Pedro Reyes',
      doctor: 'Dr. Ana Cruz',
      service: 'Prenatal Checkup',
      visitDate: new Date(this.today.getTime() - 259200000).toISOString().slice(0, 10),
      amount: 700,
      paymentStatus: 'Unpaid'
    },
    {
      bookingId: 'BK-104',
      patient: 'Ana Gomez',
      doctor: 'Dr. Santos',
      service: 'Annual Physical Exam',
      visitDate: new Date(this.today.getTime() - 345600000).toISOString().slice(0, 10),
      amount: 1000,
      paymentStatus: 'Unpaid'
    },
    {
      bookingId: 'BK-105',
      patient: 'Carlos Mendoza',
      doctor: 'Dr. Jose Reyes',
      service: 'General Consultation',
      visitDate: new Date(this.today.getTime() - 432000000).toISOString().slice(0, 10),
      amount: 500,
      paymentStatus: 'Unpaid'
    }
  ];

  private readonly _pendingFollowUpReportRows: Array<{
    patient: string;
    doctor: string;
    followUpDate: string;
    reason: string;
    status: string;
  }> = [
    {
      patient: 'Juan Dela Cruz',
      doctor: 'Dr. Santos',
      followUpDate: new Date(this.today.getTime() + 86400000 * 2).toISOString().slice(0, 10),
      reason: 'Review medication response',
      status: 'Pending'
    },
    {
      patient: 'Maria Santos',
      doctor: 'Dr. Jose Reyes',
      followUpDate: new Date(this.today.getTime() + 86400000 * 4).toISOString().slice(0, 10),
      reason: 'Pediatric follow-up check',
      status: 'Pending'
    },
    {
      patient: 'Ana Gomez',
      doctor: 'Dr. Ana Cruz',
      followUpDate: new Date(this.today.getTime() + 86400000 * 6).toISOString().slice(0, 10),
      reason: 'Prenatal monitoring',
      status: 'Pending'
    }
  ];

  private readonly _dailyBookingSummaryRows: Array<{
    date: string;
    totalBookings: number;
    completed: number;
    cancelled: number;
    noShow: number;
    revenue: number;
  }> = [
    {
      date: new Date(this.today.getTime() - 86400000 * 6).toISOString().slice(0, 10),
      totalBookings: 6,
      completed: 4,
      cancelled: 1,
      noShow: 1,
      revenue: 2600
    },
    {
      date: new Date(this.today.getTime() - 86400000 * 5).toISOString().slice(0, 10),
      totalBookings: 7,
      completed: 5,
      cancelled: 1,
      noShow: 1,
      revenue: 3200
    },
    {
      date: new Date(this.today.getTime() - 86400000 * 4).toISOString().slice(0, 10),
      totalBookings: 8,
      completed: 6,
      cancelled: 1,
      noShow: 1,
      revenue: 4100
    },
    {
      date: new Date(this.today.getTime() - 86400000 * 3).toISOString().slice(0, 10),
      totalBookings: 5,
      completed: 4,
      cancelled: 0,
      noShow: 1,
      revenue: 2100
    },
    {
      date: new Date(this.today.getTime() - 86400000 * 2).toISOString().slice(0, 10),
      totalBookings: 7,
      completed: 5,
      cancelled: 1,
      noShow: 1,
      revenue: 3600
    },
    {
      date: new Date(this.today.getTime() - 86400000).toISOString().slice(0, 10),
      totalBookings: 9,
      completed: 6,
      cancelled: 2,
      noShow: 1,
      revenue: 4500
    },
    {
      date: new Date(this.today.getTime()).toISOString().slice(0, 10),
      totalBookings: 8,
      completed: 5,
      cancelled: 1,
      noShow: 2,
      revenue: 3900
    }
  ];

  private _consultations: Consultation[] = [
    {
      id: 'consult-1',
      bookingId: 'bk-007',
      patientId: 'pat-1',
      doctorId: 'doc-1',
      consultationDate: new Date(Date.now() - 86400000 * 10).toISOString().slice(0, 10),
      consultationTime: '09:30',
      chiefComplaint: 'Fever and cough',
      subjective: 'Symptoms started three days before the consultation with mild body aches.',
      objective: 'Mild congestion, afebrile, stable vital signs.',
      assessment: 'Upper respiratory tract infection',
      plan: 'Rest, hydration, medication, follow-up if symptoms persist',
      vitalSigns: {
        bloodPressureSystolic: 118,
        bloodPressureDiastolic: 76,
        heartRate: 82,
        respiratoryRate: 18,
        temperatureCelsius: 37.1,
        oxygenSaturation: 98,
        weightKg: 68,
        heightCm: 170,
        bmi: 23.5
      },
      diagnoses: [
        {
          id: 'dx-1',
          code: 'J06.9',
          description: 'Acute upper respiratory infection, unspecified',
          type: 'Primary'
        }
      ],
      prescriptionIds: ['rx-1'],
      labRequestIds: ['labreq-1'],
      followUpDate: new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 10),
      status: 'Completed',
      isLocked: true,
      createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 10 + 900000).toISOString(),
      historyOfPresentIllness: 'Symptoms started three days before the consultation with mild body aches.',
      peGeneralFindings: 'Mild congestion, afebrile, stable vital signs.'
    },
    {
      id: 'consult-2',
      bookingId: 'bk-010',
      patientId: 'pat-1',
      doctorId: 'doc-1',
      consultationDate: new Date(Date.now() - 86400000 * 30).toISOString().slice(0, 10),
      consultationTime: '10:15',
      chiefComplaint: 'Headache',
      subjective: 'Intermittent headache associated with poor sleep and stress.',
      objective: 'No neurologic deficit, normal hydration status.',
      assessment: 'Tension headache',
      plan: 'Pain reliever as needed and sleep hygiene',
      diagnoses: [
        {
          id: 'dx-2',
          code: 'R51.9',
          description: 'Headache, unspecified',
          type: 'Secondary'
        }
      ],
      prescriptionIds: [],
      labRequestIds: [],
      status: 'Completed',
      isLocked: true,
      createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 30 + 600000).toISOString(),
      historyOfPresentIllness: 'Intermittent headache associated with poor sleep and stress.',
      peGeneralFindings: 'No neurologic deficit, normal hydration status.'
    }
  ];

  private _prescriptions: Prescription[] = [
    {
      id: 'rx-1',
      consultationId: 'consult-1',
      patientId: 'pat-1',
      doctorId: 'doc-1',
      issuedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
      prescriptionDate: new Date(Date.now() - 86400000 * 10).toISOString(),
      status: 'Active',
      notes: 'Take after meals and complete the full course.',
      items: [
        {
          id: 'rx-item-1',
          medicineName: 'Paracetamol',
          genericName: 'Paracetamol',
          dosageForm: 'Tablet',
          strength: '500 mg',
          quantity: 12,
          sig: 'Take 1 tablet every 6 hours as needed for fever.',
          frequency: 'Every 6 hours PRN',
          duration: '3 days',
          instructions: 'Take after meals.',
          isControlledSubstance: false,
          brandName: 'Biogesic'
        }
      ]
    }
  ];

  private _allergies: Allergy[] = [
    {
      id: 'allergy-1',
      patientId: 'pat-1',
      allergen: 'Penicillin',
      reaction: 'Rash and difficulty breathing',
      severity: 'Severe',
      allergenName: 'Penicillin',
      allergenType: 'Drug',
      notes: 'Documented penicillin allergy'
    }
  ];

  private _labRequests: LabRequest[] = [
    {
      id: 'labreq-1',
      consultationId: 'consult-1',
      patientId: 'pat-1',
      doctorId: 'doc-1',
      testName: 'CBC',
      reason: 'Rule out infection',
      status: 'Completed',
      requestedAt: new Date(Date.now() - 86400000 * 10).toISOString()
    }
  ];

  private _labResults: LabResult[] = [
    {
      id: 'labres-1',
      labRequestId: 'labreq-1',
      patientId: 'pat-1',
      fileName: 'cbc-result.pdf',
      resultDate: new Date(Date.now() - 86400000 * 9).toISOString(),
      notes: 'Within normal range',
      consultationId: 'consult-1'
    }
  ];

  private _vaccinations: VaccinationRecord[] = [
    {
      id: 'vac-1',
      patientId: 'pat-1',
      vaccineName: 'Influenza',
      brandName: 'Fluarix',
      doseNumber: 1,
      lotNumber: 'FLU-2025-01',
      dateGiven: new Date(Date.now() - 86400000 * 120).toISOString().slice(0, 10),
      administeredBy: 'Nurse Joy',
      remarks: 'Annual flu shot'
    }
  ];

  private _followUps: FollowUp[] = [
    {
      id: 'fu-1',
      consultationId: 'consult-1',
      patientId: 'pat-1',
      doctorId: 'doc-1',
      followUpDate: new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 10),
      reason: 'Review symptoms and test results',
      status: 'Pending',
      reminderEnabled: true
    }
  ];

  private readonly _mockDrugList: MockDrug[] = [
    { id: 'drug-1', medicineName: 'Paracetamol', genericName: 'Paracetamol' },
    { id: 'drug-2', medicineName: 'Amoxicillin', genericName: 'Amoxicillin' },
    { id: 'drug-3', medicineName: 'Penicillin V', genericName: 'Penicillin V' },
    { id: 'drug-4', medicineName: 'Cetirizine', genericName: 'Cetirizine' },
    { id: 'drug-5', medicineName: 'Salbutamol', genericName: 'Salbutamol' },
    { id: 'drug-6', medicineName: 'Metformin', genericName: 'Metformin' },
    { id: 'drug-7', medicineName: 'Losartan', genericName: 'Losartan' },
    { id: 'drug-8', medicineName: 'Omeprazole', genericName: 'Omeprazole' }
  ];

  private _bookings: Booking[] = [];

  constructor() {
    const ymd = (d: Date): string => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };
    const add = (d: Date, days: number): Date => {
      const x = new Date(d);
      x.setDate(x.getDate() + days);
      return x;
    };

    const todayStr = ymd(this.today);
    const tomorrowStr = ymd(add(this.today, 1));
    const yesterdayStr = ymd(add(this.today, -1));
    const twoDaysAgoStr = ymd(add(this.today, -2));
    const threeDaysAgoStr = ymd(add(this.today, -3));
    const nextWeekStr = ymd(add(this.today, 7));

    this._doctorBlockedDates = this.buildDoctorBlockedDates();

    this._bookings = [
      this.makeBooking(
        'bk-001',
        'pat-1',
        'doc-1',
        'svc-1',
        todayStr,
        '09:00',
        'Confirmed',
        'Paid',
        1,
        500,
        false,
        'Online',
        500,
        0
      ),
      this.makeBooking(
        'bk-002',
        'pat-2',
        'doc-1',
        'svc-4',
        todayStr,
        '09:30',
        'Confirmed',
        'Unpaid',
        2,
        1500,
        true,
        'PayAtClinic',
        500,
        1000
      ),
      this.makeBooking(
        'bk-003',
        'pat-3',
        'doc-2',
        'svc-2',
        todayStr,
        '10:00',
        'ProofSubmitted',
        'Unpaid',
        1,
        600,
        false,
        'Online',
        600,
        0
      ),
      this.makeBooking(
        'bk-004',
        'pat-4',
        'doc-3',
        'svc-3',
        todayStr,
        '09:00',
        'Confirmed',
        'Paid',
        1,
        700,
        false,
        'Online',
        700,
        0
      ),
      this.makeBooking(
        'bk-005',
        'pat-1',
        'doc-1',
        'svc-6',
        tomorrowStr,
        '08:00',
        'Pending',
        'Unpaid',
        null,
        850,
        false,
        'Online',
        500,
        350
      ),
      this.makeBooking(
        'bk-006',
        'pat-2',
        'doc-2',
        'svc-2',
        yesterdayStr,
        '10:00',
        'Completed',
        'Paid',
        3,
        600,
        false,
        'Online',
        600,
        0
      ),
      this.makeBooking(
        'bk-007',
        'pat-3',
        'doc-1',
        'svc-1',
        yesterdayStr,
        '09:00',
        'Completed',
        'Waived',
        2,
        500,
        false,
        'Online',
        500,
        0
      ),
      this.makeBooking(
        'bk-008',
        'pat-5',
        'doc-3',
        'svc-3',
        yesterdayStr,
        '11:00',
        'NoShow',
        'Unpaid',
        null,
        700,
        false,
        'Online',
        700,
        0
      ),
      this.makeBooking(
        'bk-009',
        'pat-4',
        'doc-1',
        'svc-9',
        twoDaysAgoStr,
        '14:00',
        'Cancelled',
        'Refunded',
        null,
        1000,
        false,
        'Online',
        500,
        500
      ),
      this.makeBooking(
        'bk-010',
        'pat-1',
        'doc-2',
        'svc-2',
        threeDaysAgoStr,
        '09:00',
        'Completed',
        'Paid',
        1,
        600,
        false,
        'Online',
        600,
        0
      ),
      this.makeBooking(
        'bk-011',
        'pat-5',
        'doc-1',
        'svc-4',
        nextWeekStr,
        '10:00',
        'Confirmed',
        'Paid',
        3,
        1500,
        false,
        'Online',
        500,
        1000
      ),
      this.makeBooking(
        'bk-012',
        'pat-2',
        'doc-3',
        'svc-3',
        nextWeekStr,
        '09:00',
        'Confirmed',
        'Paid',
        2,
        700,
        false,
        'Online',
        700,
        0
      )
    ];

    this._notifications.push(
      ...this.buildNotificationsForUser('user-staff-1', [
        { title: 'Queue Updated', message: 'Walk-in queue has been updated for today.', isRead: false, minutesAgo: 12, navigateTo: '/staff/bookings' },
        { title: 'Booking Confirmed', message: 'A pending booking was confirmed successfully.', isRead: false, minutesAgo: 48, navigateTo: '/staff/bookings/BK-002' },
        { title: 'Proof Submitted', message: 'Payment proof is ready for verification.', isRead: false, minutesAgo: 65, navigateTo: '/staff/bookings/BK-003' },
        { title: 'Cancelled Visit', message: 'A booking was cancelled by the patient.', isRead: true, minutesAgo: 150 },
        { title: 'Doctor Available', message: 'Dr. Santos has checked in for the morning queue.', isRead: true, minutesAgo: 240 },
        { title: 'Walk-in Added', message: 'A new walk-in patient has been registered.', isRead: true, minutesAgo: 360 },
        { title: 'Follow-up Reminder', message: 'Two patients need follow-up reminders today.', isRead: true, minutesAgo: 720 },
        { title: 'Records Updated', message: 'A patient record was updated.', isRead: true, minutesAgo: 1440 },
        { title: 'Lab Request Logged', message: 'A lab request was added to a consultation.', isRead: true, minutesAgo: 2880 },
        { title: 'System Notice', message: 'Clinic schedule was refreshed for tomorrow.', isRead: true, minutesAgo: 4320 }
      ]),
      ...this.buildNotificationsForUser('user-doctor-1', [
        { title: 'Today\'s Queue', message: 'You have 4 patients in your queue today.', isRead: false, minutesAgo: 9, navigateTo: '/doctor/dashboard' },
        { title: 'New Booking', message: 'A new booking was assigned to your schedule.', isRead: false, minutesAgo: 34, navigateTo: '/doctor/appointments' },
        { title: 'Consultation Locked', message: 'A completed consultation has been locked.', isRead: false, minutesAgo: 58, navigateTo: '/doctor/patients' },
        { title: 'Follow-up Due', message: 'A patient follow-up is due this week.', isRead: true, minutesAgo: 120 },
        { title: 'Patient Review', message: 'A new patient review was posted.', isRead: true, minutesAgo: 240 },
        { title: 'Schedule Change', message: 'Your Friday schedule was updated.', isRead: true, minutesAgo: 480 },
        { title: 'Medical Record', message: 'A record was added for a recent visit.', isRead: true, minutesAgo: 960 },
        { title: 'Prescription Ready', message: 'A prescription is ready for review.', isRead: true, minutesAgo: 1920 },
        { title: 'No Show Note', message: 'A no-show has been recorded for today.', isRead: true, minutesAgo: 2880 },
        { title: 'Clinic Memo', message: 'Please check the updated clinic memo.', isRead: true, minutesAgo: 4320 }
      ]),
      ...this.buildNotificationsForUser('user-patient-1', [
        { title: 'Appointment Confirmed', message: 'Your booking was confirmed by the clinic.', isRead: false, minutesAgo: 15, navigateTo: '/patient/bookings/BK-001' },
        { title: 'Payment Received', message: 'Your payment has been marked as paid.', isRead: false, minutesAgo: 44, navigateTo: '/patient/bookings/BK-001' },
        { title: 'Review Request', message: 'You can now leave a review for your completed visit.', isRead: false, minutesAgo: 72, navigateTo: '/patient/bookings/BK-006' },
        { title: 'Follow-up Reminder', message: 'A follow-up visit is coming up soon.', isRead: true, minutesAgo: 144 },
        { title: 'Medical Record', message: 'Your medical record has been updated.', isRead: true, minutesAgo: 288 },
        { title: 'Prescription Ready', message: 'A prescription is available for viewing.', isRead: true, minutesAgo: 432 },
        { title: 'Clinic Notice', message: 'The clinic posted a new announcement.', isRead: true, minutesAgo: 576 },
        { title: 'Consent Update', message: 'Your privacy consent record was refreshed.', isRead: true, minutesAgo: 720 },
        { title: 'New Message', message: 'The clinic has a new update for you.', isRead: true, minutesAgo: 960 },
        { title: 'Booking Reminder', message: 'Your next appointment is coming soon.', isRead: true, minutesAgo: 1200 }
      ])
    );

    this._auditLogs = this.buildAuditLogs();
  }

  get clinicSettings(): ClinicSettings {
    return this._clinicSettings;
  }

  getClinicSettings(): ClinicSettings {
    return {
      ...this._clinicSettings,
      paymentSettings: { ...this._clinicSettings.paymentSettings }
    };
  }

  get paymentSettings(): PaymentSettings {
    return this._paymentSettings;
  }

  getPaymentSettings(): PaymentSettings {
    return { ...this._paymentSettings };
  }

  get seedUsers(): SeedUser[] {
    return [...this._seedUsers];
  }

  getDoctors(): Doctor[] {
    return [...this._doctors];
  }

  getDoctorById(id: string): Doctor | undefined {
    return this._doctors.find((doctor) => doctor.id === id);
  }

  get doctors(): Doctor[] {
    return [...this._doctors];
  }

  getDoctorSchedules(): DoctorSchedule[] {
    return [...this._doctorSchedules];
  }

  getDoctorSchedulesByDoctorId(doctorId: string): DoctorSchedule[] {
    return this._doctorSchedules.filter((schedule) => schedule.doctorId === doctorId);
  }

  get doctorSchedules(): DoctorSchedule[] {
    return [...this._doctorSchedules];
  }

  getDoctorBlockedDates(doctorId?: string): DoctorBlockedDate[] {
    if (!doctorId) {
      return [...this._doctorBlockedDates];
    }
    return this._doctorBlockedDates.filter((blockedDate) => blockedDate.doctorId === doctorId);
  }

  get services(): Service[] {
    return [...this._services];
  }

  getServices(): Service[] {
    return [...this._services];
  }

  getServiceById(id: string): Service | undefined {
    return this._services.find((service) => service.id === id);
  }

  get patients(): Patient[] {
    return [...this._patients];
  }

  getPatients(): Patient[] {
    return [...this._patients];
  }

  getPatientById(id: string): Patient | undefined {
    return this._patients.find((patient) => patient.id === id);
  }

  getBookings(): Booking[] {
    return [...this._bookings];
  }

  get bookings(): Booking[] {
    return [...this._bookings];
  }

  getConsultations(): Consultation[] {
    return [...this._consultations];
  }

  getConsultationById(id: string): Consultation | undefined {
    return this._consultations.find((consultation) => consultation.id === id);
  }

  getConsultationByBookingId(bookingId: string): Consultation | undefined {
    return this._consultations.find((consultation) => consultation.bookingId === bookingId);
  }

  getPrescriptions(): Prescription[] {
    return [...this._prescriptions];
  }

  getAllergies(): Allergy[] {
    return [...this._allergies];
  }

  getLabRequests(): LabRequest[] {
    return [...this._labRequests];
  }

  getLabResults(): LabResult[] {
    return [...this._labResults];
  }

  getVaccinations(): VaccinationRecord[] {
    return [...this._vaccinations];
  }

  getFollowUps(): FollowUp[] {
    return [...this._followUps];
  }

  getMockDrugList(): MockDrug[] {
    return [...this._mockDrugList];
  }

  saveConsultation(consultation: Consultation): Consultation {
    this._consultations = [...this._consultations.filter((item) => item.id !== consultation.id), consultation];
    return { ...consultation };
  }

  savePrescription(prescription: Prescription): Prescription {
    this._prescriptions = [...this._prescriptions.filter((item) => item.id !== prescription.id), prescription];
    return { ...prescription, items: prescription.items.map((item) => ({ ...item })) };
  }

  saveAllergy(allergy: Allergy): Allergy {
    this._allergies = [...this._allergies.filter((item) => item.id !== allergy.id), allergy];
    return { ...allergy };
  }

  removeAllergy(allergyId: string): void {
    this._allergies = this._allergies.filter((allergy) => allergy.id !== allergyId);
  }

  saveLabRequest(labRequest: LabRequest): LabRequest {
    this._labRequests = [...this._labRequests.filter((item) => item.id !== labRequest.id), labRequest];
    return { ...labRequest };
  }

  saveLabResult(labResult: LabResult): LabResult {
    this._labResults = [...this._labResults.filter((item) => item.id !== labResult.id), labResult];
    return { ...labResult };
  }

  saveVaccinationRecord(record: VaccinationRecord): VaccinationRecord {
    this._vaccinations = [...this._vaccinations.filter((item) => item.id !== record.id), record];
    return { ...record };
  }

  saveFollowUp(followUp: FollowUp): FollowUp {
    this._followUps = [...this._followUps.filter((item) => item.id !== followUp.id), followUp];
    return { ...followUp };
  }

  getBookingById(id: string): Booking | undefined {
    return this._bookings.find((booking) => booking.id === id);
  }

  get announcements(): Announcement[] {
    return [...this._announcements];
  }

  getAnnouncements(): Announcement[] {
    return [...this._announcements];
  }

  getAnnouncementById(id: string): Announcement | undefined {
    return this._announcements.find((announcement) => announcement.id === id);
  }

  getNotifications(): Notification[] {
    return [...this._notifications];
  }

  getUsers(): SeedUser[] {
    return [...this._seedUsers];
  }

  getReviews(): Review[] {
    return [...this._reviews];
  }

  get reviews(): Review[] {
    return [...this._reviews];
  }

  getAuditLogs(): AuditLog[] {
    return [...this._auditLogs];
  }

  getUnpaidCompletedVisitReportRows(): Array<{
    bookingId: string;
    patient: string;
    doctor: string;
    service: string;
    visitDate: string;
    amount: number;
    paymentStatus: string;
  }> {
    return [...this._unpaidCompletedVisitReportRows];
  }

  getPendingFollowUpReportRows(): Array<{
    patient: string;
    doctor: string;
    followUpDate: string;
    reason: string;
    status: string;
  }> {
    return [...this._pendingFollowUpReportRows];
  }

  getDailyBookingSummaryRows(): Array<{
    date: string;
    totalBookings: number;
    completed: number;
    cancelled: number;
    noShow: number;
    revenue: number;
  }> {
    return [...this._dailyBookingSummaryRows];
  }

  getAdminDashboardStats(): AdminDashboardStats {
    return {
      todayAppointments: 4,
      monthAppointments: 87,
      revenueToday: 2800,
      pendingVerifications: 1,
      onHoldBookings: 0,
      unpaidCompleted: 1,
      noShowsToday: 1,
      upcomingFollowUps: this._followUps.filter((item) => item.status === 'Pending').length
    };
  }

  generateMockSlots(doctorId: string, date: Date): TimeSlot[] {
    const schedules = this.getDoctorSchedules().filter((s) => s.doctorId === doctorId);
    const dayNames: DayOfWeek[] = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday'
    ];
    const dayName = dayNames[date.getDay()] as DayOfWeek;
    const schedule = schedules.find((s) => s.dayOfWeek === dayName);

    if (!schedule) {
      return [];
    }

    const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
    if (isPast) {
      return [];
    }

    const slots: TimeSlot[] = [];
    const [startHour, startMin] = schedule.startTime.split(':').map(Number);
    const [endHour, endMin] = schedule.endTime.split(':').map(Number);
    const doctor = this.getDoctors().find((d) => d.id === doctorId);
    const duration = doctor?.slotDurationMinutes ?? 30;

    let currentMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    let index = 0;

    while (currentMinutes + duration <= endMinutes) {
      const h = Math.floor(currentMinutes / 60);
      const m = currentMinutes % 60;
      const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      const endH = Math.floor((currentMinutes + duration) / 60);
      const endM = (currentMinutes + duration) % 60;
      const endTimeStr = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

      let status: TimeSlot['status'] = 'available';
      if (index === 1) {
        status = 'full';
      }
      if (index === 2) {
        status = 'full';
      }
      if (index === 4) {
        status = 'pending';
      }

      slots.push({ time: timeStr, endTime: endTimeStr, status });
      currentMinutes += duration;
      index++;
    }

    return slots;
  }

  updatePatient(patient: Patient): void {
    this._patients = this._patients.map((item) => (item.id === patient.id ? { ...patient } : item));
  }

  updatePatientConsent(patientId: string, consentVersion: string): void {
    this._patients = this._patients.map((patient) =>
      patient.id === patientId
        ? {
          ...patient,
            consentVersion,
            consentedAt: new Date().toISOString()
          }
        : patient
    );
  }

  updateClinicSettings(settings: ClinicSettings): ClinicSettings {
    this._clinicSettings = {
      ...settings,
      paymentSettings: { ...settings.paymentSettings }
    };
    this._paymentSettings = { ...settings.paymentSettings };
    return this.getClinicSettings();
  }

  bumpConsentVersion(): ClinicSettings {
    const current = this._clinicSettings.consentVersion.trim();
    const match = /^v(\d+)(?:\.(\d+))?$/i.exec(current);
    const major = Number(match?.[1] ?? 1);
    const minor = Number(match?.[2] ?? 0) + 1;
    const version = `v${major}.${minor}`;
    this._clinicSettings = {
      ...this._clinicSettings,
      consentVersion: version
    };
    return this.getClinicSettings();
  }

  submitBookingProof(bookingId: string, proofType: ProofType, proofValue: string): void {
    this._bookings = this._bookings.map((booking) =>
      booking.id === bookingId
        ? {
            ...booking,
            status: 'ProofSubmitted',
            proofType,
            proofValue,
            proofSubmittedAt: new Date().toISOString()
          }
        : booking
    );
  }

  cancelBooking(bookingId: string, reason: string): void {
    this._bookings = this._bookings.map((booking) =>
      booking.id === bookingId
        ? {
            ...booking,
            status: 'Cancelled',
            cancellationReason: reason
          }
        : booking
    );
  }

  confirmBooking(bookingId: string): void {
    this._bookings = this._bookings.map((booking) =>
      booking.id === bookingId ? { ...booking, status: 'Confirmed' } : booking
    );
  }

  confirmPayment(bookingId: string): void {
    this._bookings = this._bookings.map((booking) =>
      booking.id === bookingId ? { ...booking, status: 'Confirmed', paymentStatus: 'Paid' } : booking
    );
  }

  markComplete(bookingId: string): void {
    this._bookings = this._bookings.map((booking) =>
      booking.id === bookingId ? { ...booking, status: 'Completed' } : booking
    );
  }

  markNoShow(bookingId: string): void {
    this._bookings = this._bookings.map((booking) =>
      booking.id === bookingId ? { ...booking, status: 'NoShow' } : booking
    );
  }

  waivePayment(bookingId: string, reason: string): Booking | undefined {
    let updated: Booking | undefined;
    this._bookings = this._bookings.map((booking) => {
      if (booking.id !== bookingId) {
        return booking;
      }
      updated = {
        ...booking,
        paymentStatus: 'Waived'
      };
      return updated;
    });
    if (updated) {
      this.addAuditLog({
        entityType: 'Payment',
        entityId: bookingId,
        action: 'Waived payment',
        performedBy: 'Dr. Grace E. Gavino',
        performedAt: new Date().toISOString(),
        details: reason
      });
    }
    return updated;
  }

  refundPayment(bookingId: string, reason: string): Booking | undefined {
    let updated: Booking | undefined;
    this._bookings = this._bookings.map((booking) => {
      if (booking.id !== bookingId) {
        return booking;
      }
      updated = {
        ...booking,
        paymentStatus: 'Refunded'
      };
      return updated;
    });
    if (updated) {
      this.addAuditLog({
        entityType: 'Payment',
        entityId: bookingId,
        action: 'Refunded payment',
        performedBy: 'Dr. Grace E. Gavino',
        performedAt: new Date().toISOString(),
        details: reason
      });
    }
    return updated;
  }

  saveReview(review: Review): Review {
    this._reviews = [...this._reviews.filter((item) => item.id !== review.id), review];
    this.recalculateDoctorReviewStats(review.doctorId);
    return { ...review };
  }

  addAuditLog(log: Omit<AuditLog, 'id'> & { id?: string }): AuditLog {
    const entry: AuditLog = {
      id: log.id ?? `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      entityType: log.entityType,
      entityId: log.entityId,
      action: log.action,
      performedBy: log.performedBy,
      performedAt: log.performedAt,
      details: log.details
    };
    this._auditLogs = [entry, ...this._auditLogs].slice(0, 50);
    return { ...entry };
  }

  private buildNotificationsForUser(
    userId: string,
    seeds: Array<{
      title: string;
      message: string;
      isRead: boolean;
      minutesAgo: number;
      navigateTo?: string;
    }>
  ): Notification[] {
    return seeds.map((seed, index) => ({
      id: `n-${userId}-${index + 1}`,
      userId,
      title: seed.title,
      message: seed.message,
      isRead: seed.isRead,
      createdAt: new Date(Date.now() - seed.minutesAgo * 60000).toISOString(),
      navigateTo: seed.navigateTo
    }));
  }

  private buildAuditLogs(): AuditLog[] {
    const seeds: Array<Omit<AuditLog, 'id'>> = [
      {
        entityType: 'Booking',
        entityId: 'BK-001',
        action: 'Confirmed booking',
        performedBy: 'Ana Gomez',
        performedAt: new Date(Date.now() - 15 * 60000).toISOString(),
        details: 'Booking confirmed by staff.'
      },
      {
        entityType: 'Booking',
        entityId: 'BK-003',
        action: 'Marked proof submitted',
        performedBy: 'Ana Gomez',
        performedAt: new Date(Date.now() - 30 * 60000).toISOString(),
        details: 'Payment proof queued for verification.'
      },
      {
        entityType: 'Payment',
        entityId: 'BK-006',
        action: 'Marked paid',
        performedBy: 'Dr. Grace E. Gavino',
        performedAt: new Date(Date.now() - 45 * 60000).toISOString(),
        details: 'Payment verified in clinic.'
      },
      {
        entityType: 'Patient',
        entityId: 'pat-1',
        action: 'Updated patient profile',
        performedBy: 'Maria Fernandez',
        performedAt: new Date(Date.now() - 60 * 60000).toISOString(),
        details: 'Contact number updated.'
      },
      {
        entityType: 'Doctor',
        entityId: 'doc-2',
        action: 'Updated schedule',
        performedBy: 'Maria Fernandez',
        performedAt: new Date(Date.now() - 75 * 60000).toISOString(),
        details: 'Wednesday clinic hours adjusted.'
      },
      {
        entityType: 'Settings',
        entityId: 'settings-1',
        action: 'Updated clinic branding',
        performedBy: 'Dr. Grace E. Gavino',
        performedAt: new Date(Date.now() - 90 * 60000).toISOString(),
        details: 'Primary color changed for demo.'
      },
      {
        entityType: 'Consultation',
        entityId: 'consult-1',
        action: 'Completed consultation',
        performedBy: 'Dr. Santos',
        performedAt: new Date(Date.now() - 105 * 60000).toISOString(),
        details: 'SOAP notes finalized.'
      },
      {
        entityType: 'Booking',
        entityId: 'BK-007',
        action: 'Waived payment',
        performedBy: 'Dr. Grace E. Gavino',
        performedAt: new Date(Date.now() - 120 * 60000).toISOString(),
        details: 'Patient hardship waiver applied.'
      },
      {
        entityType: 'Payment',
        entityId: 'BK-009',
        action: 'Refunded payment',
        performedBy: 'Dr. Grace E. Gavino',
        performedAt: new Date(Date.now() - 135 * 60000).toISOString(),
        details: 'Refund processed after cancellation.'
      },
      {
        entityType: 'Patient',
        entityId: 'pat-4',
        action: 'Added review',
        performedBy: 'Juan Dela Cruz',
        performedAt: new Date(Date.now() - 150 * 60000).toISOString(),
        details: 'Five-star review submitted.'
      },
      {
        entityType: 'Booking',
        entityId: 'BK-010',
        action: 'Completed visit',
        performedBy: 'Dr. Jose Reyes',
        performedAt: new Date(Date.now() - 165 * 60000).toISOString(),
        details: 'Visit closed with prescription.'
      },
      {
        entityType: 'Consultation',
        entityId: 'consult-2',
        action: 'Added diagnosis',
        performedBy: 'Dr. Ana Cruz',
        performedAt: new Date(Date.now() - 180 * 60000).toISOString(),
        details: 'Primary diagnosis encoded.'
      },
      {
        entityType: 'Settings',
        entityId: 'settings-1',
        action: 'Bumped consent version',
        performedBy: 'Dr. Grace E. Gavino',
        performedAt: new Date(Date.now() - 195 * 60000).toISOString(),
        details: 'Patients may need to re-accept consent.'
      },
      {
        entityType: 'Booking',
        entityId: 'BK-011',
        action: 'Rescheduled booking',
        performedBy: 'Ana Gomez',
        performedAt: new Date(Date.now() - 210 * 60000).toISOString(),
        details: 'Moved to next available day.'
      },
      {
        entityType: 'Patient',
        entityId: 'pat-5',
        action: 'Created patient record',
        performedBy: 'Maria Fernandez',
        performedAt: new Date(Date.now() - 225 * 60000).toISOString(),
        details: 'New record created from walk-in.'
      },
      {
        entityType: 'Doctor',
        entityId: 'doc-1',
        action: 'Updated consultation fee',
        performedBy: 'Dr. Grace E. Gavino',
        performedAt: new Date(Date.now() - 240 * 60000).toISOString(),
        details: 'Consultation fee reviewed.'
      },
      {
        entityType: 'Booking',
        entityId: 'BK-012',
        action: 'Marked no-show',
        performedBy: 'Ana Gomez',
        performedAt: new Date(Date.now() - 255 * 60000).toISOString(),
        details: 'Patient did not arrive for the appointment.'
      },
      {
        entityType: 'Payment',
        entityId: 'BK-002',
        action: 'Recorded payment',
        performedBy: 'Ana Gomez',
        performedAt: new Date(Date.now() - 270 * 60000).toISOString(),
        details: 'On-site payment registered.'
      },
      {
        entityType: 'Consultation',
        entityId: 'consult-3',
        action: 'Added lab request',
        performedBy: 'Dr. Santos',
        performedAt: new Date(Date.now() - 285 * 60000).toISOString(),
        details: 'CBC and urinalysis requested.'
      },
      {
        entityType: 'Settings',
        entityId: 'settings-1',
        action: 'Updated payment details',
        performedBy: 'Dr. Grace E. Gavino',
        performedAt: new Date(Date.now() - 300 * 60000).toISOString(),
        details: 'Payment channels refreshed.'
      }
    ];

    return seeds.map((seed, index) => ({
      ...seed,
      id: `audit-${index + 1}`
    }));
  }

  private recalculateDoctorReviewStats(doctorId: string): void {
    const doctorReviews = this._reviews.filter((review) => review.doctorId === doctorId);
    const doctor = this._doctors.find((item) => item.id === doctorId);
    if (!doctor || doctorReviews.length === 0) {
      return;
    }
    const averageRating =
      doctorReviews.reduce((total, review) => total + review.rating, 0) / doctorReviews.length;
    doctor.reviewCount = doctorReviews.length;
    doctor.averageRating = Math.round(averageRating * 10) / 10;
  }

  private makeBooking(
    id: string,
    patientId: string,
    doctorId: string,
    serviceId: string,
    appointmentDate: string,
    slotStartTime: string,
    status: BookingStatus,
    paymentStatus: PaymentStatus,
    queueNumber: number | null,
    totalFee: number,
    isWalkIn: boolean,
    paymentMode: PaymentMode,
    consultationFeeSnapshot: number,
    serviceFeeSnapshot: number
  ): Booking {
    const svc = this._services.find((s) => s.id === serviceId);
    const duration = svc?.estimatedDurationMinutes ?? 30;
    return {
      id,
      patientId,
      doctorId,
      serviceId,
      appointmentDate,
      slotStartTime,
      slotEndTime: this.addMinutesToTime(slotStartTime, duration),
      status,
      paymentStatus,
      paymentMode,
      queueNumber,
      totalFee,
      consultationFeeSnapshot,
      serviceFeeSnapshot,
      isWalkIn,
      createdAt: `${appointmentDate}T00:00:00Z`
    };
  }

  private stripTime(d: Date): Date {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  }

  private minutesFromMidnight(hhmm: string): number {
    const [h, m] = hhmm.split(':').map((x) => Number(x));
    return h * 60 + m;
  }

  private minutesToHHmm(total: number): string {
    const h = Math.floor(total / 60);
    const m = total % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  private addMinutesToTime(start: string, minutes: number): string {
    return this.minutesToHHmm(this.minutesFromMidnight(start) + minutes);
  }

  private buildDoctorBlockedDates(): DoctorBlockedDate[] {
    const blockedDates: DoctorBlockedDate[] = [];
    const dayNames: DayOfWeek[] = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday'
    ];

    this._doctors.forEach((doctor) => {
      const scheduleDays = this._doctorSchedules
        .filter((schedule) => schedule.doctorId === doctor.id)
        .map((schedule) => schedule.dayOfWeek);
      const upcomingDates = this.getUpcomingWorkingDates(scheduleDays, 3);

      upcomingDates.forEach((blockedDate, index) => {
        const dayLabel = dayNames[new Date(`${blockedDate}T00:00:00`).getDay()];
        blockedDates.push({
          id: `blocked-${doctor.id}-${index + 1}`,
          doctorId: doctor.id,
          blockedDate,
          reason: `Unavailable on ${dayLabel}`
        });
      });
    });

    return blockedDates;
  }

  private getUpcomingWorkingDates(days: DayOfWeek[], count: number): string[] {
    const results: string[] = [];
    const start = this.stripTime(new Date());
    for (let offset = 1; results.length < count && offset <= 90; offset++) {
      const date = new Date(start);
      date.setDate(date.getDate() + offset);
      const dayName = this.dayNames()[date.getDay()];
      if (days.includes(dayName)) {
        results.push(this.toIsoDate(date));
      }
    }
    return results;
  }

  private dayNames(): DayOfWeek[] {
    return [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday'
    ];
  }

  private toIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
