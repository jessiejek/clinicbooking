# CLINIC SYSTEM — MVP DEVELOPMENT PHASES
> Senior Software Architect Plan · Angular 17 + Ionic 7 + NgRx · Mock-First, Phase-Gated, AI-Safe

---

## OVERVIEW

This document breaks the Clinic Management System into **10 safe, sequential MVP phases**. Each phase:
- Produces visible, testable, committable output
- Uses mock/local data until Phase 7
- Prevents AI scope creep via explicit boundary rules
- Is designed to be validated by a human before proceeding

### Phase Map at a Glance

| # | Phase Name | Focus | Portal |
|---|---|---|---|
| 1 | Foundation & Design System | Project scaffold, tokens, shared components | All |
| 2 | Authentication Shell | Login, register, guards, auth state | Auth |
| 3 | Public Portal | Home, doctors, services, announcements | Public |
| 4 | Booking Wizard | Full booking flow with mock slots | Public |
| 5 | Admin Portal Shell | Dashboard, bookings, patients, doctors | Admin |
| 6 | Staff Portal Shell | Walk-in, queue management, booking ops | Staff |
| 7 | Doctor Portal Shell | Today's queue, appointments, consultation form | Doctor |
| 8 | Patient Portal | Patient dashboard, records, prescriptions | Patient |
| 9 | Medical Records Module | Consultations, prescriptions, vitals, labs | Admin/Doctor |
| 10 | Settings, Reports & Polish | Clinic settings, reports, audit log, final polish | Admin |

---

---

# PHASE 1 — Foundation & Design System

## 1. Phase Number
**Phase 1**

## 2. Phase Name
**Foundation & Design System**

## 3. Goal of the Phase
Scaffold the Angular 17 + Ionic 7 project with the complete design system, shared component library, global styles, routing skeleton, NgRx store bootstrap, and mock data layer. At the end of this phase the app starts, navigates, looks beautiful, and is wired to mock data.

## 4. Why This Phase Exists
Without a shared design system established first, all subsequent AI-generated code will produce inconsistent styling. The design tokens, component patterns, and folder structure must be the single source of truth before any page is built. This phase eliminates visual drift across all future phases.

## 5. Dependencies from Previous Phases
None — this is the root phase.

## 6. What Should Be Implemented
- Angular 17 project with Ionic 7 installed and configured
- Complete SCSS design system (colors, typography, spacing, shadows, radius, transitions, animations)
- Global styles.scss with all CSS variables from FRONTEND.md
- Inter + JetBrains Mono font imports
- Shared component library (skeleton, empty-state, status badge, confirm-modal, avatar, banner)
- Shared pipes (peso, patient-code, time-slot)
- Shared validators (password-strength)
- All TypeScript models/interfaces in `core/models/index.ts`
- All enum types
- NgRx store bootstrap (auth store, clinic-settings store scaffolds)
- Lazy-loaded routing shell (`app.routes.ts` with all portal route stubs)
- `MockDataService` with full seed data from PROJECT.md
- `ClinicSettingsService` loading from mock
- `TokenService` stub (in-memory, no real JWT)
- Auth guards (auth.guard, role.guard, first-login.guard) — all returning `true` for now with console.warn
- Environment config file
- A `/dev` route showing a living component library page (design system gallery)

## 7. What Should NOT Be Implemented Yet
- No real API calls
- No real authentication logic
- No login/register pages
- No actual portal pages (admin, staff, doctor, patient)
- No booking wizard
- No NgRx effects or real API service calls
- No Firebase/FCM integration
- No Cloudinary integration

## 8. Pages to Create
- `app.component.ts` — root component with router-outlet
- `src/app/dev/design-system-gallery/design-system-gallery.page.ts` — living style guide

## 9. Components to Create
**Shared components (`src/app/shared/components/`):**
- `skeleton/skeleton.component.ts` — shimmer skeleton loader (variants: text, title, card, avatar, stat, row)
- `empty-state/empty-state.component.ts` — configurable icon + title + description + optional CTA
- `status-badge/status-badge.component.ts` — booking status, payment status, doctor status badges
- `confirm-modal/confirm-modal.component.ts` — reusable confirmation dialog
- `avatar/avatar.component.ts` — initials fallback, sizes xs/sm/md/lg/xl
- `banner/banner.component.ts` — warning/danger/info variants with optional close button
- `page-header/page-header.component.ts` — title + subtitle + optional action slot

## 10. Services to Create
- `src/app/core/services/mock-data.service.ts` — all seed data (doctors, patients, services, bookings, clinic settings)
- `src/app/core/services/clinic-settings.service.ts` — loads and exposes clinic settings, returns mock
- `src/app/core/services/token.service.ts` — stub (returns null)

## 11. Mock Data Required
Full seed data matching PROJECT.md in `mock-data.service.ts`:
- 3 doctors (Dr. Santos, Dr. Reyes, Dr. Cruz) with full profiles
- 10 services across all 4 categories
- 5 patients (PT-2025-00001 through PT-2025-00005)
- 1 admin user, 1 staff user, 3 doctor users
- Clinic settings (clinic name, logo placeholder, operating hours, consent version)
- 5 announcements
- 10+ bookings in various statuses

## 12. State Management Required
**NgRx scaffolds only (no real actions/effects yet):**
- `store/auth/auth.state.ts` — define `AuthState` interface
- `store/auth/auth.reducer.ts` — define initial state only
- `store/clinic-settings/clinic-settings.state.ts` — define interface
- `store/clinic-settings/clinic-settings.reducer.ts` — initial state only

## 13. Routes Required
```typescript
// app.routes.ts stubs
{ path: '',           redirectTo: 'public', pathMatch: 'full' }
{ path: 'public',     loadChildren: () => public.module  }  // stub only
{ path: 'auth',       loadChildren: () => auth.module }     // stub only
{ path: 'admin',      loadChildren: () => admin.module }    // stub only
{ path: 'staff',      loadChildren: () => staff.module }    // stub only
{ path: 'doctor',     loadChildren: () => doctor.module }   // stub only
{ path: 'patient',    loadChildren: () => patient.module }  // stub only
{ path: 'dev',        loadChildren: () => dev.module }      // design system gallery
{ path: '**',         redirectTo: 'public' }
```

## 14. UI Expectations
- `/dev` route shows a beautiful design system gallery with:
  - Color palette swatches
  - Typography scale
  - All button variants (primary, outline, ghost, danger, icon)
  - All badge variants (all booking, payment, doctor statuses)
  - Card variants (default, accent-green/blue/amber/red, elevated, glass)
  - Stat card variants (green, blue, amber, red)
  - All skeleton variants
  - Empty state example
  - Banner variants (warning, danger, info)
  - Avatar sizes
  - Form field styling (Ionic override)
  - Table styling
- The gallery proves every design token renders correctly before any real page is built

## 15. Fake Functionality Allowed
- All guards return `true` (no real auth check)
- MockDataService returns hardcoded arrays
- ClinicSettingsService returns hardcoded clinic settings
- TokenService always returns null (no real token logic)

## 16. Real Functionality Required
- The project must compile with `ng serve` with zero errors
- All SCSS variables must resolve (no broken token references)
- The design gallery `/dev` must be navigable and render all components correctly
- Lazy loading must work for all module stubs
- All TypeScript interfaces must be type-safe (no `any`)

## 17. Validation Checklist
- [ ] `ng serve` runs with zero errors and zero warnings
- [ ] `/dev` route loads and renders the design system gallery
- [ ] All color tokens render correctly in the gallery
- [ ] All component variants are visible and styled correctly
- [ ] All TypeScript interfaces compile without error
- [ ] NgRx is installed and store is bootstrapped (check DevTools)
- [ ] Lazy loading works for all route stubs (no eager loading)
- [ ] SCSS compiles with no undefined variable errors
- [ ] Google Fonts (Inter + JetBrains Mono) load in browser
- [ ] All shared components are declared and exported properly

## 18. Manual Testing Checklist
- [ ] Open browser → navigate to `/dev` → see full design gallery
- [ ] Verify green gradient on primary buttons
- [ ] Verify shimmer animation on skeleton loaders
- [ ] Verify all badge colors match spec
- [ ] Verify sidebar dark theme CSS vars
- [ ] Navigate to `/admin` stub → no crash (empty module)
- [ ] Open Angular DevTools → confirm NgRx store is registered

## 19. Git Commit Recommendation
```
git add .
git commit -m "phase-1: foundation, design system, mock data, shared components"
```

## 20. Risks to Watch For
- AI may try to implement actual page content inside the gallery — **stop it**
- AI may skip the SCSS variable setup and use hardcoded values — **enforce tokens**
- AI may install wrong versions of Ionic or Angular — specify exact versions
- AI may generate components as NgModules instead of standalone — **enforce standalone**
- AI may generate real HTTP calls instead of mock — **block this**

## 21. Definition of DONE
✅ `ng serve` compiles and runs
✅ `/dev` route renders a complete, pixel-correct design system gallery
✅ All shared components exist as standalone Angular components
✅ All TypeScript models exist and match PROJECT.md data shapes
✅ MockDataService populated with all seed data
✅ NgRx store registered with initial state shapes
✅ Git commit made

---

### SHORT IMPLEMENTATION PROMPT — Phase 1

```
Build Phase 1 of an Angular 17 + Ionic 7 + NgRx clinic management app.

TECH: Angular 17 standalone components, Ionic 7, SCSS, NgRx, no real API calls.

CREATE:
1. Project scaffold with correct folder structure (see structure below)
2. Global styles.scss with full design system CSS variables (colors, typography, spacing, shadows, radius, transitions)
3. Import Inter and JetBrains Mono fonts from Google Fonts
4. All TypeScript interfaces in src/app/core/models/index.ts
5. MockDataService with seed clinic data (3 doctors, 5 patients, 10 services, 1 admin, 1 staff)
6. Shared standalone components: skeleton, empty-state, status-badge, confirm-modal, avatar, banner, page-header
7. Shared pipes: peso.pipe.ts, patient-code.pipe.ts, time-slot.pipe.ts
8. Shared validator: password-strength.validator.ts
9. NgRx store bootstrap (auth and clinic-settings feature stores, initial state only)
10. app.routes.ts with lazy-loaded stubs for: public, auth, admin, staff, doctor, patient
11. A /dev route rendering a design system gallery page showing all components and tokens

DO NOT implement: login pages, any portal page, real API calls, real auth logic, booking wizard.
DO NOT use NgModules — use standalone components only.
STOP after the /dev gallery page renders correctly.
```

---

### DETAILED IMPLEMENTATION PROMPT — Phase 1

```
You are building Phase 1 (Foundation & Design System) of a Clinic Management System.
Tech: Angular 17 (standalone components), Ionic 7, SCSS, NgRx 17, TypeScript strict.
This phase has NO real API calls, NO authentication, NO portal pages.

═══════════════════════════════════════
FOLDER STRUCTURE TO CREATE:
═══════════════════════════════════════
src/
├── app/
│   ├── core/
│   │   ├── models/index.ts           ← ALL TypeScript interfaces and enums
│   │   ├── services/
│   │   │   ├── mock-data.service.ts
│   │   │   ├── clinic-settings.service.ts
│   │   │   └── token.service.ts
│   │   └── guards/
│   │       ├── auth.guard.ts         ← returns true, console.warn only
│   │       ├── role.guard.ts         ← returns true, console.warn only
│   │       └── first-login.guard.ts  ← returns true, console.warn only
│   ├── shared/
│   │   ├── components/
│   │   │   ├── skeleton/skeleton.component.ts + .scss
│   │   │   ├── empty-state/empty-state.component.ts + .scss
│   │   │   ├── status-badge/status-badge.component.ts + .scss
│   │   │   ├── confirm-modal/confirm-modal.component.ts + .scss
│   │   │   ├── avatar/avatar.component.ts + .scss
│   │   │   ├── banner/banner.component.ts + .scss
│   │   │   └── page-header/page-header.component.ts + .scss
│   │   ├── pipes/
│   │   │   ├── peso.pipe.ts
│   │   │   ├── patient-code.pipe.ts
│   │   │   └── time-slot.pipe.ts
│   │   └── validators/
│   │       └── password-strength.validator.ts
│   ├── store/
│   │   ├── auth/
│   │   │   ├── auth.state.ts
│   │   │   └── auth.reducer.ts
│   │   └── clinic-settings/
│   │       ├── clinic-settings.state.ts
│   │       └── clinic-settings.reducer.ts
│   ├── portals/
│   │   ├── public/public.routes.ts    ← stub with one empty component
│   │   ├── admin/admin.routes.ts      ← stub
│   │   ├── staff/staff.routes.ts      ← stub
│   │   ├── doctor/doctor.routes.ts    ← stub
│   │   └── patient/patient.routes.ts  ← stub
│   ├── auth/auth.routes.ts            ← stub
│   ├── dev/
│   │   └── design-system-gallery/design-system-gallery.page.ts + .scss
│   ├── app.component.ts
│   └── app.routes.ts
└── styles.scss                        ← global design system variables

═══════════════════════════════════════
SCSS VARIABLES TO DEFINE IN styles.scss:
═══════════════════════════════════════
:root {
  /* PRIMARY — Deep Clinic Green */
  --ion-color-primary: #1A6B4A;
  --ion-color-primary-shade: #155C3E;
  --ion-color-primary-tint: #2D8060;
  --color-primary-50: #E8F4EF;
  --color-primary-100: #C5E2D5;
  --color-primary-200: #8FC6AC;
  --color-primary-600: #1A6B4A;
  --color-primary-700: #155C3E;
  --color-primary-900: #0D3D2A;

  /* SECONDARY — Medical Blue */
  --ion-color-secondary: #2563EB;
  --ion-color-secondary-shade: #1D4ED8;
  --ion-color-secondary-tint: #3B82F6;
  --color-secondary-50: #EFF6FF;
  --color-secondary-100: #DBEAFE;

  /* SEMANTIC */
  --ion-color-success: #16A34A;
  --color-success-50: #F0FDF4;
  --color-success-100: #DCFCE7;
  --ion-color-warning: #D97706;
  --color-warning-50: #FFFBEB;
  --color-warning-100: #FEF3C7;
  --ion-color-danger: #DC2626;
  --color-danger-50: #FEF2F2;
  --color-danger-100: #FEE2E2;
  --ion-color-medium: #6B7280;
  --ion-color-light: #F9FAFB;

  /* NEUTRALS */
  --color-neutral-50: #F8FAFC;
  --color-neutral-100: #F1F5F9;
  --color-neutral-200: #E2E8F0;
  --color-neutral-300: #CBD5E1;
  --color-neutral-400: #94A3B8;
  --color-neutral-500: #64748B;
  --color-neutral-600: #475569;
  --color-neutral-700: #334155;
  --color-neutral-800: #1E293B;
  --color-neutral-900: #0F172A;

  /* SEMANTIC UI */
  --clinic-bg: #F8FAFC;
  --clinic-bg-elevated: #FFFFFF;
  --clinic-border: #E2E8F0;
  --clinic-border-strong: #CBD5E1;
  --clinic-text-primary: #0F172A;
  --clinic-text-secondary: #475569;
  --clinic-text-muted: #94A3B8;
  --clinic-text-inverse: #FFFFFF;

  /* GRADIENTS */
  --gradient-hero: linear-gradient(135deg, #0D3D2A 0%, #1A6B4A 50%, #2D8060 100%);
  --gradient-card-green: linear-gradient(135deg, #1A6B4A 0%, #2D8060 100%);
  --gradient-card-blue: linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%);
  --gradient-card-amber: linear-gradient(135deg, #B45309 0%, #D97706 100%);
  --gradient-card-rose: linear-gradient(135deg, #BE123C 0%, #DC2626 100%);
  --gradient-subtle: linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%);

  /* TYPOGRAPHY */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  --text-xs: 0.75rem; --text-sm: 0.875rem; --text-base: 1rem;
  --text-lg: 1.125rem; --text-xl: 1.25rem; --text-2xl: 1.5rem;
  --text-3xl: 1.875rem; --text-4xl: 2.25rem; --text-5xl: 3rem;
  --font-light: 300; --font-normal: 400; --font-medium: 500;
  --font-semibold: 600; --font-bold: 700; --font-extrabold: 800;

  /* SPACING */
  --space-1: 0.25rem; --space-2: 0.5rem; --space-3: 0.75rem;
  --space-4: 1rem; --space-5: 1.25rem; --space-6: 1.5rem;
  --space-8: 2rem; --space-10: 2.5rem; --space-12: 3rem;
  --space-16: 4rem; --space-20: 5rem; --space-24: 6rem;

  /* SHADOWS */
  --shadow-xs: 0 1px 2px 0 rgba(0,0,0,0.05);
  --shadow-sm: 0 1px 3px 0 rgba(0,0,0,0.08), 0 1px 2px -1px rgba(0,0,0,0.08);
  --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.08), 0 2px 4px -2px rgba(0,0,0,0.08);
  --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.08);
  --shadow-xl: 0 20px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.08);
  --shadow-2xl: 0 25px 50px -12px rgba(0,0,0,0.18);
  --shadow-green: 0 8px 24px rgba(26,107,74,0.20);
  --shadow-blue: 0 8px 24px rgba(37,99,235,0.20);
  --shadow-amber: 0 8px 24px rgba(217,119,6,0.20);
  --shadow-red: 0 8px 24px rgba(220,38,38,0.20);

  /* RADIUS */
  --radius-sm: 0.375rem; --radius-md: 0.5rem; --radius-lg: 0.75rem;
  --radius-xl: 1rem; --radius-2xl: 1.5rem; --radius-full: 9999px;

  /* TRANSITIONS */
  --transition-fast: 150ms cubic-bezier(0.4,0,0.2,1);
  --transition-base: 200ms cubic-bezier(0.4,0,0.2,1);
  --transition-slow: 300ms cubic-bezier(0.4,0,0.2,1);
  --transition-spring: 400ms cubic-bezier(0.34,1.56,0.64,1);
}

/* ANIMATIONS */
@keyframes fadeSlideUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
@keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
@keyframes scaleIn { from { opacity:0; transform:scale(0.96); } to { opacity:1; transform:scale(1); } }
@keyframes shimmer { 0% { background-position:-1000px 0; } 100% { background-position:1000px 0; } }

/* GLOBAL CLASSES */
/* .clinic-card, .stat-card, .badge, .btn-primary, .btn-outline, .btn-ghost, .btn-danger, .btn-icon */
/* .skeleton, .empty-state, .avatar, .banner, .clinic-table, .slot-cell */
/* .data-mono, .divider, .content-container, .section-heading */
/* (implement all global classes from FRONTEND.md) */

═══════════════════════════════════════
MODELS TO CREATE IN core/models/index.ts:
═══════════════════════════════════════
All interfaces: AuthUser, Doctor, Service, DoctorSchedule, DoctorBlockedDate,
Booking, Payment, Patient, Consultation, Prescription, PrescriptionItem,
VitalSigns, Diagnosis, Allergy, Announcement, ClinicSettings, Notification.
All enums: Role, DoctorStatus, BookingStatus, PaymentStatus, PaymentMode,
PaymentMethod, ServiceCategory, ProofType, PrescriptionStatus.

═══════════════════════════════════════
MOCK DATA SERVICE — KEY SEED DATA:
═══════════════════════════════════════
Doctors:
- Dr. Maria Santos | General Practitioner | ₱500 | Mon-Fri 8AM-5PM | 30min slots | Active
- Dr. Jose Reyes | Pediatrics | ₱600 | Mon/Wed/Fri 9AM-4PM | 30min slots | Active
- Dr. Ana Cruz | OB-Gynecology | ₱700 | Tue/Thu 8AM-3PM | 30min slots | Active

Services (10 items across Consultation/Procedure/Laboratory/Diagnostic categories)

Patients: PT-2025-00001 through PT-2025-00005

Bookings: At least 10 bookings across all statuses
(Pending, Confirmed, Completed, Cancelled, OnHold, ProofSubmitted, NoShow)

Clinic settings:
- ClinicName: "Maliksi Family Clinic"
- OperatingHours: Mon-Fri 8AM-6PM, Sat 8AM-12PM, Sun Closed
- ConsentVersion: "v1.0"
- PrimaryColor: "#1A6B4A"

═══════════════════════════════════════
DESIGN GALLERY PAGE — SECTIONS:
═══════════════════════════════════════
The /dev/gallery page must show:
1. Color Palette — all CSS variable swatches
2. Typography Scale — all text sizes rendered
3. Buttons — primary, outline, ghost, danger, icon
4. Badges — all booking, payment, doctor status variants
5. Cards — default, accent variants, elevated, glass
6. Stat Cards — green, blue, amber, red with sample values
7. Skeletons — all variants (text, title, card, avatar, stat, row)
8. Empty State — sample with icon and description
9. Banners — warning, danger, info variants
10. Avatars — all sizes with initials
11. Form Fields — Ionic override examples
12. Table — sample row data
13. Slot Grid — sample cells in all states

═══════════════════════════════════════
DO NOT IMPLEMENT:
═══════════════════════════════════════
- No login/register pages
- No portal pages (admin, staff, doctor, patient)
- No booking wizard
- No real HTTP calls
- No NgRx effects
- No Firebase/FCM
- No Cloudinary
- No real guards (all return true with console.warn)

FILES EXPECTED AFTER THIS PHASE:
src/styles.scss
src/app/app.component.ts
src/app/app.routes.ts
src/app/core/models/index.ts
src/app/core/services/mock-data.service.ts
src/app/core/services/clinic-settings.service.ts
src/app/core/services/token.service.ts
src/app/core/guards/auth.guard.ts
src/app/core/guards/role.guard.ts
src/app/core/guards/first-login.guard.ts
src/app/shared/components/skeleton/...
src/app/shared/components/empty-state/...
src/app/shared/components/status-badge/...
src/app/shared/components/confirm-modal/...
src/app/shared/components/avatar/...
src/app/shared/components/banner/...
src/app/shared/components/page-header/...
src/app/shared/pipes/peso.pipe.ts
src/app/shared/pipes/patient-code.pipe.ts
src/app/shared/pipes/time-slot.pipe.ts
src/app/shared/validators/password-strength.validator.ts
src/app/store/auth/auth.state.ts
src/app/store/auth/auth.reducer.ts
src/app/store/clinic-settings/clinic-settings.state.ts
src/app/store/clinic-settings/clinic-settings.reducer.ts
src/app/portals/public/public.routes.ts (stub)
src/app/portals/admin/admin.routes.ts (stub)
src/app/portals/staff/staff.routes.ts (stub)
src/app/portals/doctor/doctor.routes.ts (stub)
src/app/portals/patient/patient.routes.ts (stub)
src/app/auth/auth.routes.ts (stub)
src/app/dev/design-system-gallery/design-system-gallery.page.ts
src/app/dev/design-system-gallery/design-system-gallery.page.scss
environments/environment.ts
```

