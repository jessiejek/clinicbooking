# CLINIC SYSTEM — FRONTEND.md
> Angular 17 + Ionic 7 + Capacitor. Single source of truth for all frontend structure, pages, components, state, and API integration.

---

## TECH STACK

| Layer | Technology |
|---|---|
| Framework | Angular 17 (standalone components) |
| UI Library | Ionic 7 |
| Styling | Ionic CSS Variables + SCSS |
| State Management | NgRx (feature stores per module) |
| HTTP | Angular HttpClient (interceptors for JWT + refresh) |
| Forms | Reactive Forms + custom validators |
| Routing | Angular Router (lazy-loaded modules per portal) |
| Auth | JWT access token (memory) + refresh token (HttpOnly cookie via API) |
| Notifications | Firebase FCM (Capacitor Push Plugin) |
| PDF Preview | Browser native / `@capacitor/filesystem` for mobile |
| Charts | Apex Charts (via `ng-apexcharts`) |
| Date/Time | `date-fns` |
| Icons | Ionicons (built-in with Ionic) |
| Linting | ESLint + Prettier |
| Build | Angular CLI + Capacitor |
| Package Manager | npm |

---

## DESIGN PHILOSOPHY

The clinic system must feel **trustworthy, calm, and modern** — like a premium private clinic, not a government hospital system. Every screen should communicate professionalism and care.

**Design keywords:** Clean. Airy. Medical-grade. Approachable. Premium.

**Inspired by:** Linear, Vercel dashboard (admin UX), Doctolib / ZocDoc (public portal), Apple Health (data display).

**Core principles:**
- Generous white space — never cramped
- Subtle depth through shadows, not borders
- Color used sparingly and intentionally — mostly neutral, accent only where it matters
- Data-dense screens stay readable through hierarchy, not clutter
- Every interactive element has a clear hover/focus/active state
- Transitions make the app feel alive, not sluggish

---

## DESIGN SYSTEM

### Color Palette

```scss
:root {
  // ─── Primary: Deep Clinic Green ───────────────────────────
  --ion-color-primary:           #1A6B4A;
  --ion-color-primary-shade:     #155C3E;
  --ion-color-primary-tint:      #2D8060;
  --color-primary-50:            #E8F4EF;   // lightest green tint (backgrounds)
  --color-primary-100:           #C5E2D5;
  --color-primary-200:           #8FC6AC;
  --color-primary-600:           #1A6B4A;
  --color-primary-700:           #155C3E;
  --color-primary-900:           #0D3D2A;   // darkest (hover on dark bg)

  // ─── Secondary: Medical Blue ──────────────────────────────
  --ion-color-secondary:         #2563EB;
  --ion-color-secondary-shade:   #1D4ED8;
  --ion-color-secondary-tint:    #3B82F6;
  --color-secondary-50:          #EFF6FF;
  --color-secondary-100:         #DBEAFE;

  // ─── Semantic Colors ──────────────────────────────────────
  --ion-color-success:           #16A34A;
  --color-success-50:            #F0FDF4;
  --color-success-100:           #DCFCE7;

  --ion-color-warning:           #D97706;
  --color-warning-50:            #FFFBEB;
  --color-warning-100:           #FEF3C7;

  --ion-color-danger:            #DC2626;
  --color-danger-50:             #FEF2F2;
  --color-danger-100:            #FEE2E2;

  --ion-color-medium:            #6B7280;
  --ion-color-light:             #F9FAFB;

  // ─── Neutrals (Slate) ─────────────────────────────────────
  --color-neutral-50:            #F8FAFC;
  --color-neutral-100:           #F1F5F9;
  --color-neutral-200:           #E2E8F0;
  --color-neutral-300:           #CBD5E1;
  --color-neutral-400:           #94A3B8;
  --color-neutral-500:           #64748B;
  --color-neutral-600:           #475569;
  --color-neutral-700:           #334155;
  --color-neutral-800:           #1E293B;
  --color-neutral-900:           #0F172A;

  // ─── Semantic UI Tokens ───────────────────────────────────
  --clinic-bg:                   #F8FAFC;      // page background
  --clinic-bg-elevated:          #FFFFFF;      // card / panel background
  --clinic-border:               #E2E8F0;      // all borders
  --clinic-border-strong:        #CBD5E1;      // table separators, dividers
  --clinic-text-primary:         #0F172A;      // headings, important labels
  --clinic-text-secondary:       #475569;      // body text, descriptions
  --clinic-text-muted:           #94A3B8;      // placeholders, hints
  --clinic-text-inverse:         #FFFFFF;      // text on dark backgrounds

  // ─── Gradient Tokens ──────────────────────────────────────
  --gradient-hero:               linear-gradient(135deg, #0D3D2A 0%, #1A6B4A 50%, #2D8060 100%);
  --gradient-card-green:         linear-gradient(135deg, #1A6B4A 0%, #2D8060 100%);
  --gradient-card-blue:          linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%);
  --gradient-card-amber:         linear-gradient(135deg, #B45309 0%, #D97706 100%);
  --gradient-card-rose:          linear-gradient(135deg, #BE123C 0%, #DC2626 100%);
  --gradient-subtle:             linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%);
}
```

### Typography Scale

```scss
// Import in styles.scss
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

:root {
  --font-sans:   'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono:   'JetBrains Mono', 'Fira Code', monospace;

  // Scale
  --text-xs:     0.75rem;    // 12px — labels, badges, captions
  --text-sm:     0.875rem;   // 14px — body small, table rows
  --text-base:   1rem;       // 16px — body default
  --text-lg:     1.125rem;   // 18px — card titles, section headings
  --text-xl:     1.25rem;    // 20px — page sub-headings
  --text-2xl:    1.5rem;     // 24px — page headings
  --text-3xl:    1.875rem;   // 30px — dashboard stats
  --text-4xl:    2.25rem;    // 36px — hero headings
  --text-5xl:    3rem;       // 48px — hero display text
  --text-6xl:    3.75rem;    // 60px — hero large display

  // Weight
  --font-light:    300;
  --font-normal:   400;
  --font-medium:   500;
  --font-semibold: 600;
  --font-bold:     700;
  --font-extrabold:800;

  // Line height
  --leading-tight:  1.25;
  --leading-snug:   1.375;
  --leading-normal: 1.5;
  --leading-relaxed:1.625;
}

* { font-family: var(--font-sans); }
code, kbd, pre, .monospace { font-family: var(--font-mono); }
```

### Spacing System

```scss
:root {
  --space-1:   0.25rem;   // 4px
  --space-2:   0.5rem;    // 8px
  --space-3:   0.75rem;   // 12px
  --space-4:   1rem;      // 16px
  --space-5:   1.25rem;   // 20px
  --space-6:   1.5rem;    // 24px
  --space-8:   2rem;      // 32px
  --space-10:  2.5rem;    // 40px
  --space-12:  3rem;      // 48px
  --space-16:  4rem;      // 64px
  --space-20:  5rem;      // 80px
  --space-24:  6rem;      // 96px
}
```

### Elevation / Shadow System

```scss
:root {
  --shadow-xs:  0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-sm:  0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px -1px rgba(0, 0, 0, 0.08);
  --shadow-md:  0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.08);
  --shadow-lg:  0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.08);
  --shadow-xl:  0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.08);
  --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.18);

  // Colored shadows (used on stat cards)
  --shadow-green:  0 8px 24px rgba(26, 107, 74, 0.20);
  --shadow-blue:   0 8px 24px rgba(37, 99, 235, 0.20);
  --shadow-amber:  0 8px 24px rgba(217, 119, 6, 0.20);
  --shadow-red:    0 8px 24px rgba(220, 38, 38, 0.20);
}
```

