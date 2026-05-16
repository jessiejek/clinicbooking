import { Injectable, inject } from '@angular/core';
import { map, Observable, timer } from 'rxjs';
import { Doctor } from '../../../core/models';
import { MockDataService } from '../../../core/services/mock-data.service';

@Injectable({ providedIn: 'root' })
export class AdminDoctorsService {
  private readonly mockData = inject(MockDataService);

  getDoctors(): Observable<Doctor[]> {
    return timer(300).pipe(map(() => this.mockData.getDoctors()));
  }

  addDoctor(doctor: Omit<Doctor, 'id'>): Observable<Doctor> {
    return timer(300).pipe(map(() => ({ ...doctor, id: `doc-${Date.now()}` })));
  }

  updateDoctor(doctor: Doctor): Observable<Doctor> {
    return timer(300).pipe(map(() => doctor));
  }
}
