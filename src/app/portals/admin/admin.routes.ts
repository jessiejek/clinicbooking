import { inject } from '@angular/core';
import { ResolveFn, Routes } from '@angular/router';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { authGuard } from '../../core/guards/auth.guard';
import { firstLoginGuard } from '../../core/guards/first-login.guard';
import { roleGuard } from '../../core/guards/role.guard';
import { NavItem } from '../../core/models';
import { loadBookings } from '../../store/bookings/bookings.actions';
import { loadDoctors, loadSchedules } from '../../store/doctors/doctors.actions';
import { loadNotifications } from '../../store/notifications/notifications.actions';
import { loadPatients } from '../../store/patients/patients.actions';
import { AdminLayoutComponent } from '../../layouts/admin-layout/admin-layout.component';

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', route: '/admin/dashboard', icon: 'grid-outline', section: 'CORE' },
  { label: 'Bookings', route: '/admin/bookings', icon: 'calendar-outline', section: 'CORE' },
  { label: 'Patients', route: '/admin/patients', icon: 'people-outline', section: 'CORE' },
  { label: 'Doctors', route: '/admin/doctors', icon: 'medical-outline', section: 'CORE' },
  {
    label: 'Calendar',
    route: '/admin/calendar',
    icon: 'calendar-number-outline',
    section: 'CORE'
  },
  { label: 'Services', route: '/admin/services', icon: 'briefcase-outline', section: 'MANAGEMENT' },
  { label: 'Staff', route: '/admin/staff', icon: 'person-outline', section: 'MANAGEMENT' },
  { label: 'Walk-In', route: '/admin/walk-in', icon: 'walk-outline', section: 'MANAGEMENT' },
  { label: 'Reports', route: '/admin/reports', icon: 'bar-chart-outline', section: 'ANALYTICS' },
  {
    label: 'Audit Log',
    route: '/admin/audit-logs',
    icon: 'document-text-outline',
    section: 'ANALYTICS'
  },
  {
    label: 'Announcements',
    route: '/admin/announcements',
    icon: 'megaphone-outline',
    section: 'SYSTEM'
  },
  { label: 'Settings', route: '/admin/settings', icon: 'settings-outline', section: 'SYSTEM' }
];

const preloadAdminData: ResolveFn<boolean> = () => {
  const store = inject(Store);
  store.dispatch(loadBookings());
  store.dispatch(loadDoctors());
  store.dispatch(loadSchedules());
  store.dispatch(loadPatients());
  store.dispatch(loadNotifications());
  return of(true);
};

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    data: { title: 'Dashboard' },
    canActivate: [authGuard, roleGuard, firstLoginGuard],
    resolve: { preload: preloadAdminData },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.page').then((m) => m.DashboardPage),
        data: { title: 'Dashboard' }
      },
      {
        path: 'bookings',
        loadComponent: () => import('./bookings/bookings.page').then((m) => m.BookingsPage),
        data: { title: 'Bookings' }
      },
      {
        path: 'bookings/:id',
        loadComponent: () => import('./booking-detail/booking-detail.page').then((m) => m.BookingDetailPage),
        data: { title: 'Booking Detail' }
      },
      {
        path: 'walk-in',
        loadComponent: () => import('./walk-in/walk-in.page').then((m) => m.WalkInPage),
        data: { title: 'Walk-In' }
      },
      {
        path: 'calendar',
        loadComponent: () => import('./calendar/calendar.page').then((m) => m.CalendarPage),
        data: { title: 'Calendar' }
      },
      {
        path: 'doctors',
        loadComponent: () => import('./doctors/doctors.page').then((m) => m.DoctorsPage),
        data: { title: 'Doctors' }
      },
      {
        path: 'doctors/new',
        loadComponent: () => import('./doctor-form/doctor-form.page').then((m) => m.DoctorFormPage),
        data: { title: 'Add Doctor' }
      },
      {
        path: 'doctors/:id/edit',
        loadComponent: () => import('./doctor-form/doctor-form.page').then((m) => m.DoctorFormPage),
        data: { title: 'Edit Doctor' }
      },
      {
        path: 'services',
        loadComponent: () => import('./services/services.page').then((m) => m.ServicesPage),
        data: { title: 'Services' }
      },
      {
        path: 'patients',
        loadComponent: () => import('./patients/patients.page').then((m) => m.PatientsPage),
        data: { title: 'Patients' }
      },
      {
        path: 'patients/:id',
        loadComponent: () => import('./patient-detail/patient-detail.page').then((m) => m.PatientDetailPage),
        data: { title: 'Patient Detail' }
      },
      {
        path: 'staff',
        loadComponent: () => import('./staff/staff.page').then((m) => m.StaffPage),
        data: { title: 'Staff' }
      },
      {
        path: 'announcements',
        loadComponent: () => import('./announcements/announcements.page').then((m) => m.AnnouncementsPage),
        data: { title: 'Announcements' }
      },
      {
        path: 'settings',
        loadComponent: () => import('./settings/settings.page').then((m) => m.SettingsPage),
        data: { title: 'Settings' }
      },
      {
        path: 'audit-logs',
        loadComponent: () => import('./audit-logs/audit-logs.page').then((m) => m.AuditLogsPage),
        data: { title: 'Audit Log' }
      },
      {
        path: 'reports',
        loadComponent: () => import('./reports/reports.page').then((m) => m.ReportsPage),
        data: { title: 'Reports' }
      },
      {
        path: '**',
        loadComponent: () => import('../../shared/pages/not-found/not-found.page').then((m) => m.NotFoundPage)
      }
    ]
  }
];
