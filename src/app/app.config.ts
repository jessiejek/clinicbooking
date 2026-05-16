import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { RouteReuseStrategy } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideEffects } from '@ngrx/effects';
import { provideState, provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { routes } from './app.routes';
import { AuthEffects } from './store/auth/auth.effects';
import { authReducer } from './store/auth/auth.reducer';
import { clinicSettingsReducer } from './store/clinic-settings/clinic-settings.reducer';
import { ClinicSettingsEffects } from './store/clinic-settings/clinic-settings.effects';
import { BookingsEffects } from './store/bookings/bookings.effects';
import { bookingsReducer } from './store/bookings/bookings.reducer';
import { DoctorsEffects } from './store/doctors/doctors.effects';
import { doctorsReducer } from './store/doctors/doctors.reducer';
import { NotificationsEffects } from './store/notifications/notifications.effects';
import { notificationsReducer } from './store/notifications/notifications.reducer';
import { MedicalRecordsEffects } from './store/medical-records/medical-records.effects';
import { medicalRecordsReducer } from './store/medical-records/medical-records.reducer';
import { PatientsEffects } from './store/patients/patients.effects';
import { patientsReducer } from './store/patients/patients.reducer';

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes),
    provideStore({
      auth: authReducer,
      clinicSettings: clinicSettingsReducer
    }),
    provideState({ name: 'bookings', reducer: bookingsReducer }),
    provideState({ name: 'doctors', reducer: doctorsReducer }),
    provideState({ name: 'patients', reducer: patientsReducer }),
    provideState({ name: 'notifications', reducer: notificationsReducer }),
    provideState({ name: 'medicalRecords', reducer: medicalRecordsReducer }),
    provideEffects([
      AuthEffects,
      ClinicSettingsEffects,
      BookingsEffects,
      DoctorsEffects,
      PatientsEffects,
      NotificationsEffects,
      MedicalRecordsEffects
    ]),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: false
    })
  ]
};