---

> **STOP AFTER THIS PHASE.**
> **WAIT FOR HUMAN VALIDATION AND GIT COMMIT BEFORE PROCEEDING.**

---
---

# PHASE 2 — Authentication Shell

## 1. Phase Number
**Phase 2**

## 2. Phase Name
**Authentication Shell**

## 3. Goal of the Phase
Build all authentication pages with full UI and form validation, backed by mock auth logic. The auth store must be fully wired with NgRx actions, reducers, and effects (using mock delay instead of real API). Users can log in, register, and get redirected based on role. Guards become real and route correctly.

## 4. Why This Phase Exists
Every portal depends on the auth system for role-based routing. Without real guards and role detection, testing portal pages in subsequent phases is impossible. This phase also establishes the UX patterns for forms and validation used throughout the app.

## 5. Dependencies from Previous Phases
- Phase 1: All shared components (banner, avatar, form styling)
- Phase 1: TypeScript models (AuthUser, Role enums)
- Phase 1: password-strength.validator.ts
- Phase 1: NgRx auth store scaffolds

## 6. What Should Be Implemented
- Login page (email/password, lockout feedback, error states)
- Register page (email/password, consent checkbox, social login buttons as UI only)
- Forgot password page (email input, success state)
- Reset password page (token in URL param, new password + confirm)
- Set password page (for first-login / invite token flow)
- Privacy consent page (patient-only, displays consent text, accept button)
- Auth layout component (centered card layout with clinic branding)
- NgRx auth store: actions, reducer, effects (mock 800ms delay, mock user matching from MockDataService)
- AuthService with mock login/logout/register
- TokenService: stores access token in memory (a simple class variable)
- Real auth guards: auth.guard (checks token), role.guard (checks role), first-login.guard (checks isFirstLogin flag)
- Redirect logic: Admin → /admin, Staff → /staff, Doctor → /doctor, Patient → /patient
- "Unverified email" warning banner on patient dashboard stub

## 7. What Should NOT Be Implemented Yet
- No real JWT parsing
- No real HTTP calls to /api/v1/auth
- No Google/Facebook OAuth (buttons exist as UI only, click shows "Coming Soon" toast)
- No real email sending (forgot password shows success message regardless)
- No portal pages (those come in later phases)

## 8. Pages to Create
- `src/app/auth/login/login.page.ts + .scss`
- `src/app/auth/register/register.page.ts + .scss`
- `src/app/auth/forgot-password/forgot-password.page.ts + .scss`
- `src/app/auth/reset-password/reset-password.page.ts + .scss`
- `src/app/auth/set-password/set-password.page.ts + .scss`
- `src/app/auth/privacy-consent/privacy-consent.page.ts + .scss`

## 9. Components to Create
- `src/app/auth/components/auth-layout/auth-layout.component.ts + .scss` — shared auth page wrapper (centered card, clinic logo, gradient side panel)

## 10. Services to Create
- `src/app/core/services/auth.service.ts` — mock login/logout/register (resolves from MockDataService)

## 11. Mock Data Required
Use existing MockDataService seed users:
- admin@clinic.ph / Admin@123456 → role: Admin
- staff@clinic.ph / Staff@123456 → role: Staff
- dr.santos@clinic.ph / Doctor@123456 → role: Doctor, isFirstLogin: false
- patient@clinic.ph / Patient@123456 → role: Patient, consentVersion: "v1.0"
- One doctor with isFirstLogin: true to test set-password guard

## 12. State Management Required
**NgRx auth store — full implementation:**
- Actions: `login`, `loginSuccess`, `loginFailure`, `logout`, `register`, `registerSuccess`, `registerFailure`, `setUser`
- Reducer: handles all auth state transitions
- Effects: `login$` effect (800ms delay mock), `logout$` effect
- Selectors: `selectUser`, `selectIsLoading`, `selectAuthError`, `selectIsAuthenticated`

## 13. Routes Required
```typescript
// auth.routes.ts
{ path: '', redirectTo: 'login', pathMatch: 'full' }
{ path: 'login',           component: LoginPage }
{ path: 'register',        component: RegisterPage }
{ path: 'forgot-password', component: ForgotPasswordPage }
{ path: 'reset-password',  component: ResetPasswordPage }
{ path: 'set-password',    component: SetPasswordPage }
{ path: 'privacy-consent', canActivate: [AuthGuard, RoleGuard], data: { roles: ['Patient'] }, component: PrivacyConsentPage }
```

## 14. UI Expectations
- Auth pages use a two-panel split layout on desktop: left = green gradient brand panel with clinic name + tagline, right = white form panel
- Mobile: single panel, logo on top
- Login form: email input, password input (with show/hide toggle), "Remember me" checkbox (UI only), "Forgot password?" link, primary submit button, OR divider, Google + Facebook social buttons (disabled with "Coming soon" tooltip)
- Error states: red banner showing error message from NgRx state
- Account lockout: shows "Account locked for X minutes" in error banner
- Loading state: submit button shows spinner + "Signing in..."
- Register form: full name, email, password (strength indicator), confirm password, consent checkbox (required), submit
- Password strength meter: 4-segment bar (weak=red, fair=amber, good=blue, strong=green)
- Set password: shows clinic name, "Welcome to [Clinic]", new password + confirm, strength meter

## 15. Fake Functionality Allowed
- Mock login delay of 800ms
- Forgot password always shows success regardless of email
- Social login shows "Coming Soon" Ionic toast
- Reset password link not actually sent (success shown immediately)

## 16. Real Functionality Required
- Password validation enforced (min 8 chars, 1 uppercase, 1 number, 1 special char)
- Reactive Forms with proper validators on all fields
- Role-based redirect after login actually works
- Guards actually block unauthorized access
- isFirstLogin flag redirects to /auth/set-password
- Logout clears auth state and redirects to /auth/login

## 17. Validation Checklist
- [ ] Login with admin@clinic.ph → redirects to /admin stub
- [ ] Login with staff@clinic.ph → redirects to /staff stub
- [ ] Login with dr.santos@clinic.ph → redirects to /doctor stub
- [ ] Login with patient@clinic.ph → redirects to /patient stub
- [ ] Login with wrong password → shows error banner
- [ ] Login with first-login doctor → redirects to /auth/set-password
- [ ] Navigate to /admin without login → redirected to /auth/login
- [ ] Logout clears state and redirects to /auth/login
- [ ] Password strength meter animates on input
- [ ] Register form validates all fields before submit
- [ ] Consent checkbox is required on register

## 18. Manual Testing Checklist
- [ ] Login page looks correct on desktop and mobile
- [ ] Split panel layout shows on desktop
- [ ] Mobile collapses to single-column form
- [ ] All form fields show error messages on blur
- [ ] Loading spinner shows during mock delay
- [ ] "Forgot password?" flow shows success state
- [ ] Set password page accessible at /auth/set-password

## 19. Git Commit Recommendation
```
git add .
git commit -m "phase-2: auth shell, login/register/set-password pages, real guards, mock auth"
```

## 20. Risks to Watch For
- AI may implement real JWT decoding — keep mock only
- AI may forget to wire NgRx effects — always verify loading state works
- AI may use template-driven forms instead of reactive — enforce Reactive Forms
- AI may import FormModule incorrectly with standalone components

## 21. Definition of DONE
✅ All 6 auth pages render correctly
✅ Login redirects to correct portal based on role
✅ Guards protect /admin, /staff, /doctor, /patient
✅ Password strength validator works
✅ NgRx auth state updates correctly during login
✅ Git commit made

---

### SHORT IMPLEMENTATION PROMPT — Phase 2

```
Build Phase 2 (Authentication Shell) of the clinic app.
DO NOT change anything from Phase 1.

CREATE:
Pages: login, register, forgot-password, reset-password, set-password, privacy-consent
Component: auth-layout (2-panel split: green brand left, white form right)
Service: auth.service.ts (mock, 800ms delay, reads from MockDataService)
NgRx: auth actions, reducer, effects, selectors (full implementation)
Guards: make auth.guard, role.guard, first-login.guard REAL (not stubs)

After login, redirect: Admin→/admin, Staff→/staff, Doctor→/doctor, Patient→/patient
Password validator: min 8 chars + 1 uppercase + 1 number + 1 special char
All forms: Reactive Forms with validation messages
Social login buttons: UI only, click shows "Coming soon" Ionic toast

DO NOT: implement portal pages, real API calls, real JWT, real OAuth
STOP after all auth pages compile and login/redirect flow works.
```

---

### DETAILED IMPLEMENTATION PROMPT — Phase 2

