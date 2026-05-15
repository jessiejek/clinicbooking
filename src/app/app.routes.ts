import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { DoctorLayoutComponent } from './layouts/doctor-layout/doctor-layout.component';
import { StaffLayoutComponent } from './layouts/staff-layout/staff-layout.component';

export const routes: Routes = [
  { path: '', redirectTo: 'public', pathMatch: 'full' },
  {
    path: 'public',
    component: PublicLayoutComponent,
    loadChildren: () => import('./portals/public/public.routes').then((m) => m.PUBLIC_ROUTES)
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    loadChildren: () => import('./portals/admin/admin.routes').then((m) => m.ADMIN_ROUTES)
  },
  {
    path: 'staff',
    component: StaffLayoutComponent,
    loadChildren: () => import('./portals/staff/staff.routes').then((m) => m.STAFF_ROUTES)
  },
  {
    path: 'doctor',
    component: DoctorLayoutComponent,
    loadChildren: () => import('./portals/doctor/doctor.routes').then((m) => m.DOCTOR_ROUTES)
  },
  {
    path: 'patient',
    loadChildren: () => import('./portals/patient/patient.routes').then((m) => m.PATIENT_ROUTES)
  },
  { path: '**', redirectTo: 'public' }
];