### Border Radius System

```scss
:root {
  --radius-sm:   0.375rem;    // 6px  — badges, tags, inputs
  --radius-md:   0.5rem;      // 8px  — buttons, small cards
  --radius-lg:   0.75rem;     // 12px — cards
  --radius-xl:   1rem;        // 16px — modals, panels
  --radius-2xl:  1.5rem;      // 24px — hero cards, feature cards
  --radius-full: 9999px;      // pills, avatars, icon buttons
}
```

### Transitions & Motion

```scss
:root {
  --transition-fast:   150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base:   200ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow:   300ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-spring: 400ms cubic-bezier(0.34, 1.56, 0.64, 1);  // for modals/drawers
}

// All interactive elements
button, a, ion-item, .clickable {
  transition: all var(--transition-base);
}

// Page entry animations
.page-enter {
  animation: fadeSlideUp 300ms var(--transition-slow) both;
}

@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.96); }
  to   { opacity: 1; transform: scale(1); }
}
```

---

## COMPONENT DESIGN SPECS

### Cards

All cards use a consistent visual language:

```scss
.clinic-card {
  background: var(--clinic-bg-elevated);
  border-radius: var(--radius-lg);
  border: 1px solid var(--clinic-border);
  box-shadow: var(--shadow-sm);
  padding: var(--space-6);
  transition: box-shadow var(--transition-base), transform var(--transition-base);

  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-1px);
  }
}

// Status accent variant (left border stripe)
.clinic-card--accent-green  { border-left: 3px solid var(--ion-color-primary); }
.clinic-card--accent-blue   { border-left: 3px solid var(--ion-color-secondary); }
.clinic-card--accent-amber  { border-left: 3px solid var(--ion-color-warning); }
.clinic-card--accent-red    { border-left: 3px solid var(--ion-color-danger); }

// Elevated variant (used for important CTAs / highlighted panels)
.clinic-card--elevated {
  box-shadow: var(--shadow-lg);
  border: none;
}

// Glass variant (used on colored hero sections)
.clinic-card--glass {
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.20);
  color: white;
}
```

### Stat Cards (Dashboard)

```scss
// Gradient stat card — used on all dashboards
.stat-card {
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  color: white;
  position: relative;
  overflow: hidden;

  .stat-card__icon {
    width: 48px;
    height: 48px;
    border-radius: var(--radius-lg);
    background: rgba(255, 255, 255, 0.20);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    margin-bottom: var(--space-4);
  }

  .stat-card__value {
    font-size: var(--text-3xl);
    font-weight: var(--font-bold);
    line-height: var(--leading-tight);
  }

  .stat-card__label {
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    opacity: 0.85;
    margin-top: var(--space-1);
  }

  .stat-card__trend {
    font-size: var(--text-xs);
    opacity: 0.75;
    margin-top: var(--space-2);
  }

  // Decorative circle
  &::after {
    content: '';
    position: absolute;
    top: -24px;
    right: -24px;
    width: 96px;
    height: 96px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.10);
  }

  &.stat-card--green  { background: var(--gradient-card-green);  box-shadow: var(--shadow-green); }
  &.stat-card--blue   { background: var(--gradient-card-blue);   box-shadow: var(--shadow-blue); }
  &.stat-card--amber  { background: var(--gradient-card-amber);  box-shadow: var(--shadow-amber); }
  &.stat-card--red    { background: var(--gradient-card-rose);   box-shadow: var(--shadow-red); }
}
```

### Buttons

```scss
// Primary button
.btn-primary {
  background: var(--gradient-card-green);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-6);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  letter-spacing: 0.01em;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: all var(--transition-base);

  &:hover {
    box-shadow: var(--shadow-green);
    transform: translateY(-1px);
    filter: brightness(1.05);
  }

  &:active { transform: translateY(0); box-shadow: var(--shadow-sm); }
}

// Secondary / outlined
.btn-outline {
  background: transparent;
  border: 1.5px solid var(--ion-color-primary);
  color: var(--ion-color-primary);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-6);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  transition: all var(--transition-base);

  &:hover {
    background: var(--color-primary-50);
    border-color: var(--ion-color-primary-shade);
  }
}

// Ghost / text button
.btn-ghost {
  background: transparent;
  border: none;
  color: var(--clinic-text-secondary);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);

  &:hover {
    background: var(--color-neutral-100);
    color: var(--clinic-text-primary);
  }
}

// Icon button
.btn-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: var(--clinic-text-muted);
  transition: all var(--transition-base);

  &:hover {
    background: var(--color-neutral-100);
    color: var(--clinic-text-primary);
  }
}

// Danger button
.btn-danger {
  background: var(--gradient-card-rose);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-6);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  box-shadow: var(--shadow-sm);

  &:hover { box-shadow: var(--shadow-red); filter: brightness(1.05); }
}
```

### Status Badges

```scss
.badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 3px var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  letter-spacing: 0.03em;
  text-transform: uppercase;

  // Booking status
  &.badge--pending        { background: var(--color-warning-100);   color: #92400E; }
  &.badge--confirmed      { background: var(--color-success-100);   color: #14532D; }
  &.badge--completed      { background: var(--color-primary-100);   color: #0D3D2A; }
  &.badge--cancelled      { background: var(--color-neutral-100);   color: var(--color-neutral-600); }
  &.badge--expired        { background: var(--color-neutral-100);   color: var(--color-neutral-500); }
  &.badge--on-hold        { background: var(--color-secondary-100); color: #1E3A8A; }
  &.badge--no-show        { background: var(--color-danger-100);    color: #7F1D1D; }
  &.badge--proof-submitted{ background: #FDF4FF;                    color: #6B21A8; }
  &.badge--rescheduled    { background: #FFF7ED;                    color: #9A3412; }

  // Payment status
  &.badge--paid           { background: var(--color-success-100);   color: #14532D; }
  &.badge--unpaid         { background: var(--color-danger-100);    color: #7F1D1D; }
  &.badge--waived         { background: var(--color-neutral-100);   color: var(--color-neutral-600); }
  &.badge--refunded       { background: var(--color-secondary-100); color: #1E3A8A; }

  // Doctor status
  &.badge--active         { background: var(--color-success-100);   color: #14532D; }
  &.badge--inactive       { background: var(--color-neutral-100);   color: var(--color-neutral-600); }
  &.badge--on-leave       { background: var(--color-warning-100);   color: #92400E; }

  // Dot indicator
  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    flex-shrink: 0;
  }
}
```

### Form Fields

```scss
// Override Ionic item styling for a clean, modern look
ion-item.clinic-input {
  --background: var(--clinic-bg-elevated);
  --border-color: var(--clinic-border);
  --border-radius: var(--radius-md);
  --border-width: 1.5px;
  --padding-start: var(--space-4);
  --inner-padding-end: var(--space-4);
  --highlight-color-focused: var(--ion-color-primary);
  --color: var(--clinic-text-primary);
  border: 1.5px solid var(--clinic-border);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-4);
  box-shadow: var(--shadow-xs);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);

  &.item-has-focus {
    border-color: var(--ion-color-primary);
    box-shadow: 0 0 0 3px rgba(26, 107, 74, 0.12);
  }

  &.ion-invalid.ion-touched {
    border-color: var(--ion-color-danger);
    box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.10);
  }

  ion-label { font-size: var(--text-sm); font-weight: var(--font-medium); color: var(--clinic-text-secondary); }
  ion-input, ion-textarea, ion-select { font-size: var(--text-base); color: var(--clinic-text-primary); }
}

.form-error-message {
  color: var(--ion-color-danger);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  margin-top: -var(--space-3);
  margin-bottom: var(--space-3);
  display: flex;
  align-items: center;
  gap: var(--space-1);
}
```

