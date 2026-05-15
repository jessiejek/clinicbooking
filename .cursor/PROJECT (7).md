# CLINIC SYSTEM — PROJECT.md
> Single source of truth. All backend, database, and frontend behavior must match this document.

---

## WHAT WE ARE BUILDING

A web application for clinics to manage appointment bookings, doctor schedules, patient medical records, prescriptions, lab results, and clinical documentation — all in one system.

This is a **standalone deployable app**. Every clinic gets their own separate instance — their own domain, their own database, their own data. There is no shared multi-tenant platform. The developer builds one codebase, then deploys a fresh copy per customer.

---

## WHO USES THE APP

### Admin (Clinic Owner / Clinic Manager)
- **Multiple admin accounts are allowed per deployment** — at least one must be designated as the Primary Admin
- Primary Admin cannot be deleted; other admin accounts can be deactivated by the Primary Admin
- Full access to everything: doctors, services, schedules, bookings, payments, medical records, announcements, settings
- Only role that can delete records, view the audit log, and merge duplicate patient records
- Cannot be created via registration — seeded on first run (Primary Admin)
- Additional admin accounts can be created by the Primary Admin

### Staff (Receptionist / Nurse / Medical Assistant)
- Added by Admin only
- Can confirm/cancel appointments, process walk-ins, register new patients, encode vital signs, attach lab results, log vaccinations
- Can manually create bookings on behalf of walk-in patients
- Can set the "Running Late" flag for any doctor
- Cannot manage staff accounts, change clinic settings, or write prescriptions
- Can update their own profile (name, contact number, password) from their dashboard

### Doctor
- Account created by Admin only
- Can view and manage their own schedule, appointments, and availability
- Can create consultations, write prescriptions, add diagnoses, attach lab results
- Can manage their own consultation settings: fee, daily patient limit, slot duration, slot capacity
- Can block their own dates (leave, conferences, personal)
- Can flag themselves as "Running Late" for today
- Can set their own availability status (Available / Running Late / Unavailable Today)
- Can only access patients they have personally consulted
- Doctor cross-access is **automatic** — triggered when a doctor **creates a consultation record** for a patient who was previously seen by another doctor. Access is not granted on booking alone.

### Patient
- Registers via Google, Facebook, or email/password
- Must accept a data privacy consent (RA 10173 compliant) on registration — `ConsentedAt` timestamp stored
- Browses doctors and services, books appointments, submits payment proof
- Can view their own medical records via the patient portal (read-only)
- Can belong to multiple clinic deployments using the same account
- Email verification is **soft** — unverified patients see a warning banner but can still book

---

## ONBOARDING FLOW (Admin-Created Accounts)

When Admin creates a Staff or Doctor account:
1. System generates a secure set-password token (expires in 24 hours)
2. System sends an invite email with a set-password link
3. On first login, user is **forced to change their password** before accessing anything
4. If the invite link expires, Admin can resend it

---

## PASSWORD POLICY

- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 number
- At least 1 special character
- Applied on registration, password reset, and forced first-login change

---

## ACCOUNT LOCKOUT

- Lock account after **5 consecutive failed login attempts**
- Lockout duration: **5 minutes**
- After lockout expires, attempt counter resets
- Lockout state stored in Users table (`LockoutUntil`, `FailedLoginAttempts`)

---

## DATA PRIVACY CONSENT (RA 10173)

- Patients must accept a data privacy consent on registration
- Consent acknowledgment stores: `ConsentedAt` (timestamp), `ConsentVersion` (string, e.g. "v1.0")
- Consent text is configurable by Admin via `ClinicSettings.PrivacyPolicyText`
- If the clinic updates the privacy policy (new `ConsentVersion`), patients are prompted to re-accept on next login
- Stored in `Patients` table; logged in AuditLogs

---

## CORE FEATURES

### 1. Doctor Management

**Admin controls (clinic-level):**
- Admin can add unlimited doctors
- Each doctor has: full name, specialization, bio, profile photo, license number, PTR number, S2 number
- Admin sets doctor status: Active, Inactive, On Leave
- Admin performs initial schedule setup during onboarding
- Admin can block clinic-wide holidays across all doctors at once

**Doctor controls (self-managed):**
- Doctor sets their own `ConsultationFee`
- Doctor sets their own `DailyPatientLimit` (null = no limit)
- Doctor sets their own `SlotDurationMinutes` (e.g. 15 or 30 minutes)
- Doctor sets their own `SlotCapacity` (patients per slot)
- Doctor manages their own weekly schedule (working days and hours)
- Doctor manages their own blocked dates (personal leave, conferences, etc.)
- Doctor can set their availability for today: Available / Running Late / Unavailable Today
- If Unavailable Today: all slots for that doctor on today's date are immediately closed to new bookings

### 2. Service Management (Admin)
- Admin can add unlimited services, organized by `ServiceCategory`:
  - **Consultation** — e.g. General Checkup, Pediatric Consultation, OB-Gyn Checkup
  - **Procedure** — e.g. Wound Dressing, ECG, Suturing
  - **Laboratory** — e.g. CBC, Urinalysis, Fasting Blood Sugar
  - **Diagnostic** — e.g. X-Ray, Ultrasound, 2D Echo
- Each service has: name, description, estimated duration, price, category
- A doctor can be linked to one or more services
- Service category is shown on the public portal for patient filtering

### 3. Doctor Schedules

**Admin can:**
- Set the initial weekly schedule for a new doctor
- View all doctor schedules
- Block dates for clinic-wide holidays (applies to all doctors)
- Override or correct any doctor's schedule if needed

**Doctor can (self-service):**
- Set their own working days and hours
- Set their own time slot duration
- Set their own slot capacity and daily patient limit
- Add, edit, or remove their own blocked dates
- Mark themselves unavailable for today without needing Admin

### 4. Patient Registry
- Centralized list of all patients in the clinic
- Each patient has a unique auto-generated Patient ID (e.g. PT-2025-00001)
- Patient record includes: full name, date of birth, sex, civil status, address, contact number, email, emergency contact, blood type, PhilHealth number, HMO info
- Patients who register via the booking portal are automatically linked to a patient record
- Staff can manually create patient records for walk-in patients
- Admin can merge duplicate patient records

### 5. Announcements
- Admin can post clinic announcements (text + optional image)
- Visible to patients on the public portal
- Admin can add, edit, or remove announcements

### 6. Branding / Customization
- Admin uploads clinic logo and sets brand colors
- Admin sets clinic name, address, phone, email, social media links, clinic operating hours
- **Clinic operating hours** are displayed on the public portal (e.g. "Mon–Sat 8:00 AM – 6:00 PM")
- App reflects clinic branding throughout (including generated PDF documents)

---

## BOOKING SYSTEM

### Patient-Facing: Doctor & Service Discovery
- Patients see all active doctors with specialization, photo, consultation fee, and reviews
- Patients can browse available time slots per doctor per date
- Patients can filter by specialization or service category
- Clinic operating hours are shown on the public portal

### Time Slot Visual (Patient View)
- Patient selects a doctor and a date
- A grid of time slots is shown based on the doctor's schedule and slot duration
- Slot colors:
  - **White** — available, clickable
  - **Red** — fully booked (slot capacity reached OR daily patient limit reached), not clickable
  - **Yellow** — pending (someone mid-booking), not clickable
  - **Blue** — currently selected by this patient
