# UI/UX Audit Report — Dr. Grace E. Gavino Medical Clinic System
> Senior Design Review · Angular 17 + Ionic 7 · vs FRONTEND.md + PROJECT.md

---

## SECTION 1 — CRITICAL ARCHITECTURAL DEVIATIONS

These are structural breaks that affect every page of the admin portal.

---

### [CRITICAL-1] Admin Layout Uses Wrong Component Architecture

**What exists:** `admin-layout.component.ts` uses Ionic's `IonSplitPane` + `IonMenu` — a native mobile slide-drawer pattern.

**What the spec requires:** A custom CSS sidebar (`260px fixed, dark background`) + a custom topbar, with the structure:
```
.portal-layout { display: flex; height: 100vh; overflow: hidden }
  ├── .sidebar (260px fixed)
  └── .main-content { flex: 1; display: flex; flex-direction: column; overflow: hidden }
        ├── .topbar (64px)
        └── .page-content { flex: 1; overflow-y: auto; padding: var(--space-8) }
```

**Impact:** The entire admin UX is wrong. The sidebar is light-themed (white) instead of dark (`--color-neutral-900`). The topbar is inside `IonToolbar` instead of a custom `<header>`. The page scroll area is `IonContent` with `ion-padding` instead of a proper scrollable `.page-content` div with `padding: var(--space-8)`. The `sidebar.component.ts` (which correctly implements the dark design-system sidebar) is **dead code** — it exists but is never rendered.

**Fix:**
Replace `admin-layout.component.ts` entirely. Use the already-built `SidebarComponent` and `TopbarComponent`. The layout template should be:
```html
<div class="portal-layout">
  <app-admin-sidebar
    [navItems]="navItems"
    [currentUser]="currentUser$ | async"
    portalLabel="Admin Portal"
    [clinicName]="clinicName"
    (logout)="onLogout()"
  ></app-admin-sidebar>
  <div class="main-content">
    <app-admin-topbar
      [title]="pageTitle"
      [currentUser]="currentUser$ | async"
      [unreadCount]="unreadCount$ | async"
      (logout)="onLogout()"
    ></app-admin-topbar>
    <div class="page-content">
      <router-outlet></router-outlet>
    </div>
  </div>
</div>
```
Add to `admin-layout.component.scss`:
```scss
:host { display: block; height: 100vh; }
.portal-layout { display: flex; height: 100vh; overflow: hidden; background: var(--clinic-bg); }
.main-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.page-content { flex: 1; overflow-y: auto; padding: var(--space-8); }
```
Apply the same fix to `staff-layout` and `doctor-layout` components.

---

### [CRITICAL-2] Admin Layout Nav Items Are Incomplete and Wrong

**What exists:** The `IonMenu` in admin-layout shows: Dashboard, Manage Doctors, **Clinics** (wrong — no `/admin/clinics` route exists), Reports, Settings.

**What the spec requires (from admin.routes.ts and PROJECT.md):**
- **CORE:** Dashboard, Bookings, Patients, Doctors, Calendar
- **MANAGEMENT:** Services, Staff, Walk-In
- **ANALYTICS:** Reports, Audit Log
- **SYSTEM:** Announcements, Settings

**Fix:** Define `navItems` in `admin-layout.component.ts` using the `NavItem[]` model and pass them to `SidebarComponent`. Remove the non-existent `/admin/clinics` link.

---

## SECTION 2 — COLOR SYSTEM CONTAMINATION

Old green color values (`#1A6B4A`, `rgba(26, 107, 74, ...)`) from a previous design iteration are still hardcoded throughout the codebase, overriding the brand purple (`#5D3E8E`).

---

### [COLOR-1] Revenue Chart SVG Uses Wrong Brand Color

**File:** `dashboard.page.ts`

**What exists:**
```typescript
<stop offset="0%" stop-color="#1A6B4A" stop-opacity="0.42"></stop>  // ← old green
<path ... stroke="#1A6B4A" stroke-width="4" ...></path>             // ← old green
```

**Fix:** Replace all `#1A6B4A` and `#2f8b61` references in the SVG with `var(--ion-color-primary)` (or extract to a component property using `getComputedStyle`):
```typescript
// In ngOnInit, resolve the CSS variable once
this.chartColor = getComputedStyle(document.documentElement)
  .getPropertyValue('--ion-color-primary').trim(); // → '#5d3e8e'
```
Then bind: `[attr.stroke]="chartColor"`

---

### [COLOR-2] Bar Chart Fill Uses Wrong Brand Color

**File:** `dashboard.page.scss`

**What exists:**
```scss
.bar-row__fill {
  background: linear-gradient(90deg, #1a6b4a 0%, #2f8b61 100%);
}
.bar-row__track {
  background: rgba(26, 107, 74, 0.12);
}
```

**Fix:**
```scss
.bar-row__fill {
  background: var(--gradient-card-green); // the purple gradient
}
.bar-row__track {
  background: var(--color-primary-100);
}
```

---

### [COLOR-3] Form Focus Ring Uses Wrong Brand Color

**File:** `styles.scss` (global)

**What exists:**
```scss
ion-item.clinic-input {
  &.item-has-focus {
    border-color: var(--ion-color-primary);
    box-shadow: 0 0 0 3px rgba(26, 107, 74, 0.12);  // ← old green
  }
}
```