### Tables

```scss
.clinic-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: var(--text-sm);

  thead tr {
    background: var(--color-neutral-50);
  }

  th {
    padding: var(--space-3) var(--space-4);
    text-align: left;
    font-size: var(--text-xs);
    font-weight: var(--font-semibold);
    color: var(--clinic-text-muted);
    letter-spacing: 0.05em;
    text-transform: uppercase;
    border-bottom: 1px solid var(--clinic-border);
    white-space: nowrap;
  }

  td {
    padding: var(--space-4);
    border-bottom: 1px solid var(--clinic-border);
    color: var(--clinic-text-primary);
    vertical-align: middle;
  }

  tbody tr {
    transition: background var(--transition-fast);

    &:hover { background: var(--color-primary-50); cursor: pointer; }
    &:last-child td { border-bottom: none; }
  }
}
```

### Slot Grid

```scss
// Upgraded from 64x48 to better proportioned with visual polish
.slot-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(88px, 1fr));
  gap: var(--space-2);
  padding: var(--space-4);
}

.slot-cell {
  height: 52px;
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  font-family: var(--font-mono);
  cursor: pointer;
  transition: all var(--transition-base);
  border: 1.5px solid transparent;
  user-select: none;

  .slot-cell__time { font-size: 11px; opacity: 0.75; margin-top: 2px; }

  // Available — white with subtle border
  &.slot-cell--available {
    background: white;
    border-color: var(--clinic-border);
    color: var(--clinic-text-primary);

    &:hover {
      border-color: var(--ion-color-primary);
      background: var(--color-primary-50);
      color: var(--ion-color-primary);
      box-shadow: 0 0 0 3px rgba(26, 107, 74, 0.10);
      transform: scale(1.04);
    }
  }

  // Selected — solid green
  &.slot-cell--selected {
    background: var(--gradient-card-green);
    border-color: transparent;
    color: white;
    box-shadow: var(--shadow-green);
    transform: scale(1.04);
  }

  // Pending — amber
  &.slot-cell--pending {
    background: var(--color-warning-50);
    border-color: var(--color-warning-100);
    color: #92400E;
    cursor: not-allowed;
    opacity: 0.8;
  }

  // Full — red
  &.slot-cell--full {
    background: var(--color-danger-50);
    border-color: var(--color-danger-100);
    color: #7F1D1D;
    cursor: not-allowed;
    opacity: 0.7;
  }

  // Disabled (unavailable day)
  &.slot-cell--disabled {
    background: var(--color-neutral-50);
    border-color: var(--clinic-border);
    color: var(--clinic-text-muted);
    cursor: not-allowed;
    opacity: 0.5;
  }
}
```

### Skeleton Loaders

```scss
// Used during loading states on all data-heavy pages
@keyframes shimmer {
  0%   { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-neutral-100) 25%,
    var(--color-neutral-200) 50%,
    var(--color-neutral-100) 75%
  );
  background-size: 1000px 100%;
  animation: shimmer 1.6s infinite linear;
  border-radius: var(--radius-sm);
}

.skeleton-text  { height: 14px; margin-bottom: var(--space-2); }
.skeleton-title { height: 20px; width: 60%; margin-bottom: var(--space-3); }
.skeleton-card  { height: 120px; border-radius: var(--radius-lg); }
.skeleton-avatar{ width: 48px; height: 48px; border-radius: var(--radius-full); }
.skeleton-stat  { height: 100px; border-radius: var(--radius-xl); }
.skeleton-row   { height: 52px; border-radius: var(--radius-sm); margin-bottom: var(--space-2); }
```

### Empty States

```scss
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-16) var(--space-8);
  text-align: center;

  .empty-state__icon {
    width: 80px;
    height: 80px;
    border-radius: var(--radius-2xl);
    background: var(--color-primary-50);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36px;
    margin-bottom: var(--space-6);
  }

  .empty-state__title {
    font-size: var(--text-lg);
    font-weight: var(--font-semibold);
    color: var(--clinic-text-primary);
    margin-bottom: var(--space-2);
  }

  .empty-state__description {
    font-size: var(--text-sm);
    color: var(--clinic-text-muted);
    max-width: 360px;
    line-height: var(--leading-relaxed);
    margin-bottom: var(--space-6);
  }
}
```

### Avatar

```scss
.avatar {
  border-radius: var(--radius-full);
  object-fit: cover;
  flex-shrink: 0;
  background: var(--color-primary-100);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-semibold);
  color: var(--ion-color-primary);
  font-size: var(--text-sm);

  &.avatar--xs  { width: 24px;  height: 24px;  font-size: 10px; }
  &.avatar--sm  { width: 32px;  height: 32px;  font-size: var(--text-xs); }
  &.avatar--md  { width: 40px;  height: 40px;  font-size: var(--text-sm); }
  &.avatar--lg  { width: 56px;  height: 56px;  font-size: var(--text-base); }
  &.avatar--xl  { width: 80px;  height: 80px;  font-size: var(--text-xl); }
  &.avatar--2xl { width: 112px; height: 112px; font-size: var(--text-2xl); }
}
```

### Notification Bell

```scss
.notification-bell {
  position: relative;
  cursor: pointer;

  .notification-bell__badge {
    position: absolute;
    top: -4px;
    right: -4px;
    min-width: 18px;
    height: 18px;
    background: var(--ion-color-danger);
    border-radius: var(--radius-full);
    color: white;
    font-size: 10px;
    font-weight: var(--font-bold);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 4px;
    border: 2px solid white;
    animation: badgePop 300ms var(--transition-spring);
  }
}

.notification-panel {
  width: 380px;
  max-height: 480px;
  overflow-y: auto;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-2xl);
  border: 1px solid var(--clinic-border);
  background: white;

  .notification-item {
    padding: var(--space-4) var(--space-5);
    border-bottom: 1px solid var(--clinic-border);
    display: flex;
    gap: var(--space-3);
    cursor: pointer;
    transition: background var(--transition-fast);

    &:hover { background: var(--color-neutral-50); }
    &.unread { background: var(--color-primary-50); }
    &.unread .notification-item__title { font-weight: var(--font-semibold); }
  }
}
```

### Banners (Running Late / Allergy Warning)

```scss
.banner {
  border-radius: var(--radius-md);
  padding: var(--space-4) var(--space-5);
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  margin-bottom: var(--space-4);

  &.banner--warning {
    background: var(--color-warning-50);
    border: 1px solid var(--color-warning-100);
    color: #78350F;
    ion-icon { color: var(--ion-color-warning); font-size: 18px; flex-shrink: 0; }
  }

  &.banner--danger {
    background: var(--color-danger-50);
    border: 1px solid var(--color-danger-100);
    color: #7F1D1D;
    ion-icon { color: var(--ion-color-danger); font-size: 18px; flex-shrink: 0; }
  }

  &.banner--info {
    background: var(--color-secondary-50);
    border: 1px solid var(--color-secondary-100);
    color: #1E3A8A;
    ion-icon { color: var(--ion-color-secondary); font-size: 18px; flex-shrink: 0; }
  }

  .banner__close {
    margin-left: auto;
    cursor: pointer;
    opacity: 0.6;
    &:hover { opacity: 1; }
  }
}
```

---

## LAYOUT SYSTEM

### Public Portal Layout

The public portal uses a **full-width marketing layout** with a fixed navigation header.

