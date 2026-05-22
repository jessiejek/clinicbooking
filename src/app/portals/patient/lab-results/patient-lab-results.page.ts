import { Component } from '@angular/core';
import { PatientMediaPanelComponent } from '../../../shared/components/patient-media-panel/patient-media-panel.component';

@Component({
  standalone: true,
  selector: 'app-patient-lab-results-page',
  imports: [PatientMediaPanelComponent],
  template: `
    <section class="page-shell">
      <app-patient-media-panel
        kind="lab-result"
        heading="My Lab Results"
        subheading="Upload lab reports, test results, and related files. Booking and consultation IDs are optional."
      ></app-patient-media-panel>
    </section>
  `,
  styleUrl: './patient-lab-results.page.scss'
})
export class PatientLabResultsPage {}
