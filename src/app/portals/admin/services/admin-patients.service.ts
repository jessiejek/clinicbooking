import { Injectable, inject } from '@angular/core';
import { map, Observable, timer } from 'rxjs';
import { Patient } from '../../../core/models';
import { MockDataService } from '../../../core/services/mock-data.service';

@Injectable({ providedIn: 'root' })
export class AdminPatientsService {
  private readonly mockData = inject(MockDataService);

  getPatients(): Observable<Patient[]> {
    return timer(300).pipe(map(() => this.mockData.getPatients()));
  }

  getPatientById(id: string): Observable<Patient | undefined> {
    return timer(300).pipe(map(() => this.mockData.getPatientById(id)));
  }

  addPatient(patient: Omit<Patient, 'id' | 'patientCode'>): Observable<Patient> {
    return timer(300).pipe(
      map(() => ({
        ...patient,
        id: `pat-${Date.now()}`,
        patientCode: `PT-${Date.now()}`
      }))
    );
  }

  updatePatient(patient: Patient): Observable<Patient> {
    return timer(300).pipe(map(() => patient));
  }
}
