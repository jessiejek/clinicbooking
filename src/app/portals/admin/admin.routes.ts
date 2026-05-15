import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Admin Portal (Stub)</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div class="clinic-card">
        <div class="section-heading">Phase 1</div>
        <p>Admin portal shell will be built in a later phase.</p>
      </div>
    </ion-content>
  `
})
class AdminStubPage {}

export const ADMIN_ROUTES: Routes = [{ path: '', component: AdminStubPage }];

