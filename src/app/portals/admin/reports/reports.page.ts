import { Component } from '@angular/core';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-admin-reports-page',
  standalone: true,
  imports: [EmptyStateComponent],
  template: `
    <app-empty-state icon="stats-chart-outline" title="Reports" description="Reports module coming in Phase 10."></app-empty-state>
  `
})
export class ReportsPage {}
