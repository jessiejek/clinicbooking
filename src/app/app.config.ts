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
import { BookingsEffects } from './store/bookings/bookings.effects';
import { bookingsReducer } from './store/bookings/bookings.reducer';

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
    provideEffects([AuthEffects, BookingsEffects]),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: false
    })
  ]
};