```
You are building Phase 2 (Authentication Shell) of the Clinic Management System.
Phase 1 is already complete. DO NOT modify any Phase 1 file.

═══════════════════════════════════════
FILES TO CREATE:
═══════════════════════════════════════
src/app/auth/
├── auth.routes.ts
├── components/
│   └── auth-layout/auth-layout.component.ts + .scss
├── login/login.page.ts + .scss
├── register/register.page.ts + .scss
├── forgot-password/forgot-password.page.ts + .scss
├── reset-password/reset-password.page.ts + .scss
├── set-password/set-password.page.ts + .scss
└── privacy-consent/privacy-consent.page.ts + .scss

src/app/core/services/auth.service.ts
src/app/store/auth/
├── auth.actions.ts
├── auth.reducer.ts (replace stub)
├── auth.effects.ts
└── auth.selectors.ts

src/app/core/guards/
├── auth.guard.ts (replace stub with real guard)
├── role.guard.ts (replace stub with real guard)
└── first-login.guard.ts (replace stub with real guard)

═══════════════════════════════════════
AUTH LAYOUT COMPONENT:
═══════════════════════════════════════
Desktop (>768px): 2-column layout
- Left (420px): gradient-hero background, clinic logo (white), clinic name (white, bold),
  tagline "Modern Healthcare Management", 3 trust badges
- Right: white, centered form with max-width 400px, clinic logo (colored), page title

Mobile (<768px): single column, white background, logo on top

═══════════════════════════════════════
NGRX AUTH STORE:
═══════════════════════════════════════
// auth.actions.ts
export const login = createAction('[Auth] Login', props<{email: string, password: string}>());
export const loginSuccess = createAction('[Auth] Login Success', props<{user: AuthUser}>());
export const loginFailure = createAction('[Auth] Login Failure', props<{error: string}>());
export const logout = createAction('[Auth] Logout');
export const register = createAction('[Auth] Register', props<{fullName: string, email: string, password: string}>());
export const registerSuccess = createAction('[Auth] Register Success', props<{user: AuthUser}>());
export const registerFailure = createAction('[Auth] Register Failure', props<{error: string}>());

// auth.effects.ts — login$ effect:
// 1. Find user in MockDataService.getUsers() by email
// 2. Check password matches (use exact match for mock)
// 3. If locked → error "Account temporarily locked. Try again later."
// 4. If invalid → error "Invalid email or password."
// 5. If isFirstLogin → dispatch loginSuccess with isFirstLogin:true
// 6. Delay 800ms with timer(800)
// 7. Dispatch loginSuccess → navigate based on role

// Token service: just store user object in a class variable (no real JWT)
// Selector: selectIsAuthenticated = !!user
// Selector: selectCurrentUser = user
// Selector: selectUserRole = user?.role

═══════════════════════════════════════
GUARDS (REAL IMPLEMENTATION):
═══════════════════════════════════════
// auth.guard.ts
// inject Store, select selectIsAuthenticated
// if false → router.navigate(['/auth/login']) → return false
// if true → return true

// role.guard.ts
// inject Store, select selectUserRole
// get route.data.roles (array)
// if role not in allowed roles → router.navigate(['/auth/login']) → return false

// first-login.guard.ts
// inject Store, select selectCurrentUser
// if user.isFirstLogin === true → router.navigate(['/auth/set-password']) → return false

═══════════════════════════════════════
LOGIN PAGE FORM:
═══════════════════════════════════════
FormGroup: { email: [required, email], password: [required] }

Template sections:
1. Error banner (banner--danger) — shows auth error from store
2. Email ion-item.clinic-input
3. Password ion-item.clinic-input with show/hide toggle button
4. "Forgot password?" link aligned right
5. Submit button (btn-primary, full width) — shows spinner when isLoading
6. OR divider
7. Google sign-in button (btn-social, disabled)
8. Facebook sign-in button (btn-social, disabled)
9. "Don't have an account? Register" link

═══════════════════════════════════════
REGISTER PAGE FORM:
═══════════════════════════════════════
FormGroup: {
  fullName: [required, minLength(2)],
  email: [required, email],
  password: [required, passwordStrengthValidator],
  confirmPassword: [required],
  consentAccepted: [required, Validators.requiredTrue]
}
Cross-field validator: passwords must match

Password strength meter:
- Below the password field
- 4 segments that fill based on: length, uppercase, number, special char
- Labels: "Weak" | "Fair" | "Good" | "Strong"

Consent checkbox: links to /public/privacy (fake link for now)

═══════════════════════════════════════
MOCK AUTH USERS (in AuthService, reads from MockDataService):
═══════════════════════════════════════
admin@clinic.ph     / Admin@123456   → role: Admin,   isFirstLogin: false
admin2@clinic.ph    / Admin@123456   → role: Admin,   isFirstLogin: false
staff@clinic.ph     / Staff@123456   → role: Staff,   isFirstLogin: false
dr.santos@clinic.ph / Doctor@123456  → role: Doctor,  isFirstLogin: false
dr.reyes@clinic.ph  / Doctor@123456  → role: Doctor,  isFirstLogin: true  ← tests first-login guard
dr.cruz@clinic.ph   / Doctor@123456  → role: Doctor,  isFirstLogin: false
patient@clinic.ph   / Patient@123456 → role: Patient, isFirstLogin: false

After loginSuccess → navigate based on role:
Admin → /admin, Staff → /staff, Doctor → /doctor, Patient → /patient
isFirstLogin = true → /auth/set-password (regardless of role)

═══════════════════════════════════════
DO NOT TOUCH:
═══════════════════════════════════════
- src/styles.scss
- src/app/core/models/index.ts
- src/app/core/services/mock-data.service.ts
- Any file in src/app/shared/
- Any file in src/app/dev/
- Any portal stub routes

FILES EXPECTED AFTER THIS PHASE (new or modified):
src/app/auth/auth.routes.ts
src/app/auth/components/auth-layout/auth-layout.component.ts + .scss
src/app/auth/login/login.page.ts + .scss
src/app/auth/register/register.page.ts + .scss
src/app/auth/forgot-password/forgot-password.page.ts + .scss
src/app/auth/reset-password/reset-password.page.ts + .scss
src/app/auth/set-password/set-password.page.ts + .scss
src/app/auth/privacy-consent/privacy-consent.page.ts + .scss
src/app/core/services/auth.service.ts
src/app/store/auth/auth.actions.ts
src/app/store/auth/auth.reducer.ts (updated)
src/app/store/auth/auth.effects.ts
src/app/store/auth/auth.selectors.ts
src/app/core/guards/auth.guard.ts (updated)
src/app/core/guards/role.guard.ts (updated)
src/app/core/guards/first-login.guard.ts (updated)
```

---

> **STOP AFTER THIS PHASE.**
> **WAIT FOR HUMAN VALIDATION AND GIT COMMIT BEFORE PROCEEDING.**

---
---

# PHASE 3 — Public Portal

## 1. Phase Number
**Phase 3**

## 2. Phase Name
**Public Portal (Patient-Facing Clinic Website)**

## 3. Goal of the Phase
Build the complete public-facing portal: home page, doctor listing, doctor profile, services catalog, and announcements page. All data loaded from MockDataService. Navigation and layout fully implemented.

## 4. Why This Phase Exists
The public portal is the highest-visibility surface of the system — it's what patients see first. It needs to look stunning before the booking wizard is added. Separating the portal shell from the booking wizard reduces complexity per phase.

## 5. Dependencies from Previous Phases
- Phase 1: All shared components, CSS design system, MockDataService
- Phase 2: Auth state (to show "My Appointments" link if logged in as patient)

## 6. What Should Be Implemented
- Public layout component (fixed navbar + footer)
- Public navbar with clinic logo, navigation links, CTA button, mobile hamburger menu
- Home page (hero, operating hours bar, featured doctors, service category cards, announcements, footer)
- Doctors listing page with filter by specialization
- Doctor profile page (bio, photo, fee, services, reviews, availability days — mock)
- Services catalog page with filter by category
- Announcements listing page
- Footer component (dark, 4-column)

## 7. What Should NOT Be Implemented Yet
- No booking wizard (Phase 4)
- No slot grid on doctor profile yet (show "Book Appointment" CTA that links to booking wizard stub)
- No real slot availability logic
- No reviews submission form (view only)

## 8. Pages to Create
- `public/home/home.page.ts + .scss`
- `public/doctors/doctors.page.ts + .scss`
- `public/doctor-profile/doctor-profile.page.ts + .scss`
- `public/services/services.page.ts + .scss`
- `public/announcements/announcements.page.ts + .scss`

## 9. Components to Create
- `public/components/public-navbar/public-navbar.component.ts + .scss`
- `public/components/public-footer/public-footer.component.ts + .scss`
- `public/components/public-layout/public-layout.component.ts + .scss`
- `public/components/doctor-card/doctor-card.component.ts + .scss`
- `public/components/service-category-card/service-category-card.component.ts + .scss`
- `public/components/announcement-card/announcement-card.component.ts + .scss`
- `public/components/operating-hours-bar/operating-hours-bar.component.ts + .scss`
- `public/components/hero-section/hero-section.component.ts + .scss`
- `public/components/review-card/review-card.component.ts + .scss`

## 10. Services to Create
- `services/public.service.ts` — wraps MockDataService calls for public portal (getDoctors, getServices, getAnnouncements)

## 11. Mock Data Required
Use existing MockDataService:
- 3 doctors with full profile data, specialization, photo placeholder, fee, rating (4.5 average), review count
- 10 services grouped by category
- 5 announcements with titles and body text
- Clinic settings (name, operating hours, logo)
- Mock reviews (2-3 per doctor) for the doctor profile page

## 12. State Management Required
No new NgRx store needed for public portal — use simple service injection with RxJS BehaviorSubject or direct Observable from MockDataService.

## 13. Routes Required
```typescript
// public.routes.ts
{ path: '', component: PublicLayoutComponent, children: [
  { path: '', component: HomePage },
  { path: 'doctors', component: DoctorsPage },
  { path: 'doctors/:id', component: DoctorProfilePage },
  { path: 'services', component: ServicesPage },
  { path: 'announcements', component: AnnouncementsPage },
  { path: 'booking', loadChildren: () => booking.routes }  // Phase 4 stub
]}
```

## 14. UI Expectations
**Navbar:** Fixed 64px, white, logo left, nav links center, "Book Appointment" green pill button right, shadow on scroll. Mobile: hamburger opens slide-over.