```
┌──────────────────────────────────────────────────────────────┐
│  NAVBAR: Logo | Nav Links | Book Appointment (CTA button)    │  ← fixed, white, shadow on scroll
├──────────────────────────────────────────────────────────────┤
│  PAGE CONTENT (full width sections)                          │
├──────────────────────────────────────────────────────────────┤
│  FOOTER: Logo | Links | Contact | Social | © Clinic Name     │
└──────────────────────────────────────────────────────────────┘
```

```scss
// Public portal navbar
.public-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: white;
  border-bottom: 1px solid var(--clinic-border);
  display: flex;
  align-items: center;
  padding: 0 var(--space-8);
  gap: var(--space-8);
  z-index: 1000;
  transition: box-shadow var(--transition-base);

  &.scrolled { box-shadow: var(--shadow-md); }

  .navbar__logo {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    text-decoration: none;

    img { height: 36px; width: auto; }
    span { font-size: var(--text-lg); font-weight: var(--font-bold); color: var(--ion-color-primary); }
  }

  .navbar__links {
    display: flex;
    align-items: center;
    gap: var(--space-6);
    margin-left: auto;

    a {
      font-size: var(--text-sm);
      font-weight: var(--font-medium);
      color: var(--clinic-text-secondary);
      text-decoration: none;
      transition: color var(--transition-fast);

      &:hover, &.active { color: var(--ion-color-primary); }
    }
  }
}
```

### Dashboard Portal Layout (Admin / Staff / Doctor)

All internal portals use a **sidebar + main content** layout.

```
┌───────────────────────────────────────────────────────────────┐
│ SIDEBAR (260px fixed)          │  MAIN CONTENT AREA           │
│                                │                              │
│  ┌──────────────────────────┐  │  TOPBAR: Search | Bell | Ava │
│  │  Clinic Logo             │  │  ─────────────────────────── │
│  │  + Clinic Name           │  │                              │
│  └──────────────────────────┘  │  PAGE CONTENT                │
│                                │  (scrollable)                │
│  [Nav section label]           │                              │
│  ● Dashboard                   │                              │
│  ● Bookings                    │                              │
│  ● Patients                    │                              │
│  ● Doctors                     │                              │
│  ● Calendar                    │                              │
│                                │                              │
│  [section]                     │                              │
│  ● Reports                     │                              │
│  ● Audit Log                   │                              │
│  ● Settings                    │                              │
│                                │                              │
│  ─────────────────────────     │                              │
│  [Avatar] Admin Name      ▸    │                              │
└───────────────────────────────────────────────────────────────┘
```

```scss
.portal-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: var(--clinic-bg);
}

.sidebar {
  width: 260px;
  flex-shrink: 0;
  background: var(--color-neutral-900);     // dark sidebar
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  z-index: 100;

  .sidebar__brand {
    padding: var(--space-6);
    border-bottom: 1px solid rgba(255,255,255,0.08);
    display: flex;
    align-items: center;
    gap: var(--space-3);

    img { height: 36px; width: auto; }
    .brand-name {
      font-size: var(--text-base);
      font-weight: var(--font-bold);
      color: white;
      line-height: var(--leading-tight);
    }
    .brand-sub {
      font-size: var(--text-xs);
      color: rgba(255,255,255,0.45);
      font-weight: var(--font-normal);
    }
  }

  .sidebar__section-label {
    padding: var(--space-6) var(--space-5) var(--space-2);
    font-size: 10px;
    font-weight: var(--font-semibold);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.35);
  }

  .sidebar__nav-item {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-5);
    margin: 1px var(--space-3);
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    color: rgba(255,255,255,0.60);
    cursor: pointer;
    text-decoration: none;
    transition: all var(--transition-fast);

    ion-icon { font-size: 18px; flex-shrink: 0; }

    // Badge (e.g. pending count)
    .nav-badge {
      margin-left: auto;
      background: var(--ion-color-danger);
      color: white;
      border-radius: var(--radius-full);
      padding: 1px 7px;
      font-size: 10px;
      font-weight: var(--font-bold);
      min-width: 20px;
      text-align: center;
    }

    &:hover {
      background: rgba(255,255,255,0.08);
      color: white;
    }

    &.active {
      background: var(--ion-color-primary);
      color: white;
      box-shadow: var(--shadow-green);

      ion-icon { color: white; }
    }
  }

  .sidebar__footer {
    margin-top: auto;
    padding: var(--space-4) var(--space-5);
    border-top: 1px solid rgba(255,255,255,0.08);
    display: flex;
    align-items: center;
    gap: var(--space-3);
    cursor: pointer;

    &:hover { background: rgba(255,255,255,0.06); }

    .footer-name  { font-size: var(--text-sm);  font-weight: var(--font-semibold); color: white; }
    .footer-role  { font-size: var(--text-xs);  color: rgba(255,255,255,0.45); }
    ion-icon      { margin-left: auto; color: rgba(255,255,255,0.45); }
  }
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.topbar {
  height: 64px;
  background: white;
  border-bottom: 1px solid var(--clinic-border);
  padding: 0 var(--space-8);
  display: flex;
  align-items: center;
  gap: var(--space-4);
  flex-shrink: 0;

  .topbar__search {
    flex: 1;
    max-width: 400px;
    background: var(--color-neutral-50);
    border: 1.5px solid var(--clinic-border);
    border-radius: var(--radius-full);
    height: 38px;
    padding: 0 var(--space-4);
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--text-sm);
    color: var(--clinic-text-muted);
    transition: all var(--transition-fast);

    &:focus-within {
      border-color: var(--ion-color-primary);
      background: white;
      box-shadow: 0 0 0 3px rgba(26, 107, 74, 0.10);
    }

    ion-icon { font-size: 16px; }
    input { background: none; border: none; outline: none; flex: 1; color: var(--clinic-text-primary); font-size: var(--text-sm); }
  }

  .topbar__actions { margin-left: auto; display: flex; align-items: center; gap: var(--space-2); }
}

.page-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-8);

  .page-header {
    margin-bottom: var(--space-8);

    .page-title {
      font-size: var(--text-2xl);
      font-weight: var(--font-bold);
      color: var(--clinic-text-primary);
      line-height: var(--leading-tight);
    }

    .page-subtitle {
      font-size: var(--text-sm);
      color: var(--clinic-text-muted);
      margin-top: var(--space-1);
    }
  }
}

// Dashboard grid
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-6);
  margin-bottom: var(--space-8);

  @media (max-width: 1200px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 768px)  { grid-template-columns: 1fr; }
}

.dashboard-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-6);
  margin-bottom: var(--space-6);

  @media (max-width: 900px) { grid-template-columns: 1fr; }
}
```

---

## PUBLIC PORTAL — DETAILED DESIGN

### Navbar
- White background, 64px height, fixed to top
- Left: Clinic logo + clinic name
- Center: Home | Doctors | Services | Announcements
- Right: **"Book Appointment"** button (green gradient, pill shape)
- On scroll > 10px: add `box-shadow: var(--shadow-md)`
- Mobile: hamburger icon opens a slide-over menu from the right

### Hero Section

