# PHASE 10 — Settings, Reports & Polish

## Clinic Management System · Angular 17 + Ionic 7 + NgRx
### AI Implementation Prompt Document

---

## PHASE IDENTITY

| Field | Value |
|---|---|
| Phase Number | 10 of 10 |
| Phase Name | Settings, Reports & Polish |
| Portals Affected | Admin, Patient, Shared |
| Depends On | Phases 1–9 |
| Blocks | None — MVP completion phase |
| Estimated Complexity | High |
| Mock Data | Yes — NgRx + MockDataService only |
| Real API Calls | None |
| Git Tag | `v0.1.0-mvp` |

---

## GOAL

Finish the MVP by implementing remaining admin management modules and final polish:

- Clinic settings
- Reports
- Audit logs
- Waive/refund payment modals
- Notification panel
- Patient review submission
- 404 page
- Final responsive polish
- Empty states
- Skeleton loaders
- Final demo readiness checklist

This phase turns the app from “feature complete” into “demo ready.”

---

## DO NOT MODIFY

- Do not rewrite core architecture.
- Do not change completed route structure unless required for final wiring.
- Do not implement real payment verification.
- Do not implement real email/SMS/push notifications.
- Do not implement real PDF generation.
- Do not implement real Cloudinary upload.
- Do not add backend/API calls.

Allowed updates:

- Replace Admin settings/reports/audit-log stubs.
- Add admin-only waive/refund modals.
- Upgrade notification popover into full notification panel.
- Add patient review route/form.
- Add shared 404 page.
- Add polish classes/animations if missing.

---

## FILES TO CREATE / UPDATE

```txt
src/app/portals/admin/
├── settings/
│   ├── settings.page.ts
│   └── settings.page.scss
├── reports/
│   ├── reports.page.ts
│   └── reports.page.scss
├── audit-logs/
│   ├── audit-logs.page.ts
│   └── audit-logs.page.scss
├── services/
│   ├── admin-settings.service.ts
│   ├── admin-reports.service.ts
│   └── audit-log.service.ts
└── components/
    ├── waive-payment-modal/
    │   ├── waive-payment-modal.component.ts
    │   └── waive-payment-modal.component.scss
    ├── refund-payment-modal/
    │   ├── refund-payment-modal.component.ts
    │   └── refund-payment-modal.component.scss
    ├── operating-hours-editor/
    │   ├── operating-hours-editor.component.ts
    │   └── operating-hours-editor.component.scss
    └── color-picker/
        ├── color-picker.component.ts
        └── color-picker.component.scss

src/app/shared/components/
└── notification-panel/
    ├── notification-panel.component.ts
    └── notification-panel.component.scss

src/app/shared/pages/not-found/
├── not-found.page.ts
└── not-found.page.scss

src/app/portals/patient/
├── reviews/
│   ├── patient-reviews.page.ts
│   └── patient-reviews.page.scss
└── components/
    └── review-form/
        ├── review-form.component.ts
        └── review-form.component.scss
```

Update:

```txt
src/app/portals/admin/booking-detail/booking-detail.page.ts
src/app/portals/admin/components/notification-bell/notification-bell.component.ts
src/app/store/notifications/*
src/app/store/clinic-settings/*
src/app/store/bookings/*
src/app/core/services/mock-data.service.ts
src/app/app.routes.ts
```

---

## DETAILED IMPLEMENTATION PROMPT

Copy everything below and paste into your AI coding tool.