**Hero:** Full gradient (#0D3D2A→#1A6B4A→#2D8060), min-height 640px. Badge tag "Trusted Healthcare Since 2020". H1 "Your Health, Our Priority" (text-5xl white bold). Sub: "Professional medical care tailored to you." Two CTAs: "Book Appointment" (white button) + "Meet Our Doctors" (ghost outline). Trust badges: "3 Specialist Doctors", "Available Mon-Sat", "Accepting New Patients".

**Doctor Cards:** Photo avatar, name, specialization badge, fee in green, star rating, "Book Now" CTA. 3-col grid on desktop, 2-col tablet, 1-col mobile.

**Service Category Cards:** 4 gradient cards (Consultation=green, Procedure=blue, Laboratory=amber, Diagnostic=rose). Icon, category name, service count, chevron.

**Doctor Profile:** Banner with doctor photo, name, specialization, fee, status badge. Bio section. Services offered list. Operating days. Reviews section (read-only star display). CTA: "Book Appointment with Dr. X" → links to /public/booking?doctorId=X (stub).

## 15. Fake Functionality Allowed
- Doctor photo = placeholder avatar with initials
- Reviews are hardcoded mock data
- "Book Appointment" navigates to a stub `/public/booking` (empty page with "Booking wizard coming soon")

## 16. Real Functionality Required
- Navigation between all public pages must work
- Filter by specialization on /doctors must work (client-side filter)
- Filter by category on /services must work
- Doctor profile /doctors/:id must load the correct doctor by ID
- Navbar scroll shadow must work
- Mobile hamburger menu must open/close

## 17. Validation Checklist
- [ ] Home page loads with hero, doctor cards, service cards, announcements
- [ ] /doctors loads list and filter works
- [ ] /doctors/:id shows correct doctor profile
- [ ] /services shows categorized services with filter
- [ ] /announcements shows all announcements
- [ ] Navbar is fixed and shows shadow on scroll
- [ ] Mobile hamburger menu works
- [ ] "Book Appointment" CTA is visible on all pages
- [ ] Footer shows clinic info and links

## 18. Manual Testing Checklist
- [ ] Home page hero looks stunning with correct gradient
- [ ] Doctor cards hover effect works (lift + shadow)
- [ ] Service category cards show correct colors
- [ ] Doctor profile shows all mock data
- [ ] Filter by specialization correctly filters doctors
- [ ] Mobile layout is fully responsive (test at 375px)
- [ ] Smooth page transitions (fadeSlideUp)

## 19. Git Commit Recommendation
```
git add .
git commit -m "phase-3: public portal — home, doctors, services, announcements, public layout"
```

## 20. Risks to Watch For
- AI may start implementing the booking wizard inside the doctor profile — **block this**
- AI may over-engineer the hero with third-party animation libraries — **use only CSS**
- AI may use Ion components incorrectly for public portal (Ionic is fine but use standard HTML for non-form elements where appropriate)

## 21. Definition of DONE
✅ All 5 public pages render correctly
✅ Navigation between pages works
✅ Filters work client-side
✅ Responsive on mobile
✅ Hero section is visually stunning
✅ Git commit made

---

### SHORT IMPLEMENTATION PROMPT — Phase 3

```
Build Phase 3 (Public Portal) of the clinic app.
DO NOT change anything from Phase 1 or Phase 2.

CREATE:
Pages: home, doctors, doctor-profile (by :id), services, announcements
Components: public-navbar, public-footer, public-layout, doctor-card, service-category-card, announcement-card, operating-hours-bar, hero-section, review-card
Service: public.service.ts (wraps MockDataService)
Routes: public.routes.ts with above pages

All data from MockDataService (mock only, no HTTP).
Doctor cards: 3-col grid, photo placeholder, name, specialization, fee, rating.
Hero: gradient background, tagline, 2 CTA buttons.
Filter: specialization filter on /doctors, category filter on /services.
"Book Appointment" links → /public/booking (stub page, empty).

DO NOT: implement booking wizard, slot grid, reviews form, real API calls.
STOP after all 5 pages render and navigation works.
```

---

### DETAILED IMPLEMENTATION PROMPT — Phase 3

```
You are building Phase 3 (Public Portal) of the Clinic Management System.
Phases 1 and 2 are complete. DO NOT modify any Phase 1 or Phase 2 file.

═══════════════════════════════════════
FILES TO CREATE:
═══════════════════════════════════════
src/app/portals/public/
├── public.routes.ts
├── components/
│   ├── public-layout/public-layout.component.ts + .scss
│   ├── public-navbar/public-navbar.component.ts + .scss
│   ├── public-footer/public-footer.component.ts + .scss
│   ├── hero-section/hero-section.component.ts + .scss
│   ├── doctor-card/doctor-card.component.ts + .scss
│   ├── service-category-card/service-category-card.component.ts + .scss
│   ├── announcement-card/announcement-card.component.ts + .scss
│   ├── operating-hours-bar/operating-hours-bar.component.ts + .scss
│   └── review-card/review-card.component.ts + .scss
├── home/home.page.ts + .scss
├── doctors/doctors.page.ts + .scss
├── doctor-profile/doctor-profile.page.ts + .scss
├── services/services.page.ts + .scss
├── announcements/announcements.page.ts + .scss
└── booking/booking.page.ts  ← stub only: shows "Booking wizard — Phase 4"

src/app/portals/public/services/public.service.ts

═══════════════════════════════════════
HERO SECTION:
═══════════════════════════════════════
background: var(--gradient-hero) — the deep green gradient
min-height: 640px
padding-top: 64px + var(--space-24) (account for fixed navbar)

Content (left-aligned, max-width 640px):
1. Tag badge: green glass pill "✚ Trusted Healthcare"
2. H1: "Your Health, Our Priority" — font-size var(--text-6xl), white, bold
3. Subtitle: "Professional medical care tailored to you and your family."
   — white, opacity 0.85, font-size var(--text-xl)
4. Buttons row:
   - "Book an Appointment" → /public/booking (white background, green text, pill)
   - "Meet Our Doctors" → /public/doctors (ghost outline white)
5. Trust badges row: 3 pill badges with icons:
   - "3 Specialist Doctors", "Available Mon–Sat", "Accepting New Patients"

Decorative: radial gradient blobs + large circle (CSS ::before/::after)

═══════════════════════════════════════
OPERATING HOURS BAR:
═══════════════════════════════════════
Full-width section below hero, white background with border-bottom
Displays ClinicSettingsService.getSettings().operatingHours in compact format:
Mon-Fri: 8:00 AM – 6:00 PM | Sat: 8:00 AM – 12:00 PM | Sun: Closed

═══════════════════════════════════════
DOCTOR CARD COMPONENT:
═══════════════════════════════════════
Inputs: doctor: Doctor
Display:
- Profile photo (avatar--xl with initials fallback, circular with green ring)
- Name (bold, text-lg)
- Specialization (badge, text-xs, neutral color)
- ₱XXX.00 consultation fee (green text, mono font)
- ★ 4.5 (XX reviews) — star icon + rating
- Status badge (active/inactive/on-leave)
- "Book Now" button (btn-primary, full width)

Card style: clinic-card with hover lift

═══════════════════════════════════════
SERVICE CATEGORY CARDS (4 gradient cards):
═══════════════════════════════════════
Consultation → gradient-card-green
Procedure → gradient-card-blue
Laboratory → gradient-card-amber
Diagnostic → gradient-card-rose

Each card: icon, category name, "X services available", chevron-forward icon

═══════════════════════════════════════
DOCTOR PROFILE PAGE:
═══════════════════════════════════════
Load doctor by route param :id from MockDataService.

Sections:
1. Profile banner: full-width card with gradient background
   - Large avatar (112px) with border
   - Name, specialization, fee, status badge
   - "Book Appointment" CTA button → /public/booking?doctorId=:id
2. About section: bio text in clinic-card
3. Services section: list of linked services with category badges
4. Schedule section: working days and hours (Mon-Fri or based on mock data)
5. Reviews section: list of review-card components (read-only)
   - Star rating, review text, patient first name initial + last name, date

If doctor not found → empty-state component

═══════════════════════════════════════
MOCK REVIEWS (add to MockDataService):
═══════════════════════════════════════
Add 3 mock reviews per doctor to MockDataService:
{ id, doctorId, patientName: "J. dela Cruz", rating: 5, comment: "Very thorough...", createdAt }

═══════════════════════════════════════
NAVBAR BEHAVIOR:
═══════════════════════════════════════
On scroll > 10px: add class 'scrolled' → box-shadow: var(--shadow-md)
Active link: highlight current route link
Mobile (<768px): show hamburger icon, hide nav links
Hamburger opens a slide-over drawer (IonMenu or CSS-only)

═══════════════════════════════════════
DO NOT TOUCH:
═══════════════════════════════════════
- src/styles.scss
- src/app/core/models/index.ts
- src/app/core/services/mock-data.service.ts (you MAY add reviews array)
- Any Phase 2 auth files
- Any shared component files
- /admin, /staff, /doctor, /patient stubs

FILES EXPECTED AFTER THIS PHASE:
(all public portal files listed above)
src/app/portals/public/public.routes.ts
All page + component files under src/app/portals/public/
src/app/portals/public/services/public.service.ts
```

---

> **STOP AFTER THIS PHASE.**
> **WAIT FOR HUMAN VALIDATION AND GIT COMMIT BEFORE PROCEEDING.**

---
---

# PHASE 4 — Booking Wizard

## 1. Phase Number
**Phase 4**

## 2. Phase Name
**Booking Wizard (Patient-Facing)**

## 3. Goal of the Phase
Build the complete multi-step booking wizard with mock slot generation, slot grid UI, booking timer, and a confirmation screen. The booking flow must be end-to-end functional using mock data and local state.

## 4. Why This Phase Exists
The booking wizard is the most complex UI flow in the public portal. It uses the `SlotGridComponent`, booking timer, payment instructions, and proof submission — all of which are reusable across portals. Isolating this phase reduces hallucination risk from context overflow.

## 5. Dependencies
- Phase 1: MockDataService (doctors, services, slot data), CSS system, status-badge, banner, skeleton
- Phase 2: Auth state (to check if patient is logged in for step 5)
- Phase 3: Public layout, doctor-card, public.service.ts

## 6. What Should Be Implemented
- Multi-step booking wizard component (8 steps as per PROJECT.md)
- Slot grid component (colors: white=available, red=full, amber=pending, green=selected)
- Date picker/calendar component (block unavailable days based on mock doctor schedule)
- Booking summary bar (sticky bottom panel showing doctor, date, time, service, fee)
- Booking timer component (countdown 10:00 from slot selection, monospace amber banner)
- Payment instructions step (GCash QR placeholder, Maya QR placeholder, bank details)
- Proof submission step (reference number input OR screenshot upload UI — mock only)
- Booking confirmation page (queue number, summary, "Add to Calendar" stub button)
- BookingStore NgRx feature (wizard state management)
- Booking booking-detail page (mock, shows booking in pending state with timer)

## 7. What Should NOT Be Implemented Yet
- No real slot availability API calls
- No real file upload (proof screenshot upload is UI only, no Cloudinary)
- No real payment verification
- No confirmation email
- No real queue number assignment

## 8. Pages to Create
- `public/booking/booking.page.ts + .scss` — wizard host
- `public/booking-confirmation/booking-confirmation.page.ts + .scss`

## 9. Components to Create
- `shared/components/slot-grid/slot-grid.component.ts + .scss` ← **SHARED** (used in admin/doctor portals too)
- `shared/components/booking-timer/booking-timer.component.ts + .scss` ← **SHARED**
- `public/components/booking-wizard/booking-wizard.component.ts + .scss` — step orchestrator
- `public/components/step-doctor-service/step-doctor-service.component.ts + .scss`
- `public/components/step-date-picker/step-date-picker.component.ts + .scss`
- `public/components/step-slot-select/step-slot-select.component.ts + .scss`
- `public/components/step-review/step-review.component.ts + .scss`
- `public/components/step-auth-check/step-auth-check.component.ts + .scss`
- `public/components/step-payment/step-payment.component.ts + .scss`
- `public/components/step-proof/step-proof.component.ts + .scss`
- `public/components/booking-summary-bar/booking-summary-bar.component.ts + .scss`

## 10. Services to Create
- `portals/public/services/booking-wizard.service.ts` — manages wizard step state locally (no store needed beyond booking NgRx)
- Add `MockSlotService` logic inside MockDataService — generates slots based on doctor schedule

## 11. Mock Data Required
Add to MockDataService:
- `generateSlots(doctorId, date)` — returns array of mock time slots:
  - Generate slots every 30 min from doctor's start time to end time
  - Mix of available (white), full (red: hardcode 2-3), pending (amber: hardcode 1)
- Payment settings (GCash name, number; Maya name, number; bank details)
- Clinic pay-at-clinic mode: false (online payment flow active)

## 12. State Management Required
**NgRx booking store:**
- `store/bookings/bookings.state.ts` — WizardState shape:
  ```
  { selectedDoctorId, selectedServiceId, selectedDate, selectedSlot, 
    currentStep, bookingId (mock), paymentMode, proofType, proofValue,
    isLoading, error }
  ```
- Actions: `selectDoctor`, `selectService`, `selectDate`, `selectSlot`, `nextStep`, `prevStep`, `submitBooking`, `submitBookingSuccess`, `submitProof`, `resetWizard`
- Effects: `submitBooking$` — 1s delay mock, generates mock bookingId, dispatches success

## 13. Routes Required
```typescript
// Add to public.routes.ts
{ path: 'booking', component: BookingWizardPage, canActivate: [] }  // no auth required for steps 1-4
{ path: 'booking-confirmation/:id', component: BookingConfirmationPage, canActivate: [AuthGuard] }
```

## 14. UI Expectations
**Wizard layout:**
- Step progress indicator at top (8 dots, current step highlighted green, completed steps checkmark)
- Main content area (centered, max 700px)
- Sticky booking summary bar at bottom (shows selected items as wizard progresses)
- Back / Next navigation buttons

**Slot Grid:**
- Grid layout: `repeat(auto-fill, minmax(88px, 1fr))`
- Each cell: 52px tall, shows time (e.g. "9:00 AM"), monospace font
- White = available (hover: green ring), Red = full (cursor: not-allowed), Amber = pending, Green = selected
- Clicking red/amber cell: Ionic toast "This slot is not available"
- If RunningLate mock flag is set → amber banner above grid
- If UnavailableToday → all slots disabled, danger banner

**Booking Timer:**
- Amber banner with countdown in monospace font: `⏱ Your slot is reserved for 09:47`
- When reaches 0 → navigate to empty state: "Slot expired. Please select a new slot."

**Confirmation page:**
- Green checkmark hero
- Queue number in large monospace: "#7"
- Booking summary: doctor, date, time, service, total fee
- "View My Appointments" button → /patient/bookings
- "Back to Home" button

## 15. Fake Functionality Allowed
- Slots generated from mock, not real availability
- Proof screenshot upload: file input shown, stores file name only, no real upload
- Queue number: randomly assigned (Math.floor(Math.random() * 10) + 1)
- Booking ID: generated as `BK-${Date.now()}`
- No real payment QR codes (show placeholder image with "QR Code Placeholder" text)

## 16. Real Functionality Required
- Wizard steps must progress in order (cannot skip steps)
- Back navigation must work (restore previous state)
- Selected slot must visually change to green/selected state
- Booking summary bar must update in real-time as selections are made
- Countdown timer must actually count down (use RxJS interval)
- Step 5 (auth check): if not logged in → redirect to /auth/login with returnUrl preserved

## 17. Validation Checklist
- [ ] Wizard loads at /public/booking
- [ ] Can select doctor and service in step 1
- [ ] Calendar shows doctor's working days (others grayed)
- [ ] Slot grid renders with mixed available/full/pending states
- [ ] Clicking an available slot changes it to green/selected
- [ ] Clicking a red/amber slot shows toast
- [ ] Booking summary bar updates on each selection
- [ ] Timer counts down from 10:00
- [ ] Timer reaching 0 shows expired state
- [ ] Proof submission step shows reference number input
- [ ] Confirmation page shows queue number
- [ ] "View My Appointments" navigates to /patient/bookings

## 18. Manual Testing Checklist
- [ ] Full booking wizard flow from step 1 to confirmation
- [ ] Slot colors are visually correct (white, red, amber, green)
- [ ] Booking summary bar is sticky and visible throughout
- [ ] Back button restores previous step
- [ ] Mobile wizard is usable (test at 375px)
- [ ] Timer animation is visible

## 19. Git Commit Recommendation
```
git add .
git commit -m "phase-4: booking wizard, slot grid, booking timer, confirmation page"
```

## 20. Risks to Watch For
- AI may over-engineer slot generation with complex scheduling logic — keep it simple mock
- AI may add real file upload logic — reject, use mock only
- AI may implement booking API calls — reject, mock only
- Slot grid is a shared component — AI must NOT duplicate it in any other component

## 21. Definition of DONE
✅ Full 8-step booking wizard navigable end-to-end
✅ Slot grid renders correctly in all 4 states
✅ Booking timer counts down
✅ Confirmation page shows with mock queue number
✅ Shared SlotGridComponent and BookingTimerComponent are properly in shared/
✅ Git commit made

---

### SHORT IMPLEMENTATION PROMPT — Phase 4

```
Build Phase 4 (Booking Wizard) of the clinic app.
DO NOT change anything from Phases 1-3.

CREATE:
Pages: booking (wizard host), booking-confirmation
Components: booking-wizard (8-step orchestrator), step-doctor-service, step-date-picker, step-slot-select, step-review, step-auth-check, step-payment, step-proof, booking-summary-bar
SHARED components (in src/app/shared/): slot-grid, booking-timer
NgRx booking store: actions, reducer, effects, selectors for wizard state

Slot grid: 4 states — available (white), full (red), pending (amber), selected (green)
Timer: 10:00 countdown in monospace amber banner using RxJS interval
Booking summary bar: sticky bottom, updates as user progresses through steps
Confirmation page: green checkmark, queue number, summary

All mock data — no real API calls, no real file upload, no real QR codes.
STOP after full wizard flow works from step 1 to confirmation.
```

---

### DETAILED IMPLEMENTATION PROMPT — Phase 4

```
You are building Phase 4 (Booking Wizard) of the Clinic Management System.
Phases 1-3 are complete. DO NOT modify any file from Phases 1-3.

═══════════════════════════════════════
FILES TO CREATE:
═══════════════════════════════════════
src/app/shared/components/
├── slot-grid/slot-grid.component.ts + .scss  ← SHARED (used in admin/doctor portals later)
└── booking-timer/booking-timer.component.ts + .scss  ← SHARED

src/app/portals/public/
├── booking/booking.page.ts + .scss
├── booking-confirmation/booking-confirmation.page.ts + .scss
└── components/
    ├── booking-wizard/booking-wizard.component.ts + .scss
    ├── step-doctor-service/step-doctor-service.component.ts + .scss
    ├── step-date-picker/step-date-picker.component.ts + .scss
    ├── step-slot-select/step-slot-select.component.ts + .scss
    ├── step-review/step-review.component.ts + .scss
    ├── step-auth-check/step-auth-check.component.ts + .scss
    ├── step-payment/step-payment.component.ts + .scss
    ├── step-proof/step-proof.component.ts + .scss
    └── booking-summary-bar/booking-summary-bar.component.ts + .scss

src/app/store/bookings/
├── bookings.state.ts
├── bookings.actions.ts
├── bookings.reducer.ts
├── bookings.effects.ts
└── bookings.selectors.ts

═══════════════════════════════════════
SLOT GRID COMPONENT:
═══════════════════════════════════════
Inputs:
  @Input() slots: TimeSlot[]  // { time: string, status: 'available'|'full'|'pending'|'selected' }
  @Input() selectedSlot: string | null
  @Input() runningLate: boolean = false
  @Input() unavailableToday: boolean = false
Outputs:
  @Output() slotSelected = new EventEmitter<string>()

Template:
- If unavailableToday → show banner--danger, disable all slots
- If runningLate → show banner--warning with running late message
- Grid of .slot-cell elements using CSS classes:
  slot-cell--available, slot-cell--full, slot-cell--pending, slot-cell--selected
- On click of available slot → emit slotSelected
- On click of full/pending slot → show Ionic toast "This slot is not available"

Mock slot data generator (add to MockDataService):
generateMockSlots(doctorId: string, date: Date): TimeSlot[] {
  // Generate 30min slots from 8AM to 5PM
  // Make slot at 9:00 and 10:00 'full', slot at 11:00 'pending', rest 'available'
}

═══════════════════════════════════════
BOOKING TIMER COMPONENT:
═══════════════════════════════════════
Input: @Input() durationSeconds: number = 600  // 10 minutes
Output: @Output() timerExpired = new EventEmitter<void>()

Implementation:
- Use RxJS: interval(1000).pipe(take(durationSeconds))
- Display: "⏱ Your slot is reserved for MM:SS" in amber banner
- MM:SS formatted with leading zeros
- When expired → emit timerExpired, show "Slot expired" empty state
- Stop timer on component destroy

═══════════════════════════════════════
WIZARD STEPS:
═══════════════════════════════════════
Step 1 — Select Doctor & Service:
  - Doctor cards grid (use doctor-card from Phase 3)
  - After selecting doctor → show services list for that doctor
  - Filter: show only services linked to selected doctor (from mock)
  - "Next" button enabled only when both doctor AND service selected

Step 2 — Select Date:
  - Calendar grid (current month + next month navigation)
  - Days matching doctor's working days (Mon-Fri for Santos, Mon/Wed/Fri for Reyes, etc.) = clickable (white)
  - Weekend/non-working days = grayed out
  - Today and past dates = grayed out
  - Selected date = green circle

Step 3 — Select Time Slot:
  - Call MockDataService.generateMockSlots(doctorId, date)
  - Render SlotGridComponent with generated slots
  - Start BookingTimerComponent (10 min) on slot selection
  - "Next" button enabled only when slot selected

Step 4 — Review Summary:
  - Display: Doctor name, specialization, date, time, service, fee breakdown
  - Fee breakdown: "Consultation Fee: ₱500 + [Service]: ₱0 = Total: ₱500"
  - "Proceed to Payment" button

Step 5 — Auth Check:
  - If not logged in: show "Please log in to continue"
    → "Login" button → /auth/login?returnUrl=/public/booking
    → "Register" button → /auth/register?returnUrl=/public/booking
    → "Continue as Guest" button (mock: skip to next step)
  - If logged in: auto-advance to step 6

Step 6 — Payment Instructions:
  - Clinic is NOT in PayAtClinic mode (mock default)
  - Show tabs: GCash | Maya | Bank Transfer
  - GCash tab: placeholder QR image (150x150 gray box), account name, number
  - Maya tab: same
  - Bank tab: bank name, account name, account number
  - Copy-to-clipboard button on account number (Ionic clipboard or navigator.clipboard)
  - Amount to pay: ₱XXX (highlighted green)
  - "I have paid, submit proof" button → step 7

Step 7 — Submit Proof:
  - Two radio options: "Reference Number" | "Screenshot"
  - Reference Number selected: text input for reference
  - Screenshot selected: file input (styled, accept="image/*")
    — Store file name only, no actual upload
  - Submit button → dispatches submitBooking action

Step 8 — No actual step, goes to /public/booking-confirmation/:id

═══════════════════════════════════════
BOOKING SUMMARY BAR:
═══════════════════════════════════════
Fixed bottom bar (height 72px, white background, top border, shadow)
Shows from Step 2 onwards.
Content: Doctor avatar (sm) | Dr. Name | Date (when selected) | Time (when selected) | ₱Fee
On mobile: condensed to 2 lines

═══════════════════════════════════════
BOOKING CONFIRMATION PAGE:
═══════════════════════════════════════
Centered layout, max-width 560px:
1. Large green checkmark circle (animated fadeIn)
2. "Booking Confirmed!" heading (text-2xl bold green)
3. "Awaiting payment verification" subtext
4. Queue card: "You are #7 in queue" (large monospace number in green stat card)
5. Summary card: doctor, date, time, service, total fee
6. Status badge: "Pending Verification"
7. Buttons:
   - "View My Appointments" → /patient/bookings
   - "Back to Home" → /public

═══════════════════════════════════════
NGRX BOOKING STORE:
═══════════════════════════════════════
interface WizardState {
  currentStep: number;
  selectedDoctorId: string | null;
  selectedServiceId: string | null;
  selectedDate: string | null;
  selectedSlot: string | null;
  bookingId: string | null;
  paymentMode: 'Online' | 'PayAtClinic';
  proofType: 'ReferenceNumber' | 'Screenshot' | null;
  proofValue: string | null;
  isLoading: boolean;
  error: string | null;
}

submitBooking$ effect: 1000ms delay, generate bookingId = 'BK-' + Date.now(), dispatch submitBookingSuccess, navigate to /public/booking-confirmation/:bookingId

═══════════════════════════════════════
DO NOT TOUCH:
═══════════════════════════════════════
All Phase 1, 2, 3 files (except adding mock slot generation + reviews to MockDataService)

FILES EXPECTED AFTER THIS PHASE:
(all listed above + updates to public.routes.ts + app.routes.ts to include booking store)
```

---

> **STOP AFTER THIS PHASE.**
> **WAIT FOR HUMAN VALIDATION AND GIT COMMIT BEFORE PROCEEDING.**

---
---

# PHASE 5 — Admin Portal Shell

## 1. Phase Number
**Phase 5**

## 2. Phase Name
**Admin Portal Shell**

## 3. Goal of the Phase
Build the complete Admin portal with sidebar layout, all admin pages, and full CRUD operations on mock data for: bookings management, patient registry, doctor management, services, announcements, and the admin dashboard with stat cards and charts.

## 4. Why This Phase Exists
The admin portal is the operational heart of the system. It must be built before the staff portal (Phase 6) because staff reuses many admin patterns. The admin dashboard proves the entire visual framework works end-to-end.

## 5. Dependencies
- Phase 1: All shared components, MockDataService, design system
- Phase 2: Auth state (admin role check), guards
- Phase 4: SlotGridComponent, BookingTimerComponent (shared)

## 6. What Should Be Implemented
**Layout:**
- Portal layout component (sidebar + topbar + main content)
- Sidebar with dark theme, nav items, active state, badge counts
- Topbar with search, notification bell (mock), avatar dropdown

**Pages:**
- Admin Dashboard (stat cards, today's appointments table, charts)
- Bookings list (table with filters, status badges, action buttons)
- Booking detail (status timeline, payment info, actions: confirm/reject/cancel/reschedule)
- Walk-in booking form (patient search, quick registration, slot selection)
- Calendar view (weekly view of all appointments per doctor)
- Doctors list + Doctor form (add/edit doctor)
- Services list + manage services
- Patient list + Patient detail (basic info, booking history)
- Staff accounts list + add staff form
- Announcements management (add/edit/delete)
- Settings page stub (shell only)
- Audit log page stub (shell only)

**NgRx stores (full):** bookings store, doctors store, patients store, notifications store

## 7. What Should NOT Be Implemented Yet
- No real consultation/prescription forms (Phase 7/9)
- No PDF generation
- No real file uploads
- No payment waive/refund modals (add to Phase 10 polish)
- No audit log real data (stub only)
- No real charts data (mock only)

## 8. Pages to Create
```
admin/dashboard/dashboard.page.ts + .scss
admin/bookings/bookings.page.ts + .scss
admin/booking-detail/booking-detail.page.ts + .scss
admin/walk-in/walk-in.page.ts + .scss
admin/calendar/calendar.page.ts + .scss
admin/doctors/doctors.page.ts + .scss
admin/doctor-form/doctor-form.page.ts + .scss
admin/services/services.page.ts + .scss
admin/patients/patients.page.ts + .scss
admin/patient-detail/patient-detail.page.ts + .scss
admin/staff/staff.page.ts + .scss
admin/announcements/announcements.page.ts + .scss
admin/settings/settings.page.ts + .scss  (stub)
admin/audit-logs/audit-logs.page.ts + .scss  (stub)
admin/reports/reports.page.ts + .scss  (stub)
```

## 9. Components to Create
- `portals/admin/components/portal-layout/portal-layout.component.ts + .scss` ← **REUSED BY STAFF AND DOCTOR**
- `portals/admin/components/sidebar/sidebar.component.ts + .scss`
- `portals/admin/components/topbar/topbar.component.ts + .scss`
- `portals/admin/components/notification-bell/notification-bell.component.ts + .scss`
- `portals/admin/components/stat-card/stat-card.component.ts + .scss`
- `portals/admin/components/today-appointments-table/today-appointments-table.component.ts + .scss`
- `portals/admin/components/booking-actions-menu/booking-actions-menu.component.ts + .scss`
- `portals/admin/components/doctor-schedule-form/doctor-schedule-form.component.ts + .scss`

## 10. Services to Create
- `portals/admin/services/admin-bookings.service.ts`
- `portals/admin/services/admin-doctors.service.ts`
- `portals/admin/services/admin-patients.service.ts`
- `portals/admin/services/admin-services.service.ts`

All return Observables from MockDataService with simulated delay (300ms).

## 11. Mock Data Required
Use MockDataService. Add if missing:
- generateAdminDashboardStats() — returns { todayAppointments: 12, monthAppointments: 87, revenueToday: 6500, pendingVerifications: 3, onHold: 1, unpaidCompleted: 2, noShowsToday: 1, upcomingFollowUps: 4 }
- Mock chart data: last 7 days bookings per doctor (for bar chart), last 30 days revenue (for area chart)

## 12. State Management Required
**Full NgRx feature stores:**
- `store/bookings/` — full actions/reducer/effects/selectors for bookings CRUD
- `store/doctors/` — full doctors store
- `store/patients/` — full patients store
- `store/notifications/` — notifications store (unread count, list)

## 13. Routes Required
```typescript
// admin.routes.ts
{ path: '', component: PortalLayoutComponent, canActivate: [AuthGuard, RoleGuard, FirstLoginGuard],
  data: { roles: ['Admin'] }, children: [
  { path: '',             redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard',    component: DashboardPage },
  { path: 'bookings',     component: BookingsPage },
  { path: 'bookings/:id', component: BookingDetailPage },
  { path: 'walk-in',      component: WalkInPage },
  { path: 'calendar',     component: CalendarPage },
  { path: 'doctors',      component: DoctorsPage },
  { path: 'doctors/new',  component: DoctorFormPage },
  { path: 'doctors/:id/edit', component: DoctorFormPage },
  { path: 'services',     component: ServicesPage },
  { path: 'patients',     component: PatientsPage },
  { path: 'patients/:id', component: PatientDetailPage },
  { path: 'staff',        component: StaffPage },
  { path: 'announcements',component: AnnouncementsPage },
  { path: 'settings',     component: SettingsPage },
  { path: 'audit-logs',   component: AuditLogsPage },
  { path: 'reports',      component: ReportsPage },
]}
```

## 14. UI Expectations
**Dashboard stat cards (8 total):**
1. Today's Appointments — stat-card--green — Ionicon: calendar-outline
2. This Month's Appointments — stat-card--blue — Ionicon: stats-chart-outline
3. Revenue Today (₱) — stat-card--amber — Ionicon: cash-outline
4. Pending Verifications — stat-card--red — "Action Required" badge
5. On Hold Bookings — stat-card--blue — Ionicon: time-outline
6. Unpaid Completed Visits — stat-card--red — "Collect Payment" badge
7. No Shows Today — stat-card (neutral gray)
8. Upcoming Follow-Ups (7 days) — stat-card--amber

**ApexCharts below stat cards:**
- Left chart: "Most Booked Doctors" — horizontal bar chart (ng-apexcharts)
- Right chart: "Revenue This Month" — area chart with gradient fill

**Today's appointments table:**
Columns: Queue#, Patient Name, Doctor, Service, Time, Status badge, Payment badge, Actions

**Booking detail page:**
- Status timeline (Pending → ProofSubmitted → Confirmed → Completed)
- Patient info card
- Doctor info card
- Payment info card
- Action buttons (role-appropriate): Confirm, Reject, Reschedule, Mark Complete, Mark No Show
- All actions show confirm-modal before executing

## 15. Fake Functionality Allowed
- Chart data is hardcoded mock
- Actions (confirm, cancel, etc.) update local mock state only (NgRx mutation, no API call)
- Walk-in: booking created in local NgRx store only
- PDF download buttons visible but show "Coming Soon" toast
- Notification bell shows mock notifications from MockDataService

## 16. Real Functionality Required
- Booking status changes via NgRx must visually update throughout the portal
- Filters on bookings list must work (by doctor, by status, by date)
- Patient search must work (filter MockDataService patients by name/code/contact)
- Doctor add/edit form must save to NgRx store (not API)
- Sidebar navigation must highlight active route
- Mobile sidebar must collapse to bottom tab bar

## 17. Validation Checklist
- [ ] /admin redirects to /admin/dashboard
- [ ] Dashboard shows 8 stat cards with values
- [ ] ApexCharts charts render
- [ ] Bookings list loads with all mock bookings
- [ ] Booking status badges render correctly
- [ ] Booking detail page loads for any booking ID
- [ ] Booking confirm action shows confirm-modal, then updates status badge
- [ ] Walk-in page shows patient search
- [ ] Doctors page lists all 3 mock doctors
- [ ] Doctor form can add a new doctor (saves to NgRx)
- [ ] Patients page shows list with search
- [ ] Patient detail loads for any patient ID
- [ ] Sidebar nav highlights active item
- [ ] Notification bell shows badge count

## 18. Manual Testing Checklist
- [ ] Navigate all admin pages, none crash
- [ ] Sidebar is dark and styled correctly
- [ ] Stat cards show correct gradient colors
- [ ] Charts render and look professional
- [ ] Confirm a booking → status badge changes to Confirmed
- [ ] Walk-in flow → search patient → select slot → create booking
- [ ] Mobile: sidebar collapses, bottom tab bar appears

## 19. Git Commit Recommendation
```
git add .
git commit -m "phase-5: admin portal — dashboard, bookings, patients, doctors, services, walk-in"
```

## 20. Risks to Watch For
- AI may generate portal-layout as a copy instead of the shared component — **enforce shared**
- AI may start implementing consultation forms (Phase 9) — **stop it**
- AI may over-engineer the calendar with a third-party library — use CSS grid calendar
- AI may implement real HTTP in admin services — reject, use MockDataService

## 21. Definition of DONE
✅ All 15 admin pages render without errors
✅ Dashboard stat cards and charts display correctly
✅ Booking status changes work through NgRx
✅ Walk-in booking creation works
✅ Sidebar navigation works, active states correct
✅ Mobile responsive layout works
✅ Git commit made

---

### SHORT IMPLEMENTATION PROMPT — Phase 5

```
Build Phase 5 (Admin Portal) of the clinic app.
DO NOT change anything from Phases 1-4.

CREATE portal-layout component (dark sidebar + topbar) — this will be reused by staff/doctor portals.
CREATE all admin pages: dashboard, bookings, booking-detail, walk-in, calendar, doctors, doctor-form, services, patients, patient-detail, staff, announcements, settings (stub), audit-logs (stub), reports (stub).
CREATE full NgRx stores: bookings, doctors, patients, notifications.
Dashboard: 8 stat cards (gradient colors as per spec) + 2 ApexCharts + today's appointment table.
All data from MockDataService. All mutations update NgRx store only (no API).
Sidebar: dark (#0F172A), nav items with icons, active state green, badge counts.
Mobile: bottom tab bar replaces sidebar.

DO NOT: implement consultation/prescription forms, PDF generation, real API calls.
STOP after all admin pages navigate without errors and dashboard renders.
```

---

### DETAILED IMPLEMENTATION PROMPT — Phase 5

```
You are building Phase 5 (Admin Portal) of the Clinic Management System.
Phases 1-4 are complete. DO NOT modify any Phase 1-4 file.
IMPORTANT: portal-layout, sidebar, topbar will be REUSED by staff (Phase 6) and doctor (Phase 7).
Make them configurable via @Input() properties (navItems, portalTitle).

═══════════════════════════════════════
PORTAL LAYOUT COMPONENT (SHARED):
═══════════════════════════════════════
src/app/shared/components/portal-layout/portal-layout.component.ts + .scss

@Input() navItems: NavItem[] = []
@Input() portalTitle: string = 'Dashboard'

interface NavItem {
  label: string;
  route: string;
  icon: string;  // Ionicon name
  badgeCount?: number;  // shows red badge
  section?: string;  // section label above item
}

Desktop: 260px dark sidebar + router-outlet main content
Mobile: hidden sidebar + 60px bottom tab bar (first 5 nav items)

SIDEBAR:
- background: var(--color-neutral-900)
- Brand area: clinic logo (from ClinicSettingsService) + clinic name + "Admin Portal" sub-label
- Nav items with section labels
- Active item: background var(--ion-color-primary), white text
- Footer: admin avatar + name + role + chevron (shows logout dropdown)

TOPBAR (64px):
- Search input (pill shape, var(--color-neutral-50) background)
- Notification bell with unread badge (from notifications store)
- Avatar with dropdown: "My Profile", "Logout"

═══════════════════════════════════════
ADMIN DASHBOARD PAGE:
═══════════════════════════════════════
Stat cards grid (4 columns desktop, 2 tablet, 1 mobile):
1. Today's Appointments — stat-card--green — calendar-outline — value from AdminDashboardStats
2. Monthly Appointments — stat-card--blue — stats-chart-outline
3. Revenue Today — stat-card--amber — cash-outline — "₱{value}" with peso-pipe
4. Pending Verifications — stat-card--red — alert-circle-outline — badge: "Action Required"
5. On Hold — stat-card--blue — time-outline
6. Unpaid Completed — stat-card--red — warning-outline — badge: "Collect Payment"
7. No Shows — stat-card (neutral styling)
8. Follow-Ups Due — stat-card--amber — calendar-outline

ApexCharts row (2 equal columns):
- Left: Horizontal bar — "Top Doctors by Bookings" — 3 bars for Dr. Santos, Dr. Reyes, Dr. Cruz
- Right: Area chart — "Revenue This Month" — 30 data points — green gradient fill

Today's appointments table below charts:
Columns: # | Patient | Doctor | Service | Time | Status | Payment | Actions
Actions column: 3-dot menu → Confirm | Cancel | Reschedule | Mark Complete

═══════════════════════════════════════
BOOKINGS PAGE:
═══════════════════════════════════════
Page header: "Bookings" title + "New Walk-In" button (navigates to /admin/walk-in)
Filter bar: Doctor dropdown | Status dropdown | Date range | Search input | Reset button
Table: all columns as dashboard table + link to /admin/bookings/:id

Each row clickable → navigates to booking-detail

Status badges use StatusBadgeComponent from shared/

═══════════════════════════════════════
BOOKING DETAIL PAGE:
═══════════════════════════════════════
Two-column layout: main info (left 2/3) + actions sidebar (right 1/3)

Main info:
- Status pill (large badge) + Booking ID (data-mono style)
- Patient card: avatar, name (PT-XXXX), DOB, contact
- Doctor card: photo, name, specialization
- Appointment card: date, time, service, queue number
- Payment card: mode, status badge, total fee, fee breakdown
  If ProofSubmitted: show reference number or "Screenshot uploaded"

Action sidebar (based on status):
- Pending: "Confirm" (green) + "Reject" (red) buttons
- ProofSubmitted: "Confirm Payment" (green) + "Reject" (red) buttons
- Confirmed: "Mark Complete" + "Mark No Show" + "Reschedule" + "Cancel" buttons
- Completed: "Download Receipt (Coming Soon)" + "Download Visit Summary (Coming Soon)"
- All destructive actions require confirm-modal with reason input

═══════════════════════════════════════
WALK-IN PAGE:
═══════════════════════════════════════
Two-column form layout:

Step 1 — Patient Search:
  Search input → filter MockDataService patients by name / contact / patient code
  Results list: clickable rows
  If patient not found: "Register as Guest" button (quick: name + contact only)
                        "Full Registration" button (full patient form)

Step 2 — Slot Selection (after patient selected):
  Doctor dropdown
  Date picker
  SlotGridComponent (same as booking wizard)

Step 3 — Payment Mode:
  Radio: "Pay at Clinic" | "Online (proof in hand)"
  Confirm button → creates booking in NgRx store with status = Confirmed

═══════════════════════════════════════
DOCTORS PAGE:
═══════════════════════════════════════
Table: photo avatar | name | specialization | fee | schedule | status badge | actions
"Add Doctor" button → /admin/doctors/new
Row click → /admin/doctors/:id/edit
Status toggle: Active | Inactive | On Leave (updates NgRx)

DOCTOR FORM PAGE:
Reactive form: fullName, specialization, bio (textarea), licenseNumber, ptrNumber, s2Number, consultationFee, status, profilePhoto (UI only, no upload)
Working days: checkboxes Mon-Sun
Working hours: time inputs (start, end)
Slot duration: 15 | 30 | 45 | 60 min radio
Daily patient limit: number input (optional)
Slot capacity: number input
Submit → dispatches addDoctor or updateDoctor to store

═══════════════════════════════════════
PATIENTS PAGE:
═══════════════════════════════════════
Search bar (filter by name, code, contact, DOB)
Table: Patient Code | Name | Sex | DOB | Contact | Email | Registered Date | Actions
"Add Patient" button → inline modal form (basic registration)
Row click → /admin/patients/:id

PATIENT DETAIL PAGE:
Tab layout: Overview | Bookings | (Medical Records — Phase 9 stub)
Overview tab: personal info card, emergency contact card, HMO/PhilHealth card
Bookings tab: table of patient's bookings with status

═══════════════════════════════════════
DO NOT TOUCH:
═══════════════════════════════════════
All Phase 1-4 files.
DO NOT implement: consultation forms, prescription forms, vital signs, lab results, PDF generation.
These are Phase 7 and Phase 9.

FILES EXPECTED AFTER THIS PHASE:
src/app/shared/components/portal-layout/portal-layout.component.ts + .scss
(and all admin page/component/service files listed above)
```

---

> **STOP AFTER THIS PHASE.**
> **WAIT FOR HUMAN VALIDATION AND GIT COMMIT BEFORE PROCEEDING.**

---
---

# PHASE 6 — Staff Portal Shell

## 1. Phase Number
**Phase 6**

## 2. Phase Name
**Staff Portal Shell**

## 3. Goal of the Phase
Build the Staff portal by reusing the shared portal-layout and adapting it for staff permissions. Staff has a subset of admin capabilities plus the queue management view and doctor status flags.

## 4. Why This Phase Exists
Staff portal is deliberately separate from admin to enforce role boundaries visually and functionally. Staff pages that mirror admin (bookings, patients) are reused with restricted action sets.

## 5. Dependencies
- Phase 1–4 (full)
- Phase 5: PortalLayoutComponent, all NgRx stores, AdminBookingsService, AdminPatientsService

## 6. What Should Be Implemented
- Staff portal using shared PortalLayoutComponent (configured with staff nav items)
- Staff dashboard (today's queue, pending verifications alert, upcoming appointments)
- Bookings page (same as admin but without waive/refund actions)
- Booking detail (same layout, restricted action set: no waive, no refund, no delete)
- Walk-in booking (identical to admin walk-in)
- Patients page (view + edit patient info)
- Doctor status flags: "Set Running Late" and "Set Unavailable Today" per doctor
- Staff own profile page (edit name, contact, password only)

## 7. What Should NOT Be Implemented Yet
- No admin account management
- No settings page
- No audit log
- No waive/refund actions
- No consultation/prescription forms

## 8. Pages to Create
```
staff/dashboard/staff-dashboard.page.ts + .scss
staff/bookings/staff-bookings.page.ts + .scss
staff/booking-detail/staff-booking-detail.page.ts + .scss
staff/walk-in/staff-walk-in.page.ts + .scss
staff/patients/staff-patients.page.ts + .scss
staff/patient-detail/staff-patient-detail.page.ts + .scss
staff/doctor-status/doctor-status.page.ts + .scss
staff/profile/staff-profile.page.ts + .scss
```

## 9. Components to Create
- `staff/components/queue-table/queue-table.component.ts + .scss`
- `staff/components/doctor-status-card/doctor-status-card.component.ts + .scss`

## 10. Services to Create
- `portals/staff/services/staff.service.ts` (thin wrapper, reads from same MockDataService)

## 11. Mock Data Required
Existing mock data. No new additions needed.

## 12. State Management Required
Reuse all NgRx stores from Phase 5. No new stores.

## 13. Routes Required
```typescript
// staff.routes.ts
{ path: '', component: PortalLayoutComponent,
  data: { portalNavItems: STAFF_NAV_ITEMS }, children: [
  { path: '',                redirectTo: 'dashboard' },
  { path: 'dashboard',       component: StaffDashboardPage },
  { path: 'bookings',        component: StaffBookingsPage },
  { path: 'bookings/:id',    component: StaffBookingDetailPage },
  { path: 'walk-in',         component: StaffWalkInPage },
  { path: 'patients',        component: StaffPatientsPage },
  { path: 'patients/:id',    component: StaffPatientDetailPage },
  { path: 'doctor-status',   component: DoctorStatusPage },
  { path: 'profile',         component: StaffProfilePage },
]}
```

## 14. UI Expectations
**Staff Dashboard:** Simpler than admin — focuses on today's queue.
- "Today's Queue" section: table sorted by queue number, doctor name filter
- "Pending Verifications" alert card (red, shows count, link to bookings with ProofSubmitted filter)
- 4 stat cards (smaller set): Today's Appointments, Pending Verifications, Walk-ins Today, No Shows

**Doctor Status Page:**
- Card per doctor (3 cards): Doctor photo, name, specialization, current status
- Toggle buttons: "Set Running Late" (shows input for estimated minutes), "Set Unavailable Today", "Mark Available"
- Changes update NgRx store (DoctorDayStatus)

## 15. Fake Functionality Allowed
- Doctor status changes update NgRx store only (no API)
- All booking actions same as admin (NgRx mock)

## 16. Real Functionality Required
- Waive and Refund action buttons must NOT appear for staff
- Admin management and Settings links must NOT appear in staff sidebar
- Staff can see own profile and edit name/contact/password (form + NgRx mock save)

## 17. Validation Checklist
- [ ] Login as staff@clinic.ph → redirects to /staff/dashboard
- [ ] Staff dashboard shows today's queue
- [ ] Booking detail does NOT show Waive or Refund buttons
- [ ] Doctor status page allows setting Running Late with minutes
- [ ] Doctor status page shows "Unavailable Today" toggle
- [ ] Staff profile page loads and form works
- [ ] No admin-only links visible in staff sidebar

## 18. Manual Testing Checklist
- [ ] Navigate all staff pages, none crash
- [ ] Set Dr. Santos as "Running Late — 15 minutes" → public portal shows banner (navigate to /public/doctors/:id)
- [ ] Set Dr. Reyes as "Unavailable Today" → public portal shows unavailable state
- [ ] Staff cannot access /admin routes

## 19. Git Commit Recommendation
```
git add .
git commit -m "phase-6: staff portal — dashboard, queue management, booking ops, doctor status flags"
```

## 20. Risks to Watch For
- AI may copy-paste admin pages instead of reusing shared components
- AI may give staff access to admin-only features
- AI may create a new portal-layout instead of reusing Phase 5's shared one

## 21. Definition of DONE
✅ All staff pages render
✅ Staff cannot access admin-only features
✅ Doctor status flags work and update public portal display
✅ Walk-in flow works identically to admin
✅ Git commit made

---

### SHORT IMPLEMENTATION PROMPT — Phase 6

```
Build Phase 6 (Staff Portal) of the clinic app.
DO NOT change anything from Phases 1-5.

REUSE: PortalLayoutComponent from Phase 5 (pass different navItems for staff)
REUSE: all NgRx stores from Phase 5

CREATE staff pages: dashboard, bookings (no waive/refund), booking-detail (restricted actions), walk-in (same as admin), patients, patient-detail, doctor-status, profile.
STAFF NAV: Dashboard | Bookings | Walk-In | Patients | Doctor Status | My Profile
NO admin features: no Settings, no Audit Log, no Admin Accounts, no Waive/Refund buttons.

Doctor status page: 3 cards, one per doctor. Toggle: Set Running Late (+ minutes input) | Unavailable Today | Available.

STOP after all staff pages render and permission restrictions are confirmed.
```

---

### DETAILED IMPLEMENTATION PROMPT — Phase 6

```
You are building Phase 6 (Staff Portal) of the Clinic Management System.
Phases 1-5 complete. DO NOT modify Phase 1-5 files.

KEY RULE: DO NOT duplicate PortalLayoutComponent. Import it from src/app/shared/components/portal-layout.

STAFF_NAV_ITEMS constant to define:
[
  { label: 'Dashboard',    route: '/staff/dashboard',      icon: 'grid-outline',     section: 'Main' },
  { label: 'Bookings',     route: '/staff/bookings',       icon: 'calendar-outline',  badgeCount: pendingCount },
  { label: 'Walk-In',      route: '/staff/walk-in',        icon: 'walk-outline' },
  { label: 'Patients',     route: '/staff/patients',       icon: 'people-outline' },
  { label: 'Doctor Status',route: '/staff/doctor-status',  icon: 'medical-outline',   section: 'Tools' },
  { label: 'My Profile',   route: '/staff/profile',        icon: 'person-outline',    section: 'Account' },
]

STAFF DASHBOARD:
4 stat cards: Today's Appointments (green), Pending Verifications (red + "Action Required"), Walk-Ins Today (blue), Confirmed Today (neutral)
Today's Queue table below: Queue# | Patient | Doctor | Service | Time | Status | Actions
"Set Doctor Status" shortcut link → /staff/doctor-status

BOOKING DETAIL DIFFERENCES FROM ADMIN:
- REMOVE: Waive Payment button, Refund button
- KEEP: Confirm, Reject, Reschedule, Mark Complete, Mark No Show
- Add a visible note: "Only Admin can waive or refund payments."

DOCTOR STATUS PAGE:
3 ion-cards, one per doctor from MockDataService.
Each card shows:
- Doctor avatar, name, specialization
- Current status chip (Available = green, RunningLate = amber, UnavailableToday = red)
- Action buttons:
  "Set Running Late" → shows inline input for minutes, updates NgRx DoctorDayStatus
  "Mark Unavailable Today" → confirm-modal → updates status
  "Mark Available" → resets status

When status changes in NgRx → the public portal doctor profile should reflect this:
Connect to selectDoctorDayStatuses in doctors store.

STAFF PROFILE PAGE:
Simple form: Full Name (editable), Contact Number (editable), Email (read-only), Password change section (current password + new + confirm).
Save updates NgRx store only (mock).

PERMISSION ENFORCEMENT:
Use RoleGuard on all /staff routes (roles: ['Staff'])
Remove admin-specific links from sidebar
In booking-detail component, add an @Input() mode: 'admin' | 'staff' = 'admin'
When mode = 'staff', hide waive/refund buttons.

DO NOT TOUCH: All Phase 1-5 files except adding DoctorDayStatus to doctors store (if not already present).
```

---

> **STOP AFTER THIS PHASE.**
> **WAIT FOR HUMAN VALIDATION AND GIT COMMIT BEFORE PROCEEDING.**

---
---

# PHASE 7 — Doctor Portal Shell

## 1. Phase Number
**Phase 7**

## 2. Phase Name
**Doctor Portal Shell**

## 3. Goal of the Phase
Build the Doctor portal with today's queue, appointment management, patient list (own patients only), doctor self-service settings (fee, schedule, slot config, blocked dates, availability), and a stub for the consultation form.

## 4. Why This Phase Exists
Doctor portal has unique patterns not present in admin/staff: the queue-based workflow, self-service schedule management, and the consultation form (which is its own complex phase). Building the shell here sets up the navigation and layout so Phase 9 can drop the consultation form in cleanly.

## 5. Dependencies
- All Phases 1-6

## 6. What Should Be Implemented
- Doctor portal using shared PortalLayoutComponent
- Doctor dashboard (today's queue table, quick stats, availability toggle)
- Appointments page (today's queue + upcoming week)
- Appointment detail page (patient info, booking detail, "Start Consultation" CTA → stub)
- Patients page (own patients only — filtered by consultation history in mock)
- Patient detail page (read-only: basic info + booking history + consultation stubs)
- Doctor settings page (fee, slot duration, slot capacity, daily limit)
- Schedule management page (working days/hours, blocked dates calendar)
- Doctor profile page (edit name, bio, photo upload UI)

## 7. What Should NOT Be Implemented Yet
- No consultation form (Phase 9)
- No prescription form
- No vital signs entry
- No ICD-10 search

## 8. Pages to Create
```
doctor/dashboard/doctor-dashboard.page.ts + .scss
doctor/appointments/doctor-appointments.page.ts + .scss
doctor/appointment-detail/doctor-appointment-detail.page.ts + .scss
doctor/patients/doctor-patients.page.ts + .scss
doctor/patient-detail/doctor-patient-detail.page.ts + .scss
doctor/my-settings/doctor-settings.page.ts + .scss
doctor/schedule/doctor-schedule.page.ts + .scss
doctor/profile/doctor-profile.page.ts + .scss
```

## 9. Components to Create
- `doctor/components/queue-card/queue-card.component.ts + .scss`
- `doctor/components/availability-toggle/availability-toggle.component.ts + .scss`
- `doctor/components/blocked-dates-calendar/blocked-dates-calendar.component.ts + .scss`
- `doctor/components/schedule-editor/schedule-editor.component.ts + .scss`

## 10. Services to Create
- `portals/doctor/services/doctor.service.ts` — reads own data from MockDataService filtered by logged-in doctor ID

## 11. Mock Data Required
- Use existing MockDataService (doctors, patients, bookings)
- Add: DoctorDayStatus mock per doctor
- Mock blocked dates: 2-3 blocked dates per doctor in next 30 days

## 12. State Management Required
Reuse NgRx stores from Phase 5. No new stores.
Add selectors to doctors store: `selectDoctorById`, `selectCurrentDoctorSchedule`, `selectCurrentDoctorBlockedDates`.

## 13. Routes Required
```typescript
// doctor.routes.ts
{ path: '', component: PortalLayoutComponent,
  data: { portalNavItems: DOCTOR_NAV_ITEMS }, children: [
  { path: '',                  redirectTo: 'dashboard' },
  { path: 'dashboard',         component: DoctorDashboardPage },
  { path: 'appointments',      component: DoctorAppointmentsPage },
  { path: 'appointments/:id',  component: DoctorAppointmentDetailPage },
  { path: 'patients',          component: DoctorPatientsPage },
  { path: 'patients/:id',      component: DoctorPatientDetailPage },
  { path: 'my-settings',       component: DoctorSettingsPage },
  { path: 'schedule',          component: DoctorSchedulePage },
  { path: 'profile',           component: DoctorProfilePage },
]}
```

## 14. UI Expectations
**Doctor Dashboard:**
- Availability toggle at top: 3-option pill toggle — "Available" (green) | "Running Late" (amber + minutes input) | "Unavailable Today" (red)
- Today's queue: numbered cards in a grid layout. Each card: Queue#, Patient name, Time, Service, "Start Consultation" CTA
- Stats row: Today's Patients | Completed Today | No Shows | Remaining
- Quick settings widget (fee, slot duration)

**Queue Card:**
- Large queue number (bold, text-3xl, primary color)
- Patient name (bold, text-base)
- Appointment time (mono, text-sm)
- Service name (badge)
- Status badge
- "Start Consultation" button → navigates to stub page

**Schedule page:**
- Weekly schedule editor: checkboxes for Mon-Sun, time inputs per day
- Blocked dates section: mini calendar + "Add Blocked Date" button
- Blocked dates list with remove button

## 15. Fake Functionality Allowed
- Schedule changes save to NgRx only
- "Start Consultation" links to `/doctor/appointments/:id/consultation` stub page (empty, "Consultation form coming in next phase")
- Doctor photo upload is UI only

## 16. Real Functionality Required
- Availability toggle updates DoctorDayStatus in NgRx
- When RunningLate set → public portal shows amber banner on doctor profile
- Schedule editor shows correct current schedule from mock data
- Patient list shows ONLY patients that doctor has seen (filtered mock consultations)

## 17. Validation Checklist
- [ ] Login as dr.santos@clinic.ph → redirects to /doctor/dashboard
- [ ] Dashboard shows today's queue with queue cards
- [ ] Availability toggle changes status in NgRx
- [ ] Running late flag shows banner on public portal
- [ ] Schedule page shows current schedule
- [ ] Patient list only shows patients associated with this doctor
- [ ] Appointment detail loads correctly

## 18. Manual Testing Checklist
- [ ] All doctor pages navigate without errors
- [ ] Set availability to "Running Late — 20 min" → check /public/doctors/:id shows amber banner
- [ ] Set availability to "Unavailable Today" → check /public/doctors/:id shows danger notice + slots disabled
- [ ] Doctor schedule page renders working days correctly
- [ ] Add a blocked date → appears in list

## 19. Git Commit Recommendation
```
git add .
git commit -m "phase-7: doctor portal — dashboard, queue, appointments, settings, schedule, patients"
```

## 20. Risks to Watch For
- AI may prematurely implement consultation form — **leave as stub**
- AI may not filter patient list to own patients only
- AI may create duplicate PortalLayoutComponent

## 21. Definition of DONE
✅ All doctor pages render
✅ Availability toggle works and updates public portal display
✅ Queue cards displayed correctly
✅ Patient list filtered to doctor's own patients
✅ Schedule page functional
✅ Consultation page is a clear stub with "Coming in Phase 9" message
✅ Git commit made

---

### SHORT IMPLEMENTATION PROMPT — Phase 7

```
Build Phase 7 (Doctor Portal) of the clinic app.
DO NOT change anything from Phases 1-6.

REUSE: PortalLayoutComponent from Phase 5.
CREATE doctor pages: dashboard, appointments, appointment-detail, patients (own only), patient-detail, my-settings, schedule, profile.
DOCTOR NAV: Dashboard | Appointments | Patients | My Settings | Schedule | My Profile

Dashboard: availability 3-way toggle (Available/RunningLate/Unavailable), today's queue cards, 4 stat tiles.
Schedule page: day checkboxes + time inputs, blocked dates mini-calendar.
Patient list: filter MockDataService to only return patients with consultations by current doctor.
"Start Consultation" button on appointment-detail → shows stub page "Consultation form — Phase 9".
Running Late status change must update public portal doctor profile banner.

DO NOT implement: consultation form, prescription form, vital signs.
STOP after all doctor pages render and availability toggle updates public portal.
```

---

> **STOP AFTER THIS PHASE.**
> **WAIT FOR HUMAN VALIDATION AND GIT COMMIT BEFORE PROCEEDING.**

---
---

# PHASE 8 — Patient Portal

## 1. Phase Number
**Phase 8**

## 2. Phase Name
**Patient Portal**

## 3. Goal of the Phase
Build the logged-in patient portal: dashboard, booking history, booking detail with payment proof submission, medical records (read-only), prescriptions (read-only), profile management, and privacy consent re-prompt flow.

## 4. Why This Phase Exists
The patient portal completes the end-to-end patient journey (book → pay → receive care → view records). It uses a different layout from the dashboard portals (top navbar, not sidebar) and has unique concerns like consent versioning.

## 5. Dependencies
- All Phases 1-7
- Phase 4: BookingTimerComponent (reused for pending booking proof submission)

## 6. What Should Be Implemented
- Patient portal layout (white topbar with tabs, no sidebar)
- Patient dashboard (upcoming appointments, recent medical records, action alerts)
- Bookings list (own bookings, status filters)
- Booking detail (timeline, payment info, submit proof form for Pending bookings, cancel option)
- Medical records page (read-only list of consultations)
- Prescriptions page (read-only list, download stub)
- Patient profile page (edit personal info, emergency contact, HMO info)
- Privacy consent page (consent text + Accept button)
- Unverified email banner

## 7. What Should NOT Be Implemented Yet
- No consultation detail (Phase 9 adds these)
- No actual PDF download
- No reviews submission (add in Phase 10 polish)

## 8. Pages to Create
```
patient/dashboard/patient-dashboard.page.ts + .scss
patient/bookings/patient-bookings.page.ts + .scss
patient/booking-detail/patient-booking-detail.page.ts + .scss
patient/medical-records/patient-medical-records.page.ts + .scss
patient/prescriptions/patient-prescriptions.page.ts + .scss
patient/profile/patient-profile.page.ts + .scss
patient/privacy-consent/patient-privacy-consent.page.ts + .scss
```

## 9. Components to Create
- `patient/components/patient-topbar/patient-topbar.component.ts + .scss`
- `patient/components/patient-layout/patient-layout.component.ts + .scss`
- `patient/components/upcoming-appointment-card/upcoming-appointment-card.component.ts + .scss`
- `patient/components/medical-record-card/medical-record-card.component.ts + .scss`
- `patient/components/prescription-card/prescription-card.component.ts + .scss`
- `patient/components/booking-timeline/booking-timeline.component.ts + .scss`
- `patient/components/proof-submission-form/proof-submission-form.component.ts + .scss`

## 10. Services to Create
- `portals/patient/services/patient.service.ts` — reads own data from MockDataService filtered by patient userId

## 11. Mock Data Required
Use existing MockDataService. Add:
- 2-3 mock consultations per patient (for medical-records page)
- 1-2 mock prescriptions per patient with prescription items
- 1 upcoming confirmed booking per patient

## 12. State Management Required
Reuse NgRx stores. No new stores needed.
Add selectors to bookings store: `selectBookingsByPatientId`.
Add patient-specific selectors to patients store: `selectCurrentPatient`.

## 13. Routes Required
```typescript
// patient.routes.ts
{ path: '', component: PatientLayoutComponent, canActivate: [AuthGuard, RoleGuard],
  data: { roles: ['Patient'] }, children: [
  { path: '',                redirectTo: 'dashboard' },
  { path: 'dashboard',       component: PatientDashboardPage },
  { path: 'bookings',        component: PatientBookingsPage },
  { path: 'bookings/:id',    component: PatientBookingDetailPage },
  { path: 'medical-records', component: PatientMedicalRecordsPage },
  { path: 'prescriptions',   component: PatientPrescriptionsPage },
  { path: 'profile',         component: PatientProfilePage },
  { path: 'privacy-consent', component: PatientPrivacyConsentPage },
]}
```

## 14. UI Expectations
**Patient layout:**
- White topbar (64px): clinic logo left, nav links center (Dashboard | My Bookings | Medical Records | Prescriptions | Profile), notification bell + avatar right
- No sidebar. Light page background (var(--clinic-bg))
- Mobile: bottom tab bar with 5 icons

**Patient dashboard:**
- If unverified email → full-width blue info banner "Please verify your email. [Resend]"
- Upcoming appointments: next 1-2 confirmed appointments as cards (doctor avatar, date/time, queue#, "View Details" CTA)
- Pending bookings alert: if any booking in Pending status → amber card "You have X bookings awaiting proof submission"
- Recent consultations: 2 most recent as mini-cards (date, doctor, chief complaint)

**Booking detail:**
- Status timeline steps visual (horizontal, 5 steps): Pending → Proof Submitted → Confirmed → Completed
- If status = Pending: show proof-submission-form + BookingTimerComponent (countdown)
- If status = Confirmed: show queue number prominently, appointment details
- If status = Completed: show "Download Visit Summary" stub + "Leave a Review" button (stub)
- Cancel booking button (only for Pending or Confirmed status, within deadline)

**Privacy consent page:**
- Shows ClinicSettings.PrivacyPolicyText (use placeholder lorem ipsum for mock)
- "Accept and Continue" button → marks consent as accepted in NgRx, redirect to dashboard
- Cannot be dismissed — patient must accept before accessing portal

## 15. Fake Functionality Allowed
- PDF download shows "Coming Soon" toast
- Review submission shows "Coming Soon" toast
- Proof submission: file upload is UI only, no real upload
- Resend verification email shows success toast

## 16. Real Functionality Required
- Privacy consent guard: if patient's consentVersion !== ClinicSettings.consentVersion → redirect to /patient/privacy-consent
- After accepting consent: update NgRx patient state (consentVersion matches)
- Cancel booking: confirm-modal, updates NgRx booking status to Cancelled
- Proof submission form: validates reference number OR file selected, updates NgRx booking status to ProofSubmitted

## 17. Validation Checklist
- [ ] Login as patient@clinic.ph → redirects to /patient/dashboard
- [ ] Dashboard shows upcoming appointments
- [ ] Pending booking shows timer and proof form
- [ ] Submitting proof changes booking status to ProofSubmitted
- [ ] Medical records page shows list of mock consultations
- [ ] Prescriptions page shows mock prescriptions
- [ ] Profile page form is editable
- [ ] Privacy consent redirect works if versions mismatch
- [ ] Accepting consent updates NgRx state

## 18. Manual Testing Checklist
- [ ] Full patient experience: login → see dashboard → view pending booking → submit proof → see status change
- [ ] Check that medical records are read-only (no edit buttons)
- [ ] Cancel a Confirmed booking → confirm-modal → status changes to Cancelled
- [ ] Privacy consent: force consent mismatch in MockDataService → login → redirected to consent page → accept → goes to dashboard

## 19. Git Commit Recommendation
```
git add .
git commit -m "phase-8: patient portal — dashboard, bookings, proof submission, medical records, profile, consent"
```

## 20. Risks to Watch For
- AI may build a sidebar layout instead of the specified top-nav layout
- AI may implement consultation form in medical-records (Phase 9 only)
- AI may skip the consent guard logic

## 21. Definition of DONE
✅ All patient portal pages render
✅ Proof submission changes booking status
✅ Privacy consent redirect and acceptance work
✅ Medical records and prescriptions are read-only displays
✅ Cancel booking works
✅ Git commit made

---

### SHORT IMPLEMENTATION PROMPT — Phase 8

```
Build Phase 8 (Patient Portal) of the clinic app.
DO NOT change anything from Phases 1-7.

Layout: top-navbar (no sidebar), clinic logo + nav tabs + bell + avatar. Mobile: bottom tab bar.
Pages: dashboard, bookings, booking-detail, medical-records (read-only), prescriptions (read-only), profile, privacy-consent.

Dashboard: email verification banner, upcoming appointment cards, pending booking alert.
Booking-detail: status timeline + proof submission form (Pending bookings) + BookingTimerComponent.
Privacy consent: mandatory accept screen, guard redirects here if consentVersion mismatch.
Medical-records: list of consultations (read-only, no edit, no consultation form).
Prescriptions: list of prescriptions (read-only).

DO NOT: implement consultation form, prescription form, PDF download, reviews form.
STOP after all patient pages work and proof submission updates booking status.
```

---

> **STOP AFTER THIS PHASE.**
> **WAIT FOR HUMAN VALIDATION AND GIT COMMIT BEFORE PROCEEDING.**

---
---

# PHASE 9 — Medical Records Module

## 1. Phase Number
**Phase 9**

## 2. Phase Name
**Medical Records Module (Consultations, Prescriptions, Vitals, Diagnoses, Allergies, Labs)**

## 3. Goal of the Phase
Build the full medical records module accessible to Admin and Doctor. This includes: the consultation form (SOAP + vital signs + ICD-10 + prescriptions), allergy management, lab result attachment UI, vaccination records, and the patient medical history view.

## 4. Why This Phase Exists
Medical records is the most complex feature set with the highest hallucination risk. By isolating it to its own phase after all portals are established, the AI has clear context boundaries and can focus entirely on the clinical forms and data structures.

## 5. Dependencies
- All Phases 1-8
- Phase 5: Admin patient-detail page (stub Medical Records tab becomes real here)
- Phase 7: Doctor appointment-detail "Start Consultation" CTA becomes real here

## 6. What Should Be Implemented
- Consultation form page (SOAP: chief complaint, HPI, PE findings, assessment, plan, follow-up date)
- Vital signs form within consultation (BP, HR, RR, Temp, O2Sat, Weight, Height, BMI auto-calc)
- ICD-10 code search component (searchable dropdown, mock 500 ICD codes)
- Diagnoses section within consultation (add multiple, type: Primary/Secondary/Comorbidity)
- Prescription form (drug name, dosage form, strength, quantity, sig, controlled substance flag)
- Allergy warning banner (triggered when drug name matches allergy list)
- Allergy management section in patient detail
- Lab results attachment section in patient detail (upload UI mock only)
- Vaccination records section in patient detail
- Vital signs trend chart (ApexCharts area/line chart — BP trend, weight over time)
- Consultation lock indicator (🔒 if isLocked: true — no edit allowed)
- Consultation amendment flow (locked consultations: "Add Amendment" button)
- Patient medical history tab in admin and doctor patient-detail pages

## 7. What Should NOT Be Implemented Yet
- No actual file upload (lab results)
- No PDF generation (Phase 10)
- No real ICD-10 API (use local JSON of 500 mock codes)

## 8. Pages to Create
```
doctor/consultation-form/consultation-form.page.ts + .scss
admin/patient-detail/ (update Medical Records tab — already exists as stub)
```

## 9. Components to Create
- `shared/components/icd10-search/icd10-search.component.ts + .scss` ← **SHARED**
- `shared/components/vital-signs-form/vital-signs-form.component.ts + .scss` ← **SHARED**
- `shared/components/allergy-warning-banner/allergy-warning-banner.component.ts + .scss` ← **SHARED**
- `shared/components/running-late-banner/running-late-banner.component.ts + .scss` ← **SHARED**
- `shared/components/prescription-form/prescription-form.component.ts + .scss` ← **SHARED**
- `shared/components/vitals-trend-chart/vitals-trend-chart.component.ts + .scss`
- `medical-records/components/consultation-card/consultation-card.component.ts + .scss`
- `medical-records/components/prescription-card/prescription-card.component.ts + .scss`
- `medical-records/components/allergy-list/allergy-list.component.ts + .scss`
- `medical-records/components/lab-result-card/lab-result-card.component.ts + .scss`
- `medical-records/components/vaccination-record-row/vaccination-record-row.component.ts + .scss`
- `medical-records/components/diagnosis-row/diagnosis-row.component.ts + .scss`

## 10. Services to Create
- `core/services/medical-records.service.ts` — reads from/writes to MockDataService for consultations, prescriptions, vitals, diagnoses, allergies, labs, vaccinations

## 11. Mock Data Required
Add to MockDataService:
- 2-3 consultations per patient (with vital signs, diagnoses, prescriptions)
- 1 allergy per patient (e.g. "Penicillin — Drug — Severe")
- 1 lab result attachment per patient (placeholder)
- 1 vaccination record per patient
- Local ICD-10 JSON: 500 common codes (create a `src/assets/icd10.json`)

## 12. State Management Required
Add to existing NgRx stores or create new feature:
- `store/medical-records/` — consultations, prescriptions, vitals, diagnoses, allergies, labs, vaccinations
- Actions: `loadConsultations`, `createConsultation`, `updateConsultation`, `createPrescription`, `addDiagnosis`, `addAllergy`, `addLabResult`, `addVaccination`

## 13. Routes Required
```typescript
// Add to doctor.routes.ts:
{ path: 'appointments/:id/consultation', component: ConsultationFormPage }
{ path: 'appointments/:id/consultation/:consultationId', component: ConsultationFormPage }

// Admin patient-detail: already exists, Medical Records tab activates
```

## 14. UI Expectations
**Consultation form:**
- Two-column layout: left (SOAP fields, 2/3 width) + right sidebar (patient summary, allergy alerts, 1/3 width)
- Section headers with icons: 📋 Chief Complaint, 🔍 History, 🩺 Physical Exam, 🧪 Assessment, 📝 Plan
- Each field: large textarea (3-5 rows), no borders on focus — clean flat style
- Vital signs inline grid (3 cols): BP (systolic/diastolic pair), HR, RR, Temp, O2Sat, Weight, Height, BMI (auto-calculated)
- Diagnoses section: searchable ICD-10 dropdown → adds chip, type selector per chip
- Follow-up date picker
- "Add Prescription" button → prescription form inline or modal
- Lock indicator: if isLocked → overlay banner "🔒 Consultation locked. You can add an amendment." with "Add Amendment" button

**Allergy warning banner:**
- Amber banner, dismissable (X button)
- Text: "⚠️ Patient has a known allergy to [Drug]. Please review before prescribing."
- Appears when any prescription item's `genericName` matches an allergy allergen name (case-insensitive)

**Prescription form:**
- Drug name input (free text, with typeahead from mock drug list)
- Dosage form dropdown: Tablet | Capsule | Syrup | Injection | Cream | Drops | Others
- Strength input
- Quantity number input
- Sig: "Instructions for patient" textarea (e.g. "1 tab OD after meals")
- "Controlled substance" checkbox — shows warning badge
- "Add another drug" button — adds another row

**ICD-10 search:**
- Input: type to search — filters `icd10.json` by code or description
- Dropdown: shows code + description (e.g. "J06.9 — Acute upper respiratory infection, unspecified")
- On select: emits `{code, description}` to parent

**Vitals trend chart:**
- ApexCharts area/line chart
- Data: last 5 consultations' vital signs
- Selectable metric: BP | HR | Weight | O2Sat

## 15. Fake Functionality Allowed
- Lab result file upload: UI only, no Cloudinary (store file name in mock)
- Vaccination record save: NgRx mock only
- ICD-10 search reads from local `src/assets/icd10.json`

## 16. Real Functionality Required
- Vital signs BMI auto-calculation (weight / height² in kg/m²)
- Allergy warning must fire when drug name matches allergy (case-insensitive, substring match)
- Consultation lock check: if `isLocked: true` → form is read-only, only amendment allowed
- ICD-10 search filters in real-time on the local JSON
- Form validation: chief complaint is required before consultation can be saved

## 17. Validation Checklist
- [ ] Doctor clicks "Start Consultation" → consultation form loads
- [ ] Vital signs BMI auto-calculates when weight and height entered
- [ ] ICD-10 search filters correctly
- [ ] Adding a diagnosis via ICD-10 creates a chip in the diagnoses list
- [ ] Allergy warning fires when adding "Penicillin" to prescription for a patient with penicillin allergy
- [ ] Allergy warning can be dismissed (X)
- [ ] Prescription form adds items and they appear in the form
- [ ] Locked consultation shows lock banner and read-only state
- [ ] Medical records tab in admin/doctor patient-detail shows consultations, prescriptions, vitals, allergies, labs
- [ ] Vitals trend chart renders with mock data

## 18. Manual Testing Checklist
- [ ] Doctor opens appointment → clicks "Start Consultation" → consultation form loads
- [ ] Enter vitals (weight 70kg, height 1.70m) → BMI auto-shows as 24.2
- [ ] Search ICD-10 "pneumonia" → results show → select one → appears as chip
- [ ] Add "Penicillin" to prescription for patient with Penicillin allergy → amber warning appears
- [ ] Save consultation → appears in patient's medical records tab
- [ ] Admin views patient-detail Medical Records tab → sees consultation timeline
- [ ] Patient portal medical-records page shows new consultation (read-only)

## 19. Git Commit Recommendation
```
git add .
git commit -m "phase-9: medical records — consultation form, prescriptions, vitals, ICD-10, allergy warning, labs, vaccinations"
```

## 20. Risks to Watch For
- AI may implement real drug database lookup instead of mock — use local JSON only
- AI may over-engineer the consultation form with too many nested components — keep flat
- AI may skip the consultation lock check
- AI may forget the allergy warning cross-check logic

## 21. Definition of DONE
✅ Consultation form complete with SOAP, vitals, diagnoses, prescriptions
✅ Allergy warning fires correctly
✅ ICD-10 search works from local JSON
✅ Medical records tab in admin and doctor patient-detail shows all records
✅ Patient portal medical-records page reflects new data
✅ Vitals trend chart renders
✅ Git commit made

---

### SHORT IMPLEMENTATION PROMPT — Phase 9

```
Build Phase 9 (Medical Records Module) of the clinic app.
DO NOT change anything from Phases 1-8.

CREATE consultation-form page (accessible from doctor's appointment-detail "Start Consultation" CTA).
Consultation form: SOAP fields + vital signs grid (BMI auto-calc) + ICD-10 search + diagnoses + prescription form + follow-up date.
Allergy warning banner: fires when prescription drug name matches patient's allergy list.
ICD-10 search: reads from src/assets/icd10.json (500 mock codes).
Consultation lock: if isLocked=true, form is read-only.
UPDATE admin/doctor patient-detail Medical Records tab (previously stub) to show: consultations list, prescriptions list, allergies, lab results, vaccination records, vitals trend chart.

All data reads/writes to NgRx mock stores.
STOP after consultation form saves successfully and appears in patient medical records.
```

---

> **STOP AFTER THIS PHASE.**
> **WAIT FOR HUMAN VALIDATION AND GIT COMMIT BEFORE PROCEEDING.**

---
---

# PHASE 10 — Settings, Reports, Polish & Final MVP

## 1. Phase Number
**Phase 10**

## 2. Phase Name
**Settings, Reports, Polish & Final MVP**

## 3. Goal of the Phase
Complete all remaining features: clinic settings (branding, payment settings, operating hours, privacy policy), admin reports (unpaid summary, follow-ups pending), audit log display, waive/refund payment actions, review submission by patients, notification panel, and final visual polish pass.

## 4. Why This Phase Exists
This phase ties together all the "admin management" features that are important but don't block the core clinical workflow. It also performs a final quality sweep across all portals.

## 5. Dependencies
- All Phases 1-9 complete

## 6. What Should Be Implemented
- **Clinic Settings page (Admin):** clinic name, logo upload UI, brand colors, address/phone/email, operating hours editor, social media links, PayAtClinic mode toggle, cancellation deadline, payment settings (GCash/Maya/Bank details), privacy policy editor + consent version bump
- **Reports page (Admin):** Unpaid completed visits report (table + export to CSV mock), Follow-ups pending report
- **Audit log page (Admin):** Table with filter by entity type, date range, performed by (reads from mock audit log data)
- **Waive payment modal (Admin only):** WaivedReason input, updates payment status in NgRx
- **Refund payment modal (Admin only):** RefundReason input, updates payment status in NgRx
- **Review submission (Patient):** After Completed booking, "Leave a Review" star rating + text form
- **Notification panel:** Bell popover (380px), last 10 notifications from mock, "Mark all read", unread count badge
- **Final polish:** Page transition animations on all portals, empty states on all list pages, loading skeletons on all data-heavy pages, 404 page
- **Doctor merge duplicate stub (Admin):** UI only, shows "This feature requires manual admin review" message

## 7. What Should NOT Be Implemented Yet (Post-MVP)
- Real Cloudinary file upload
- Real SMTP email
- Real Firebase FCM push
- Real JWT/refresh token backend
- Real Stripe/GCash/Maya payment verification
- Real PDF generation (QuestPDF)
- Real audit log API
- Real ICD-10 API integration

## 8. Pages to Create / Update
```
admin/settings/settings.page.ts + .scss  (replace stub)
admin/reports/reports.page.ts + .scss  (replace stub)
admin/audit-logs/audit-logs.page.ts + .scss  (replace stub)
patient/reviews/patient-reviews.page.ts + .scss  (new)
shared/pages/not-found/not-found.page.ts + .scss  (new)
```

## 9. Components to Create
- `admin/components/waive-payment-modal/waive-payment-modal.component.ts + .scss`
- `admin/components/refund-payment-modal/refund-payment-modal.component.ts + .scss`
- `shared/components/notification-panel/notification-panel.component.ts + .scss`
- `patient/components/review-form/review-form.component.ts + .scss`
- `admin/components/operating-hours-editor/operating-hours-editor.component.ts + .scss`
- `admin/components/color-picker/color-picker.component.ts + .scss` (simple hex input with preview swatch)

## 10. Services to Create
- `portals/admin/services/admin-settings.service.ts`
- `portals/admin/services/admin-reports.service.ts`
- `portals/admin/services/audit-log.service.ts`

## 11. Mock Data Required
Add to MockDataService:
- 20 mock audit log entries (entity type, action, performed by, timestamp)
- 10 mock notifications per user (5 unread, 5 read)
- Unpaid completed bookings report data (5 records)
- Follow-ups pending report data (3 records)

## 12. State Management Required
- Update notifications store: actions `loadNotifications`, `markAllRead`, `markOneRead`
- Add settings to clinic-settings store: `updateSettings` action

## 13. Routes Required
```typescript
// Update admin.routes.ts (replace stubs with real components)
// Add to patient.routes.ts:
{ path: 'reviews', component: PatientReviewsPage }
// Add to app.routes.ts:
{ path: '**', component: NotFoundPage }
```

## 14. UI Expectations
**Settings page (tabbed):**
- Tab 1 "Clinic Info": name, address, phone, email, logo upload (UI only), social links, operating hours editor
- Tab 2 "Branding": primary color picker (hex input + swatch preview), secondary color (live preview updates CSS var)
- Tab 3 "Payments": PayAtClinic toggle, GCash details (QR upload UI, name, number), Maya details, Bank details, cancellation deadline hours
- Tab 4 "Privacy Policy": textarea for policy text, "Current version: v1.0" chip, "Bump Version to v1.1" button → confirm-modal → updates consentVersion in NgRx → patients prompted on next login

**Audit log page:**
- Table: Timestamp | Performed By | Role | Action | Entity | Description
- Filters: entity type dropdown, date range, search by name
- Read-only — no delete buttons

**Notification panel:**
- Triggered by bell icon click in topbar
- Animated popover (380px wide, scaleIn animation)
- Header: "Notifications" title + "Mark all read" link
- List: last 10 notifications, unread highlighted with green-50 background
- Each item: icon (based on notification type), title, time-ago (date-fns)
- Clicking → marks as read + navigates to relevant page

**Review form (patient):**
- Star rating: 5 interactive stars (click to rate)
- Comment textarea (optional)
- "Submit Review" button → updates NgRx, shows success toast

**Final polish checklist:**
- All list pages must have empty states (using EmptyStateComponent)
- All data-heavy pages must show skeleton loaders while mock delay resolves
- All pages must have fadeSlideUp animation on entry
- All modals/drawers must have scaleIn animation
- All destructive actions must use confirm-modal
- Responsive breakpoints tested at 375px, 768px, 1024px, 1440px

## 15. Fake Functionality Allowed
- Logo upload shows file name only (no actual upload)
- Branding color change updates CSS variable live in-session only (not persisted across refresh)
- "Export to CSV" on reports shows "Coming Soon" toast
- "Send Reminder" on follow-ups report shows success toast
- PDF generation stubs throughout all portals remain as "Coming Soon"

## 16. Real Functionality Required
- Notification unread count badge in topbar must update when notifications are marked read
- Review form star rating must be interactive
- Waive payment modal requires WaivedReason text before enabling confirm button
- Refund modal requires RefundReason text
- Privacy policy version bump must update clinic-settings NgRx store
- Settings form must validate required fields (clinic name is required)

## 17. Validation Checklist
- [ ] Settings page tabs all render
- [ ] Operating hours editor renders all days with open/close time inputs
- [ ] Color picker input updates CSS var live
- [ ] Waive payment modal appears in admin booking-detail
- [ ] Waive requires reason before confirm is enabled
- [ ] Refund modal same behavior
- [ ] Notification bell shows unread badge
- [ ] Mark all read → badge disappears
- [ ] Audit log table renders with mock data
- [ ] Reports page shows unpaid and follow-ups tables
- [ ] Patient can submit review after completed booking
- [ ] 404 page shows for unknown routes
- [ ] All list pages have empty states
- [ ] Skeleton loaders visible during mock load delay

## 18. Manual Testing Checklist
- [ ] Navigate to /admin/settings → all 4 tabs work
- [ ] Change primary color → sidebar active item changes color
- [ ] Waive a booking payment → reason required → booking shows "Waived" badge
- [ ] Refund a payment → reason required → booking shows "Refunded" badge
- [ ] Open notification bell → see mock notifications → mark all read → badge clears
- [ ] Patient leaves a 5-star review on completed booking → appears in doctor profile reviews
- [ ] Navigate to /some-unknown-route → 404 page
- [ ] Go through entire booking flow one more time end-to-end and verify it's complete and polished

## 19. Git Commit Recommendation
```
git add .
git commit -m "phase-10: settings, reports, audit log, waive/refund, reviews, notifications, final polish — MVP COMPLETE"
git tag v0.1.0-mvp
```

## 20. Risks to Watch For
- AI may try to implement real file upload for logo
- AI may try to implement real PDF export
- AI may over-scope "polish" and start adding new features
- AI may skip empty states and skeleton loaders

## 21. Definition of DONE
✅ Settings page complete (4 tabs)
✅ Waive and refund modals work with reason validation
✅ Notifications panel works with unread count
✅ Review form works for patients
✅ Audit log renders with mock data
✅ Reports page shows unpaid and follow-up tables
✅ 404 page exists
✅ All pages have empty states and skeleton loading
✅ All animations applied consistently
✅ Full end-to-end booking flow verified one final time
✅ `git tag v0.1.0-mvp` applied

---

### SHORT IMPLEMENTATION PROMPT — Phase 10

```
Build Phase 10 (Settings, Reports, Polish) of the clinic app — the FINAL MVP phase.
DO NOT change core feature logic from Phases 1-9.

IMPLEMENT:
- Admin Settings page (4 tabs: Clinic Info, Branding, Payments, Privacy Policy)
- Admin Reports page: unpaid visits table + follow-ups table
- Admin Audit Log page: table with filters (replace stub)
- Waive/Refund modals in admin booking-detail (Admin only, require reason text)
- Notification panel (bell popover, 380px, mark all read, unread badge)
- Patient review form (star rating + comment after Completed booking)
- 404 page

POLISH:
- Add EmptyStateComponent to all list pages (doctors, patients, bookings, services, etc.)
- Add skeleton loaders to all data-heavy pages (mock 400ms delay before data resolves)
- Add fadeSlideUp animation to all page entries
- Add scaleIn animation to all modals
- Verify responsive layout at 375px, 768px, 1440px for all portals

STOP after all pages render, end-to-end booking + consultation + notification flow works, and git tag v0.1.0-mvp is applied.
```

---

### DETAILED IMPLEMENTATION PROMPT — Phase 10

```
You are building Phase 10 (Settings, Reports, Polish) — the FINAL MVP phase.
All Phases 1-9 are complete. DO NOT break any existing feature.

FOCUS: completeness, polish, consistency. No new major features.

═══════════════════════════════════════
SETTINGS PAGE (replace stub):
═══════════════════════════════════════
Use IonSegment tabs: "Clinic Info" | "Branding" | "Payments" | "Privacy Policy"

Clinic Info tab:
  Reactive form: clinicName (required), address, phone, email, facebookUrl, instagramUrl
  Logo section: current logo placeholder + "Upload Logo" button (UI only, no upload)
  Operating hours editor component:
    7 rows (Mon-Sun), each: toggle (open/closed), start time input, end time input
  Save button → dispatches updateSettings to clinic-settings NgRx store

Branding tab:
  Primary color: text input with hex validation + 40x40px color swatch preview
  Secondary color: same
  Live preview: when color changes → update CSS variable in document root
    document.documentElement.style.setProperty('--ion-color-primary', value)
  "Save Branding" button (note: changes reset on refresh — inform user with info banner)

Payments tab:
  IsPayAtClinicMode toggle (if ON: hides GCash/Maya/Bank sections)
  GCash section: QR image upload UI + account name + number
  Maya section: same
  Bank section: bank name, account name, account number
  Cancellation deadline: number input (hours)
  No-show window: number input (minutes)

Privacy Policy tab:
  Textarea for policy text (from clinic-settings store)
  Current consent version chip: "v1.0"
  "Update Policy & Bump Version" button → confirm-modal:
    "This will require all patients to re-accept the privacy policy on next login. Continue?"
    → updates consentVersion (increment: v1.0 → v1.1, v1.1 → v1.2, etc.)
  After bump: dispatch updateClinicSettings action

═══════════════════════════════════════
WAIVE PAYMENT MODAL:
═══════════════════════════════════════
Triggered by "Waive Payment" button in admin booking-detail (Admin only — hide for Staff).
IonModal with:
  Heading: "Waive Payment"
  Payment amount display: "₱500.00 — Consultation Fee"
  WaivedReason: required textarea (min 10 chars), shows error if empty on submit
  "Confirm Waive" button (disabled until reason.length >= 10)
  → dispatches updateBookingPayment({status: 'Waived', waivedReason}) to bookings NgRx

REFUND PAYMENT MODAL:
Same pattern but for Refund. Required RefundReason field.

═══════════════════════════════════════
NOTIFICATION PANEL:
═══════════════════════════════════════
Triggered by bell icon in topbar across ALL portals (admin, staff, doctor, patient).
IonPopover or custom positioned div (380px wide, --shadow-2xl, --radius-xl)

Header (sticky): "Notifications" | "Mark all read" link (right)
Body (max-height 400px, scroll):
  For each notification from selectNotifications:
    - Unread: background var(--color-primary-50)
    - Icon: varies by type (calendar=green, warning=amber, checkmark=green, x=red)
    - Title (bold if unread), message (truncated to 2 lines), time-ago (date-fns formatDistanceToNow)
    - Click → mark as read → navigate to relevant route

Bell badge: red dot with count from selectUnreadCount
On "Mark all read" → dispatch markAllNotificationsRead → badge disappears

═══════════════════════════════════════
REVIEWS (Patient side):
═══════════════════════════════════════
On patient booking-detail for Completed bookings:
  Replace "Coming Soon" stub with actual review form:
  - 5 interactive stars (click to rate, hover preview)
  - Optional comment textarea
  - "Submit Review" (disabled until at least 1 star selected)
  → dispatches submitReview to NgRx
  → shows success toast "Review submitted!"
  → button changes to "Review Submitted ✓" (disabled)

On public doctor profile → reviews section reads from NgRx reviews state
  (new reviews submitted by patient must appear here)

═══════════════════════════════════════
POLISH PASS:
═══════════════════════════════════════
1. Empty states on ALL list pages:
   Pass appropriate props to EmptyStateComponent:
   Doctors list empty: icon="people-outline", title="No doctors found", description="Adjust your search or add a new doctor."
   Patients empty: "No patients found" etc.
   Bookings empty: "No bookings match your filters."
   (Use EmptyStateComponent from Phase 1 — it already exists)

2. Skeleton loaders:
   All services using MockDataService should add:
     return timer(400).pipe(mergeMap(() => of(data)))
   On all list pages: show skeleton-row × 5 while isLoading === true

3. Page transitions:
   Add .page-enter class to ion-content on ALL pages
   @HostBinding('class') class = 'page-enter';

4. Modal animations:
   All IonModals should use enterAnimation: scaleIn (custom animation function)

5. 404 page:
   src/app/shared/pages/not-found/not-found.page.ts
   Large centered: 404 emoji or SVG, "Page Not Found", "The page you're looking for doesn't exist.", "Go Home" button
   Add to app.routes.ts: { path: '**', component: NotFoundPage }

═══════════════════════════════════════
FINAL END-TO-END VERIFICATION:
═══════════════════════════════════════
After implementation, manually trace these full flows:
1. Patient books appointment (public wizard) → admin confirms → patient views confirmed booking
2. Staff creates walk-in → assigns doctor → booking appears in admin queue
3. Doctor opens appointment → creates consultation → adds vital signs + ICD-10 diagnosis + prescription
4. Admin views patient medical records → sees all clinical data
5. Patient views medical records + prescriptions (read-only)
6. Admin waives a payment with reason
7. Patient leaves review → appears on public doctor profile
8. Admin updates clinic name in settings → topbar shows new name

═══════════════════════════════════════
DO NOT IMPLEMENT (post-MVP):
═══════════════════════════════════════
Real Cloudinary upload, real SMTP email, real FCM push, real JWT backend, real PDF generation,
real Stripe/GCash payment verification, real ICD-10 API, real audit log API.

FILES EXPECTED AFTER THIS PHASE:
src/app/portals/admin/settings/settings.page.ts + .scss (updated)
src/app/portals/admin/reports/reports.page.ts + .scss (updated)
src/app/portals/admin/audit-logs/audit-logs.page.ts + .scss (updated)
src/app/portals/admin/components/waive-payment-modal/...
src/app/portals/admin/components/refund-payment-modal/...
src/app/portals/admin/components/operating-hours-editor/...
src/app/shared/components/notification-panel/notification-panel.component.ts + .scss
src/app/portals/patient/reviews/patient-reviews.page.ts + .scss
src/app/portals/patient/components/review-form/...
src/app/shared/pages/not-found/not-found.page.ts + .scss
(plus polish updates across all existing pages)
```

---

> **STOP AFTER THIS PHASE.**
> **WAIT FOR HUMAN VALIDATION AND GIT COMMIT BEFORE PROCEEDING.**
> **Apply `git tag v0.1.0-mvp` — MVP is complete.**

---

---

# APPENDIX A — Summary Reference

## Phase Dependency Chain
```
Phase 1 (Foundation)
    └─► Phase 2 (Auth)
            └─► Phase 3 (Public Portal)
                    └─► Phase 4 (Booking Wizard)
                            └─► Phase 5 (Admin Portal)
                                    ├─► Phase 6 (Staff Portal)
                                    └─► Phase 7 (Doctor Portal)
                                                └─► Phase 8 (Patient Portal)
                                                        └─► Phase 9 (Medical Records)
                                                                    └─► Phase 10 (Polish & Settings)
```

## Shared Components Across All Portals
| Component | Used In |
|---|---|
| `portal-layout` | Admin, Staff, Doctor |
| `slot-grid` | Public (booking wizard), Admin (walk-in), Staff (walk-in), Doctor (schedule) |
| `booking-timer` | Public (booking wizard), Patient (booking detail) |
| `status-badge` | All portals |
| `icd10-search` | Doctor (consultation form), Admin (consultation form) |
| `vital-signs-form` | Doctor, Admin |
| `allergy-warning-banner` | Doctor (prescription), Admin (prescription) |
| `notification-panel` | Admin, Staff, Doctor, Patient |
| `confirm-modal` | All portals |
| `skeleton` | All portals |
| `empty-state` | All portals |
| `avatar` | All portals |
| `banner` | All portals |
| `prescription-form` | Doctor, Admin |

## Mock-to-Real Migration Path (Post-MVP)
When real backend is ready, replace in this order:
1. `auth.service.ts` → real JWT auth API
2. `mock-data.service.ts` → real HTTP services per module
3. NgRx effects → real API calls (one effect at a time)
4. File upload UI → real Cloudinary integration
5. PDF download stubs → real QuestPDF API
6. FCM push → real Firebase integration
7. Email stubs → real SMTP

---

## Critical AI Scope Rules (Apply to Every Phase)

> Use these rules in every prompt to prevent scope creep:

```
SCOPE RULES FOR EVERY AI PROMPT:
1. DO NOT implement features from future phases
2. DO NOT create real HTTP calls — use MockDataService
3. DO NOT use NgModules — use Angular 17 standalone components only
4. DO NOT duplicate shared components — import from src/app/shared/
5. DO NOT duplicate portal-layout — import from src/app/shared/components/portal-layout/
6. DO NOT use any as a TypeScript type — use proper interfaces from core/models/index.ts
7. DO NOT import from @capacitor or @firebase packages (post-MVP)
8. DO NOT implement PDF generation (post-MVP)
9. DO NOT install additional npm packages without explicit instruction
10. STOP after the scope of this phase is complete
```