- If the doctor has a **RunningLate** status for today, a banner is shown: _"Dr. [Name] is running approximately [N] minutes behind schedule today."_
- If the doctor is **Unavailable Today**, the entire day is shown as unavailable with a notice.

### Slot Selection Rules
- Patient selects one time slot per booking
- A slot can hold multiple patients if SlotCapacity > 1
- Once a slot reaches its capacity → shown as Booked/Full
- Once a doctor reaches their DailyPatientLimit → entire day shown as Full
- Summary bar shows: doctor, date, time, service, fee, queue number (assigned on confirmation)

### Booking Flow (Online / Patient-Initiated)
```
Step 1  — Patient selects doctor + date + time slot + service
Step 2  — Patient taps "Proceed to Booking"
Step 3  — System holds the slot for 10 minutes (status = Pending)
Step 4  — Patient sees payment details: GCash QR / Maya QR / Bank account
          (Skipped entirely if clinic is in "Pay at Clinic" mode OR per-booking override is PayAtClinic)
Step 5  — Patient pays outside the app
Step 6  — Patient submits proof of payment:
            Option A: Type/paste reference number
            Option B: Upload screenshot
          (Skipped if PayAtClinic mode applies)
Step 7  — Slot hold extends by 30 minutes for admin/staff to verify
Step 8  — Admin or Staff receives notification, checks their payment app
Step 9a — Admin/Staff confirms → status = Confirmed ✅ → QueueNumber assigned → Patient notified → Payment Receipt generated + emailed
Step 9b — Admin/Staff rejects → status = Cancelled ❌ → Patient notified, must rebook
Step 9c — No action within 1 hour → status = On Hold ⚠️ → manual resolution required

(If PayAtClinic mode applies: Steps 4–7 are skipped, booking goes straight to Confirmed + QueueNumber assigned + Payment Receipt generated)
```

### Walk-In Booking Flow (Staff / Admin)
```
Step 1  — Staff opens the Walk-In screen
Step 2  — Staff searches for patient by name, contact number, or Patient ID
            Patient found → proceed to Step 4
            Patient not found → proceed to Step 3
Step 3  — Staff registers patient (two options):
            Option A: Quick Guest Entry
              — Name + contact number only
              — Patient record created with IsGuest = true
            Option B: Full Registration
              — Complete patient form (DOB, address, emergency contact, etc.)
Step 4  — Staff selects doctor + date + time slot + service
Step 5  — Staff selects Payment Mode:
            Option A: Pay at Clinic → PaymentStatus = Unpaid
            Option B: Online (paid externally, proof already in hand)
Step 6  — System creates booking with status = Confirmed immediately
Step 7  — QueueNumber assigned automatically (per doctor per day)
Step 8  — Payment Receipt generated automatically
Step 9  — If PaymentMode = PayAtClinic → Staff marks PaymentStatus = Paid when cash is collected → Receipt regenerated with Paid status
```

### Rescheduling Flow (Admin / Staff)
```
Step 1  — Admin or Staff opens the booking details
Step 2  — Selects "Reschedule"
Step 3  — Picks new doctor (optional), new date, new time slot
          (Doctor can only be changed if the new doctor also offers the same service)
Step 4  — System checks slot availability for the new slot (concurrency-safe)
Step 5  — If available: booking is updated, old slot is released, new slot is held
          QueueNumber is re-assigned for the new date/doctor
Step 6  — Patient is notified of the reschedule (new date, time, queue number)
Step 7  — If new payment amount differs (e.g. different doctor fee): Admin/Staff notes the difference;
          no automatic re-billing — handled manually
```
- Rescheduling is only allowed when booking status is Confirmed or OnHold
- Rescheduling is logged in AuditLogs
- Patients cannot self-reschedule — they must cancel and rebook

### Follow-Up Booking Flow
- When a doctor sets a `FollowUpDate` on a consultation, the system:
  1. Creates a `FollowUpReminder` record linked to the consultation
  2. Sends the patient a notification 3 days before the follow-up date: _"Dr. [Name] has recommended a follow-up visit on [Date]. Book your appointment here: [link]"_
  3. If the patient has not booked within 1 day of the follow-up date, sends a second reminder
- Follow-up reminders are processed by the external cron job
- Reminders are sent only if `FollowUpReminderEnabled = true` in ClinicSettings
- `FollowUpReminderSent` flag tracked per `FollowUpReminders` record to avoid duplicates

### Booking Status Definitions
| Status | Meaning |
|---|---|
| Pending | Slot held, waiting for patient to submit proof (10 min timer) |
| ProofSubmitted | Proof submitted, waiting for admin/staff to verify (1 hour window) |
| Confirmed | Payment verified (or PayAtClinic) — appointment is reserved |
| OnHold | Admin/staff did not act within 1 hour — needs manual resolution |
| Cancelled | Proof rejected, or patient/admin cancelled |
| Completed | Appointment done, marked by staff or doctor |
| Expired | Patient did not submit proof within 10 minutes — slot released |
| NoShow | Patient did not appear for a Confirmed appointment |
| Rescheduled | Booking was moved to a new date/time (original record kept, new booking created) |

### Payment Status (separate from Booking Status)
| PaymentStatus | Meaning |
|---|---|
| Unpaid | Pay at Clinic booking — payment not yet collected by staff |
| Paid | Cash collected by staff, or online payment verified |
| Waived | Admin waived the consultation fee |
| Refunded | Payment was returned to the patient (manual) |

- Online bookings: PaymentStatus = Paid when Admin/Staff confirms proof
- PayAtClinic bookings: PaymentStatus starts as Unpaid; Staff sets to Paid when cash is collected
- If patient leaves without paying → booking can be Completed with PaymentStatus = Unpaid (flagged on dashboard)
- Admin can pull a report of all Completed bookings with PaymentStatus = Unpaid

### Waived Payment Flow
- Only Admin can waive a consultation fee
- When marking as Waived, Admin must provide a `WaivedReason` (required, free text)
- A receipt is still generated with amount = ₱0 and "Waived" label
- The waiver is logged in AuditLogs: who waived, when, and the reason
- `WaivedByUserId` and `WaivedAt` stored in the `Payments` table

### Refund Flow
- Only Admin can mark a payment as Refunded
- When marking as Refunded, Admin must provide a `RefundReason` (required, free text)
- Stored fields: `RefundedAt`, `RefundedByUserId`, `RefundReason` in the `Payments` table
- Logged in AuditLogs
- No automatic refund integration — manual process only
- Patient is notified when refund is marked

### Payment Mode (two levels of control)
1. **Clinic-level default** — Admin sets clinic-wide default in ClinicSettings (`IsPayAtClinicMode`)
2. **Per-booking override** — Staff can override when creating a walk-in booking. Online patients follow the clinic default.

### Fee Computation (TotalFee)
- `TotalFee` on a booking = `Doctor.ConsultationFee` + `Service.Price` IF the service selected is a Procedure, Laboratory, or Diagnostic category
- If the service selected is a **Consultation** category, `TotalFee` = `Doctor.ConsultationFee` only (the service price is the same as the consultation fee — no double charging)
- The rule: **Consultation category services are included in the doctor's fee. All other service categories are additive.**
- `TotalFee` is computed and locked at the time of booking creation; changing service prices afterward does not retroactively affect existing bookings
- `TotalFee` breakdown is shown to the patient during booking (e.g. "Consultation Fee: ₱500 + CBC: ₱300 = ₱800")