**Fix:**
```scss
box-shadow: 0 0 0 3px rgba(93, 62, 142, 0.12);  // brand purple
```

---

### [COLOR-4] Slot Cell Hover Ring Uses Wrong Brand Color

**File:** `styles.scss` (global)

**What exists:**
```scss
.slot-cell--available:hover {
  box-shadow: 0 0 0 3px rgba(26, 107, 74, 0.1);  // ← old green
}
```

**Fix:**
```scss
box-shadow: 0 0 0 3px rgba(93, 62, 142, 0.10);  // brand purple
```

---

### [COLOR-5] `badge--completed` Text Color Is Dark Green

**File:** `styles.scss`

**What exists:**
```scss
&.badge--completed { background: var(--color-primary-100); color: #0d3d2a; }
```
The color `#0d3d2a` is a dark forest green — visually inconsistent on a purple-tinted background.

**Fix:** Use a dark purple that pairs with the purple badge background:
```scss
&.badge--completed { background: var(--color-primary-100); color: var(--color-primary-900); }
```

---

## SECTION 3 — LAYOUT & SPACING INCONSISTENCIES

---

### [SPACING-1] Dashboard Stats Grid Gap Is Too Tight

**File:** `dashboard.page.scss`

**What exists:** `gap: var(--space-4)` (16px)

**Spec requires:** `gap: var(--space-6)` (24px) in `.dashboard-grid`

**Fix:** Change `.stats-grid { gap: var(--space-6); }`

---

### [SPACING-2] Topbar Padding Is Too Narrow

**File:** `topbar.component.scss`

**What exists:** `padding: 0 var(--space-6)` (24px)

**Spec requires:** `padding: 0 var(--space-8)` (32px)

**Fix:** `padding: 0 var(--space-8);`

---

### [SPACING-3] Sidebar Nav Item Margin Is Too Narrow

**File:** `sidebar.component.scss`

**What exists:** `.nav-item { margin: 1px var(--space-2); }` (8px horizontal)

**Spec requires:** `margin: 1px var(--space-3);` (12px horizontal)

**Fix:** `.nav-item { margin: 1px var(--space-3); }`

---

### [SPACING-4] Sidebar Section Label Padding Is Wrong

**File:** `sidebar.component.scss`

**What exists:** `.nav-section-label { padding: var(--space-3) var(--space-5); margin-top: var(--space-3); }`

**Spec requires:** `padding: var(--space-6) var(--space-5) var(--space-2)` (no separate margin-top)

**Fix:**
```scss
.nav-section-label {
  padding: var(--space-6) var(--space-5) var(--space-2);
  margin-top: 0;
}
```
Exception for the first label (i = 0): use `padding-top: var(--space-3)` — add an `.is-first` modifier or use `:first-of-type` logic.

---

### [SPACING-5] Hero Padding-Top Missing Navbar Offset

**File:** `hero-section.component.scss`

**What exists:** `padding: var(--space-24) var(--space-8);`

**Spec requires:** `padding-top: calc(64px + var(--space-24));` to account for the fixed 64px navbar

**Fix:**
```scss
.hero {
  padding: var(--space-24) var(--space-8);
  padding-top: calc(64px + var(--space-24));
}
```

---

## SECTION 4 — MISSING MICRO-INTERACTIONS & STATES

---

### [MICRO-1] Active Sidebar Nav Item Missing Shadow

**File:** `sidebar.component.scss`

**What exists:**
```scss
.nav-item.active { background: var(--ion-color-primary); color: white; }
```

**Spec requires:** Active items also get `box-shadow: var(--shadow-green)` (the purple-colored shadow).

**Fix:**
```scss
.nav-item.active {
  background: var(--ion-color-primary);
  color: white;
  box-shadow: var(--shadow-green);
}
```

---

### [MICRO-2] Notification Badge Missing White Border

**File:** `notification-bell.component.scss`

**What exists:**
```scss
.notification-badge {
  position: absolute;
  top: -4px; right: -4px;
  min-width: 18px; height: 18px;
  // no border
}
```

**Spec requires:** `border: 2px solid white;` on the badge to visually separate it from the button.

**Fix:**
```scss
.notification-badge {
  border: 2px solid white;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
}
```

---

### [MICRO-3] Topbar Search Bar Missing Focus-Within State

**File:** `topbar.component.scss`

**What exists:** The search bar has no focus state.

**Spec requires:**
```scss
.topbar__search:focus-within {
  border-color: var(--ion-color-primary);
  background: white;
  box-shadow: 0 0 0 3px rgba(93, 62, 142, 0.10);
}
```

**Fix:** Add the `:focus-within` rule to `.topbar__search`.

---

### [MICRO-4] Filter Inputs Have No Focus State

**Files:** `bookings.page.scss`, `walk-in.page.scss`, `patients.page.scss`, etc.

**What exists:** `.filter-input { height: 40px; border: 1px solid var(--clinic-border); ... }` — no focus styling.

**Fix:** Add globally to `styles.scss`:
```scss
.filter-input:focus {
  outline: none;
  border-color: var(--ion-color-primary);
  box-shadow: 0 0 0 3px rgba(93, 62, 142, 0.10);
}
```

---

### [MICRO-5] Booking Timer Countdown Not Using Monospace Font

