import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonRouterOutlet 
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-public-layout',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Clinic Patient Portal</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-router-outlet></ion-router-outlet>
    </ion-content>
  `,
  standalone: true,
  imports: [
    CommonModule, 
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent, 
    IonRouterOutlet
  ]
})
export class PublicLayoutComponent {}
