import { Component } from '@angular/core';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-admin-settings-page',
  standalone: true,
  imports: [EmptyStateComponent],
  template: `
    <app-empty-state icon="settings-outline" title="Clinic Settings" description="Settings module coming in Phase 10."></app-empty-state>
  `
})
export class SettingsPage {}