**File:** `booking-timer.component.ts` / `.scss`

**What exists:** `<strong class="timer-countdown">{{ formattedTime }}</strong>` — no explicit mono font applied.

**Spec requires:** "Timer styled with monospace font in amber banner."

**Fix:** In `booking-timer.component.scss`:
```scss
.timer-countdown {
  font-family: var(--font-mono);
  font-size: var(--text-lg);
  letter-spacing: 0.05em;
}
```

---

### [MICRO-6] `btn-primary` Disabled State Not Styled

**File:** `styles.scss`

**What exists:** `.btn-primary` has no `:disabled` styling.

**Fix:**
```scss
.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: var(--shadow-sm) !important;
  filter: none !important;
}
```

---

### [MICRO-7] Page Entry Animation Not Applied Consistently

**What exists:** `.page-enter` is defined globally but only applied in `booking.page.ts`. Admin pages like `dashboard.page.ts`, `bookings.page.ts`, `patients.page.ts` have a `.page-shell` div but it does not animate.

**Fix:** In each portal page, apply the animation to the page shell, either:
- Add `class="page-shell page-enter"` to every portal page's root `<section>`, OR
- Add to the layout's `.page-content` block:
```scss
.page-content > * {
  animation: fadeSlideUp 250ms ease-out both;
}
```

---

## SECTION 5 — COMPONENT DESIGN GAPS VS SPEC

---

### [COMP-1] Hero CTA Buttons Wrong Shape and Style

**File:** `hero-section.component.scss`

**What exists:** Custom `hero-btn-primary` / `hero-btn-outline` classes with `border-radius: var(--radius-md)` (8px, rectangular).

**Spec requires:**
```scss
.hero__cta-primary {
  background: white;
  color: var(--ion-color-primary);
  border-radius: var(--radius-full);  // pill, not rectangular
  padding: var(--space-4) var(--space-8);
  font-size: var(--text-base);
  font-weight: var(--font-bold);
  box-shadow: var(--shadow-xl);
}
.hero__cta-secondary {
  color: rgba(255, 255, 255, 0.85);
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  text-decoration: none;
  display: flex; align-items: center; gap: var(--space-2);
}
```

**Fix:** Replace `hero-btn-primary`/`hero-btn-outline` with `.hero__cta-primary` and `.hero__cta-secondary` per spec. Update the template class names.

---

### [COMP-2] Hero Trust Section Entirely Missing

**File:** `hero-section.component.ts`

**What exists:** `.hero__badges` with three emoji pill badges stacked vertically.

**Spec requires:** A `.hero__trust` section at the bottom of the hero content with a `border-top: 1px solid rgba(255,255,255,0.15)` separator, using `ion-icon` icons instead of emojis:
```html
<div class="hero__trust">
  <div class="trust-item">
    <ion-icon name="medical-outline"></ion-icon>
    <span>3 Specialist Doctors</span>
  </div>
  <div class="trust-item">
    <ion-icon name="calendar-outline"></ion-icon>
    <span>Available Mon–Sat</span>
  </div>
  <div class="trust-item">
    <ion-icon name="people-outline"></ion-icon>
    <span>Accepting New Patients</span>
  </div>
</div>
```
```scss
.hero__trust {
  display: flex;
  align-items: center;
  gap: var(--space-6);
  margin-top: var(--space-12);
  padding-top: var(--space-8);
  border-top: 1px solid rgba(255, 255, 255, 0.15);

  .trust-item {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--text-sm);
    color: rgba(255, 255, 255, 0.70);
    font-weight: var(--font-medium);

    ion-icon { color: rgba(255, 255, 255, 0.50); font-size: 16px; }
  }
}
```

---

### [COMP-3] Hero Tag Typography Wrong

**File:** `hero-section.component.scss`

**What exists:** `.hero__tag { font-size: var(--text-sm); font-weight: var(--font-medium); }`

**Spec requires:** `font-size: var(--text-xs); font-weight: var(--font-semibold); text-transform: uppercase; letter-spacing: 0.05em;`

**Fix:**
```scss
.hero__tag {
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(255, 255, 255, 0.90); // slightly adjusted from current white
}
```

---

### [COMP-4] Doctors Page Has Duplicated/Confusing Columns

**File:** `doctors.page.ts`

**What exists:** The table has both a `<select>` for status change and `<app-status-badge>` in what appear to be two columns ("Status" and "Actions") — but the column header says "Actions" while the badge is rendered there. The select and badge render in adjacent columns for the same data point.

**Fix:** Merge into a single "Status" column containing the `StatusBadge`. Move the inline `<select>` into a dedicated action dropdown or an edit modal. Rename "Actions" column to contain action buttons (Edit, View) with icon buttons.

Correct table column order: `Avatar | Name | Specialization | Fee | Status | Actions`

---

### [COMP-5] `stat-card--neutral` Class Missing From Global Styles

**Files:** `staff-dashboard.page.ts` uses `class="stat-card stat-card--neutral clinic-card"`, but `styles.scss` only defines `stat-card--green`, `stat-card--blue`, `stat-card--amber`, `stat-card--red`, and `stat-card--gray`.

