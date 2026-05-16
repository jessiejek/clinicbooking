import { Component } from '@angular/core';
import { PortalLayoutComponent } from '../../shared/components/portal-layout/portal-layout.component';
import { ADMIN_NAV_ITEMS } from '../../portals/admin/admin.routes';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [PortalLayoutComponent],
  template: `
    <app-portal-layout
      [navItems]="navItems"
      portalLabel="Admin Portal"
      [portalTitle]="portalTitle"
    ></app-portal-layout>
  `
})
export class AdminLayoutComponent {
  readonly navItems = ADMIN_NAV_ITEMS;
  readonly portalTitle = 'Dashboard';
}
