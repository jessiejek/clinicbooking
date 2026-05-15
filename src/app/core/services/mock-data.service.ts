import { Injectable } from '@angular/core';
import {
  Announcement,
  AuthUser,
  Booking,
  BookingStatus,
  ClinicSettings,
  Doctor,
  DoctorStatus,
  Patient,
  PaymentMode,
  PaymentStatus,
  Role,
  Service,
  ServiceCategory
} from '../models';

@Injectable({ providedIn: 'root' })
export class MockDataService {
  readonly users: AuthUser[] = [
    {
      id: 'USR-ADMIN-001',
      role: Role.Admin,
      email: 'admin@maliksi-clinic.test',
      fullName: 'Primary Admin',
      isActive: true,
      isFirstLogin: false
    },
    {
      id: 'USR-STAFF-001',
      role: Role.Staff,
      email: 'staff@maliksi-clinic.test',
      fullName: 'Front Desk Staff',
      isActive: true,
      isFirstLogin: false
    }
  ];

  readonly services: Service[] = [
    {
      id: 'SRV-001',
      name: 'General Checkup',
      description: 'Basic consultation and assessment.',
      estimatedDurationMinutes: 30,
      price: 500,
      category: ServiceCategory.Consultation,
      doctorIds: ['DOC-001']
    },
    {
      id: 'SRV-002',
      name: 'Pediatric Consultation',
      description: 'Child health assessment and consultation.',
      estimatedDurationMinutes: 30,
      price: 600,
      category: ServiceCategory.Consultation,
      doctorIds: ['DOC-002']
    },
    {
      id: 'SRV-003',
      name: 'OB-Gyn Checkup',
      description: 'Women’s health and OB-Gyn consultation.',
      estimatedDurationMinutes: 30,
      price: 700,
      category: ServiceCategory.Consultation,
      doctorIds: ['DOC-003']
    },
    {
      id: 'SRV-004',
      name: 'Wound Dressing',
      description: 'Cleaning and dressing of minor wounds.',
      estimatedDurationMinutes: 20,
      price: 350,
      category: ServiceCategory.Procedure,
      doctorIds: ['DOC-001']
    },
    {
      id: 'SRV-005',
      name: 'ECG',
      description: 'Electrocardiogram procedure.',
      estimatedDurationMinutes: 20,
      price: 900,
      category: ServiceCategory.Procedure,
      doctorIds: ['DOC-001']
    },
    {
      id: 'SRV-006',
      name: 'CBC',
      description: 'Complete blood count.',
      estimatedDurationMinutes: 15,
      price: 450,
      category: ServiceCategory.Laboratory,
      doctorIds: ['DOC-001', 'DOC-002', 'DOC-003']
    },
    {
      id: 'SRV-007',
      name: 'Urinalysis',
      description: 'Routine urine analysis.',
      estimatedDurationMinutes: 15,
      price: 300,
      category: ServiceCategory.Laboratory,
      doctorIds: ['DOC-001', 'DOC-002', 'DOC-003']
    },
    {
      id: 'SRV-008',
      name: 'Fasting Blood Sugar',
      description: 'Blood glucose test after fasting.',
      estimatedDurationMinutes: 15,
      price: 250,
      category: ServiceCategory.Laboratory,
      doctorIds: ['DOC-001', 'DOC-002', 'DOC-003']
    },
    {
      id: 'SRV-009',
      name: 'X-Ray',
      description: 'Basic X-Ray diagnostic imaging.',
      estimatedDurationMinutes: 25,
      price: 1200,
      category: ServiceCategory.Diagnostic,
      doctorIds: ['DOC-001', 'DOC-002', 'DOC-003']
    },
    {
      id: 'SRV-010',
      name: 'Ultrasound',
      description: 'Ultrasound diagnostic imaging.',
      estimatedDurationMinutes: 30,
      price: 1800,
      category: ServiceCategory.Diagnostic,
      doctorIds: ['DOC-003']
    }
  ];