**Fix:** Either rename the class in staff-dashboard to `stat-card--gray` (which does exist), or add `stat-card--neutral` to `styles.scss`:
```scss
&.stat-card--neutral {
  background: linear-gradient(135deg, #475569 0%, #64748b 100%);
  box-shadow: var(--shadow-sm);
}
```

---

### [COMP-6] Notification Panel Unread Item Background Not Applied

**File:** `notification-panel.component.scss`

**What exists:** The template uses class `is-unread` for unread items. The spec defines `.notification-item.unread { background: var(--color-primary-50); }`.

**Fix:** In `notification-panel.component.scss`, ensure the correct class selector matches:
```scss
.notification-panel__item.is-unread {
  background: var(--color-primary-50);
}
.notification-panel__item.is-unread .notification-panel__topline strong {
  font-weight: var(--font-semibold);
}
```

---

### [COMP-7] Slot Grid Skeleton Uses Wrong Class Name

**File:** `slot-grid.component.ts`

**What exists:** `<div class="skeleton skeleton-slot" ...>` — but `skeleton-slot` is not defined anywhere in the global styles.

**Fix:** Change to `skeleton skeleton-row` which is defined, or add:
```scss
.skeleton-slot {
  height: 52px;
  border-radius: var(--radius-md);
  margin-bottom: 0;
}
```

---

## SECTION 6 — MISSING FEATURES vs PROJECT.md + FRONTEND.md

---

### [FEAT-1] Walk-In Booking Stepper Has No Visual Connector

**File:** `walk-in.page.scss`

**What exists:** Three pill buttons with `.is-active` state, but no connecting line between steps and no completion checkmark for past steps.

**Fix:** Add step connector lines and completed state:
```scss
.stepper {
  display: flex;
  align-items: center;
  gap: 0;
}
.stepper__step {
  position: relative;
  // after each step (except last), add a line
  &:not(:last-child)::after {
    content: '';
    display: block;
    width: var(--space-8);
    height: 2px;
    background: var(--clinic-border);
    flex-shrink: 0;
  }
}
.stepper__step.is-done {
  background: var(--color-success-100);
  color: var(--ion-color-success);
  border-color: var(--color-success-100);
}
```

---

### [FEAT-2] Booking Timer Expiry Does Not Navigate Away

**File:** `booking-timer.component.ts`

**What exists:** On expiry, `timerExpired` is emitted and the component shows a danger banner. The parent page is responsible for handling this but does nothing that forces navigation.

**Spec requires:** "At 0 → auto-refreshes and shows 'Slot expired' empty state screen"

**Fix:** In the patient booking proof-submission page, listen for `(timerExpired)` and navigate back to slot selection:
```typescript
onTimerExpired(): void {
  // Reset the booking wizard to step 2 (slot selection)
  this.store.dispatch(resetToSlotStep());
  void this.router.navigate(['/public/booking'], { queryParams: { step: 2 } });
}
```

---

### [FEAT-3] Admin Layout Missing Several Nav Items

**Routes defined in `admin.routes.ts` but absent from admin layout nav:**
- `/admin/services` — Service Management
- `/admin/staff` — Staff Management
- `/admin/calendar` — Booking Calendar
- `/admin/walk-in` — Walk-In Booking
- `/admin/announcements` — Announcements
- `/admin/audit-logs` — Audit Log

All of these have page components implemented — they just can't be navigated to from the sidebar.

---

### [FEAT-4] Public Navbar Book Appointment Button Should Be Pill-Shaped

**File:** `public-navbar.component.scss` (`.navbar-book-btn`)

**What exists:** The book button class presumably uses the standard `btn-primary` styles (rectangular, `border-radius: var(--radius-md)`).

**Spec requires:** The CTA button in the navbar should be pill-shaped (`border-radius: var(--radius-full)`).

**Fix:**
```scss
.navbar-book-btn {
  background: var(--gradient-card-green);
  color: white;
  border-radius: var(--radius-full);
  padding: var(--space-2) var(--space-5);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  text-decoration: none;
  transition: all var(--transition-base);
  box-shadow: var(--shadow-sm);

  &:hover {
    box-shadow: var(--shadow-green);
    transform: translateY(-1px);
    filter: brightness(1.05);
  }
}
```

---

### [FEAT-5] Add Patient Modal Uses Inconsistent Form Styling

**File:** `patients.page.ts`

**What exists:** The modal uses raw `<input class="filter-input">` elements — a native input with minimal styling.

**Spec requires:** All form fields use `ion-item.clinic-input` pattern with `ion-label position="floating"` for consistent Ionic form UX with the floating label and focus ring.

**Fix:** Replace modal form inputs with `ion-item.clinic-input > ion-label + ion-input` pattern. Add `ReactiveFormsModule` + `ion-item` imports to the modal or extract to a standalone `AddPatientFormComponent`.

---

### [FEAT-6] Consent Version Check on Login Not Wired

**Files:** `auth.effects.ts` / `privacy-consent.page.ts`

**Spec requires:** "On every login, `Patient.ConsentVersion` is compared to `ClinicSettings.ConsentVersion`. If they differ → patient is redirected to `/auth/privacy-consent`."

**Current state:** The `privacy-consent.page.ts` exists but it is unknown if the auth effect dispatches the consent-check redirect. Verify that `login success` effect does:
```typescript
// In auth.effects.ts loginSuccess$ effect
if (user.role === 'Patient' && user.consentVersion !== clinicSettings.consentVersion) {
  this.router.navigate(['/auth/privacy-consent']);
  return;
}
```
If missing, add this check in the login effect after loading clinic settings.