```txt
You are building Phase 10 (Settings, Reports & Polish) of the Clinic Management System.

Phases 1–9 are complete.

CRITICAL RULES:
1. Angular 17 standalone components only.
2. Ionic 7 components.
3. Use NgRx for settings, notifications, bookings updates where stores exist.
4. No HTTP calls.
5. No real upload.
6. No real payment gateway.
7. No real PDF generation.
8. No real email/SMS/FCM.
9. No `any` TypeScript types.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 1 — ADMIN SETTINGS SERVICE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create:

src/app/portals/admin/services/admin-settings.service.ts

Methods:
- getSettings(): Observable<ClinicSettings>
- updateSettings(settings: ClinicSettings): Observable<ClinicSettings>
- bumpConsentVersion(): Observable<ClinicSettings>

Behavior:
- Reads/writes mock ClinicSettings through MockDataService.
- Uses timer(400) for realistic loading.
- No HTTP.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 2 — ADMIN SETTINGS PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Replace Phase 5 settings stub:

src/app/portals/admin/settings/settings.page.ts
src/app/portals/admin/settings/settings.page.scss

Use tabs or IonSegment:

Tabs:
1. General
2. Operating Hours
3. Payments
4. Privacy & Consent
5. Branding

GENERAL:
- Clinic name required
- Logo upload UI only: show selected file name
- Address
- Phone
- Email
- Social media links

OPERATING HOURS:
- Use OperatingHoursEditorComponent.
- Days Monday–Sunday
- isOpen toggle
- openTime
- closeTime

PAYMENTS:
- PayAtClinic mode toggle
- Cancellation deadline hours
- GCash details
- Maya details
- Bank details
- Pay-at-clinic no-show window minutes

PRIVACY & CONSENT:
- Privacy policy textarea
- Current consent version
- "Bump Consent Version" button
- Confirmation modal before bumping version
- On bump, update clinic-settings store.
- Show warning that patients may be required to re-accept consent.

BRANDING:
- Primary color hex input
- Secondary color hex input
- Live swatch preview
- ColorPickerComponent
- Applying primary color updates CSS variable live in session:
  document.documentElement.style.setProperty('--ion-color-primary', value)

Save behavior:
- Validate required fields.
- Show skeleton while loading.
- Show toast: "Settings saved."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 3 — OPERATING HOURS EDITOR COMPONENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create:

src/app/portals/admin/components/operating-hours-editor/

Inputs:
@Input() hours!: OperatingHours;

Outputs:
@Output() hoursChange = new EventEmitter<OperatingHours>();

UI:
- One row per day
- Open/Closed toggle
- Open time input
- Close time input
- Closed days disable time inputs

Validation:
- If day is open, openTime and closeTime required.
- closeTime must be later than openTime.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 4 — COLOR PICKER COMPONENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create:

src/app/portals/admin/components/color-picker/

Inputs:
@Input() label = '';
@Input() value = '#1A6B4A';

Outputs:
@Output() valueChange = new EventEmitter<string>();

UI:
- Hex input
- Native color input
- Preview swatch

Validation:
- Must be valid hex color.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 5 — ADMIN REPORTS SERVICE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create:

src/app/portals/admin/services/admin-reports.service.ts

Methods:
- getUnpaidCompletedVisits(): Observable<UnpaidCompletedVisitReportRow[]>
- getPendingFollowUps(): Observable<PendingFollowUpReportRow[]>
- getDailyBookingSummary(): Observable<DailyBookingSummaryRow[]>

Data source:
- MockDataService only.

Report row interfaces may live in this service or core models.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 6 — ADMIN REPORTS PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Replace Phase 5 reports stub:

src/app/portals/admin/reports/reports.page.ts
src/app/portals/admin/reports/reports.page.scss

Sections:

1. Report header:
   - Title: "Reports"
   - Date range filters
   - Export CSV button mock

2. Unpaid completed visits:
   Table columns:
   - Booking ID
   - Patient
   - Doctor
   - Service
   - Visit date
   - Amount
   - Payment status
   - Action: View booking

3. Pending follow-ups:
   Table columns:
   - Patient
   - Doctor
   - Follow-up date
   - Reason
   - Status
   - Action: Send Reminder

4. Daily booking summary:
   Table columns:
   - Date
   - Total bookings
   - Completed
   - Cancelled
   - No-show
   - Revenue mock

Behaviors:
- Export CSV button shows toast: "CSV export coming soon."
- Send Reminder shows toast: "Reminder sent successfully." Mock only.
- Show skeleton loaders while loading.
- Empty states for no rows.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 7 — AUDIT LOG SERVICE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create:

src/app/portals/admin/services/audit-log.service.ts

Methods:
- getAuditLogs(): Observable<AuditLog[]>

AuditLog interface:
export interface AuditLog {
  id: string;
  entityType: 'Booking' | 'Patient' | 'Doctor' | 'Payment' | 'Settings' | 'Consultation';
  entityId: string;
  action: string;
  performedBy: string;
  performedAt: string;
  details?: string;
}

MockDataService:
- Add 20 audit log entries.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 8 — ADMIN AUDIT LOGS PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Replace Phase 5 audit logs stub:

src/app/portals/admin/audit-logs/audit-logs.page.ts
src/app/portals/admin/audit-logs/audit-logs.page.scss

Table columns:
- Date/time
- Entity type
- Entity ID
- Action
- Performed by
- Details

Filters:
- Entity type
- Date range
- Search action/performed by/entity ID

UI:
- Skeleton rows while loading.
- EmptyStateComponent if no records.
- Entity type badge.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 9 — WAIVE PAYMENT MODAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create:

src/app/portals/admin/components/waive-payment-modal/

Inputs:
@Input() booking!: Booking;

Outputs:
@Output() confirmed = new EventEmitter<{
  bookingId: string;
  reason: string;
}>();

Form:
- Reason textarea required
- Confirm button disabled until reason length >= 5
- Cancel button

On confirm:
- Emit bookingId + reason.
- Parent updates booking payment status to Waived.
- Parent adds audit log entry mock.
- Show toast: "Payment waived."

Admin-only:
- This modal must only appear in admin booking detail.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 10 — REFUND PAYMENT MODAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create:

src/app/portals/admin/components/refund-payment-modal/

Inputs:
@Input() booking!: Booking;

Outputs:
@Output() confirmed = new EventEmitter<{
  bookingId: string;
  reason: string;
}>();

Form:
- Reason textarea required
- Confirm button disabled until reason length >= 5
- Cancel button

On confirm:
- Emit bookingId + reason.
- Parent updates booking payment status to Refunded.
- Parent adds audit log entry mock.
- Show toast: "Payment refunded."

Admin-only.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 11 — UPDATE ADMIN BOOKING DETAIL ACTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Update:

src/app/portals/admin/booking-detail/booking-detail.page.ts

Add admin-only payment actions:

- Waive Payment
- Refund Payment

Rules:
- Waive available if payment status is Pending or Unpaid.
- Refund available if payment status is Paid.
- Both require reason modal.
- Both update NgRx/local mock state.
- Both add audit log entry.
- Staff portal must not show these buttons.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 12 — NOTIFICATION PANEL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create:

src/app/shared/components/notification-panel/

Update notification bell to use this full panel.

Notification panel:
- Width: 380px desktop
- Mobile: full-width sheet
- Header:
  - "Notifications"
  - "Mark all read" link
- List:
  - Last 10 notifications
  - Unread highlighted with green-50 background
  - Icon based on notification type
  - Title
  - Message
  - Time ago using date-fns
- Clicking notification:
  - mark one read
  - navigate to notification.navigateTo if present

NgRx notifications update:
- loadNotifications
- loadNotificationsSuccess
- markNotificationRead
- markAllNotificationsRead

Unread count badge must update immediately.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 13 — PATIENT REVIEW FORM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create:

src/app/portals/patient/components/review-form/
src/app/portals/patient/reviews/patient-reviews.page.ts
src/app/portals/patient/reviews/patient-reviews.page.scss

Route:
- /patient/reviews/:bookingId

Add to patient routes.

ReviewFormComponent:
- 5 interactive stars
- Comment textarea optional
- Submit button
- Rating required

Rules:
- Review allowed only for Completed bookings.
- One review per booking.
- On submit, update mock reviews.
- Show toast: "Review submitted."
- Navigate back to booking detail.

Update patient booking detail:
- If booking is Completed and no review exists, show Leave Review button.

Update public doctor profile:
- Reviews list should include newly submitted mock reviews if using shared mock state.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 14 — SHARED NOT FOUND PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create:

src/app/shared/pages/not-found/not-found.page.ts
src/app/shared/pages/not-found/not-found.page.scss

UI:
- Large icon
- Title: "Page not found"
- Description: "The page you are looking for does not exist or has been moved."
- Button: "Back to Home" → /public

Update app.routes.ts:
- Unknown routes go to NotFoundPage instead of silently redirecting.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 15 — FINAL MOCK DATA ADDITIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Add to MockDataService:
- 20 mock audit logs
- 10 notifications per user
- 5 unpaid completed visit report rows
- 3 pending follow-up report rows
- 7 daily booking summary rows
- Review create/update method
- Settings update method
- Payment waive/refund update method

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 16 — FINAL POLISH PASS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Apply these across all portals:

1. Empty states:
   Every list/table page must show EmptyStateComponent when no data.

2. Skeleton loading:
   Every data-heavy page must show SkeletonComponent during mock load delay.

3. Confirm modals:
   All destructive actions must use ConfirmModalComponent:
   - Delete announcement
   - Cancel booking
   - Remove blocked date
   - Refund payment
   - Waive payment
   - Bump consent version

4. Animations:
   - Page entry uses fadeSlideUp
   - Modals/drawers use scaleIn

5. Responsive checks:
   Test at:
   - 375px
   - 768px
   - 1024px
   - 1440px

6. Final copy polish:
   Make user-facing text consistent and professional.

7. Demo safety:
   Ensure all real integrations are labeled mock/stub when needed:
   - Upload
   - Export
   - PDF download
   - Payment verification
   - Send reminder

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCOPE RULES — STRICTLY ENFORCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DO NOT implement:
- Real Cloudinary upload
- Real SMTP email
- Real Firebase FCM push
- Real JWT/refresh token backend
- Real Stripe/GCash/Maya verification
- Real PDF generation
- Real audit log API
- Real ICD-10 API integration

DO implement:
- Settings page
- Reports page
- Audit logs page
- Waive/refund payment modals
- Notification panel
- Patient reviews
- Not found page
- Final empty states
- Final skeleton loading
- Final responsive polish

STOP when the MVP is demo-ready and all routes compile.
```

