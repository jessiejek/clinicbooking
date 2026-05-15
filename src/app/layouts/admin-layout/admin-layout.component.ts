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
  gridOutline, 
  peopleOutline, 
  businessOutline, 
  barChartOutline, 
  settingsOutline, 
  logOutOutline,
  notificationsOutline,
  searchOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-admin-layout',
  template: `
    <ion-split-pane contentId="main-content" when="lg">
      <ion-menu contentId="main-content" type="push" class="premium-sidebar">
        <ion-header class="ion-no-border">
          <ion-toolbar style="--background: var(--clinic-bg-elevated); height: 80px;">
            <div class="logo-area ion-padding">
              <div class="logo-icon">A</div>
              <div class="logo-text">ADMIN<span class="muted">PORTAL</span></div>
            </div>
          </ion-toolbar>
        </ion-header>

        <ion-content class="ion-no-padding">
          <div class="sidebar-section">MAIN NAVIGATION</div>
          <ion-list lines="none" class="sidebar-list">
            <ion-menu-toggle auto-hide="false">
              <ion-item routerLink="/admin/dashboard" routerDirection="root" detail="false" class="sidebar-item" routerLinkActive="active-item">
                <ion-icon slot="start" name="grid-outline"></ion-icon>
                <ion-label>Dashboard</ion-label>
              </ion-item>
              <ion-item routerLink="/admin/doctors" routerDirection="root" detail="false" class="sidebar-item" routerLinkActive="active-item">
                <ion-icon slot="start" name="people-outline"></ion-icon>
                <ion-label>Manage Doctors</ion-label>
              </ion-item>
              <ion-item routerLink="/admin/clinics" routerDirection="root" detail="false" class="sidebar-item" routerLinkActive="active-item">
                <ion-icon slot="start" name="business-outline"></ion-icon>
                <ion-label>Clinics</ion-label>
              </ion-item>
              <ion-item routerLink="/admin/reports" routerDirection="root" detail="false" class="sidebar-item" routerLinkActive="active-item">
                <ion-icon slot="start" name="bar-chart-outline"></ion-icon>
                <ion-label>Reports</ion-label>
              </ion-item>
            </ion-menu-toggle>
          </ion-list>

          <div class="sidebar-section">SYSTEM</div>
          <ion-list lines="none" class="sidebar-list">
            <ion-menu-toggle auto-hide="false">
              <ion-item routerLink="/admin/settings" routerDirection="root" detail="false" class="sidebar-item" routerLinkActive="active-item">
                <ion-icon slot="start" name="settings-outline"></ion-icon>
                <ion-label>Settings</ion-label>
              </ion-item>
            </ion-menu-toggle>
          </ion-list>
        </ion-content>

        <ion-footer class="ion-no-border ion-padding">
          <div class="user-pill">
            <div class="avatar-sm">AD</div>
            <div class="user-info">
              <div class="user-name">System Admin</div>
              <div class="user-role">Administrator</div>
            </div>
            <ion-icon name="log-out-outline" class="logout-btn"></ion-icon>
          </div>
        </ion-footer>
      </ion-menu>

      <div class="ion-page" id="main-content">
        <ion-header class="ion-no-border">
          <ion-toolbar style="--background: white; --padding-start: 24px; --padding-end: 24px; height: 72px; box-shadow: var(--shadow-sm);">
            <ion-buttons slot="start">
              <ion-menu-button color="primary"></ion-menu-button>
            </ion-buttons>
            <ion-title style="font-weight: 700; color: var(--clinic-text-primary);">
              Management System
            </ion-title>
            <ion-buttons slot="end">
              <ion-button color="medium" class="btn-icon">
                <ion-icon name="notifications-outline"></ion-icon>
              </ion-button>
              <ion-button color="medium" class="btn-icon">
                <ion-icon name="search-outline"></ion-icon>
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
        --background-hover: var(--color-primary-50);
        transition: all 0.2s ease;
      }
      .active-item {
        --color: var(--ion-color-primary);
        --background: var(--color-primary-50);
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
export class AdminLayoutComponent {
  constructor() {
    addIcons({ 
      gridOutline, 
      peopleOutline, 
      businessOutline, 
      barChartOutline, 
      settingsOutline, 
      logOutOutline,
      notificationsOutline,
      searchOutline
    });
  }
}