### Queue Numbers
- Each Confirmed booking is assigned a `QueueNumber` — auto-incremented per doctor per day
- Queue numbers reset to 1 each new day per doctor
- Queue number is shown to the patient in their booking confirmation and reminder notifications
- Example: _"You are #7 for Dr. Santos today — your appointment is at 10:00 AM"_
- On reschedule: a new queue number is assigned for the new date/doctor; the old queue number is released

### Cancellation by Patient
- Patient can cancel if status is Pending or Confirmed
- If payment was already confirmed → Refund = Pending (processed manually by admin; PaymentStatus → Refunded)
- Admin sets cancellation deadline (e.g. must cancel at least 24 hours before)
- No automatic refund integration

### Booking Timers
- **10 minutes** — booking creation to proof submission deadline → Expired
- **1 hour** — proof submission to admin/staff verification deadline → On Hold

### Doctor Running Late / Unavailable Today
- Doctor or Staff can flag a doctor as running late or unavailable for a specific date
- **RunningLate**: estimated delay in minutes shown as a banner on the public portal
- **Unavailable Today**: all slots for that doctor on that date are immediately closed to new bookings; existing confirmed bookings are NOT auto-cancelled — staff must handle manually
- Both flags are stored in `DoctorDayStatuses`
- Doctor can set these flags themselves from their own dashboard
- Staff can set or clear these flags for any doctor
- Informational only for RunningLate — does not block or cancel bookings

### Reviews
- One review per patient per doctor per completed visit (enforced via unique constraint on `BookingId`)
- Patient can only review after booking status = Completed
- Patient can edit their own review
- No time limit to submit a review after completion
- Admin can delete any review

---

## RECEIPTS & DOCUMENT GENERATION

### Payment Receipt (OR)
- Generated automatically when a booking is **Confirmed** (online) or when **PaymentStatus is marked Paid** (walk-in)
- OR Number format: `OR-2025-00001` — auto-incremented per clinic, resets never
- OR Number stored in `Payments` table
- Receipt contains: OR number, patient name, doctor, service, fee breakdown (ConsultationFee + service fee if applicable), appointment date/time, amount paid, payment method, queue number, clinic branding
- Receipt PDF stored to `GeneratedDocuments` table (`DocumentType = PaymentReceipt`)
- Receipt URL stored in `Bookings.ReceiptUrl`
- Delivered via: email to patient + downloadable in patient portal

### Visit Summary Receipt
- Generated automatically when a booking is marked **Completed**
- Triggered by: `PUT /api/v1/bookings/{id}/complete`
- Contains: patient name, doctor, consultation date, chief complaint, diagnosis summary, prescription summary, next follow-up date, amount paid, OR number, clinic branding
- PDF stored to `GeneratedDocuments` table (`DocumentType = VisitSummary`)
- Visit Summary URL stored in `Consultations.VisitSummaryUrl`
- Delivered via: email to patient + downloadable in patient portal

### Other Generated Documents (on demand)
All documents use clinic branding (logo, name, address, configurable header/footer):

| Document | DocumentType Enum | Who Can Generate |
|---|---|---|
| Prescription | Prescription | Doctor, Admin |
| Medical Certificate | MedCert | Doctor, Admin |
| Referral Letter | Referral | Doctor, Admin |
| Patient Visit Summary | VisitSummary | Doctor, Staff, Admin |
| Lab Result Report | LabReport | Doctor, Staff, Admin |
| Payment Receipt | PaymentReceipt | System (auto) |

- All generated documents are automatically saved to the patient's `GeneratedDocuments` and linked to `PatientAttachments`

---

## PATIENT PORTAL

The patient portal is a dedicated view for authenticated patients. Pages:

| Page | Description |
|---|---|
| My Bookings | All bookings (upcoming + history), with status, queue number, and cancel option |
| My Medical Records | Read-only view of consultations, diagnoses, vitals trend charts |
| My Prescriptions | List of prescriptions with status; download PDF per prescription |
| My Receipts | List of payment receipts and visit summaries; download PDF |
| My Profile | Editable: name, contact number, address, emergency contact, blood type, PhilHealth, HMO |

- Patients cannot edit: DOB, sex, PatientCode
- Patients can update their password from their profile
- Patients can link/unlink Google or Facebook from their account

---

## PAYMENT

- **Methods:** GCash, Maya, Bank Transfer, Pay at Clinic
- **Manual flow** — admin sets up QR codes and account details in settings; no Xendit, no PayMongo
- Patient pays on their own app, submits proof, admin verifies manually
- Unpaid Pay at Clinic bookings tracked via `PaymentStatus = Unpaid` and flagged on Admin dashboard

---

## MEDICAL RECORDS SYSTEM

### Patient Profile
Each patient has a profile showing:
- Personal information
- Allergy alerts (displayed prominently with a warning badge)
- Active diagnoses and known conditions
- Visit history (all past consultations)
- Active prescriptions
- Upcoming appointments
- Attached documents (lab results, X-rays, referral letters, etc.)
- Vaccination history

### Consultation Records
- Each patient visit creates a Consultation Record, linked to the booking
- A consultation record contains:
  - Date and time, attending doctor
  - Chief complaint
  - History of present illness (HPI)
  - Vital signs: BP, HR, RR, temperature, O2 sat, weight, height, BMI (auto-computed)
  - Physical examination findings by system: General, HEENT, Chest, Abdomen, Extremities, Neurological
  - Assessment / Diagnosis (ICD-10 coded or free text)
  - Plan (treatment, advice, referrals)
  - Follow-up date (optional; if set, triggers the Follow-Up Reminder flow)
- Consultation records **lock after 24 hours** — edits after that are tracked as amendments
- Amendment log records: field name, old value, new value, who changed it, when, reason

### Prescriptions
- Doctor creates a prescription per consultation (or standalone)
- Contains: prescription date, patient details (auto-filled), medication list, doctor license/PTR/S2 numbers, digital signature placeholder
- Each medication line: generic name, brand name (optional), dosage form, strength, quantity, sig/instructions
- Prescription status: Active, Filled, Expired (auto after 30 days), Cancelled
- Only the prescribing doctor or Admin can cancel
- Downloadable as branded PDF

### Diagnoses & ICD-10 Coding
- Doctors add diagnoses per consultation via ICD-10 lookup (searchable, seeded in DB)
- Each diagnosis: ICD-10 code, description, type (Primary / Secondary / Comorbidity)
- Active diagnoses shown on the patient profile

### Allergy & Medication Alert
- Staff or Doctor adds allergy entries per patient
- Each allergy: allergen name, type (Drug / Food / Environmental / Other), severity (Mild / Moderate / Severe), reaction description
- When a doctor prescribes a drug matching an allergy → system shows a **warning** (not a hard block)

### Lab Results & Attachments
- Staff or Doctor attaches lab results or documents to a patient record
- Each attachment: type (CBC / Urinalysis / X-Ray / ECG / Ultrasound / Other), date taken, remarks, file upload (image or PDF)
- Doctor can add interpretation notes per result
- Files stored via Cloudinary
- Visible to patient via the patient portal

