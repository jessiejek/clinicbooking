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
import { personAddOutline, journalOutline } from 'ionicons/icons';

@Component({
  selector: 'app-staff-layout',
  template: `
    <ion-split-pane contentId="staff-content">
      <ion-menu contentId="staff-content" type="overlay">
        <ion-header>
          <ion-toolbar color="primary">
            <ion-title>Reception Portal</ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content>
          <ion-list>
            <ion-menu-toggle auto-hide="false">
              <ion-item routerLink="/staff/registration" routerDirection="root">
                <ion-icon slot="start" name="person-add-outline"></ion-icon>
                <ion-label>Patient Registration</ion-label>
              </ion-item>
              <ion-item routerLink="/staff/queue" routerDirection="root">
                <ion-icon slot="start" name="journal-outline"></ion-icon>
                <ion-label>Queue Management</ion-label>
              </ion-item>
            </ion-menu-toggle>
          </ion-list>
        </ion-content>
      </ion-menu>

      <div class="ion-page" id="staff-content">
        <ion-header>
          <ion-toolbar>
            <ion-title>Reception Desk</ion-title>
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
export class StaffLayoutComponent {
  constructor() {
    addIcons({ personAddOutline, journalOutline });
  }
}
