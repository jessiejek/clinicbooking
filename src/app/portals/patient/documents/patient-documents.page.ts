import { Component } from '@angular/core';
import { PatientMediaPanelComponent } from '../../../shared/components/patient-media-panel/patient-media-panel.component';

@Component({
  standalone: true,
  selector: 'app-patient-documents-page',
  imports: [PatientMediaPanelComponent],
  template: `
    <section class="page-shell">
      <app-patient-media-panel
        kind="document"
        heading="My Documents"
        subheading="Upload referrals, certificates, prescriptions, and other files linked to your appointments."
      ></app-patient-media-panel>
    </section>
  `,
  styleUrl: './patient-documents.page.scss'
})
export class PatientDocumentsPage {}
