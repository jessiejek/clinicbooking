import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { 
  IonSplitPane, 
  IonMenu, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonList, 
  IonItem, 
  IonIcon, 
  IonLabel, 
  IonRouterOutlet,
  IonMenuToggle
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarOutline, clipboardOutline } from 'ionicons/icons';

@Component({
  selector: 'app-doctor-layout',
  template: `
    <ion-split-pane contentId="doctor-content">
      <ion-menu contentId="doctor-content" type="overlay">
        <ion-header>
          <ion-toolbar color="secondary">
            <ion-title>Doctor Portal</ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content>
          <ion-list>
            <ion-menu-toggle auto-hide="false">
              <ion-item routerLink="/doctor/appointments" routerDirection="root">
                <ion-icon slot="start" name="calendar-outline"></ion-icon>
                <ion-label>Appointments</ion-label>
              </ion-item>
              <ion-item routerLink="/doctor/records" routerDirection="root">
                <ion-icon slot="start" name="clipboard-outline"></ion-icon>
                <ion-label>Patient Records</ion-label>
              </ion-item>
            </ion-menu-toggle>
          </ion-list>
        </ion-content>
      </ion-menu>

      <div class="ion-page" id="doctor-content">
        <ion-header>
          <ion-toolbar>
            <ion-title>Doctor Workspace</ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content>
          <ion-router-outlet></ion-router-outlet>
        </ion-content>
      </div>
    </ion-split-pane>
  `,
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonSplitPane,
    IonMenu,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonIcon,
    IonLabel,
    IonRouterOutlet,
    IonMenuToggle
  ]
})
export class DoctorLayoutComponent {
  constructor() {
    addIcons({ calendarOutline, clipboardOutline });
  }
}