```scss
.hero {
  min-height: 640px;
  background: var(--gradient-hero);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  padding: var(--space-24) var(--space-8);
  padding-top: calc(64px + var(--space-24));  // account for navbar

  // Abstract mesh background
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 80% 60% at 70% 50%, rgba(45, 128, 96, 0.4) 0%, transparent 60%),
      radial-gradient(ellipse 40% 40% at 20% 80%, rgba(37, 99, 235, 0.2) 0%, transparent 50%);
  }

  // Decorative circles
  &::after {
    content: '';
    position: absolute;
    top: -80px;
    right: -80px;
    width: 480px;
    height: 480px;
    border-radius: 50%;
    background: rgba(255,255,255,0.04);
  }

  .hero__content {
    position: relative;
    z-index: 1;
    max-width: 640px;
  }

  .hero__tag {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    background: rgba(255,255,255,0.15);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255,255,255,0.20);
    border-radius: var(--radius-full);
    padding: var(--space-2) var(--space-4);
    font-size: var(--text-xs);
    font-weight: var(--font-semibold);
    color: rgba(255,255,255,0.90);
    letter-spacing: 0.05em;
    text-transform: uppercase;
    margin-bottom: var(--space-6);
  }

  h1 {
    font-size: var(--text-5xl);
    font-weight: var(--font-extrabold);
    color: white;
    line-height: var(--leading-tight);
    margin-bottom: var(--space-6);

    span { color: rgba(255,255,255,0.70); }   // de-emphasized word
  }

  p {
    font-size: var(--text-xl);
    color: rgba(255,255,255,0.75);
    line-height: var(--leading-relaxed);
    margin-bottom: var(--space-8);
    max-width: 520px;
  }

  .hero__cta-group {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    flex-wrap: wrap;
  }

  .hero__cta-primary {
    background: white;
    color: var(--ion-color-primary);
    border-radius: var(--radius-full);
    padding: var(--space-4) var(--space-8);
    font-size: var(--text-base);
    font-weight: var(--font-bold);
    box-shadow: var(--shadow-xl);
    transition: all var(--transition-base);
    text-decoration: none;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 20px 40px rgba(0,0,0,0.25);
    }
  }

  .hero__cta-secondary {
    color: rgba(255,255,255,0.85);
    font-size: var(--text-base);
    font-weight: var(--font-medium);
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: var(--space-2);
    transition: color var(--transition-fast);

    &:hover { color: white; }
  }

  // Trust badges row
  .hero__trust {
    display: flex;
    align-items: center;
    gap: var(--space-6);
    margin-top: var(--space-12);
    padding-top: var(--space-8);
    border-top: 1px solid rgba(255,255,255,0.15);

    .trust-item {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--text-sm);
      color: rgba(255,255,255,0.70);
      font-weight: var(--font-medium);

      ion-icon { color: rgba(255,255,255,0.50); font-size: 16px; }
    }
  }
}
```

### Operating Hours Widget (below hero)

```scss
.hours-bar {
  background: white;
  border-bottom: 1px solid var(--clinic-border);
  padding: var(--space-4) var(--space-8);
  display: flex;
  align-items: center;
  gap: var(--space-8);
  box-shadow: var(--shadow-sm);

  .hours-item {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    font-size: var(--text-sm);

    .day   { font-weight: var(--font-semibold); color: var(--clinic-text-primary); min-width: 80px; }
    .time  { color: var(--clinic-text-secondary); }
    .closed{ color: var(--ion-color-danger); font-weight: var(--font-medium); }
  }
}
```

### Doctor Cards (Public Portal)

```scss
.doctor-card {
  background: white;
  border-radius: var(--radius-xl);
  border: 1px solid var(--clinic-border);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base);
  cursor: pointer;

  &:hover {
    box-shadow: var(--shadow-xl);
    transform: translateY(-4px);
    border-color: var(--color-primary-200);
  }

  .doctor-card__photo {
    width: 100%;
    height: 200px;
    object-fit: cover;
    background: var(--color-primary-50);
  }

  .doctor-card__photo-placeholder {
    width: 100%;
    height: 200px;
    background: linear-gradient(135deg, var(--color-primary-50) 0%, var(--color-primary-100) 100%);
    display: flex;
    align-items: center;
    justify-content: center;

    ion-icon { font-size: 64px; color: var(--color-primary-200); }
  }

  .doctor-card__body {
    padding: var(--space-5);
  }

  .doctor-card__name {
    font-size: var(--text-lg);
    font-weight: var(--font-bold);
    color: var(--clinic-text-primary);
  }

  .doctor-card__specialty {
    font-size: var(--text-sm);
    color: var(--ion-color-primary);
    font-weight: var(--font-semibold);
    margin-top: 2px;
  }

  .doctor-card__fee {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin-top: var(--space-4);
    font-size: var(--text-sm);
    color: var(--clinic-text-secondary);

    strong { color: var(--clinic-text-primary); font-size: var(--text-base); }
  }

  .doctor-card__rating {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    margin-top: var(--space-2);

    .stars { color: #F59E0B; font-size: var(--text-sm); }
    .count { font-size: var(--text-xs); color: var(--clinic-text-muted); }
  }

  .doctor-card__footer {
    padding: var(--space-4) var(--space-5);
    border-top: 1px solid var(--clinic-border);
    display: flex;
    align-items: center;
    justify-content: space-between;

    .btn-book {
      background: var(--gradient-card-green);
      color: white;
      border: none;
      border-radius: var(--radius-md);
      padding: var(--space-2) var(--space-5);
      font-size: var(--text-sm);
      font-weight: var(--font-semibold);
      cursor: pointer;
      transition: all var(--transition-base);

      &:hover { filter: brightness(1.1); box-shadow: var(--shadow-green); }
    }
  }
}
```

### Service Category Cards (Public Portal)

```scss
.service-category-card {
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  cursor: pointer;
  transition: all var(--transition-base);
  position: relative;
  overflow: hidden;

  .service-category-card__icon {
    width: 52px;
    height: 52px;
    border-radius: var(--radius-lg);
    background: rgba(255,255,255,0.20);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26px;
    margin-bottom: var(--space-4);
  }

  .service-category-card__name {
    font-size: var(--text-lg);
    font-weight: var(--font-bold);
    color: white;
  }

  .service-category-card__count {
    font-size: var(--text-sm);
    color: rgba(255,255,255,0.70);
    margin-top: var(--space-1);
  }

  &.scc--consultation { background: var(--gradient-card-green); }
  &.scc--procedure    { background: var(--gradient-card-blue); }
  &.scc--laboratory   { background: var(--gradient-card-amber); }
  &.scc--diagnostic   { background: linear-gradient(135deg, #5B21B6 0%, #7C3AED 100%); }

  &:hover { transform: translateY(-3px); box-shadow: var(--shadow-xl); }
}
```

### Booking Wizard

```scss
// Multi-step wizard progress bar
.booking-wizard {
  max-width: 760px;
  margin: 0 auto;
  padding: var(--space-8);

  .wizard-progress {
    display: flex;
    align-items: center;
    margin-bottom: var(--space-10);

    .wizard-step {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      flex: 1;

      .step-number {
        width: 32px;
        height: 32px;
        border-radius: var(--radius-full);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--text-sm);
        font-weight: var(--font-bold);
        flex-shrink: 0;
        transition: all var(--transition-base);
      }

      .step-label {
        font-size: var(--text-xs);
        font-weight: var(--font-medium);
        color: var(--clinic-text-muted);
        white-space: nowrap;
      }

      .step-connector {
        flex: 1;
        height: 2px;
        background: var(--clinic-border);
        margin: 0 var(--space-2);
        transition: background var(--transition-base);
      }

      &.completed .step-number  { background: var(--ion-color-primary); color: white; }
      &.active .step-number     { background: var(--gradient-card-green); color: white; box-shadow: var(--shadow-green); }
      &.pending .step-number    { background: var(--color-neutral-100); color: var(--clinic-text-muted); }
      &.completed .step-connector { background: var(--ion-color-primary); }
    }
  }

  // Booking timer countdown
  .booking-timer {
    background: var(--color-warning-50);
    border: 1px solid var(--color-warning-100);
    border-radius: var(--radius-lg);
    padding: var(--space-4) var(--space-5);
    display: flex;
    align-items: center;
    gap: var(--space-3);
    margin-bottom: var(--space-6);
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    color: #78350F;

    .timer-value {
      font-size: var(--text-2xl);
      font-weight: var(--font-bold);
      font-family: var(--font-mono);
      color: var(--ion-color-warning);
      min-width: 52px;
    }
  }

  // Booking summary card
  .booking-summary {
    background: var(--color-primary-50);
    border: 1px solid var(--color-primary-100);
    border-radius: var(--radius-lg);
    padding: var(--space-6);
    margin-bottom: var(--space-6);

    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-3) 0;
      border-bottom: 1px solid var(--color-primary-100);
      font-size: var(--text-sm);

      &:last-child { border-bottom: none; }

      .label  { color: var(--clinic-text-muted); }
      .value  { font-weight: var(--font-semibold); color: var(--clinic-text-primary); }
      &.total .label { font-weight: var(--font-semibold); color: var(--clinic-text-primary); font-size: var(--text-base); }
      &.total .value { font-size: var(--text-xl); font-weight: var(--font-bold); color: var(--ion-color-primary); }
    }
  }
}
```

