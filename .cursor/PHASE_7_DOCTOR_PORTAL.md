# PHASE 7 — Doctor Portal Shell

## Clinic Management System · Angular 17 + Ionic 7 + NgRx
### AI Implementation Prompt Document

---

## PHASE IDENTITY

| Field | Value |
|---|---|
| Phase Number | 7 of 10 |
| Phase Name | Doctor Portal Shell |
| Portals Affected | `/doctor/*` |
| Depends On | Phases 1–6 |
| Blocks | Phase 9 Medical Records Module |
| Estimated Complexity | Medium-High |
| Mock Data | Reuses Phase 5/6 NgRx stores + MockDataService |
| Real API Calls | None |
| Git Tag | `phase-7-doctor-portal` |

---

## GOAL

Build the Doctor portal using the existing shared `PortalLayoutComponent`.

Doctor users can:

- View today’s queue
- View appointments assigned to them
- Open appointment details
- View own patients only
- Manage their own schedule and blocked dates
- Update their own availability status
- Access a consultation form stub for Phase 9

Consultation, prescriptions, vital signs, diagnosis, labs, and PDF generation are **NOT** implemented yet.

---

## DO NOT MODIFY

- Do not recreate `PortalLayoutComponent`
- Do not recreate NgRx stores
- Do not modify Admin portal files
- Do not modify Staff portal files
- Do not implement real medical records yet
- Do not implement actual consultation/prescription logic
- Do not make HTTP calls

Allowed small updates:

- Add doctor-specific selectors if missing
- Add mock helper methods in `MockDataService` if required
- Add route wiring for `/doctor`

---

## FILES TO CREATE

```txt
src/app/portals/doctor/
├── doctor.routes.ts
├── services/
│   └── doctor.service.ts
├── components/
│   ├── doctor-queue-table/
│   │   ├── doctor-queue-table.component.ts
│   │   └── doctor-queue-table.component.scss
│   ├── doctor-appointment-card/
│   │   ├── doctor-appointment-card.component.ts
│   │   └── doctor-appointment-card.component.scss
│   ├── doctor-patient-card/
│   │   ├── doctor-patient-card.component.ts
│   │   └── doctor-patient-card.component.scss
│   ├── doctor-schedule-editor/
│   │   ├── doctor-schedule-editor.component.ts
│   │   └── doctor-schedule-editor.component.scss
│   └── doctor-status-panel/
│       ├── doctor-status-panel.component.ts
│       └── doctor-status-panel.component.scss
├── dashboard/
│   ├── doctor-dashboard.page.ts
│   └── doctor-dashboard.page.scss
├── appointments/
│   ├── doctor-appointments.page.ts
│   └── doctor-appointments.page.scss
├── appointment-detail/
│   ├── doctor-appointment-detail.page.ts
│   └── doctor-appointment-detail.page.scss
├── patients/
│   ├── doctor-patients.page.ts
│   └── doctor-patients.page.scss
├── patient-detail/
│   ├── doctor-patient-detail.page.ts
│   └── doctor-patient-detail.page.scss
├── schedule/
│   ├── doctor-schedule.page.ts
│   └── doctor-schedule.page.scss
├── consultation/
│   ├── doctor-consultation-stub.page.ts
│   └── doctor-consultation-stub.page.scss
└── profile/
    ├── doctor-profile.page.ts
    └── doctor-profile.page.scss
```

---

## DETAILED IMPLEMENTATION PROMPT

Copy everything below and paste into your AI coding tool.

