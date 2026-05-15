import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { RouteReuseStrategy } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideStore, provideState } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { routes } from './app.routes';
import { environment } from '../environments/environment';
import { authFeatureKey, authReducer } from './store/auth/auth.reducer';
import { clinicSettingsFeatureKey, clinicSettingsReducer } from './store/clinic-settings/clinic-settings.reducer';

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes),
    provideStore(),
    provideState(authFeatureKey, authReducer),
    provideState(clinicSettingsFeatureKey, clinicSettingsReducer),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: environment.production
    })
  ]
};
