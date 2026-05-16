import { Injectable } from '@angular/core';
import {
  AdminDashboardStats,
  Announcement,
  Booking,
  BookingStatus,
  ClinicSettings,
  DayOfWeek,
  DoctorBlockedDate,
  Doctor,
  DoctorSchedule,
  DoctorStatus,
  Patient,
  Notification,
  PaymentMode,
  PaymentSettings,
  PaymentStatus,
  Review,
  Role,
  Service,
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

  private readonly _clinicSettings: ClinicSettings = {
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
    consentVersion: 'v1.0'
  };

  private readonly _paymentSettings: PaymentSettings = {
    gcashAccountName: 'Dr. Grace E. Gavino',
    gcashNumber: '09285612976',
    mayaAccountName: 'Dr. Grace E. Gavino',
    mayaNumber: '09285612976',
    bankName: 'BDO Unibank',
    bankAccountName: 'Grace E. Gavino',
    bankAccountNumber: '00123456789'
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
      email: 'admin2@clinic.ph',
      password: 'Admin@123456',
      role: 'Admin',
      isFirstLogin: false
    },
    {
      id: 'user-staff-1',
      fullName: 'Ana Gomez',
      email: 'staff@clinic.ph',
      password: 'Staff@123456',
      role: 'Staff',
      isFirstLogin: false
    },
    {
      id: 'user-doctor-1',
      fullName: 'Dr. Grace E. Gavino',
      email: 'dr.gavino@gavino.clinic',
      password: 'Doctor@123456',
      role: 'Doctor',
      isFirstLogin: false
    },
    {
      id: 'user-doctor-2',
      fullName: 'Dr. Jose Reyes',
      email: 'dr.reyes@clinic.ph',
      password: 'Doctor@123456',
      role: 'Doctor',
      isFirstLogin: true
    },
    {
      id: 'user-doctor-3',
      fullName: 'Dr. Ana Cruz',
      email: 'dr.cruz@clinic.ph',
      password: 'Doctor@123456',
      role: 'Doctor',
      isFirstLogin: false
    },
    {
      id: 'user-patient-1',
      fullName: 'Juan dela Cruz',
      email: 'patient@clinic.ph',
      password: 'Patient@123456',
      role: 'Patient',
      isFirstLogin: false
    }
  ];

  private readonly _doctors: Doctor[] = [
    {
      id: 'doc-1',
      userId: 'user-doctor-1',
      fullName: 'Dr. Grace E. Gavino',
      specialization: 'Family Medicine / Adult & Pedia',
      bio: 'Dr. Gavino is a dedicated specialist in Family Medicine, providing comprehensive healthcare for both adults and children with over 15 years of clinical experience.',
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
    ['doc-3', 'Thursday', '08:00', '15:00']
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
      doctorIds: ['doc-1']
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
      doctorIds: ['doc-1']
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
      doctorIds: ['doc-1', 'doc-2', 'doc-3']
    },
    {
      id: 'svc-7',
      name: 'Urinalysis',
      category: 'Laboratory',
      price: 150,
      estimatedDurationMinutes: 15,
      doctorIds: ['doc-1', 'doc-2', 'doc-3']
    },
    {
      id: 'svc-8',
      name: 'Fasting Blood Sugar',
      category: 'Laboratory',
      price: 200,
      estimatedDurationMinutes: 15,
      doctorIds: ['doc-1', 'doc-3']
    },
    {
      id: 'svc-9',
      name: 'Chest X-Ray',
      category: 'Diagnostic',
      price: 500,
      estimatedDurationMinutes: 20,
      doctorIds: ['doc-1']
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

  private readonly _patients: Patient[] = [
    {
      id: 'pat-1',
      patientCode: 'PT-2025-00001',
      firstName: 'Juan',
      lastName: 'dela Cruz',
      dateOfBirth: '1990-05-15',
      sex: 'Male',
      contactNumber: '09171234567',
      email: 'patient@clinic.ph',
      bloodType: 'O+',
      isGuest: false,
      consentVersion: 'v1.0',
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

  private readonly _reviews: Review[] = [
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
  }

  get clinicSettings(): ClinicSettings {
    return this._clinicSettings;
  }

  getClinicSettings(): ClinicSettings {
    return { ...this._clinicSettings };
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

  getDoctorBlockedDates(doctorId: string): DoctorBlockedDate[] {
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

  get reviews(): Review[] {
    return [...this._reviews];
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
      upcomingFollowUps: 3
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