### Vaccination Records
- Staff logs vaccinations given at the clinic
- Each entry: vaccine name, brand, dose number, lot number, date given, administered by, next dose date
- System sends reminder to patient when next dose date is approaching (if enabled in ClinicSettings)

### Vital Signs Tracking
- Each consultation logs vital signs
- Vitals are viewable as a trend chart per patient over time (BP trend, weight trend, etc.)

---

## ACCESS CONTROL

### Booking Module
| Action | Admin | Staff | Doctor | Patient |
|---|---|---|---|---|
| View all bookings | ✅ | ✅ | ✅ (own patients) | ✅ (own only) |
| Create booking (online flow) | ✅ | ✅ | ❌ | ✅ |
| Create walk-in booking | ✅ | ✅ | ❌ | ❌ |
| Register walk-in patient (guest/full) | ✅ | ✅ | ❌ | ❌ |
| Override payment mode per booking | ✅ | ✅ | ❌ | ❌ |
| Mark PaymentStatus as Paid | ✅ | ✅ | ❌ | ❌ |
| Confirm / reject booking | ✅ | ✅ | ❌ | ❌ |
| Cancel booking | ✅ | ✅ | ❌ | ✅ (own, within deadline) |
| Reschedule booking | ✅ | ✅ | ❌ | ❌ |
| Mark complete / no show | ✅ | ✅ | ✅ | ❌ |
| Set doctor running late / unavailable flag | ✅ | ✅ | ✅ (own only) | ❌ |
| View unpaid completed bookings report | ✅ | ✅ | ❌ | ❌ |
| Manage payment settings | ✅ | ❌ | ❌ | ❌ |
| Waive payment | ✅ | ❌ | ❌ | ❌ |
| Mark payment as Refunded | ✅ | ❌ | ❌ | ❌ |
| Submit payment proof | ❌ | ❌ | ❌ | ✅ (own) |
| Download payment receipt | ✅ | ✅ | ❌ | ✅ (own) |

### Doctor Settings Module
| Action | Admin | Doctor |
|---|---|---|
| Create doctor account | ✅ | ❌ |
| Set doctor status (Active/Inactive/OnLeave) | ✅ | ❌ |
| Edit doctor profile (name, bio, photo, license numbers) | ✅ | ✅ (own) |
| Set consultation fee | ✅ | ✅ (own) |
| Set daily patient limit | ✅ | ✅ (own) |
| Set slot duration and capacity | ✅ | ✅ (own) |
| Set weekly schedule | ✅ | ✅ (own) |
| Add/remove blocked dates | ✅ | ✅ (own) |
| Set today's availability (Running Late / Unavailable) | ✅ | ✅ (own) |
| Block clinic-wide holidays (all doctors) | ✅ | ❌ |

### Service / Lab Management Module
| Action | Admin | Doctor | Staff | Patient |
|---|---|---|---|---|
| Add / edit / delete services (all categories) | ✅ | ❌ | ❌ | ❌ |
| Link a service to a doctor | ✅ | ❌ | ❌ | ❌ |
| View services | ✅ | ✅ | ✅ | ✅ (public) |

### Medical Records Module
| Action | Admin | Doctor | Staff | Patient |
|---|---|---|---|---|
| View patient list | ✅ | ✅ (own patients only) | ✅ | ❌ |
| View patient profile | ✅ | ✅ (own patients) | ✅ | ✅ (own only) |
| Create consultation | ✅ | ✅ | ❌ | ❌ |
| Edit consultation (within 24 hrs) | ✅ | ✅ (own) | ❌ | ❌ |
| Amend consultation (after 24 hrs) | ✅ | ✅ (own, logged) | ❌ | ❌ |
| Create prescription | ✅ | ✅ | ❌ | ❌ |
| Attach lab result | ✅ | ✅ | ✅ | ❌ |
| Log vaccination | ✅ | ✅ | ✅ | ❌ |
| Add allergy | ✅ | ✅ | ✅ | ❌ |
| Generate PDF documents | ✅ | ✅ | ✅ | ❌ |
| Download own prescriptions (PDF) | ❌ | ❌ | ❌ | ✅ |
| Download own visit summaries | ❌ | ❌ | ❌ | ✅ |
| Delete any record | ✅ | ❌ | ❌ | ❌ |
| View audit log | ✅ | ❌ | ❌ | ❌ |

### Reviews Module
| Action | Admin | Doctor | Staff | Patient |
|---|---|---|---|---|
| View reviews (public) | ✅ | ✅ | ✅ | ✅ |
| Submit review | ❌ | ❌ | ❌ | ✅ (Completed booking only, one per visit) |
| Edit own review | ❌ | ❌ | ❌ | ✅ |
| Delete review | ✅ | ❌ | ❌ | ✅ (own) |

### Admin Management Module
| Action | Primary Admin | Admin | Staff | Doctor |
|---|---|---|---|---|
| Create additional Admin accounts | ✅ | ❌ | ❌ | ❌ |
| Deactivate Admin accounts | ✅ | ❌ | ❌ | ❌ |
| Manage Staff accounts | ✅ | ✅ | ❌ | ❌ |
| View audit log | ✅ | ✅ | ❌ | ❌ |

---

## AUDIT TRAIL

All create, update, and delete actions on the following are logged:
- Medical records (consultations, prescriptions, diagnoses, allergies, attachments, vaccinations)
- Bookings (confirmations, cancellations, reschedules, completions, no-shows, status changes)
- Payments (verified, waived, refunded — includes reason and who acted)
- Doctor settings changes (consultation fee, schedule, daily limit)
- Admin/Staff account management actions
- Patient data privacy consent

Each log entry records:
- Who (user ID + name + role)
- What (entity type + entity ID)
- What changed (old value → new value as JSON)
- When (timestamp + IP address)
- Audit log is read-only, cannot be deleted
- Admin can filter by patient, user, entity type, or date range

---

## NOTIFICATIONS

Notifications are delivered via three channels simultaneously:
- **In-app** — bell icon / notification feed (written to Notifications table)
- **Email** — via SMTP
- **Push** — via Firebase FCM (free tier)

Delivery is fire-and-forget using `Task.Run`. The API never waits for delivery before responding. Failures are logged but not retried.

### Notification Triggers
| Event | Who Gets Notified |
|---|---|
| New booking created | Admin + Staff |
| Payment proof submitted | Admin + Staff |
| Booking confirmed | Patient (includes Queue Number) |
| Booking rejected / cancelled | Patient |
| Booking expired (10 min) | Patient |
| Booking on hold | Admin |
| Booking rescheduled | Patient (new date, time, queue number) |
| Payment receipt generated | Patient (email with PDF attachment) |
| Appointment reminder (24 hrs before) | Patient (includes Queue Number) |
| Appointment reminder (1 hr before) | Patient (includes Queue Number) |
| Follow-up reminder (3 days before follow-up date) | Patient (includes booking link) |
| Follow-up reminder (1 day before, if not yet booked) | Patient |
| Booking marked as No Show | Patient |
| Refund marked as processed | Patient |
| Payment waived | Patient |
| Visit summary generated (on completion) | Patient (email with PDF attachment) |
| Vaccination next dose approaching (7 days) | Patient |
| New staff account created | Staff (invite email with set-password link) |
| New doctor account created | Doctor (invite email with set-password link) |
| Doctor running late flag set | Portal banner only — no push/email |
| Doctor unavailable today flag set | Portal banner + in-app to Admin/Staff |
| Completed booking with PaymentStatus = Unpaid | Admin + Staff (daily summary) |