---

## SECTION 7 — ACCESSIBILITY ISSUES

---

### [A11Y-1] Topbar User Button Has No Accessible Label

**File:** `topbar.component.ts`

**What exists:** `<button type="button" class="topbar__user" (click)="logout.emit()">` — clicking the avatar area logs out, but there's no `aria-label`.

**Fix:**
```html
<button type="button" class="topbar__user" aria-label="Account options" (click)="logout.emit()">
```
Better: open a dropdown for profile/logout rather than immediate logout on avatar click (which is a surprise interaction).

---

### [A11Y-2] Table Rows Used as Navigation Without Role

**Files:** `bookings.page.ts`, `patients.page.ts`, `doctors.page.ts`

**What exists:** `<tr (click)="openBooking(...)">` — clicking a row navigates. No keyboard support, no `role="button"`, no `tabindex`.

**Fix:**
```html
<tr
  *ngFor="let booking of filteredBookings"
  (click)="openBooking(booking.id)"
  (keydown.enter)="openBooking(booking.id)"
  tabindex="0"
  role="button"
  [attr.aria-label]="'Open booking for ' + patientName(booking.patientId)"
>
```

---

### [A11Y-3] Sidebar Logo Placeholder "G" Has No Accessible Text

**File:** `sidebar.component.ts`

**What exists:** `<div class="sidebar__logo">G</div>` — a decorative div with a letter.

**Fix:**
```html
<div class="sidebar__logo" aria-hidden="true">G</div>
```
Add the clinic name in the adjacent text (already done via `sidebar__clinic-name`) so screen readers read it from there.

---

### [A11Y-4] Status Select in Doctors Table Missing Label

**File:** `doctors.page.ts`

**What exists:** `<select [ngModel]="doctor.status" ...>` — no `<label>` or `aria-label`.

**Fix:**
```html
<select [ngModel]="doctor.status" [attr.aria-label]="'Status for ' + doctor.fullName" ...>
```

---

## SECTION 8 — MOBILE RESPONSIVENESS GAPS

---

### [MOBILE-1] Dashboard Stats Grid Breakpoints Are Too Late

**File:** `dashboard.page.scss`

**What exists:**
```scss
@media (max-width: 1100px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 720px) { .stats-grid { grid-template-columns: 1fr; } }
```

With 8 stat cards, `repeat(4, 1fr)` at 1100px produces cards ~200px wide — too cramped on a 1100px screen.

**Fix:** Break to 4-col at 1440px, 2-col at 900px:
```scss
@media (max-width: 1440px) { .stats-grid { grid-template-columns: repeat(4, 1fr); } }
@media (max-width: 1200px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 640px)  { .stats-grid { grid-template-columns: 1fr; } }
```

---

### [MOBILE-2] Filter Bar Grid Collapses at Wrong Breakpoint

**File:** `bookings.page.scss`

**What exists:** `@media (max-width: 1000px) { .filter-bar { grid-template-columns: 1fr 1fr; } }` — at 5 columns, this breaks at 1000px to 2-col, leaving the Clear Filters button orphaned.

**Fix:**
```scss
@media (max-width: 768px) {
  .filter-bar {
    grid-template-columns: 1fr 1fr;
  }
}
@media (max-width: 480px) {
  .filter-bar {
    grid-template-columns: 1fr;
  }
}
```

---

### [MOBILE-3] Topbar Hides Search at 1024px — Too Aggressive

**File:** `topbar.component.scss`

**What exists:** `@media (max-width: 1024px) { .topbar__search { display: none; } }` — search disappears at iPad size.

**Fix:** Keep search visible down to 768px, then hide at mobile:
```scss
@media (max-width: 768px) {
  .topbar__search { display: none; }
  .topbar__user-meta { display: none; }
}
```
At 768px, add a search icon button that expands an inline search bar.

---

## SECTION 9 — VISUAL POLISH & TYPOGRAPHY

---

### [POLISH-1] Page Title Has No Top Margin Separation from Content

**Files:** `dashboard.page.scss`, `bookings.page.scss`, etc.

**What exists:** `.page-shell__header` has `display: flex` but no `margin-bottom`.

**Spec requires:** `.page-header { margin-bottom: var(--space-8); }`

