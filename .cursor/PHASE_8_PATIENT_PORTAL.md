# PHASE 8 — Patient Portal

## Clinic Management System · Angular 17 + Ionic 7 + NgRx
### AI Implementation Prompt Document

---

## PHASE IDENTITY

| Field | Value |
|---|---|
| Phase Number | 8 of 10 |
| Phase Name | Patient Portal |
| Portals Affected | `/patient/*` |
| Depends On | Phases 1–7 |
| Blocks | Phase 9 Medical Records Module |
| Estimated Complexity | Medium-High |
| Mock Data | MockDataService + existing NgRx stores |
| Real API Calls | None |
| Git Tag | `phase-8-patient-portal` |

---

## GOAL

Build the Patient portal with a top-navbar layout, dashboard, bookings, booking detail, medical records read-only page, prescriptions read-only page, profile page, and privacy consent page.

The patient portal completes the demo flow:

Public booking → payment/proof → patient dashboard → appointment history → medical records/prescriptions read-only.

---

## DO NOT MODIFY

- Do not modify Admin portal files
- Do not modify Staff portal files
- Do not modify Doctor portal files
- Do not recreate `BookingTimerComponent`
- Do not implement real PDF download
- Do not implement reviews yet
- Do not implement consultation detail yet
- Do not make HTTP calls

Allowed small updates:

- Add patient-specific selectors if missing
- Add mock consultations/prescriptions to `MockDataService`
- Add patient route wiring

---

## FILES TO CREATE

```txt
src/app/portals/patient/
├── patient.routes.ts
├── services/
│   └── patient.service.ts
├── components/
│   ├── patient-layout/
│   │   ├── patient-layout.component.ts
│   │   └── patient-layout.component.scss
│   ├── patient-topbar/
│   │   ├── patient-topbar.component.ts
│   │   └── patient-topbar.component.scss
│   ├── upcoming-appointment-card/
│   │   ├── upcoming-appointment-card.component.ts
│   │   └── upcoming-appointment-card.component.scss
│   ├── patient-booking-card/
│   │   ├── patient-booking-card.component.ts
│   │   └── patient-booking-card.component.scss
│   ├── medical-record-card/
│   │   ├── medical-record-card.component.ts
│   │   └── medical-record-card.component.scss
│   ├── prescription-card/
│   │   ├── prescription-card.component.ts
│   │   └── prescription-card.component.scss
│   ├── booking-timeline/
│   │   ├── booking-timeline.component.ts
│   │   └── booking-timeline.component.scss
│   └── proof-submission-form/
│       ├── proof-submission-form.component.ts
│       └── proof-submission-form.component.scss
├── dashboard/
│   ├── patient-dashboard.page.ts
│   └── patient-dashboard.page.scss
├── bookings/
│   ├── patient-bookings.page.ts
│   └── patient-bookings.page.scss
├── booking-detail/
│   ├── patient-booking-detail.page.ts
│   └── patient-booking-detail.page.scss
├── medical-records/
│   ├── patient-medical-records.page.ts
│   └── patient-medical-records.page.scss
├── prescriptions/
│   ├── patient-prescriptions.page.ts
│   └── patient-prescriptions.page.scss
├── profile/
│   ├── patient-profile.page.ts
│   └── patient-profile.page.scss
└── privacy-consent/
    ├── patient-privacy-consent.page.ts
    └── patient-privacy-consent.page.scss
```

---

## DETAILED IMPLEMENTATION PROMPT

Copy everything below and paste into your AI coding tool.

