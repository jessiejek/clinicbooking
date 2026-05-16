import { Component } from '@angular/core';
import { PortalLayoutComponent } from '../../shared/components/portal-layout/portal-layout.component';
import { DOCTOR_NAV_ITEMS } from '../../portals/doctor/doctor.routes';

@Component({
  selector: 'app-doctor-layout',
  standalone: true,
  imports: [PortalLayoutComponent],
  template: `
    <app-portal-layout
      [navItems]="navItems"
      portalLabel="Doctor Portal"
      [portalTitle]="portalTitle"
    ></app-portal-layout>
  `
})
export class DoctorLayoutComponent {
  readonly navItems = DOCTOR_NAV_ITEMS;
  readonly portalTitle = 'Dashboard';
}