### Footer

```scss
.public-footer {
  background: var(--color-neutral-900);
  color: rgba(255,255,255,0.70);
  padding: var(--space-16) var(--space-8) var(--space-8);

  .footer-grid {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: var(--space-12);
    margin-bottom: var(--space-12);
    padding-bottom: var(--space-12);
    border-bottom: 1px solid rgba(255,255,255,0.10);

    @media (max-width: 768px) { grid-template-columns: 1fr 1fr; }
  }

  .footer-brand {
    .brand-logo { height: 36px; margin-bottom: var(--space-4); }
    .brand-name { font-size: var(--text-lg); font-weight: var(--font-bold); color: white; margin-bottom: var(--space-3); }
    .brand-desc { font-size: var(--text-sm); line-height: var(--leading-relaxed); color: rgba(255,255,255,0.55); }
  }

  .footer-col {
    h4 {
      font-size: var(--text-sm);
      font-weight: var(--font-semibold);
      color: white;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin-bottom: var(--space-5);
    }

    a {
      display: block;
      font-size: var(--text-sm);
      color: rgba(255,255,255,0.55);
      text-decoration: none;
      margin-bottom: var(--space-3);
      transition: color var(--transition-fast);

      &:hover { color: white; }
    }
  }

  .footer-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: var(--text-xs);
    color: rgba(255,255,255,0.35);

    .social-links {
      display: flex;
      gap: var(--space-3);

      a {
        width: 32px;
        height: 32px;
        border-radius: var(--radius-full);
        background: rgba(255,255,255,0.08);
        display: flex;
        align-items: center;
        justify-content: center;
        color: rgba(255,255,255,0.55);
        transition: all var(--transition-fast);

        &:hover { background: var(--ion-color-primary); color: white; }
      }
    }
  }
}
```

---

## AUTH PAGES — DESIGN

All auth pages use a **split-screen layout**:
- Left half: Clinic branding panel (gradient green, logo, tagline, decorative elements)
- Right half: White panel with centered auth form

```scss
.auth-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 100vh;

  @media (max-width: 768px) { grid-template-columns: 1fr; }

  .auth-panel-brand {
    background: var(--gradient-hero);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--space-12);
    position: relative;
    overflow: hidden;

    @media (max-width: 768px) { display: none; }

    // Decorative circles
    &::before {
      content: '';
      position: absolute;
      bottom: -80px;
      left: -80px;
      width: 360px;
      height: 360px;
      border-radius: 50%;
      background: rgba(255,255,255,0.06);
    }

    .brand-logo { width: 80px; height: 80px; margin-bottom: var(--space-6); }
    .brand-name { font-size: var(--text-3xl); font-weight: var(--font-extrabold); color: white; text-align: center; }
    .brand-sub  { font-size: var(--text-base); color: rgba(255,255,255,0.70); margin-top: var(--space-3); text-align: center; max-width: 300px; line-height: var(--leading-relaxed); }
  }

  .auth-panel-form {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-12);
    background: white;

    .auth-form-inner {
      width: 100%;
      max-width: 400px;

      .auth-form__title {
        font-size: var(--text-2xl);
        font-weight: var(--font-bold);
        color: var(--clinic-text-primary);
        margin-bottom: var(--space-2);
      }

      .auth-form__subtitle {
        font-size: var(--text-sm);
        color: var(--clinic-text-muted);
        margin-bottom: var(--space-8);
      }
    }
  }
}

// Social login buttons
.btn-social {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-6);
  border: 1.5px solid var(--clinic-border);
  border-radius: var(--radius-md);
  background: white;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--clinic-text-primary);
  cursor: pointer;
  transition: all var(--transition-fast);
  margin-bottom: var(--space-3);

  &:hover { background: var(--color-neutral-50); border-color: var(--clinic-border-strong); box-shadow: var(--shadow-sm); }

  img { width: 20px; height: 20px; }
}

.auth-divider {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin: var(--space-6) 0;

  hr { flex: 1; border: none; border-top: 1px solid var(--clinic-border); }
  span { font-size: var(--text-xs); color: var(--clinic-text-muted); font-weight: var(--font-medium); text-transform: uppercase; letter-spacing: 0.08em; white-space: nowrap; }
}
```

---

## PATIENT PORTAL — DESIGN

The patient portal uses a **light, card-based layout** with a top navigation bar (not a sidebar — cleaner for patients).

