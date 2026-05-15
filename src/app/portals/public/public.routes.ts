import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { IonButton, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButton],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Public Portal (Stub)</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div class="clinic-card">
        <div class="section-heading">Phase 1</div>
        <p>This is a lazy-loaded route stub. Portal pages are not implemented yet.</p>
      </div>
    </ion-content>
  `
})
class PublicStubPage {}

export const PUBLIC_ROUTES: Routes = [{ path: '', component: PublicStubPage }];

