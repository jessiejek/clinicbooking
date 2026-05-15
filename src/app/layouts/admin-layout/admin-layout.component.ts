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
import { gridOutline, peopleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-admin-layout',
  template: `
    <ion-split-pane contentId="main-content">
      <ion-menu contentId="main-content" type="overlay">
        <ion-header>
          <ion-toolbar color="primary">
            <ion-title>Admin Panel</ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content>
          <ion-list>
            <ion-menu-toggle auto-hide="false">
              <ion-item routerLink="/admin/dashboard" routerDirection="root">
                <ion-icon slot="start" name="grid-outline"></ion-icon>
                <ion-label>Dashboard</ion-label>
              </ion-item>
              <ion-item routerLink="/admin/doctors" routerDirection="root">
                <ion-icon slot="start" name="people-outline"></ion-icon>
                <ion-label>Doctors</ion-label>
              </ion-item>
            </ion-menu-toggle>
          </ion-list>
        </ion-content>
      </ion-menu>

      <div class="ion-page" id="main-content">
        <ion-header>
          <ion-toolbar>
            <ion-title>Admin Dashboard</ion-title>
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
export class AdminLayoutComponent {
  constructor() {
    addIcons({ gridOutline, peopleOutline });
  }
}