```txt
You are building Phase 7 (Doctor Portal Shell) of the Clinic Management System.

Phases 1–6 are complete.

CRITICAL RULES:
1. Use Angular 17 standalone components only.
2. Use Ionic 7 components.
3. Reuse PortalLayoutComponent from src/app/shared/components/portal-layout/.
4. Reuse NgRx stores from Phase 5: bookings, doctors, patients, notifications.
5. Do not recreate shared layout, slot grid, booking timer, status badge, avatar, banner, skeleton, or empty-state components.
6. Do not implement real consultation, prescription, vital signs, diagnosis, lab results, or PDF generation.
7. No HTTP calls. Use MockDataService and existing NgRx stores only.
8. No `any` TypeScript types.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 1 — DOCTOR SERVICE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create:

src/app/portals/doctor/services/doctor.service.ts

@Injectable({ providedIn: 'root' })
export class DoctorService {
  constructor(private mockData: MockDataService) {}

  getCurrentDoctor(userId: string): Observable<Doctor | undefined> {
    return of(this.mockData.getDoctors().find(d => d.userId === userId)).pipe(delay(200));
  }

  getDoctorBookings(doctorId: string): Observable<Booking[]> {
    return of(this.mockData.getBookings().filter(b => b.doctorId === doctorId)).pipe(delay(300));
  }

  getTodaysDoctorBookings(doctorId: string): Observable<Booking[]> {
    const today = new Date().toDateString();

    return of(
      this.mockData.getBookings()
        .filter(b =>
          b.doctorId === doctorId &&
          new Date(b.appointmentDate).toDateString() === today
        )
        .sort((a, b) => (a.queueNumber ?? 0) - (b.queueNumber ?? 0))
    ).pipe(delay(300));
  }

  getDoctorPatients(doctorId: string): Observable<Patient[]> {
    const doctorBookings = this.mockData.getBookings().filter(b => b.doctorId === doctorId);
    const patientIds = [...new Set(doctorBookings.map(b => b.patientId))];

    return of(
      this.mockData.getPatients().filter(p => patientIds.includes(p.id))
    ).pipe(delay(300));
  }

  getDoctorSchedules(doctorId: string): Observable<DoctorSchedule[]> {
    return of(this.mockData.getDoctorSchedules().filter(s => s.doctorId === doctorId)).pipe(delay(200));
  }

  getDoctorBlockedDates(doctorId: string): Observable<DoctorBlockedDate[]> {
    return of(this.mockData.getDoctorBlockedDates?.().filter(b => b.doctorId === doctorId) ?? []).pipe(delay(200));
  }
}

If getDoctorBlockedDates() does not exist in MockDataService, add it with mock data only.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 2 — DOCTOR ROUTES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create:

src/app/portals/doctor/doctor.routes.ts

export const DOCTOR_NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',    route: '/doctor/dashboard',    icon: 'grid-outline',       section: 'Main' },
  { label: 'Appointments', route: '/doctor/appointments', icon: 'calendar-outline' },
  { label: 'Patients',     route: '/doctor/patients',     icon: 'people-outline',     section: 'Records' },
  { label: 'Schedule',     route: '/doctor/schedule',     icon: 'time-outline',       section: 'Tools' },
  { label: 'My Profile',   route: '/doctor/profile',      icon: 'person-outline',     section: 'Account' },
];

export const DOCTOR_ROUTES: Routes = [
  {
    path: '',
    component: PortalLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: {
      roles: ['Doctor'],
      navItems: DOCTOR_NAV_ITEMS,
      portalLabel: 'Doctor Portal',
    },
    children: [
      { path: '',                    redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard',           component: DoctorDashboardPage },
      { path: 'appointments',        component: DoctorAppointmentsPage },
      { path: 'appointments/:id',    component: DoctorAppointmentDetailPage },
      { path: 'patients',            component: DoctorPatientsPage },
      { path: 'patients/:id',        component: DoctorPatientDetailPage },
      { path: 'schedule',            component: DoctorSchedulePage },
      { path: 'consultation/:id',    component: DoctorConsultationStubPage },
      { path: 'profile',             component: DoctorProfilePage },
    ],
  },
];

IMPORTANT:
- The route data object must include both roles and navItems.
- Do not duplicate the data property.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 3 — DOCTOR DASHBOARD PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create:

src/app/portals/doctor/dashboard/doctor-dashboard.page.ts
src/app/portals/doctor/dashboard/doctor-dashboard.page.scss

On init:
- Read current user from auth store.
- Resolve current doctor by matching AuthUser.userId to Doctor.userId.
- Dispatch/load bookings, doctors, patients if needed.
- Load today's bookings for this doctor only.

Dashboard sections:

1. Header:
   - "Good morning, Dr. Santos"
   - Subtitle: "Here is your queue and schedule for today."

2. Status Panel:
   Use DoctorStatusPanelComponent.
   Show current doctor day status:
   - Available
   - Running Late
   - Unavailable Today

   Actions:
   - Mark Available
   - Set Running Late with minutes input
   - Mark Unavailable Today

   Dispatch:
   setDoctorDayStatus({ doctorId, status, runningLateMinutes })

3. Stat cards:
   - Today's Queue
   - Waiting
   - Completed Today
   - No Show Today

4. Today's Queue:
   Use DoctorQueueTableComponent.
   Columns:
   - Queue #
   - Patient
   - Service
   - Time
   - Status
   - Payment
   - Actions

   Actions:
   - Open
   - Start Consultation
   - Mark Complete
   - Mark No Show

5. Upcoming Appointments:
   Show next 3 future appointments for the current doctor.

Empty state:
- If no appointments today, show EmptyStateComponent:
  title: "No appointments today"
  description: "You have no scheduled appointments for today."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 4 — DOCTOR QUEUE TABLE COMPONENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create:

src/app/portals/doctor/components/doctor-queue-table/

Inputs:
@Input() bookings: Booking[] = [];
@Input() patients: Patient[] = [];
@Input() services: Service[] = [];

Outputs:
@Output() openBooking = new EventEmitter<string>();
@Output() startConsultation = new EventEmitter<string>();
@Output() markComplete = new EventEmitter<string>();
@Output() markNoShow = new EventEmitter<string>();

Table columns:
- Queue #
- Patient
- Service
- Time
- StatusBadgeComponent
- Payment StatusBadgeComponent
- Actions

Action rules:
- Show Start Consultation only if booking.status is Confirmed or InProgress.
- Show Mark Complete only if booking.status is InProgress or Confirmed.
- Show Mark No Show only if booking.status is Confirmed.
- Do not show admin-only payment actions.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 5 — DOCTOR APPOINTMENTS PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create:

src/app/portals/doctor/appointments/doctor-appointments.page.ts
src/app/portals/doctor/appointments/doctor-appointments.page.scss

Show all bookings assigned to the current doctor only.

Filters:
- Date
- Status
- Payment status
- Search patient name

Layout:
- Desktop: table view
- Mobile: appointment cards

Each row/card shows:
- Patient
- Service
- Appointment date/time
- Queue number
- Booking status
- Payment status
- Actions: View, Start Consultation

Do not show bookings for other doctors.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 6 — DOCTOR APPOINTMENT DETAIL PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create:

src/app/portals/doctor/appointment-detail/doctor-appointment-detail.page.ts
src/app/portals/doctor/appointment-detail/doctor-appointment-detail.page.scss

Route: /doctor/appointments/:id

Show:
- Booking ID
- Patient info card
- Appointment details
- Service details
- Payment summary
- Booking status timeline
- Doctor notes placeholder

Actions:
- Start Consultation → navigate to /doctor/consultation/:bookingId
- Mark Complete
- Mark No Show
- Back to appointments

Rules:
- Doctor cannot confirm/reject payment.
- Doctor cannot waive/refund payment.
- Doctor cannot edit patient demographic info from this page.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 7 — DOCTOR PATIENTS PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create:

src/app/portals/doctor/patients/doctor-patients.page.ts
src/app/portals/doctor/patients/doctor-patients.page.scss

Show only patients who have bookings with the current doctor.

Search by:
- Patient code
- Name
- Contact number
- Email

Each patient card/row:
- Avatar
- Patient name
- Patient code
- Age / gender
- Last visit
- Upcoming appointment count
- View button

No add/delete patient action here.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 8 — DOCTOR PATIENT DETAIL PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create:

src/app/portals/doctor/patient-detail/doctor-patient-detail.page.ts
src/app/portals/doctor/patient-detail/doctor-patient-detail.page.scss

Route: /doctor/patients/:id

Show read-only patient information:
- Basic info
- Contact info
- Emergency contact
- Allergies
- HMO/PhilHealth info
- Booking history with this doctor
- Medical records stub section

Medical Records tab:
- Show EmptyStateComponent:
  title: "Medical Records"
  description: "Consultation history will be implemented in Phase 9."

Do not implement real medical records yet.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 9 — DOCTOR SCHEDULE PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create:

src/app/portals/doctor/schedule/doctor-schedule.page.ts
src/app/portals/doctor/schedule/doctor-schedule.page.scss

Features:
1. Weekly schedule editor:
   - Days of week
   - Start time
   - End time
   - Is active
   - Slot duration
   - Slot capacity

2. Blocked dates:
   - Date picker
   - Reason input
   - Add blocked date
   - Remove blocked date

3. Preview slots:
   - Select date
   - Use SlotGridComponent to preview generated slots

Mock only:
- Saving schedule updates NgRx/local component state only.
- Blocked date add/remove updates NgRx/local component state only.
- Show toast after save.

Do not affect real backend.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 10 — DOCTOR STATUS PANEL COMPONENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create:

src/app/portals/doctor/components/doctor-status-panel/

Inputs:
@Input() doctor!: Doctor;
@Input() status!: DoctorDayStatus | null;

Outputs:
@Output() statusChanged = new EventEmitter<{
  doctorId: string;
  status: AvailabilityStatus;
  runningLateMinutes?: number;
}>();

UI:
- Current status chip
- Available button
- Running Late button
- Running late minutes input
- Unavailable Today button

Behavior:
- Running Late requires minutes >= 5.
- Unavailable Today opens ConfirmModalComponent.
- Emit statusChanged on action.
- Toast handled by parent page.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 11 — DOCTOR CONSULTATION STUB PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create:

src/app/portals/doctor/consultation/doctor-consultation-stub.page.ts
src/app/portals/doctor/consultation/doctor-consultation-stub.page.scss

Route: /doctor/consultation/:id

Show:
- Page header: "Consultation Form"
- Booking summary card
- Patient summary card
- EmptyStateComponent:
  icon: "document-text-outline"
  title: "Consultation Form — Phase 9"
  description: "SOAP notes, vital signs, diagnosis, prescriptions, labs, and follow-up scheduling will be implemented in Phase 9."

Add button:
- Back to Appointment

Do not create SOAP form yet.
Do not create prescription form yet.
Do not create diagnosis picker yet.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 12 — DOCTOR PROFILE PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create:

src/app/portals/doctor/profile/doctor-profile.page.ts
src/app/portals/doctor/profile/doctor-profile.page.scss

Sections:
1. Professional Profile:
   - Full name
   - Specialization
   - Bio
   - Consultation fee
   - License number
   - PTR number
   - S2 number

2. Account Info:
   - Email read-only
   - Contact number editable
   - Password change section

3. Preview card:
   - Show how doctor appears in public doctor listing.

Save behavior:
- Mock only.
- Update NgRx doctor state if updateDoctor action exists.
- Otherwise update local page state and show toast.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 13 — SELECTORS / STORE ADDITIONS IF MISSING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

If not already existing, add selectors only:

bookings.selectors.ts:
- selectBookingsByDoctorId(doctorId: string)
- selectTodaysBookingsByDoctorId(doctorId: string)
- selectUpcomingBookingsByDoctorId(doctorId: string)

patients.selectors.ts:
- selectPatientsByIds(patientIds: string[])

doctors.selectors.ts:
- selectDoctorByUserId(userId: string)
- selectDoctorDayStatus(doctorId: string)

Do not rewrite stores.
Do not duplicate existing selectors.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCOPE RULES — STRICTLY ENFORCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DO NOT implement:
- SOAP notes
- Vital signs
- ICD-10 search
- Diagnosis form
- Prescription form
- Lab requests
- PDF printing
- Real file upload
- Real API calls
- Admin payment actions

DO implement:
- Doctor portal routes
- Doctor dashboard
- Doctor appointments
- Doctor appointment detail
- Doctor patients
- Doctor patient detail
- Doctor schedule page
- Doctor status panel
- Doctor profile page
- Consultation stub only

STOP after all doctor pages render and doctor-specific filtering works.
```