  readonly doctors: Doctor[] = [
    {
      id: 'DOC-001',
      fullName: 'Dr. Maria Santos',
      specialization: 'General Practitioner',
      bio: 'General practitioner with a calm, patient-first approach.',
      profilePhotoUrl: null,
      consultationFee: 500,
      licenseNumber: 'LIC-0001',
      ptrNumber: 'PTR-0001',
      s2Number: null,
      status: DoctorStatus.Active,
      schedule: {
        doctorId: 'DOC-001',
        days: [
          { day: 'Mon', startTime: '08:00', endTime: '17:00' },
          { day: 'Tue', startTime: '08:00', endTime: '17:00' },
          { day: 'Wed', startTime: '08:00', endTime: '17:00' },
          { day: 'Thu', startTime: '08:00', endTime: '17:00' },
          { day: 'Fri', startTime: '08:00', endTime: '17:00' }
        ],
        slotDurationMinutes: 30,
        slotCapacity: 1,
        dailyPatientLimit: null
      },
      serviceIds: ['SRV-001', 'SRV-004', 'SRV-005', 'SRV-006', 'SRV-007', 'SRV-008', 'SRV-009']
    },
    {
      id: 'DOC-002',
      fullName: 'Dr. Jose Reyes',
      specialization: 'Pediatrics',
      bio: 'Pediatrician focused on prevention, growth, and development.',
      profilePhotoUrl: null,
      consultationFee: 600,
      licenseNumber: 'LIC-0002',
      ptrNumber: 'PTR-0002',
      s2Number: null,
      status: DoctorStatus.Active,
      schedule: {
        doctorId: 'DOC-002',
        days: [
          { day: 'Mon', startTime: '09:00', endTime: '16:00' },
          { day: 'Wed', startTime: '09:00', endTime: '16:00' },
          { day: 'Fri', startTime: '09:00', endTime: '16:00' }
        ],
        slotDurationMinutes: 30,
        slotCapacity: 1,
        dailyPatientLimit: null
      },
      serviceIds: ['SRV-002', 'SRV-006', 'SRV-007', 'SRV-008', 'SRV-009']
    },
    {
      id: 'DOC-003',
      fullName: 'Dr. Ana Cruz',
      specialization: 'OB-Gynecology',
      bio: 'OB-Gyn providing compassionate women’s healthcare.',
      profilePhotoUrl: null,
      consultationFee: 700,
      licenseNumber: 'LIC-0003',
      ptrNumber: 'PTR-0003',
      s2Number: 'S2-0003',
      status: DoctorStatus.Active,
      schedule: {
        doctorId: 'DOC-003',
        days: [
          { day: 'Tue', startTime: '08:00', endTime: '15:00' },
          { day: 'Thu', startTime: '08:00', endTime: '15:00' }
        ],
        slotDurationMinutes: 30,
        slotCapacity: 1,
        dailyPatientLimit: null
      },
      serviceIds: ['SRV-003', 'SRV-006', 'SRV-007', 'SRV-008', 'SRV-009', 'SRV-010']
    }
  ];

  readonly patients: Patient[] = [
    {
      id: 'PAT-001',
      code: 'PT-2025-00001',
      fullName: 'Juan Dela Cruz',
      email: 'juan@example.com',
      phone: '09171234567',
      dateOfBirth: '1990-02-14',
      sex: 'Male',
      civilStatus: 'Married',
      address: 'Cebu City',
      bloodType: 'O+',
      philHealthNumber: null,
      hmoProvider: null,
      emergencyContact: { name: 'Maria Dela Cruz', relationship: 'Spouse', phone: '09179876543' },
      createdAt: '2026-05-01T09:00:00.000Z',
      updatedAt: '2026-05-01T09:00:00.000Z'
    },
    {
      id: 'PAT-002',
      code: 'PT-2025-00002',
      fullName: 'Ana Ramirez',
      email: 'ana@example.com',
      phone: '09170001111',
      dateOfBirth: '1995-08-03',
      sex: 'Female',
      civilStatus: 'Single',
      address: 'Mandaue City',
      bloodType: 'A+',
      philHealthNumber: null,
      hmoProvider: 'Maxicare',
      emergencyContact: null,
      createdAt: '2026-05-02T10:10:00.000Z',
      updatedAt: '2026-05-02T10:10:00.000Z'
    },
    {
      id: 'PAT-003',
      code: 'PT-2025-00003',
      fullName: 'Josefa Lim',
      email: null,
      phone: '09173334444',
      dateOfBirth: '1988-11-22',
      sex: 'Female',
      civilStatus: 'Married',
      address: 'Lapu-Lapu City',
      bloodType: null,
      philHealthNumber: null,
      hmoProvider: null,
      emergencyContact: null,
      createdAt: '2026-05-03T12:30:00.000Z',
      updatedAt: '2026-05-03T12:30:00.000Z'
    },
    {
      id: 'PAT-004',
      code: 'PT-2025-00004',
      fullName: 'Mark Villanueva',
      email: 'mark@example.com',
      phone: '09175556666',
      dateOfBirth: '2001-01-10',
      sex: 'Male',
      civilStatus: 'Single',
      address: 'Talisay City',
      bloodType: 'B+',
      philHealthNumber: null,
      hmoProvider: null,
      emergencyContact: { name: 'Rina Villanueva', relationship: 'Mother', phone: '09174443322' },
      createdAt: '2026-05-04T08:45:00.000Z',
      updatedAt: '2026-05-04T08:45:00.000Z'
    },
    {
      id: 'PAT-005',
      code: 'PT-2025-00005',
      fullName: 'Liza Gomez',
      email: 'liza@example.com',
      phone: '09176667777',
      dateOfBirth: '1998-06-18',
      sex: 'Female',
      civilStatus: 'Single',
      address: 'Cebu City',
      bloodType: 'AB+',
      philHealthNumber: null,
      hmoProvider: null,
      emergencyContact: null,
      createdAt: '2026-05-05T14:20:00.000Z',
      updatedAt: '2026-05-05T14:20:00.000Z'
    }
  ];