---

## VALIDATION CHECKLIST

```txt
[ ] /admin/settings renders all tabs
[ ] Clinic name required validation works
[ ] Operating hours editor renders all days
[ ] Color picker updates CSS variable live
[ ] Privacy consent version bump updates clinic settings store
[ ] /admin/reports shows unpaid completed visits report
[ ] /admin/reports shows pending follow-ups report
[ ] Export CSV shows mock toast only
[ ] Send Reminder shows mock success toast only
[ ] /admin/audit-logs table renders mock logs
[ ] Audit log filters work
[ ] Admin booking detail shows Waive Payment when allowed
[ ] Waive Payment requires reason
[ ] Admin booking detail shows Refund Payment when allowed
[ ] Refund Payment requires reason
[ ] Staff booking detail still has no Waive/Refund buttons
[ ] Notification bell shows unread badge
[ ] Mark all read clears unread badge
[ ] Clicking notification marks one read and navigates
[ ] Patient can leave review for completed booking
[ ] Review appears in doctor profile review list
[ ] Unknown route shows 404 page
[ ] All list pages have empty states
[ ] All data-heavy pages have skeleton loaders
[ ] Destructive actions use confirm modal
[ ] App is responsive at 375px, 768px, 1024px, 1440px
[ ] ng serve has zero errors
[ ] MVP demo flow works end-to-end
```

---

## FINAL DEMO READINESS CHECKLIST

```txt
[ ] Public home loads
[ ] Public doctor profile loads
[ ] Public booking flow works
[ ] Patient can log in
[ ] Patient can submit proof
[ ] Staff can manage queue/walk-in
[ ] Doctor can view queue
[ ] Doctor can complete consultation
[ ] Admin can view booking/patient/doctor records
[ ] Admin can view reports/audit logs/settings
[ ] Patient can view medical records/prescriptions
[ ] Patient can leave review
[ ] All important fake actions show clear mock/stub feedback
```

---

## GIT COMMIT AND MVP TAG

```bash
git add .
git commit -m "phase-10: settings, reports, audit log, waive-refund, reviews, notifications, final polish"
git tag v0.1.0-mvp
git push
git push origin v0.1.0-mvp
```

---

## MVP COMPLETE

After this phase, the frontend mock MVP is complete and ready for client/demo review.