```txt
You are building Phase 8 (Patient Portal) of the Clinic Management System.

Phases 1–7 are complete.

CRITICAL RULES:
1. Angular 17 standalone components only.
2. Ionic 7 components.
3. Patient portal uses its own topbar layout, NOT PortalLayoutComponent sidebar.
4. Reuse BookingTimerComponent from src/app/shared/components/booking-timer/.
5. Reuse StatusBadgeComponent, BannerComponent, EmptyStateComponent, SkeletonComponent, AvatarComponent.
6. Reuse existing NgRx stores.
7. No real HTTP calls.
8. No real PDF generation.
9. No real consultation editor.
10. No `any` TypeScript types.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 1 — PATIENT SERVICE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create:

src/app/portals/patient/services/patient.service.ts

@Injectable({ providedIn: 'root' })
export class PatientService {
  constructor(private mockData: MockDataService) {}

  getCurrentPatient(userId: string): Observable<Patient | undefined> {
    return of(this.mockData.getPatients().find(p => p.userId === userId)).pipe(delay(200));
  }

  getPatientBookings(patientId: string): Observable<Booking[]> {
    return of(
      this.mockData.getBookings()
        .filter(b => b.patientId === patientId)
        .sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime())
    ).pipe(delay(300));
  }

  getUpcomingBookings(patientId: string): Observable<Booking[]> {
    const now = new Date();

    return of(
      this.mockData.getBookings()
        .filter(b =>
          b.patientId === patientId &&
          new Date(b.appointmentDate) >= now &&
          ['Pending', 'ProofSubmitted', 'Confirmed', 'OnHold'].includes(b.status)
        )
        .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())
    ).pipe(delay(300));
  }

  getPatientConsultations(patientId: string): Observable<Consultation[]> {
    return of(this.mockData.getConsultations?.().filter(c => c.patientId === patientId) ?? []).pipe(delay(300));
  }

  getPatientPrescriptions(patientId: string): Observable<Prescription[]> {
    return of(this.mockData.getPrescriptions?.().filter(p => p.patientId === patientId) ?? []).pipe(delay(300));
  }
}

If getConsultations() and getPrescriptions() do not exist in MockDataService, add mock versions.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 2 — ADD MOCK PATIENT RECORDS IF MISSING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

In MockDataService, add mock data only if missing:

getConsultations(): Consultation[] {
  return [
    {
      id: 'consult-1',
      bookingId: 'BK-001',
      patientId: 'pat-1',
      doctorId: 'doc-1',
      consultationDate: new Date(Date.now() - 86400000 * 10).toISOString(),
      chiefComplaint: 'Fever and cough',
      assessment: 'Upper respiratory tract infection',
      plan: 'Rest, hydration, medication, follow-up if symptoms persist',
      status: 'Completed',
    },
    {
      id: 'consult-2',
      bookingId: 'BK-002',
      patientId: 'pat-1',
      doctorId: 'doc-1',
      consultationDate: new Date(Date.now() - 86400000 * 30).toISOString(),
      chiefComplaint: 'Headache',
      assessment: 'Tension headache',
      plan: 'Pain reliever as needed and sleep hygiene',
      status: 'Completed',
    },
  ];
}

getPrescriptions(): Prescription[] {
  return [
    {
      id: 'rx-1',
      consultationId: 'consult-1',
      patientId: 'pat-1',
      doctorId: 'doc-1',
      issuedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
      status: 'Active',
      items: [
        {
          id: 'rx-item-1',
          medicineName: 'Paracetamol 500mg',
          dosage: '500mg',
          frequency: 'Every 6 hours as needed',
          duration: '3 days',
          instructions: 'Take after meals',
        },
      ],
    },
  ];
}

Match the actual Consultation and Prescription interfaces in core/models/index.ts.
Do not change model names unless required by existing interfaces.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 3 — PATIENT ROUTES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create:

src/app/portals/patient/patient.routes.ts

export const PATIENT_ROUTES: Routes = [
  {
    path: '',
    component: PatientLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Patient'] },
    children: [
      { path: '',                   redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard',          component: PatientDashboardPage },
      { path: 'bookings',           component: PatientBookingsPage },
      { path: 'bookings/:id',       component: PatientBookingDetailPage },
      { path: 'medical-records',    component: PatientMedicalRecordsPage },
      { path: 'prescriptions',      component: PatientPrescriptionsPage },
      { path: 'profile',            component: PatientProfilePage },
      { path: 'privacy-consent',    component: PatientPrivacyConsentPage },
    ],
  },
];

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 4 — PATIENT LAYOUT + TOPBAR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create:

src/app/portals/patient/components/patient-layout/
src/app/portals/patient/components/patient-topbar/

Patient portal uses a white topbar, not sidebar.

Topbar links:
- Dashboard → /patient/dashboard
- Bookings → /patient/bookings
- Medical Records → /patient/medical-records
- Prescriptions → /patient/prescriptions
- Profile → /patient/profile

Topbar right side:
- Patient avatar
- Patient name
- Logout button/dropdown

Mobile:
- Collapse links into hamburger menu
- Use Ionic menu or simple dropdown panel

PatientLayoutComponent:
- Contains PatientTopbarComponent
- Contains router-outlet
- Uses soft clinic background
- Max-width content container

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 5 — PATIENT DASHBOARD PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create:

src/app/portals/patient/dashboard/patient-dashboard.page.ts
src/app/portals/patient/dashboard/patient-dashboard.page.scss

On init:
- Read current user from auth store.
- Resolve current patient by userId.
- Load patient bookings.
- Load patient consultations.
- Load prescriptions.

Dashboard sections:

1. Welcome header:
   "Welcome back, Juan"
   Subtitle: "Manage your appointments and health records."

2. Alerts:
   - If email is not verified, show BannerComponent warning:
     "Your email is not verified. Some notifications may not be delivered."
   - If privacy consent is outdated, show BannerComponent info:
     "Please review and accept the latest privacy consent."
     CTA: Review Consent → /patient/privacy-consent

3. Stat cards:
   - Upcoming Appointments
   - Pending Payment Proof
   - Completed Visits
   - Active Prescriptions

4. Upcoming appointment:
   Use UpcomingAppointmentCardComponent.
   Show nearest upcoming booking.
   If booking status is Pending and payment mode is Online:
   - Show BookingTimerComponent.
   - Show button: Submit Proof.

5. Recent medical records:
   Show latest 2 consultation records using MedicalRecordCardComponent.
   If none, show EmptyStateComponent.

6. Recent prescriptions:
   Show latest 2 prescriptions using PrescriptionCardComponent.
   If none, show EmptyStateComponent.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 6 — UPCOMING APPOINTMENT CARD COMPONENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create:

src/app/portals/patient/components/upcoming-appointment-card/

Inputs:
@Input() booking!: Booking;
@Input() doctor?: Doctor;
@Input() service?: Service;

Outputs:
@Output() viewDetails = new EventEmitter<string>();
@Output() submitProof = new EventEmitter<string>();
@Output() cancelBooking = new EventEmitter<string>();

UI:
- Doctor name
- Service name
- Date and time
- Queue number if available
- Booking status badge
- Payment status badge
- BookingTimerComponent if pending payment/proof deadline exists
- View Details button
- Submit Proof button if status is Pending or OnHold
- Cancel button if allowed

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 7 — PATIENT BOOKINGS PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create:

src/app/portals/patient/bookings/patient-bookings.page.ts
src/app/portals/patient/bookings/patient-bookings.page.scss

Show only current patient's bookings.

Filters:
- All
- Upcoming
- Pending Payment
- Confirmed
- Completed
- Cancelled

Display:
- Desktop: table
- Mobile: PatientBookingCardComponent

Each booking shows:
- Booking ID
- Doctor
- Service
- Date/time
- Status
- Payment status
- Actions: View Details, Submit Proof, Cancel

Rules:
- Patient cannot see other patients' bookings.
- Patient cannot mark complete/no-show.
- Patient cannot confirm/reject bookings.
- Patient cannot waive/refund payments.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 8 — PATIENT BOOKING DETAIL PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create:

src/app/portals/patient/booking-detail/patient-booking-detail.page.ts
src/app/portals/patient/booking-detail/patient-booking-detail.page.scss

Route: /patient/bookings/:id

Show:
- Booking summary
- Doctor info
- Service info
- Appointment date/time
- Queue number
- Booking timeline using BookingTimelineComponent
- Payment details
- Proof submission form if allowed
- Cancellation panel if allowed

Proof submission:
Use ProofSubmissionFormComponent.

Allowed proof types:
- Reference number
- Screenshot placeholder, no real upload

Behavior:
- Submit proof updates mock booking status to ProofSubmitted.
- Show toast: "Payment proof submitted for review."
- No real file upload.

Cancel behavior:
- If appointment is more than cancellationDeadlineHours away:
  show ConfirmModalComponent.
  Update status to Cancelled.
- Else:
  show BannerComponent danger:
  "This booking can no longer be cancelled online. Please contact the clinic."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 9 — BOOKING TIMELINE COMPONENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create:

src/app/portals/patient/components/booking-timeline/

Input:
@Input() booking!: Booking;

Timeline states:
1. Booking Created
2. Payment Pending
3. Proof Submitted
4. Confirmed
5. Completed

Display active/completed/current states based on booking.status and payment.status.

Use clinic design tokens.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 10 — PROOF SUBMISSION FORM COMPONENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create:

src/app/portals/patient/components/proof-submission-form/

Inputs:
@Input() booking!: Booking;

Outputs:
@Output() proofSubmitted = new EventEmitter<{
  bookingId: string;
  proofType: ProofType;
  proofValue: string;
}>();

Form:
- proofType: ReferenceNumber | Screenshot
- referenceNumber input if ReferenceNumber selected
- screenshot placeholder if Screenshot selected
- Submit button

Validation:
- proofType required
- referenceNumber required if ReferenceNumber
- screenshot placeholder required if Screenshot

No real upload.
For screenshot, use fake filename only.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 11 — PATIENT MEDICAL RECORDS PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create:

src/app/portals/patient/medical-records/patient-medical-records.page.ts
src/app/portals/patient/medical-records/patient-medical-records.page.scss

Read-only page.

Show consultations for current patient only.

Each MedicalRecordCardComponent shows:
- Date
- Doctor
- Chief complaint
- Assessment
- Plan
- Status

If no records:
EmptyStateComponent:
title: "No medical records yet"
description: "Your completed consultations will appear here."

Important:
- Do not implement edit.
- Do not implement full SOAP detail yet.
- Do not implement admin/doctor clinical forms.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 12 — MEDICAL RECORD CARD COMPONENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create:

src/app/portals/patient/components/medical-record-card/

Inputs:
@Input() consultation!: Consultation;
@Input() doctor?: Doctor;

UI:
- Date
- Doctor name
- Chief complaint
- Assessment
- Plan summary
- Status badge
- "View Details" button disabled or shows toast:
  "Detailed consultation view will be available in Phase 9."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 13 — PATIENT PRESCRIPTIONS PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create:

src/app/portals/patient/prescriptions/patient-prescriptions.page.ts
src/app/portals/patient/prescriptions/patient-prescriptions.page.scss

Read-only page.

Show prescriptions for current patient only.

Each PrescriptionCardComponent shows:
- Issued date
- Doctor
- Medicine list
- Dosage/frequency/duration
- Instructions
- Status
- Download button stub

Download behavior:
- Show toast: "Prescription PDF download will be available in Phase 10."
- Do not generate PDF.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 14 — PRESCRIPTION CARD COMPONENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create:

src/app/portals/patient/components/prescription-card/

Inputs:
@Input() prescription!: Prescription;
@Input() doctor?: Doctor;

Outputs:
@Output() download = new EventEmitter<string>();

UI:
- Prescription header with issued date and doctor
- List of prescription items
- Status badge
- Download PDF button stub

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 15 — PATIENT PROFILE PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create:

src/app/portals/patient/profile/patient-profile.page.ts
src/app/portals/patient/profile/patient-profile.page.scss

Sections:

1. Personal Information:
   - First name
   - Middle name
   - Last name
   - Birthdate
   - Gender
   - Contact number
   - Email read-only

2. Address:
   - Street
   - Barangay
   - City
   - Province

3. Emergency Contact:
   - Name
   - Relationship
   - Contact number

4. HMO / PhilHealth:
   - HMO provider
   - HMO number
   - PhilHealth number

5. Change Password:
   - Current password
   - New password
   - Confirm password
   - Use existing passwordStrengthValidator

Save behavior:
- Mock only.
- Update NgRx/local state only.
- Show toast: "Profile updated successfully."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 16 — PATIENT PRIVACY CONSENT PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create:

src/app/portals/patient/privacy-consent/patient-privacy-consent.page.ts
src/app/portals/patient/privacy-consent/patient-privacy-consent.page.scss

Show:
- Clinic privacy policy text from ClinicSettings
- Consent version
- Last updated
- Accept checkbox
- Accept button

Behavior:
- Accept button disabled until checkbox checked.
- On accept:
  - update mock patient consentVersion to current settings.consentVersion
  - show toast: "Privacy consent accepted."
  - navigate to /patient/dashboard

No real backend.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 17 — SELECTORS / STORE ADDITIONS IF MISSING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Add only if missing:

bookings.selectors.ts:
- selectBookingsByPatientId(patientId: string)
- selectUpcomingBookingsByPatientId(patientId: string)
- selectPendingProofBookingsByPatientId(patientId: string)

patients.selectors.ts:
- selectCurrentPatient(userId: string)
- selectPatientByUserId(userId: string)

Do not rewrite existing stores.
Do not duplicate selector names.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCOPE RULES — STRICTLY ENFORCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DO NOT implement:
- Real PDF download
- Real file upload
- Real payment verification
- Reviews submission
- Consultation detail editor
- SOAP notes
- Prescription creation
- Admin/doctor clinical forms
- Real API calls

DO implement:
- Patient layout and topbar
- Patient dashboard
- Own bookings only
- Booking detail
- Proof submission mock
- Medical records read-only list
- Prescriptions read-only list
- Profile page
- Privacy consent page

STOP after patient portal renders and all pages show patient-filtered mock data.
```

