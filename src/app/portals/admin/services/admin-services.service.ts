import { Injectable, inject } from '@angular/core';
import { map, Observable, timer } from 'rxjs';
import { Service } from '../../../core/models';
import { MockDataService } from '../../../core/services/mock-data.service';

@Injectable({ providedIn: 'root' })
export class AdminServicesService {
  private readonly mockData = inject(MockDataService);

  getServices(): Observable<Service[]> {
    return timer(300).pipe(map(() => this.mockData.getServices()));
  }

  addService(service: Service): Observable<Service> {
    return timer(300).pipe(map(() => ({ ...service, id: `svc-${Date.now()}` })));
  }

  toggleServiceStatus(service: Service, isActive: boolean): Observable<Service> {
    return timer(300).pipe(map(() => ({ ...service, name: service.name, description: service.description })));
  }
}