- White topbar with clinic logo, nav tabs, notification bell, avatar
- Content area in `--clinic-bg` (#F8FAFC)
- Medical records displayed in timeline cards with clear date/doctor hierarchy
- Prescriptions shown in pill-styled cards with status badges

---

## MOBILE RESPONSIVENESS

All portals are responsive. Key breakpoints:

```scss
// Breakpoints
$bp-sm:  480px;
$bp-md:  768px;
$bp-lg:  1024px;
$bp-xl:  1280px;
$bp-2xl: 1536px;

// Public portal: stack vertically on mobile
// Dashboard portals: sidebar collapses to bottom tab bar on mobile
// Slot grid: reduce to 3 columns on mobile
// Hero h1: drops from text-5xl to text-3xl on mobile
// Doctor cards: single column on mobile
```

### Mobile Sidebar → Bottom Tab Bar

On screens < 768px, the sidebar collapses and a **bottom tab bar** replaces it:

```scss
.bottom-tab-bar {
  display: none;  // hidden on desktop

  @media (max-width: 768px) {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60px;
    background: white;
    border-top: 1px solid var(--clinic-border);
    box-shadow: 0 -4px 12px rgba(0,0,0,0.06);
    z-index: 100;

    .tab-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 3px;
      font-size: 10px;
      font-weight: var(--font-semibold);
      color: var(--clinic-text-muted);
      cursor: pointer;
      transition: color var(--transition-fast);

      ion-icon { font-size: 22px; }

      &.active { color: var(--ion-color-primary); }
    }
  }
}
```

---

## GLOBAL STYLES (styles.scss additions)

```scss
// Page-level entry animation
ion-content {
  --background: var(--clinic-bg);
}

// All pages animate in
.page-enter-active {
  animation: fadeSlideUp 250ms ease-out both;
}

// Smooth scrollbar
* {
  scrollbar-width: thin;
  scrollbar-color: var(--clinic-border) transparent;
}
*::-webkit-scrollbar { width: 6px; height: 6px; }
*::-webkit-scrollbar-track { background: transparent; }
*::-webkit-scrollbar-thumb { background: var(--clinic-border-strong); border-radius: 3px; }
*::-webkit-scrollbar-thumb:hover { background: var(--color-neutral-400); }

// Focus ring (accessibility)
*:focus-visible {
  outline: 2px solid var(--ion-color-primary);
  outline-offset: 2px;
}

// No focus ring on mouse click
*:focus:not(:focus-visible) { outline: none; }

// Section heading pattern
.section-heading {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--clinic-text-muted);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: var(--space-5);
  display: flex;
  align-items: center;
  gap: var(--space-3);

  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--clinic-border);
  }
}

// Monospace data (IDs, codes, OR numbers, queue numbers)
.data-mono {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--clinic-text-primary);
  background: var(--color-neutral-100);
  padding: 2px var(--space-2);
  border-radius: var(--radius-sm);
  letter-spacing: 0.03em;
}

// Divider
.divider {
  border: none;
  border-top: 1px solid var(--clinic-border);
  margin: var(--space-6) 0;
}

// Page max width for dashboard content
.content-container {
  max-width: 1400px;
  margin: 0 auto;
}
```

---

## FOLDER STRUCTURE

```
src/
├── app/
│   ├── core/
│   │   ├── interceptors/
│   │   │   ├── auth.interceptor.ts          — Attaches JWT to every request
│   │   │   └── error.interceptor.ts         — Global 401/403/409 handling
│   │   ├── guards/
│   │   │   ├── auth.guard.ts
│   │   │   ├── role.guard.ts                — Checks role claim from JWT
│   │   │   └── first-login.guard.ts         — Redirects to set-password if IsFirstLogin
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── token.service.ts             — Stores access token in memory only
│   │   │   ├── notification.service.ts      — FCM + in-app bell
│   │   │   └── clinic-settings.service.ts   — Loads branding/settings on boot
│   │   └── models/
│   │       └── index.ts                     — All TypeScript interfaces (mirrors DB tables)
│   │
│   ├── shared/
│   │   ├── components/
│   │   │   ├── slot-grid/
│   │   │   ├── booking-status-badge/
│   │   │   ├── patient-search/
│   │   │   ├── confirm-modal/
│   │   │   ├── icd10-search/
│   │   │   ├── vital-signs-form/
│   │   │   ├── allergy-warning-banner/
│   │   │   ├── running-late-banner/
│   │   │   ├── payment-status-badge/
│   │   │   └── empty-state/
│   │   ├── pipes/
│   │   │   ├── peso.pipe.ts
│   │   │   ├── patient-code.pipe.ts
│   │   │   └── time-slot.pipe.ts
│   │   └── validators/
│   │       └── password-strength.validator.ts
│   │
│   ├── portals/
│   │   ├── public/          — Patient-facing booking portal (no auth required)
│   │   ├── patient/         — Logged-in patient portal
│   │   ├── admin/           — Admin portal
│   │   ├── staff/           — Staff portal
│   │   └── doctor/          — Doctor portal
│   │
│   ├── auth/
│   │   ├── login/
│   │   ├── register/
│   │   ├── set-password/    — Invite link landing (IsFirstLogin flow)
│   │   ├── forgot-password/
│   │   └── reset-password/
│   │
│   └── app.routes.ts
│
└── environments/
    ├── environment.ts
    └── environment.prod.ts
```

---

## PORTALS & PAGES

### PUBLIC PORTAL (`/portals/public/`)
No auth required. Patient-facing clinic website.

```
public/
├── home/
├── doctors/           — Doctor listing with filter by specialization
├── doctor-profile/    — Bio, services offered, reviews, available dates
├── services/          — Service catalog filtered by category
├── booking/           — Full multi-step booking wizard
├── booking-confirmation/
└── announcements/
```

**Home page sections:**
- Navbar (fixed, white)
- Hero (gradient, tagline, dual CTA, trust badges)
- Operating hours bar
- Featured doctors (horizontal scroll cards on mobile, 3-col grid on desktop)
- Services by category (4 gradient category cards)
- Announcements feed (card grid)
- Footer (dark, 4-column)

**Booking wizard steps:**
1. Select doctor + service
2. Select date (calendar — blocked dates grayed out)
3. Select time slot (slot grid component)
4. Review summary (doctor, date, time, service, TotalFee breakdown)
5. Login/register prompt if not authenticated
6. Payment instructions (GCash QR / Maya QR / Bank — skipped if PayAtClinic)
7. Submit proof (reference number or screenshot upload)
8. Confirmation screen with queue number

---

### PATIENT PORTAL (`/portals/patient/`)
Requires Patient role.

```
patient/
├── dashboard/
├── bookings/
├── booking-detail/
├── medical-records/
├── prescriptions/
├── profile/
├── privacy-consent/
└── reviews/
```

---

### ADMIN PORTAL (`/portals/admin/`)
Requires Admin role. Dark sidebar layout.

```
admin/
├── dashboard/         — Stat cards + charts + today's appointment table
├── bookings/
├── booking-detail/
├── walk-in/
├── calendar/
├── doctors/
├── doctor-form/
├── services/
├── patients/
├── patient-detail/
├── staff/
├── admin-accounts/
├── announcements/
├── audit-logs/
├── reports/
└── settings/
```

**Admin Dashboard stat cards (in order):**
1. Today's Appointments — green
2. This Month's Appointments — blue
3. Revenue Today — amber
4. Pending Verifications — red (action required badge)
5. On Hold Bookings — blue (action required badge)
6. Unpaid Completed Visits — red (collection alert)
7. No Shows Today — neutral
8. Upcoming Follow-Ups (7 days) — amber

**Below stat cards:**
- Today's appointment table (queue#, patient, doctor, status, payment badge, actions)
- ApexCharts: Most booked doctor (bar) | Revenue this month (area)
- Running late / unavailable flags active today (alert strip)

---

### STAFF PORTAL (`/portals/staff/`)
Requires Staff role. Mirrors Admin minus settings, audit log, admin accounts, waive/refund.

---

### DOCTOR PORTAL (`/portals/doctor/`)
Requires Doctor role.

```
doctor/
├── dashboard/         — Today's queue + upcoming + stats + quick settings
├── appointments/      — Today's queue and upcoming week
├── appointment-detail/
├── patients/          — Own patients only
├── patient-detail/
├── consultation-form/ — SOAP + vital signs + ICD-10 + prescriptions
├── my-settings/       — Fee, slot config, schedule, blocked dates, today's availability
├── schedule/
└── profile/
```

---

## STATE MANAGEMENT (NgRx)

One feature store per module.

```
store/
├── auth/
├── bookings/
├── doctors/
├── patients/
├── notifications/
└── clinic-settings/
```

**Auth store state shape:**
```typescript
interface AuthState {
  user: AuthUser | null;       // { id, role, name, isFirstLogin }
  accessToken: string | null;  // in-memory only, never localStorage
  isLoading: boolean;
  error: string | null;
}
```

---

## HTTP SERVICES (per API module)

```
services/
├── auth.api.service.ts
├── doctors.api.service.ts
├── services.api.service.ts
├── bookings.api.service.ts
├── patients.api.service.ts
├── consultations.api.service.ts
├── prescriptions.api.service.ts
├── vitals.api.service.ts
├── diagnoses.api.service.ts
├── allergies.api.service.ts
├── attachments.api.service.ts
├── vaccinations.api.service.ts
├── reviews.api.service.ts
├── announcements.api.service.ts
├── notifications.api.service.ts
├── staff.api.service.ts
├── admin.api.service.ts
├── audit-logs.api.service.ts
├── documents.api.service.ts
└── settings.api.service.ts
```

---

## MODELS (TypeScript interfaces)

All interfaces live in `core/models/index.ts` and mirror the database tables exactly.

```typescript
// Users
interface AuthUser { id: string; fullName: string; email: string; role: Role; avatarUrl?: string; isFirstLogin: boolean; }

// Doctors
interface Doctor { id: string; userId: string; fullName: string; specialization: string; bio: string; profilePhotoUrl?: string; licenseNumber: string; ptrNumber: string; s2Number: string; consultationFee: number; slotDurationMinutes: number; slotCapacity: number; dailyPatientLimit: number | null; status: DoctorStatus; }

// Bookings
interface Booking { id: string; patientId: string; doctorId: string; serviceId: string; appointmentDate: string; slotStartTime: string; slotEndTime: string; status: BookingStatus; paymentStatus: PaymentStatus; paymentMode: PaymentMode; queueNumber: number | null; totalFee: number; consultationFeeSnapshot: number; serviceFeeSnapshot: number; isWalkIn: boolean; rescheduledFromBookingId?: string; proofType?: ProofType; proofValue?: string; receiptUrl?: string; cancellationReason?: string; notes?: string; createdAt: string; }

// Payments
interface Payment { id: string; bookingId: string; amount: number; paymentMethod: PaymentMethod; referenceNumber?: string; proofImageUrl?: string; status: PaymentStatus; orNumber?: string; verifiedByUserId?: string; verifiedAt?: string; waivedByUserId?: string; waivedAt?: string; waivedReason?: string; refundedByUserId?: string; refundedAt?: string; refundReason?: string; }

// Patients
interface Patient { id: string; patientCode: string; firstName: string; middleName?: string; lastName: string; dateOfBirth: string; sex: string; civilStatus?: string; address?: string; city?: string; zipCode?: string; contactNumber?: string; email?: string; emergencyContactName?: string; emergencyContactNumber?: string; emergencyContactRelationship?: string; bloodType?: string; philHealthNumber?: string; hmoProvider?: string; hmoCardNumber?: string; userId?: string; isGuest: boolean; consentedAt?: string; consentVersion?: string; }

// Consultations
interface Consultation { id: string; patientId: string; doctorId: string; bookingId?: string; consultationDate: string; consultationTime: string; chiefComplaint: string; historyOfPresentIllness?: string; peGeneralFindings?: string; assessment?: string; plan?: string; followUpDate?: string; isLocked: boolean; visitSummaryUrl?: string; }

// Prescriptions
interface Prescription { id: string; consultationId?: string; patientId: string; doctorId: string; prescriptionDate: string; status: PrescriptionStatus; notes?: string; items: PrescriptionItem[]; }
interface PrescriptionItem { id: string; prescriptionId: string; genericName: string; brandName?: string; dosageForm: string; strength: string; quantity: number; sig: string; isControlledSubstance: boolean; }

// VitalSigns
interface VitalSigns { id: string; consultationId: string; patientId: string; bloodPressureSystolic?: number; bloodPressureDiastolic?: number; heartRate?: number; respiratoryRate?: number; temperature?: number; oxygenSaturation?: number; weight?: number; height?: number; bmi?: number; createdAt: string; }

// Enums
type Role = 'Admin' | 'Staff' | 'Doctor' | 'Patient';
type DoctorStatus = 'Active' | 'Inactive' | 'OnLeave';
type BookingStatus = 'Pending' | 'ProofSubmitted' | 'Confirmed' | 'OnHold' | 'Cancelled' | 'Completed' | 'Expired' | 'NoShow' | 'Rescheduled';
type PaymentStatus = 'Unpaid' | 'Paid' | 'Waived' | 'Refunded';
type PaymentMode = 'Online' | 'PayAtClinic';
type PaymentMethod = 'GCash' | 'Maya' | 'BankTransfer' | 'PayAtClinic';
type ProofType = 'ReferenceNumber' | 'Screenshot';
type PrescriptionStatus = 'Active' | 'Filled' | 'Expired' | 'Cancelled';
type ServiceCategory = 'Consultation' | 'Procedure' | 'Laboratory' | 'Diagnostic';
```

---

## KEY UI BEHAVIORS

### Slot Grid Component
- Renders a grid of time slots based on `slotDurationMinutes` and the doctor's schedule for a given date
- Colors: White (available), Red (fully booked), Yellow/Amber (pending), Green (selected)
- Clicking a Red or Yellow slot shows tooltip: "Slot not available"
- If doctor status = RunningLate → `<running-late-banner>` shown above grid (amber)
- If doctor status = UnavailableToday → entire grid shown as disabled, banner shown (danger)

### Booking Timer
- When booking is `Pending`, a countdown timer shows on the proof submission page
- Timer styled with monospace font in amber banner
- At 0 → auto-refreshes and shows "Slot expired" empty state screen

### Allergy Warning
- When a doctor opens the prescription form, the patient's allergy list is fetched
- If any drug name in the new prescription matches an allergen → `<allergy-warning-banner>` appears (amber, dismissable, non-blocking)

### Consent Re-prompt
- On every login, `Patient.ConsentVersion` is compared to `ClinicSettings.ConsentVersion`
- If they differ → patient is redirected to `/patient/privacy-consent` before accessing their portal

### First-Login Force
- If `AuthUser.isFirstLogin === true` → `first-login.guard.ts` redirects to `/auth/set-password`
- Cannot navigate away until password is changed

### Notification Bell
- Bell icon in the topbar shows unread count badge (red dot, animated pop on new notification)
- Popover panel (380px wide) shows last 10 notifications
- Unread items highlighted in `--color-primary-50` background
- "Mark all read" action
- New push notifications from FCM auto-refresh the bell

### Skeleton Loading
- Every data-heavy page shows skeleton rows/cards while fetching
- Skeleton animation: shimmer left-to-right
- Never show empty state until fetch completes

### Page Transitions
- All pages animate in with `fadeSlideUp` (250ms ease-out)
- Modals scale in with `scaleIn` (300ms spring)

---

## ROUTING STRUCTURE

```typescript
// app.routes.ts
const routes: Routes = [
  { path: '', loadChildren: () => import('./portals/public/public.module') },
  { path: 'auth', loadChildren: () => import('./auth/auth.module') },
  {
    path: 'patient',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Patient'] },
    loadChildren: () => import('./portals/patient/patient.module')
  },
  {
    path: 'admin',
    canActivate: [AuthGuard, RoleGuard, FirstLoginGuard],
    data: { roles: ['Admin'] },
    loadChildren: () => import('./portals/admin/admin.module')
  },
  {
    path: 'staff',
    canActivate: [AuthGuard, RoleGuard, FirstLoginGuard],
    data: { roles: ['Staff'] },
    loadChildren: () => import('./portals/staff/staff.module')
  },
  {
    path: 'doctor',
    canActivate: [AuthGuard, RoleGuard, FirstLoginGuard],
    data: { roles: ['Doctor'] },
    loadChildren: () => import('./portals/doctor/doctor.module')
  }
];
```

---

## ENVIRONMENT CONFIG

```typescript
// environment.ts
export const environment = {
  production: false,
  apiBaseUrl: 'https://localhost:7000/api/v1',
  firebaseConfig: {
    apiKey: '',
    authDomain: '',
    projectId: '',
    messagingSenderId: '',
    appId: ''
  },
  googleClientId: '',
  facebookAppId: ''
};
```

---

## SECURITY NOTES

- JWT access token stored in **memory only** (never `localStorage` or `sessionStorage`)
- Refresh token handled via `HttpOnly` cookie on the API side
- `auth.interceptor.ts` attaches `Authorization: Bearer {token}` to every request
- On `401` → `error.interceptor.ts` calls refresh → retries request once → on second 401, logs out
- Role check done in `role.guard.ts` from JWT claims, not from a separate API call
- File uploads go through the API → Cloudinary (never direct Cloudinary upload from the client)
- All forms use Reactive Forms with `password-strength.validator.ts` enforcing the policy