  readonly clinicSettings: ClinicSettings = {
    clinicName: 'Maliksi Family Clinic',
    logoUrl: null,
    primaryColor: '#1A6B4A',
    operatingHours: [
      { label: 'Mon–Fri', details: '8:00 AM – 6:00 PM' },
      { label: 'Sat', details: '8:00 AM – 12:00 PM' },
      { label: 'Sun', details: 'Closed' }
    ],
    consentVersion: 'v1.0'
  };

  readonly announcements: Announcement[] = [
    {
      id: 'ANN-001',
      title: 'Welcome to Maliksi Family Clinic',
      body: 'We are now accepting online bookings.',
      imageUrl: null,
      publishedAt: '2026-05-01T08:00:00.000Z'
    },
    {
      id: 'ANN-002',
      title: 'Clinic Hours Update',
      body: 'Saturday hours are 8:00 AM – 12:00 PM.',
      imageUrl: null,
      publishedAt: '2026-05-02T08:00:00.000Z'
    }
  ];

  readonly bookings: Booking[] = [
    this.booking('BKG-001', 'BK-0001', 'PAT-001', 'DOC-001', 'SRV-001', '2026-05-15', '08:00', '08:30', BookingStatus.Pending, PaymentStatus.Unpaid),
    this.booking('BKG-002', 'BK-0002', 'PAT-002', 'DOC-001', 'SRV-004', '2026-05-15', '08:30', '09:00', BookingStatus.Confirmed, PaymentStatus.Paid),
    this.booking('BKG-003', 'BK-0003', 'PAT-003', 'DOC-001', 'SRV-005', '2026-05-15', '09:00', '09:30', BookingStatus.Completed, PaymentStatus.Paid),
    this.booking('BKG-004', 'BK-0004', 'PAT-004', 'DOC-002', 'SRV-002', '2026-05-14', '09:00', '09:30', BookingStatus.Cancelled, PaymentStatus.Refunded),
    this.booking('BKG-005', 'BK-0005', 'PAT-005', 'DOC-002', 'SRV-002', '2026-05-15', '10:00', '10:30', BookingStatus.OnHold, PaymentStatus.Unpaid),
    this.booking('BKG-006', 'BK-0006', 'PAT-001', 'DOC-002', 'SRV-002', '2026-05-13', '11:00', '11:30', BookingStatus.ProofSubmitted, PaymentStatus.Unpaid),
    this.booking('BKG-007', 'BK-0007', 'PAT-002', 'DOC-003', 'SRV-003', '2026-05-15', '08:00', '08:30', BookingStatus.Rescheduled, PaymentStatus.Unpaid),
    this.booking('BKG-008', 'BK-0008', 'PAT-003', 'DOC-003', 'SRV-010', '2026-05-15', '08:30', '09:00', BookingStatus.NoShow, PaymentStatus.Unpaid),
    this.booking('BKG-009', 'BK-0009', 'PAT-004', 'DOC-001', 'SRV-001', '2026-05-12', '14:00', '14:30', BookingStatus.Expired, PaymentStatus.Unpaid),
    this.booking('BKG-010', 'BK-0010', 'PAT-005', 'DOC-003', 'SRV-003', '2026-05-15', '09:00', '09:30', BookingStatus.Confirmed, PaymentStatus.Paid)
  ];

  private booking(
    id: string,
    code: string,
    patientId: string,
    doctorId: string,
    serviceId: string,
    date: string,
    startTime: string,
    endTime: string,
    status: BookingStatus,
    paymentStatus: PaymentStatus
  ): Booking {
    const now = '2026-05-15T00:00:00.000Z';
    return {
      id,
      code,
      patientId,
      doctorId,
      serviceId,
      date,
      startTime,
      endTime,
      status,
      paymentStatus,
      paymentMode: PaymentMode.PayOnline,
      createdAt: now,
      updatedAt: now
    };
  }
}