---

## VALIDATION CHECKLIST

```txt
[ ] Login as dr.santos@clinic.ph redirects to /doctor/dashboard
[ ] Doctor sidebar shows Dashboard, Appointments, Patients, Schedule, My Profile
[ ] Doctor dashboard loads only Dr. Santos bookings
[ ] Today's queue is sorted by queue number
[ ] Start Consultation navigates to /doctor/consultation/:id
[ ] Consultation page is only a stub
[ ] Doctor appointments page does not show other doctors' bookings
[ ] Doctor patient list shows only patients assigned to the logged-in doctor
[ ] Doctor schedule page loads current doctor's schedule
[ ] Slot preview works using SlotGridComponent
[ ] Doctor status can be set to Available
[ ] Doctor status can be set to Running Late with minutes
[ ] Doctor status can be set to Unavailable Today
[ ] Doctor profile page loads and saves mock updates
[ ] No Waive Payment or Refund Payment buttons appear anywhere
[ ] No SOAP/prescription/vitals/lab form exists yet
[ ] ng serve has zero errors
```

---

## GIT COMMIT

```bash
git add .
git commit -m "phase-7: doctor portal — dashboard, queue, appointments, patients, schedule, profile"
git push
```

---

## STOP AFTER THIS PHASE

Wait for human validation and git commit before proceeding to Phase 8.
