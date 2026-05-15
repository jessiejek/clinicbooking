import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, shareReplay } from 'rxjs/operators';
import { ClinicSettings } from '../models';
import { MockDataService } from './mock-data.service';

@Injectable({ providedIn: 'root' })
export class ClinicSettingsService {
  private readonly mockData = inject(MockDataService);
  private readonly settings$ = of(this.mockData.clinicSettings).pipe(delay(50), shareReplay(1));

  load(): Observable<ClinicSettings> {
    return this.settings$;
  }
}

