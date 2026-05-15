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
  IonMenuToggle,
  IonButtons,
  IonMenuButton,
  IonButton,
  IonFooter
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  calendarOutline, 
  clipboardOutline, 
  peopleOutline, 
  flaskOutline, 
  settingsOutline, 
  logOutOutline,
  notificationsOutline,
  chatbubbleEllipsesOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-doctor-layout',
  template: `
    <ion-split-pane contentId="doctor-content" when="lg">
      <ion-menu contentId="doctor-content" type="push" class="premium-sidebar doctor-theme">
        <ion-header class="ion-no-border">
          <ion-toolbar style="--background: var(--clinic-bg-elevated); height: 80px;">
            <div class="logo-area ion-padding">
              <div class="logo-icon blue">D</div>
              <div class="logo-text">DOCTOR<span class="muted">PORTAL</span></div>
            </div>
          </ion-toolbar>
        </ion-header>

        <ion-content class="ion-no-padding">
          <div class="sidebar-section">CLINICAL</div>
          <ion-list lines="none" class="sidebar-list">
            <ion-menu-toggle auto-hide="false">
              <ion-item routerLink="/doctor/appointments" routerDirection="root" detail="false" class="sidebar-item" routerLinkActive="active-item">
                <ion-icon slot="start" name="calendar-outline"></ion-icon>
                <ion-label>Appointments</ion-label>
              </ion-item>
              <ion-item routerLink="/doctor/patients" routerDirection="root" detail="false" class="sidebar-item" routerLinkActive="active-item">
                <ion-icon slot="start" name="people-outline"></ion-icon>
                <ion-label>My Patients</ion-label>
              </ion-item>
              <ion-item routerLink="/doctor/records" routerDirection="root" detail="false" class="sidebar-item" routerLinkActive="active-item">
                <ion-icon slot="start" name="clipboard-outline"></ion-icon>
                <ion-label>Medical Records</ion-label>
              </ion-item>
              <ion-item routerLink="/doctor/labs" routerDirection="root" detail="false" class="sidebar-item" routerLinkActive="active-item">
                <ion-icon slot="start" name="flask-outline"></ion-icon>
                <ion-label>Lab Results</ion-label>
              </ion-item>
            </ion-menu-toggle>
          </ion-list>

          <div class="sidebar-section">COMMUNICATION</div>
          <ion-list lines="none" class="sidebar-list">
            <ion-menu-toggle auto-hide="false">
              <ion-item routerLink="/doctor/messages" routerDirection="root" detail="false" class="sidebar-item" routerLinkActive="active-item">
                <ion-icon slot="start" name="chatbubble-ellipses-outline"></ion-icon>
                <ion-label>Messages</ion-label>
              </ion-item>
            </ion-menu-toggle>
          </ion-list>
        </ion-content>

        <ion-footer class="ion-no-border ion-padding">
          <div class="user-pill">
            <div class="avatar-sm blue">DR</div>
            <div class="user-info">
              <div class="user-name">Dr. Smith</div>
              <div class="user-role">General Physician</div>
            </div>
            <ion-icon name="log-out-outline" class="logout-btn"></ion-icon>
          </div>
        </ion-footer>
      </ion-menu>

      <div class="ion-page" id="doctor-content">
        <ion-header class="ion-no-border">
          <ion-toolbar style="--background: white; --padding-start: 24px; --padding-end: 24px; height: 72px; box-shadow: var(--shadow-sm);">
            <ion-buttons slot="start">
              <ion-menu-button color="secondary"></ion-menu-button>
            </ion-buttons>
            <ion-title style="font-weight: 700; color: var(--clinic-text-primary);">
              Doctor Workspace
            </ion-title>
            <ion-buttons slot="end">
              <ion-button color="medium" class="btn-icon">
                <ion-icon name="notifications-outline"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>

        <ion-content class="ion-padding" style="--background: var(--clinic-bg);">
          <ion-router-outlet></ion-router-outlet>
        </ion-content>
      </div>
    </ion-split-pane>

    <style>
      .premium-sidebar {
        --background: var(--clinic-bg-elevated);
        border-right: none;
        box-shadow: 4px 0 24px rgba(0,0,0,0.03);
      }
      .logo-area {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .logo-icon {
        width: 40px;
        height: 40px;
        background: var(--gradient-card-green);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 800;
        font-size: 20px;
        box-shadow: var(--shadow-green);
      }
      .logo-icon.blue {
        background: var(--gradient-card-blue);
        box-shadow: var(--shadow-blue);
      }
      .logo-text {
        font-weight: 800;
        letter-spacing: -0.5px;
        font-size: 18px;
        color: var(--clinic-text-primary);
      }
      .logo-text .muted {
        opacity: 0.5;
        font-weight: 400;
      }
      .sidebar-section {
        padding: 24px 24px 8px;
        font-size: 11px;
        font-weight: 700;
        color: var(--clinic-text-muted);
        letter-spacing: 1px;
      }
      .sidebar-item {
        --padding-start: 24px;
        --padding-end: 24px;
        --border-radius: 12px;
        margin: 4px 12px;
        font-weight: 500;
        --color: var(--clinic-text-secondary);
        --background-hover: var(--color-secondary-50);
        transition: all 0.2s ease;
      }
      .active-item {
        --color: var(--ion-color-secondary);
        --background: var(--color-secondary-50);
        font-weight: 700;
      }
      .user-pill {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        background: var(--color-neutral-50);
        border-radius: 16px;
      }
      .avatar-sm {
        width: 36px;
        height: 36px;
        background: var(--color-primary-100);
        color: var(--ion-color-primary);
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 14px;
      }
      .avatar-sm.blue {
        background: var(--color-secondary-100);
        color: var(--ion-color-secondary);
      }
      .user-info {
        flex: 1;
      }
      .user-name {
        font-size: 14px;
        font-weight: 700;
        color: var(--clinic-text-primary);
      }
      .user-role {
        font-size: 12px;
        color: var(--clinic-text-muted);
      }
      .logout-btn {
        font-size: 20px;
        color: var(--clinic-text-muted);
        cursor: pointer;
      }
      .logout-btn:hover {
        color: var(--ion-color-danger);
      }
    </style>
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
    IonMenuToggle,
    IonButtons,
    IonMenuButton,
    IonButton,
    IonFooter
  ]
})
export class DoctorLayoutComponent {
  constructor() {
    addIcons({ 
      calendarOutline, 
      clipboardOutline, 
      peopleOutline, 
      flaskOutline, 
      settingsOutline, 
      logOutOutline,
      notificationsOutline,
      chatbubbleEllipsesOutline
    });
  }
}