**Fix:** Add `margin-bottom: var(--space-8);` to `.page-shell__header` across all page stylesheets (or centralize in the portal layout's `.page-content` first-child rule).

---

### [POLISH-2] Tables Missing Rounded Corners on First/Last Rows

**File:** `styles.scss`

**What exists:** The `.clinic-table` uses `border-collapse: separate; border-spacing: 0` (correct for rounded corners) but no `border-radius` is applied to `thead tr:first-child th` or `tbody tr:last-child td`.

**Fix:**
```scss
.clinic-table {
  thead tr:first-child {
    th:first-child { border-top-left-radius: var(--radius-lg); }
    th:last-child  { border-top-right-radius: var(--radius-lg); }
  }
}
```
This makes the table header visually merge with the containing card.

---

### [POLISH-3] Section Heading Rule Line Uses No Animation on Entry

**File:** `styles.scss`

**What exists:** `.section-heading::after { flex: 1; height: 1px; background: var(--clinic-border); }` — static.

**Suggestion (low priority):** On page entry, animate the `::after` line from `width: 0` to `width: 100%` using a CSS animation. This is a subtle but satisfying micro-detail:
```scss
.section-heading::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--clinic-border);
  transform-origin: left;
  animation: expandLine 400ms ease-out both;
  animation-delay: 200ms;
}
@keyframes expandLine {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}
```

---

### [POLISH-4] Empty State Button Missing Standard Styling

**File:** `empty-state.component.ts`

**What exists:** The empty state CTA emits `(ctaClick)` but the button is likely styled with a raw class inside the component without the standard `.btn-primary` system class.

**Fix:** Ensure the CTA button uses `class="btn-primary"` so it picks up the gradient, shadow, and hover transition from the global design system.

---

### [POLISH-5] Dashboard Chart Legend Needs Proper Month Labels

**File:** `dashboard.page.ts`

**What exists:** `revenueLegend = Array.from({ length: 6 }, (_, i) => i + 1)` — renders as numbers 1–6.

**Fix:** Use actual short month names relative to current month:
```typescript
const now = new Date();
this.revenueLegend = Array.from({ length: 6 }, (_, i) => {
  const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
  return d.toLocaleString('default', { month: 'short' });
});
```

---

## SUMMARY — PRIORITY ORDER

| Priority | Count | Category |
|---|---|---|
| 🔴 Critical (blocks correct UX) | 3 | CRITICAL-1, CRITICAL-2, FEAT-3 |
| 🟠 High (visible color/design breaks) | 5 | COLOR-1–5 |
| 🟡 Medium (spec deviations, missing states) | 12 | SPACING 1–5, MICRO 1–7, COMP 1–7 |
| 🟢 Low (polish, accessibility) | 8 | A11Y 1–4, MOBILE 1–3, POLISH 1–5 |

---

## FINAL IMPROVEMENT PROMPT FOR DEVELOPER

Paste this directly into a new chat to implement all fixes in one pass:

---

```
You are implementing a precise UI/UX correction pass on an Angular 17 + Ionic 7 clinic management app. The design system is defined in styles.scss and FRONTEND.md. Apply every fix below exactly as described — do not improvise or add unrequested changes.

CRITICAL FIXES (do these first):

1. ADMIN LAYOUT REBUILD
Replace admin-layout.component.ts entirely. Remove IonSplitPane/IonMenu. Use the existing SidebarComponent (sidebar.component.ts) and TopbarComponent (topbar.component.ts) which are already implemented but not wired up. The layout should be a flex container: sidebar (260px fixed dark) + main-content (flex-col: topbar 64px + page-content scrollable). Add to admin-layout.component.scss:
  :host { display: block; height: 100vh; }
  .portal-layout { display: flex; height: 100vh; overflow: hidden; background: var(--clinic-bg); }
  .main-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
  .page-content { flex: 1; overflow-y: auto; padding: var(--space-8); }
Apply same pattern to staff-layout and doctor-layout. Do not use IonSplitPane in any portal layout.

2. ADMIN NAV ITEMS — In admin-layout.component.ts, pass these navItems to SidebarComponent:
  Section "CORE": Dashboard(/admin/dashboard, grid-outline), Bookings(/admin/bookings, calendar-outline, badge=pendingCount), Patients(/admin/patients, people-outline), Doctors(/admin/doctors, medical-outline), Calendar(/admin/calendar, calendar-number-outline)
  Section "MANAGEMENT": Services(/admin/services, briefcase-outline), Staff(/admin/staff, person-outline), Walk-In(/admin/walk-in, walk-outline)
  Section "ANALYTICS": Reports(/admin/reports, bar-chart-outline), Audit Log(/admin/audit-logs, document-text-outline)
  Section "SYSTEM": Announcements(/admin/announcements, megaphone-outline), Settings(/admin/settings, settings-outline)

COLOR FIXES:

3. In dashboard.page.ts, replace all hardcoded "#1A6B4A" and "#2f8b61" with the primary purple. For the SVG chart, resolve CSS var at runtime: const c = getComputedStyle(document.documentElement).getPropertyValue('--ion-color-primary').trim(). Bind to [attr.stop-color] and [attr.stroke].

4. In dashboard.page.scss, change .bar-row__fill background to var(--gradient-card-green) and .bar-row__track background to var(--color-primary-100).

5. In styles.scss (global), change ALL occurrences of rgba(26, 107, 74, ...) to rgba(93, 62, 142, ...) — this affects: ion-item.clinic-input focus ring, slot-cell--available hover ring.

6. In styles.scss, change badge--completed color from #0d3d2a to var(--color-primary-900).

SPACING FIXES:

7. stats-grid: change gap to var(--space-6).
8. topbar.component.scss: change padding to 0 var(--space-8).
9. sidebar nav-item margin: change to 1px var(--space-3).
10. sidebar nav-section-label: padding: var(--space-6) var(--space-5) var(--space-2); remove margin-top.
11. hero-section.component.scss: add padding-top: calc(64px + var(--space-24)).
12. Add margin-bottom: var(--space-8) to .page-shell__header in all page stylesheets.

MICRO-INTERACTION FIXES:

13. sidebar.component.scss active nav item: add box-shadow: var(--shadow-green).
14. notification-bell.component.scss badge: add border: 2px solid white; padding: 0 4px.
15. topbar.component.scss search: add :focus-within { border-color: var(--ion-color-primary); background: white; box-shadow: 0 0 0 3px rgba(93,62,142,0.10); }.
16. styles.scss: add .filter-input:focus { outline: none; border-color: var(--ion-color-primary); box-shadow: 0 0 0 3px rgba(93,62,142,0.10); }.
17. booking-timer.component.scss: add .timer-countdown { font-family: var(--font-mono); font-size: var(--text-lg); letter-spacing: 0.05em; }.
18. styles.scss .btn-primary: add :disabled { opacity: 0.5; cursor: not-allowed; transform: none !important; box-shadow: var(--shadow-sm) !important; filter: none !important; }.
19. Add animation: fadeSlideUp 250ms ease-out both to .page-content > * in the layout stylesheet.

COMPONENT FIXES:

20. hero-section.component.ts: Replace .hero__badges emoji section with .hero__trust containing three .trust-item divs using ion-icon (medical-outline, calendar-outline, people-outline). Replace hero-btn-primary/hero-btn-outline classes with .hero__cta-primary (white bg, primary color, radius-full, space-4 space-8 padding) and .hero__cta-secondary (transparent, white text, flex+gap).
21. hero-section.component.scss: Fix .hero__tag to font-size: var(--text-xs); font-weight: var(--font-semibold); text-transform: uppercase; letter-spacing: 0.05em; color: rgba(255,255,255,0.90).
22. doctors.page.ts: Remove the duplicate status column. Keep only Status column with StatusBadge. Move status <select> into an edit action. Add Actions column with icon buttons (edit-outline, trash-outline).
23. styles.scss: Add stat-card--neutral { background: linear-gradient(135deg, #475569 0%, #64748b 100%); box-shadow: var(--shadow-sm); }.
24. notification-panel.component.scss: Add .notification-panel__item.is-unread { background: var(--color-primary-50); } and .notification-panel__item.is-unread strong { font-weight: var(--font-semibold); }.
25. slot-grid.component.ts: Change skeleton div class from "skeleton skeleton-slot" to "skeleton skeleton-row".
26. public-navbar.component.scss: Add .navbar-book-btn { border-radius: var(--radius-full); padding: var(--space-2) var(--space-5); } with hover: transform: translateY(-1px); box-shadow: var(--shadow-green).

ACCESSIBILITY FIXES:

27. topbar user button: add aria-label="Account options".
28. All clickable table rows: add tabindex="0", role="button", (keydown.enter)="..." and [attr.aria-label].
29. Sidebar logo div: add aria-hidden="true".
30. Doctors table status select: add [attr.aria-label]="'Status for ' + doctor.fullName".

MOBILE FIXES:

31. dashboard.page.scss breakpoints: 4-col at default, 2-col at max-width 1200px, 1-col at max-width 640px.
32. topbar.component.scss: hide search and user-meta only at max-width 768px (not 1024px).
33. bookings.page.scss filter-bar: 2-col at 768px, 1-col at 480px.

POLISH:

34. styles.scss .clinic-table: add border-radius to thead first/last th cells.
35. dashboard.page.ts revenueLegend: replace with last-6-months short names from toLocaleString.
36. empty-state.component.ts CTA button: ensure it uses class="btn-primary".
```

---

---

## SECTION 10 — NEW REQUIREMENTS (Added by Product Owner)

---

### [REQ-1] Remove "Continue as Guest" — Registration Required to Book

**What exists:** `step-auth-check.component.ts` shows three options during the booking wizard:
```html
<button class="btn-primary"  (click)="goToLogin()">Sign In</button>
<button class="btn-outline"  (click)="goToRegister()">Create Account</button>
<button class="btn-ghost"    (click)="continueAsGuest()">Continue as Guest</button>  ← REMOVE
```
The `continueAsGuest()` method calls `this.store.dispatch(nextStep())` — allowing anyone to complete a booking without an account.

**What is required:** Every patient must be registered and logged in before booking. Guest checkout is not allowed.

**Fix — `step-auth-check.component.ts`:**

1. Remove the "Continue as Guest" button entirely from the template.
2. Delete the `continueAsGuest()` method.
3. Tighten the heading copy to reinforce that an account is required:

```html
<section class="wizard-panel">
  <div class="auth-check-card clinic-card">
    <div class="empty-state__icon">
      <ion-icon name="lock-closed-outline"></ion-icon>
    </div>
    <h3>Account Required</h3>
    <p>
      You need to sign in or create a free account to complete your booking.
      Registration only takes a minute.
    </p>
    <div class="auth-check-actions">
      <button type="button" class="btn-primary" (click)="goToLogin()">Sign In</button>
      <button type="button" class="btn-outline" (click)="goToRegister()">Create Account</button>
      <!-- NO guest button -->
    </div>
  </div>
  <div class="wizard-actions wizard-actions--split">
    <button type="button" class="btn-outline" (click)="goBack()">Back</button>
  </div>
</section>
```

4. In `booking.guard.ts` (or wherever booking route access is checked), add an additional guard: if the user reaches `/public/booking` step 3+ (payment/confirmation) without being authenticated, redirect to `/auth/login?returnUrl=/public/booking`.

5. In `bookings.effects.ts`, reject any `submitBooking` action where `isGuest: true` is present. The `isWalkIn: true` flag (set by staff) is the only legitimate way to create a booking for someone without an account.

---

### [REQ-2] Public Navbar Must Always Show a "Login" Button

**What exists:** The public navbar (`public-navbar.component.ts`) shows:
- Logo | Home | Doctors | Services | Announcements | **Book Appointment** (pill CTA)

There is **no Login or Sign In button** at any point in the public portal. Unauthenticated users have no visible path to login from the public pages except by finding the booking flow's auth wall.

**What is required:** A persistent **"Login"** button (or "Sign In") must always be visible in the navbar when the user is browsing `/public`.

**Fix — `public-navbar.component.ts`:**

Inject `Store` and select auth state. Show "Login" when unauthenticated, show the user's name/avatar + a "My Portal" link when authenticated:

```typescript
import { selectIsAuthenticated, selectCurrentUser } from '../../../../store/auth/auth.selectors';

// In component class:
readonly isAuthenticated = this.store.selectSignal(selectIsAuthenticated);
readonly currentUser     = this.store.selectSignal(selectCurrentUser);
```

Update the navbar template — add a login section **between the nav links and the Book Appointment CTA**:

```html
<!-- Between .navbar__links items and .navbar__cta -->
<div class="navbar__auth">
  <!-- Logged out -->
  <ng-container *ngIf="!isAuthenticated()">
    <a routerLink="/auth/login" class="navbar-login-btn">Login</a>
  </ng-container>

  <!-- Logged in -->
  <ng-container *ngIf="isAuthenticated()">
    <a routerLink="/patient/dashboard" class="navbar-portal-btn">
      My Portal
    </a>
  </ng-container>
</div>

<div class="navbar__cta">
  <a routerLink="/public/booking" class="navbar-book-btn">Book Appointment</a>
</div>
```

Add to `public-navbar.component.scss`:

```scss
.navbar__auth {
  display: flex;
  align-items: center;
}

// Ghost-style login button — visible but not competing with Book CTA
.navbar-login-btn {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--ion-color-primary);
  text-decoration: none;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  border: 1.5px solid var(--ion-color-primary);
  transition: all var(--transition-fast);
  white-space: nowrap;

  &:hover {
    background: var(--color-primary-50);
  }
}

// Subtle link for logged-in users
.navbar-portal-btn {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--ion-color-primary);
  text-decoration: none;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  transition: background var(--transition-fast);

  &:hover {
    background: var(--color-primary-50);
  }
}
```

Also add to the **mobile menu** (`mobile-menu` section of the template):

```html
<!-- Mobile menu — auth entry points -->
<a routerLink="/auth/login" class="navbar-login-btn mobile-login" (click)="closeMobile()" *ngIf="!isAuthenticated()">
  Login
</a>
<a routerLink="/patient/dashboard" (click)="closeMobile()" *ngIf="isAuthenticated()">
  My Portal
</a>
```

```scss
.mobile-login {
  margin-top: var(--space-2);
  text-align: center;
  display: block;
}
```

Add `Store` and `NgIf` / `AsyncPipe` to the component's `imports` array.

---

### ADDENDUM — Developer Prompt Additions (append to the prompt in Section 2)

Add these items to the bottom of the improvement prompt:

```
AUTH/BOOKING GATE FIXES:

37. step-auth-check.component.ts: Remove the "Continue as Guest" button and the continueAsGuest() method entirely. Update the heading to "Account Required" and the body copy to "You need to sign in or create a free account to complete your booking. Registration only takes a minute." Keep only the Sign In (btn-primary) and Create Account (btn-outline) buttons.

38. booking flow guard: Ensure that if a user reaches any booking step beyond slot selection without being authenticated, they are redirected to /auth/login?returnUrl=/public/booking. The auth check step is the enforcement point — remove any code path that bypasses it.

39. public-navbar.component.ts: Inject Store. Add signal selectors: isAuthenticated = store.selectSignal(selectIsAuthenticated) and currentUser = store.selectSignal(selectCurrentUser). Add NgIf and RouterLink to imports.

40. public-navbar.component.ts template: Add a .navbar__auth div between .navbar__links and .navbar__cta. When NOT authenticated: show <a routerLink="/auth/login" class="navbar-login-btn">Login</a>. When authenticated: show <a routerLink="/patient/dashboard" class="navbar-portal-btn">My Portal</a>.

41. public-navbar.component.scss: Add .navbar__auth { display: flex; align-items: center; }. Add .navbar-login-btn { font-size: var(--text-sm); font-weight: var(--font-semibold); color: var(--ion-color-primary); border: 1.5px solid var(--ion-color-primary); border-radius: var(--radius-md); padding: var(--space-2) var(--space-4); text-decoration: none; transition: all var(--transition-fast); } .navbar-login-btn:hover { background: var(--color-primary-50); }. Add .navbar-portal-btn with same layout but no border, just color and hover background.

42. public-navbar.component.ts mobile-menu template: Add Login link (navbar-login-btn mobile-login, shown when not authenticated) and My Portal link (shown when authenticated) at the bottom of the mobile-menu div. Call closeMobile() on click.
```

---

*End of Audit Report. Total issues found: 42 discrete items across 10 categories.*
