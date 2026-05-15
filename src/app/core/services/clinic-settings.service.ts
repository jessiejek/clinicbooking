import { Injectable, inject } from '@angular/core';
import { ClinicSettings } from '../models';
import { MockDataService } from './mock-data.service';

@Injectable({ providedIn: 'root' })
export class ClinicSettingsService {
  private readonly mockData = inject(MockDataService);

  /** Loads clinic configuration from seed data (Phase 1 — no HTTP). */
  load(): ClinicSettings {
    return this.mockData.clinicSettings;
  }
}
