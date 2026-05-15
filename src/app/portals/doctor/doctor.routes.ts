import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';

@Component({
  standalone: true,
  imports: [IonContent],
  template: `
    <ion-content>
      <p style="padding: 2rem">Doctor — Phase 1 coming soon</p>
    </ion-content>
  `
})
class PlaceholderPage {}

export const DOCTOR_ROUTES: Routes = [{ path: '', component: PlaceholderPage }];