---

## DASHBOARDS

### Admin / Staff Dashboard
- Total appointments today and this month
- Total revenue today and this month (PaymentStatus = Paid only)
- Pending payment verifications (awaiting action)
- On hold bookings (requires attention)
- Unpaid completed visits today (PaymentStatus = Unpaid, Status = Completed) — collection alert
- No show count today
- Today's appointment list (filterable by doctor, shows QueueNumber + PaymentStatus)
- Most booked doctor and most booked service
- Total patients registered / new this month
- Total consultations today and this month
- Active prescriptions count
- Upcoming vaccination reminders (next dose within 7 days)
- Upcoming follow-up dates not yet booked (within next 7 days)
- Booking calendar (monthly view, all doctors)
- Doctor running late / unavailable flags (active today)

### Doctor Dashboard
- Today's appointments (queue number, time, patient name, service, status)
- Upcoming appointments this week
- Total patients seen this month
- Calendar view of own schedule
- **My Settings panel**: edit consultation fee, daily patient limit, slot duration, slot capacity, weekly schedule, blocked dates, today's availability

---

## DATABASE TABLES

### Users
- Id, FullName, Email, PasswordHash, Provider (Local/Google/Facebook), ProviderId
- Role (Admin / Staff / Doctor / Patient)
- **IsPrimaryAdmin** (bool, default false — only one per deployment)
- AvatarUrl, IsEmailVerified, EmailVerificationToken
- PasswordResetToken, PasswordResetExpiresAt
- RefreshToken, RefreshTokenExpiresAt
- FailedLoginAttempts (int, default 0)
- LockoutUntil (datetime, nullable)
- IsFirstLogin (bool, default true — for Admin-created accounts; forces password change)
- InviteToken (string, nullable)
- InviteTokenExpiresAt (datetime, nullable)
- CreatedAt, UpdatedAt, IsDeleted, DeletedAt

### Doctors
- Id, UserId (FK → Users), FullName, Specialization, Bio
- ProfilePhotoUrl, LicenseNumber, PTRNumber, S2Number
- **ConsultationFee** (decimal — set by Doctor)
- **SlotDurationMinutes** (int — set by Doctor)
- **SlotCapacity** (int — set by Doctor)
- **DailyPatientLimit** (int, nullable — null = no limit, set by Doctor)
- Status (Active / Inactive / OnLeave — set by Admin)
- CreatedAt, UpdatedAt, IsDeleted, DeletedAt

### Services
- Id, Name, Description, EstimatedDurationMinutes, Price
- **Category** (Consultation / Procedure / Laboratory / Diagnostic)
- CreatedAt, UpdatedAt, IsDeleted, DeletedAt

### DoctorServices (many-to-many)
- Id, DoctorId, ServiceId, CreatedAt

### DoctorSchedules
- Id, DoctorId, DayOfWeek (0–6), StartTime, EndTime, IsActive
- **SetByUserId** (FK → Users — tracks whether Admin or Doctor last set this)
- CreatedAt, UpdatedAt

### DoctorBlockedDates
- Id, DoctorId, BlockedDate, Reason
- **BlockedByUserId** (FK → Users — Admin or Doctor)
- **IsClinicHoliday** (bool — true if Admin blocked for all doctors)
- CreatedAt

### DoctorDayStatuses
- Id, DoctorId, StatusDate
- RunningLate (bool), EstimatedDelayMinutes (int, nullable)
- **UnavailableToday** (bool, default false)
- SetByUserId (FK → Users), CreatedAt, UpdatedAt
- One record per Doctor per Date

### Patients
- Id, PatientCode (auto-generated, e.g. PT-2025-00001)
- FirstName, MiddleName, LastName, DateOfBirth, Sex, CivilStatus
- Address, City, ZipCode, ContactNumber, Email
- EmergencyContactName, EmergencyContactNumber, EmergencyContactRelationship
- BloodType, PhilHealthNumber, HMOProvider, HMOCardNumber
- UserId (FK → Users, nullable)
- IsGuest (bool)
- **ConsentedAt** (datetime, nullable — timestamp of data privacy consent)
- **ConsentVersion** (string, nullable — e.g. "v1.0")
- CreatedAt, UpdatedAt, IsDeleted, DeletedAt

### Announcements
- Id, Title, Body, ImageUrl, IsActive, CreatedAt, UpdatedAt

