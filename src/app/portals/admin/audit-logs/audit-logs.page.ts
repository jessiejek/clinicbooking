import { Component } from '@angular/core';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-admin-audit-logs-page',
  standalone: true,
  imports: [EmptyStateComponent],
  template: `
    <app-empty-state icon="shield-checkmark-outline" title="Audit Logs" description="Audit log module coming in Phase 10."></app-empty-state>
  `
})
export class AuditLogsPage {}