---

## VALIDATION CHECKLIST

```txt
[ ] Login as patient@clinic.ph redirects to /patient/dashboard
[ ] Patient topbar shows Dashboard, Bookings, Medical Records, Prescriptions, Profile
[ ] Patient portal uses topbar layout, not sidebar
[ ] Dashboard shows welcome header and stat cards
[ ] Unverified email warning banner appears if applicable
[ ] Upcoming appointment card renders
[ ] BookingTimerComponent appears for pending online payment booking
[ ] /patient/bookings shows only current patient's bookings
[ ] Booking filters work
[ ] /patient/bookings/:id loads booking detail
[ ] Proof submission form works with reference number
[ ] Proof submission updates status to ProofSubmitted
[ ] Cancel booking works only if within allowed cancellation deadline
[ ] /patient/medical-records shows read-only records
[ ] /patient/prescriptions shows read-only prescriptions
[ ] Download PDF button is stub only
[ ] /patient/profile loads editable patient profile
[ ] Privacy consent page displays clinic consent text
[ ] Accept consent updates mock state and returns to dashboard
[ ] Patient cannot see other patients' records/bookings
[ ] ng serve has zero errors
```

---

## GIT COMMIT

```bash
git add .
git commit -m "phase-8: patient portal — dashboard, bookings, records, prescriptions, profile"
git push
```

---

## STOP AFTER THIS PHASE

Wait for human validation and git commit before proceeding to Phase 9.