### Bookings
- Id, PatientId (FK → Patients), DoctorId, ServiceId
- AppointmentDate, SlotStartTime, SlotEndTime
- Status (Pending / ProofSubmitted / Confirmed / OnHold / Cancelled / Completed / Expired / NoShow / Rescheduled)
- PaymentStatus (Unpaid / Paid / Waived / Refunded)
- PaymentMode (Online / PayAtClinic)
- QueueNumber (int — assigned on Confirmed, per doctor per day)
- IsWalkIn (bool)
- ReminderSent24hr (bool, default false)
- ReminderSent1hr (bool, default false)
- ReceiptUrl (string, nullable)
- **TotalFee** (decimal — locked at booking creation time)
- **ConsultationFeeSnapshot** (decimal — doctor's fee at time of booking)
- **ServiceFeeSnapshot** (decimal — service price at time of booking)
- ProofType (ReferenceNumber / Screenshot / null), ProofValue, ProofSubmittedAt
- CancellationReason, Notes
- **RescheduledFromBookingId** (FK → Bookings, nullable — links to original booking if rescheduled)
- RowVersion (concurrency token)
- CreatedAt, UpdatedAt, IsDeleted, DeletedAt

### Payments
- Id, BookingId, Amount, PaymentMethod (GCash / Maya / BankTransfer / PayAtClinic)
- ReferenceNumber, ProofImageUrl
- Status (Pending / Verified / Rejected / Refunded / Waived)
- ORNumber (string, nullable — e.g. OR-2025-00001)
- ORSequence (int — auto-incremented globally per clinic instance)
- VerifiedByUserId, VerifiedAt
- **WaivedByUserId** (FK → Users, nullable)
- **WaivedAt** (datetime, nullable)
- **WaivedReason** (string, nullable)
- **RefundedByUserId** (FK → Users, nullable)
- **RefundedAt** (datetime, nullable)
- **RefundReason** (string, nullable)
- CreatedAt, UpdatedAt

### PaymentSettings
- Id, GCashQrImageUrl, GCashAccountName, GCashNumber
- MayaQrImageUrl, MayaAccountName, MayaNumber
- BankName, BankAccountName, BankAccountNumber
- IsPayAtClinicMode (bool)
- UpdatedAt

### Reviews
- Id, PatientId, DoctorId, BookingId (UNIQUE), Rating (1–5), Comment
- CreatedAt, UpdatedAt, IsDeleted, DeletedAt

### Consultations
- Id, PatientId, DoctorId, BookingId (nullable)
- ConsultationDate, ConsultationTime
- ChiefComplaint, HistoryOfPresentIllness
- PEGeneralFindings, PEHEENTFindings, PEChestFindings, PEAbdomenFindings
- PEExtremitiesFindings, PENeurologicalFindings
- Assessment, Plan, FollowUpDate (nullable)
- IsLocked (bool)
- VisitSummaryUrl (string, nullable)
- CreatedAt, UpdatedAt, IsDeleted, DeletedAt

### ConsultationAmendments
- Id, ConsultationId, FieldName, OldValue, NewValue
- AmendedByUserId, AmendedAt, Reason

### FollowUpReminders
- Id, ConsultationId, PatientId, DoctorId
- FollowUpDate
- ReminderSent3Day (bool, default false)
- ReminderSent1Day (bool, default false)
- IsBookedByPatient (bool, default false — set to true if patient books a new appointment after the reminder)
- CreatedAt

### VitalSigns
- Id, ConsultationId, PatientId
- BloodPressureSystolic, BloodPressureDiastolic, HeartRate, RespiratoryRate
- Temperature, OxygenSaturation, Weight, Height, BMI (computed)
- CreatedAt

### Diagnoses
- Id, ConsultationId, PatientId
- ICD10Code, ICD10Description
- DiagnosisType (Primary / Secondary / Comorbidity)
- IsActive, ResolvedDate
- CreatedAt, UpdatedAt

### ICD10Codes (seeded lookup table)
- Id, Code, Description, Category

### Prescriptions
- Id, ConsultationId (nullable), PatientId, DoctorId
- PrescriptionDate, Status (Active / Filled / Expired / Cancelled), Notes
- CreatedAt, UpdatedAt, IsDeleted, DeletedAt

### PrescriptionItems
- Id, PrescriptionId
- GenericName, BrandName, DosageForm, Strength, Quantity, Sig
- IsControlledSubstance

### Allergies
- Id, PatientId
- AllergenName, AllergenType (Drug / Food / Environmental / Other)
- Severity (Mild / Moderate / Severe), ReactionDescription
- CreatedAt, UpdatedAt, IsDeleted, DeletedAt

### PatientAttachments
- Id, PatientId, ConsultationId (nullable)
- AttachmentType (CBC / Urinalysis / XRay / ECG / Ultrasound / ReferralLetter / MedCert / VisitSummary / PaymentReceipt / Other)
- FileName, FileUrl, MimeType, FileSizeBytes
- DateTaken, Remarks, InterpretationNotes, UploadedByUserId
- CreatedAt, UpdatedAt, IsDeleted, DeletedAt

### VaccinationRecords
- Id, PatientId, VaccineName, BrandName, DoseNumber, LotNumber
- DateAdministered, AdministeredByUserId, NextDoseDate, NextDoseReminderSent
- CreatedAt, UpdatedAt, IsDeleted, DeletedAt

### GeneratedDocuments
- Id, PatientId, ConsultationId (nullable), BookingId (nullable)
- DocumentType (Prescription / MedCert / Referral / VisitSummary / LabReport / PaymentReceipt)
- FileUrl, GeneratedByUserId, CreatedAt

### AuditLogs
- Id, EntityType, EntityId, Action (Create / Update / Delete / Waive / Refund / Reschedule / Verify / Cancel)
- OldValues (JSON), NewValues (JSON)
- PerformedByUserId, PerformedByName, PerformedByRole, PerformedAt, IPAddress

### Notifications
- Id, UserId, Title, Message, IsRead, CreatedAt

### StaffAccounts
- Id, UserId, AddedByAdminId, IsActive, CreatedAt

### ClinicSettings
- Id, ClinicName, LogoUrl, PrimaryColor, SecondaryColor
- Address, Phone, Email, FacebookUrl, InstagramUrl, LicenseNumber
- **OperatingHours** (JSON — e.g. `{ "Mon": "8:00 AM – 6:00 PM", "Sat": "8:00 AM – 12:00 PM", "Sun": "Closed" }`)
- CancellationDeadlineHours
- PatientPortalEnabled (bool)
- VaccinationReminderEnabled (bool)
- **FollowUpReminderEnabled** (bool, default true)
- IsPayAtClinicMode (bool)
- PayAtClinicNoShowWindowMinutes (int, default 60)
- DocumentHeaderHtml, DocumentFooterHtml
- **PrivacyPolicyText** (text — displayed to patients on registration/consent prompt)
- **ConsentVersion** (string — increment when privacy policy is updated, e.g. "v1.0", "v1.1")
- UpdatedAt

---

## API ENDPOINTS

### Auth
```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/google
POST   /api/v1/auth/facebook
POST   /api/v1/auth/refresh
POST   /api/v1/auth/verify-email
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password
POST   /api/v1/auth/logout
POST   /api/v1/auth/set-password          — for Admin-created accounts (invite token)
POST   /api/v1/auth/resend-invite         — Admin only
```

### Doctors
```
GET    /api/v1/doctors                                          — public
GET    /api/v1/doctors/{id}                                    — public
GET    /api/v1/doctors/{id}/availability                       — public
POST   /api/v1/doctors                                          — Admin
PUT    /api/v1/doctors/{id}/status                             — Admin (Active/Inactive/OnLeave)
PUT    /api/v1/doctors/{id}/profile                            — Admin | Doctor (own)
PUT    /api/v1/doctors/{id}/consultation-settings              — Admin | Doctor (own)
        Body: { consultationFee, dailyPatientLimit, slotDurationMinutes, slotCapacity }
DELETE /api/v1/doctors/{id}                                    — Admin
POST   /api/v1/doctors/{id}/schedule                           — Admin | Doctor (own)
PUT    /api/v1/doctors/{id}/schedule/{schedId}                 — Admin | Doctor (own)
DELETE /api/v1/doctors/{id}/schedule/{schedId}                 — Admin | Doctor (own)
POST   /api/v1/doctors/{id}/blocked-dates                      — Admin | Doctor (own)
DELETE /api/v1/doctors/{id}/blocked-dates/{dateId}             — Admin | Doctor (own)
GET    /api/v1/doctors/{id}/day-status                         — Admin | Staff | Doctor (own)
PUT    /api/v1/doctors/{id}/day-status                         — Admin | Staff | Doctor (own)
POST   /api/v1/doctors/clinic-holiday                          — Admin (blocks all doctors for a date)
```

### Services
```
GET    /api/v1/services                                         — public
GET    /api/v1/services?category=Laboratory                    — public (filter by category)
POST   /api/v1/services                                         — Admin
PUT    /api/v1/services/{id}                                   — Admin
DELETE /api/v1/services/{id}                                   — Admin
```

### Bookings
```
GET    /api/v1/bookings                                         — Patient: own | Admin/Staff/Doctor: all
GET    /api/v1/bookings/{id}                                   — Patient (own) | Admin | Staff | Doctor
POST   /api/v1/bookings                                         — Patient
POST   /api/v1/bookings/walk-in                                — Admin | Staff
POST   /api/v1/bookings/{id}/proof                             — Patient
PUT    /api/v1/bookings/{id}/confirm                           — Admin | Staff
PUT    /api/v1/bookings/{id}/reject                            — Admin | Staff
PUT    /api/v1/bookings/{id}/cancel                            — Patient (within deadline) | Admin | Staff
PUT    /api/v1/bookings/{id}/reschedule                        — Admin | Staff
PUT    /api/v1/bookings/{id}/complete                          — Admin | Staff | Doctor
PUT    /api/v1/bookings/{id}/no-show                           — Admin | Staff
PUT    /api/v1/bookings/{id}/resolve-hold                      — Admin | Staff
PUT    /api/v1/bookings/{id}/refund                            — Admin
PUT    /api/v1/bookings/{id}/waive                             — Admin
PUT    /api/v1/bookings/{id}/mark-paid                         — Admin | Staff
GET    /api/v1/bookings/unpaid-report                          — Admin | Staff
GET    /api/v1/bookings/{id}/receipt                           — Admin | Staff | Patient (own)
```

### Payments
```
GET    /api/v1/payments/settings                                — public
PUT    /api/v1/payments/settings                                — Admin
```

### Patients
```
GET    /api/v1/patients                                         — Admin | Staff | Doctor
GET    /api/v1/patients/{id}                                   — Admin | Staff | Doctor | Patient (own)
POST   /api/v1/patients                                         — Admin | Staff
POST   /api/v1/patients/guest                                  — Admin | Staff
PUT    /api/v1/patients/{id}                                   — Admin | Staff
DELETE /api/v1/patients/{id}                                   — Admin
GET    /api/v1/patients/{id}/timeline                          — Admin | Doctor | Staff
GET    /api/v1/patients/search?q=                              — Admin | Staff
PUT    /api/v1/patients/{id}/profile                           — Patient (own profile fields only)
POST   /api/v1/patients/merge                                  — Admin
```

### Consultations
```
GET    /api/v1/patients/{patientId}/consultations
GET    /api/v1/patients/{patientId}/consultations/{id}
POST   /api/v1/patients/{patientId}/consultations              — Doctor | Admin
PUT    /api/v1/patients/{patientId}/consultations/{id}         — Doctor (own, within 24 hrs) | Admin
POST   /api/v1/patients/{patientId}/consultations/{id}/amend   — Doctor (own) | Admin
DELETE /api/v1/patients/{patientId}/consultations/{id}         — Admin
```

### Vital Signs
```
GET    /api/v1/patients/{patientId}/vitals                     — Admin | Doctor | Staff | Patient (own)
POST   /api/v1/patients/{patientId}/vitals                     — Doctor | Staff | Admin
```

### Diagnoses
```
GET    /api/v1/patients/{patientId}/diagnoses
POST   /api/v1/patients/{patientId}/diagnoses                  — Doctor | Admin
PUT    /api/v1/patients/{patientId}/diagnoses/{id}             — Doctor | Admin
DELETE /api/v1/patients/{patientId}/diagnoses/{id}             — Admin
GET    /api/v1/icd10/search?q=                                  — authenticated
```

### Prescriptions
```
GET    /api/v1/patients/{patientId}/prescriptions
GET    /api/v1/patients/{patientId}/prescriptions/{id}
POST   /api/v1/patients/{patientId}/prescriptions              — Doctor | Admin
PUT    /api/v1/patients/{patientId}/prescriptions/{id}/cancel  — Doctor (own) | Admin
GET    /api/v1/patients/{patientId}/prescriptions/{id}/pdf     — Doctor | Admin | Staff | Patient (own)
```

### Allergies
```
GET    /api/v1/patients/{patientId}/allergies
POST   /api/v1/patients/{patientId}/allergies                  — Doctor | Staff | Admin
PUT    /api/v1/patients/{patientId}/allergies/{id}             — Doctor | Staff | Admin
DELETE /api/v1/patients/{patientId}/allergies/{id}             — Admin
```

### Attachments
```
GET    /api/v1/patients/{patientId}/attachments
POST   /api/v1/patients/{patientId}/attachments                — Doctor | Staff | Admin
PUT    /api/v1/patients/{patientId}/attachments/{id}           — Doctor | Staff | Admin
DELETE /api/v1/patients/{patientId}/attachments/{id}           — Admin
```

### Vaccinations
```
GET    /api/v1/patients/{patientId}/vaccinations
POST   /api/v1/patients/{patientId}/vaccinations               — Doctor | Staff | Admin
DELETE /api/v1/patients/{patientId}/vaccinations/{id}          — Admin
```

### Document Generation
```
POST   /api/v1/documents/prescription/{prescriptionId}         — Doctor | Admin | Staff
POST   /api/v1/documents/medical-certificate                   — Doctor | Admin
POST   /api/v1/documents/referral-letter                       — Doctor | Admin
POST   /api/v1/documents/visit-summary/{consultationId}        — Doctor | Admin | Staff
POST   /api/v1/documents/receipt/{bookingId}                   — System (auto) | Admin | Staff
```

### Reviews
```
GET    /api/v1/reviews/{doctorId}                              — public, paginated
POST   /api/v1/reviews                                          — Patient (Completed booking only)
PUT    /api/v1/reviews/{id}                                    — Patient (own)
DELETE /api/v1/reviews/{id}                                    — Patient (own) | Admin
```

### Announcements
```
GET    /api/v1/announcements                                    — public
POST   /api/v1/announcements                                   — Admin
PUT    /api/v1/announcements/{id}                              — Admin
DELETE /api/v1/announcements/{id}                              — Admin
```

### Notifications
```
GET    /api/v1/notifications                                    — authenticated user
PUT    /api/v1/notifications/{id}/read                         — authenticated user
PUT    /api/v1/notifications/read-all                          — authenticated user
```

### Staff
```
GET    /api/v1/staff                                            — Admin
POST   /api/v1/staff                                            — Admin
PUT    /api/v1/staff/{id}                                      — Admin
PUT    /api/v1/staff/me/profile                                — Staff (own: name, contact, password)
DELETE /api/v1/staff/{id}                                      — Admin
POST   /api/v1/staff/{id}/resend-invite                        — Admin
```

### Admin Accounts
```
GET    /api/v1/admins                                           — Primary Admin
POST   /api/v1/admins                                           — Primary Admin
PUT    /api/v1/admins/{id}/deactivate                          — Primary Admin
PUT    /api/v1/admins/me/profile                               — Admin (own: name, contact, password)
```

### Audit Logs
```
GET    /api/v1/audit-logs                                       — Admin
GET    /api/v1/audit-logs?entityType=Booking&patientId=&userId=&from=&to=
```

### Dashboards
```
GET    /api/v1/admin/dashboard                                  — Admin | Staff
GET    /api/v1/admin/bookings/calendar                         — Admin | Staff
GET    /api/v1/admin/reports/unpaid                            — Admin | Staff
GET    /api/v1/admin/reports/followups-pending                 — Admin | Staff
GET    /api/v1/doctor/dashboard                                — Doctor
```

### Settings
```
GET    /api/v1/settings                                         — public
PUT    /api/v1/settings                                         — Admin
PUT    /api/v1/settings/privacy-policy                         — Admin (updates PrivacyPolicyText + bumps ConsentVersion)
```

### Jobs (External Cron)
```
POST   /api/v1/jobs/run-reminders                              — X-Cron-Secret header only
```

---

## BOOKING CONCURRENCY SAFETY

- Booking creation → immediately set status to Pending and count toward slot occupancy AND daily count
- Slot availability queries exclude all non-Expired/Cancelled/Rescheduled bookings
- Overlap detection runs inside a **serializable database transaction**
- EF Core `RowVersion` concurrency token on Bookings table
- If slot count >= SlotCapacity → return `409 Conflict`
- If daily count >= DailyPatientLimit (when not null) → return `409 Conflict`
- Rescheduling runs in a single transaction: new slot claimed before old slot is released

---

## BACKGROUND JOBS (No Hangfire)

### Pattern 1 — Lazy Expiry (on query)
Shared `ResolveStaleBookings(doctorId, date)` method called at the top of any query returning booking or slot data.

| Condition | Action |
|---|---|
| Booking is `Pending` + `CreatedAt` older than 10 minutes | → set `Expired`, slot released |
| Booking is `ProofSubmitted` + `ProofSubmittedAt` older than 1 hour | → set `OnHold` |
| Booking is `Confirmed` + `PayAtClinic` + `PaymentStatus = Unpaid` + `SlotStartTime` past `PayAtClinicNoShowWindowMinutes` | → set `NoShow` |
| Consultation `IsLocked = false` + `CreatedAt` older than 24 hours | → set `IsLocked = true` on read |
| Prescription `Status = Active` + `PrescriptionDate` older than 30 days | → set `Expired` on read |

### Pattern 2 — External Cron (cron-job.org)
```
POST /api/v1/jobs/run-reminders
Header: X-Cron-Secret: {secret}
Schedule: every 30 minutes
```
- Sends 24hr appointment reminders (`ReminderSent24hr = false`)
- Sends 1hr appointment reminders (`ReminderSent1hr = false`)
- Sends follow-up reminders 3 days before `FollowUpDate` (`ReminderSent3Day = false`, if `FollowUpReminderEnabled = true`)
- Sends follow-up reminders 1 day before `FollowUpDate` if patient has not yet booked (`ReminderSent1Day = false`, `IsBookedByPatient = false`)
- Sends vaccination reminders (NextDoseDate within 7 days, `NextDoseReminderSent = false`)
- Sends daily unpaid summary to Admin + Staff

### Pattern 3 — Fire-and-Forget (Task.Run)
```csharp
_ = _notificationService.SendAsync(notification)
      .ContinueWith(t => _logger.LogError(t.Exception, "Notification failed"),
                    TaskContinuationOptions.OnlyOnFaulted);
```
API returns `200 OK` immediately. Failures are logged, not retried.

---

## SECURITY

- JWT access tokens (15 min) + refresh tokens (7 days, hashed in DB)
- BCrypt password hashing (work factor 12)
- HTTPS enforced
- Rate limiting on auth endpoints
- Account lockout: 5 failed attempts → 5-minute lockout
- EF Core parameterized queries only (no raw string SQL)
- Global exception middleware — never expose stack traces to client
- Sensitive fields (tokens, hashes) never returned in API responses
- FluentValidation on all endpoints
- All access to patient medical records logged in AuditLogs
- All booking and payment actions logged in AuditLogs
- Doctor cross-access automatic based on consultation history (not booking)
- File uploads validated by MIME type and size before storing to Cloudinary
- Doctor self-service endpoints enforce ownership — a doctor can only modify their own settings (validated by JWT claim, not just route parameter)
- Primary Admin flag (`IsPrimaryAdmin`) is immutable after seeding — cannot be changed via API

---

## CLEAN ARCHITECTURE LAYERS

```
ClinicSystem.Domain/          — Entities, Enums, Domain Events
ClinicSystem.Application/     — Use Cases (MediatR Commands/Queries), DTOs, Interfaces, Validators
ClinicSystem.Infrastructure/  — Email, Push, File Storage, OAuth, PDF Generation
ClinicSystem.Persistence/     — EF Core DbContext, Repositories, Migrations, Seeders
ClinicSystem.API/             — Controllers, Middleware, DI Registration, Program.cs
```

---

## SEED DATA

### Accounts
- Primary Admin: admin@clinic.ph / Admin@123456
- Admin 2: admin2@clinic.ph / Admin@123456
- Staff: staff@clinic.ph / Staff@123456
- Doctors: dr.santos@clinic.ph, dr.reyes@clinic.ph, dr.cruz@clinic.ph / Doctor@123456
- Patient: patient@clinic.ph / Patient@123456

### Sample Doctors
1. Dr. Maria Santos — General Practitioner — ₱500 consultation fee — Mon–Fri 8AM–5PM — 30-min slots — SlotCapacity 1 — DailyPatientLimit 10
2. Dr. Jose Reyes — Pediatrics — ₱600 consultation fee — Mon/Wed/Fri 9AM–4PM — 30-min slots — SlotCapacity 1 — DailyPatientLimit 8
3. Dr. Ana Cruz — OB-Gynecology — ₱700 consultation fee — Tue/Thu 8AM–3PM — 30-min slots — SlotCapacity 1 — DailyPatientLimit 8

### Sample Services
**Consultation**
1. General Consultation — ₱0 (fee covered by doctor's ConsultationFee) — 30 min
2. Pediatric Checkup — ₱0 — 30 min
3. Prenatal Checkup — ₱0 — 30 min

**Procedure**
4. Annual Physical Exam — ₱1,000 — 60 min (added to doctor's ConsultationFee)
5. Wound Dressing — ₱200 — 15 min

**Laboratory**
6. CBC — ₱350 — 15 min
7. Urinalysis — ₱150 — 15 min
8. Fasting Blood Sugar — ₱200 — 15 min

**Diagnostic**
9. Chest X-Ray — ₱500 — 20 min
10. Ultrasound (Abdominal) — ₱800 — 30 min

### Sample Patients (5)
PT-2025-00001 through PT-2025-00005 — IsGuest: false — ConsentedAt: seeded

### Sample Records Per Patient
- 2–3 past consultations with vital signs, diagnoses, and prescriptions
- 1 consultation with a FollowUpDate set (triggers FollowUpReminder record)
- 1–2 lab result attachments (placeholder files)
- 1 allergy entry
- 2 completed bookings per doctor (PaymentStatus = Paid, QueueNumber assigned, ORNumber assigned e.g. OR-2025-00001)
- 1 walk-in booking with PaymentStatus = Unpaid (demonstrates collection alert)
- 1 rescheduled booking (demonstrates reschedule flow)
- 1 waived booking (demonstrates waived payment with reason)
- 1 review per doctor
- Payment Receipt PDF generated for all Paid bookings
- Visit Summary PDF generated for all Completed bookings

### Clinic Settings (seeded)
- OperatingHours: Mon–Fri 8:00 AM – 6:00 PM, Sat 8:00 AM – 12:00 PM, Sun Closed
- ConsentVersion: v1.0
- FollowUpReminderEnabled: true
- VaccinationReminderEnabled: true

### ICD-10 Codes
- 500 common codes for General Practice, Pediatrics, and OB-Gyn

---

## WHAT IS NOT IN SCOPE

- Mobile app (web only)
- Automatic payment verification (GCash/Maya API)
- SMS notifications
- Telemedicine / video consultation
- Recurring / standing appointments
- Waitlist for fully booked slots
- Online refund processing
- PhilHealth electronic claims (eClaims API)
- Real digital signatures / PKI
- DICOM imaging / radiology viewer
- Inventory management
- Billing and invoicing module
- Insurance claims processing
- HIS integration
- Patient self-rescheduling (cancel + rebook only)
