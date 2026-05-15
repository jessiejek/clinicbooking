import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Auth (Stub)</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div class="clinic-card">
        <div class="section-heading">Phase 1</div>
        <p>Authentication pages are not implemented in Phase 1.</p>
      </div>
    </ion-content>
  `
})
class AuthStubPage {}

export const AUTH_ROUTES: Routes = [{ path: '', component: AuthStubPage }];

