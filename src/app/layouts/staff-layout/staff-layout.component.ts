import { Component } from '@angular/core';
import { PortalLayoutComponent } from '../../shared/components/portal-layout/portal-layout.component';
import { STAFF_NAV_ITEMS } from '../../portals/staff/staff.routes';

@Component({
  selector: 'app-staff-layout',
  standalone: true,
  imports: [PortalLayoutComponent],
  template: `
    <app-portal-layout
      [navItems]="navItems"
      portalLabel="Staff Portal"
      [portalTitle]="portalTitle"
    ></app-portal-layout>
  `
})
export class StaffLayoutComponent {
  readonly navItems = STAFF_NAV_ITEMS;
  readonly portalTitle = 'Dashboard';
}
