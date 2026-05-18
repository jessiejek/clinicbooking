import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ClinicSettings } from '../models';
import { MockDataService } from './mock-data.service';

@Injectable({ providedIn: 'root' })
export class ClinicSettingsService {
  private readonly mockData = inject(MockDataService);
  private readonly settingsSubject = new BehaviorSubject<ClinicSettings>(
    this.mockData.getClinicSettings()
  );
  private readonly loadingSubject = new BehaviorSubject(false);

  readonly settings$ = this.settingsSubject.asObservable();
  readonly isLoading$ = this.loadingSubject.asObservable();

  /** Loads clinic configuration from seed data (Phase 1 - no HTTP). */
  load(): ClinicSettings {
    const settings = this.mockData.getClinicSettings();
    this.settingsSubject.next(settings);
    return settings;
  }

  getSettings(): Observable<ClinicSettings> {
    return this.settings$;
  }

  updateSettings(settings: ClinicSettings): ClinicSettings {
    const updated = this.mockData.updateClinicSettings(settings);
    this.settingsSubject.next(updated);
    return updated;
  }

  bumpConsentVersion(): ClinicSettings {
    const updated = this.mockData.bumpConsentVersion();
    this.settingsSubject.next(updated);
    return updated;
  }
}
