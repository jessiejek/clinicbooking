import { NgIf } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarOutline, documentTextOutline, homeOutline, personOutline } from 'ionicons/icons';

@Component({
  selector: 'app-patient-bottom-nav',
  standalone: true,
  imports: [NgIf, RouterLink, RouterLinkActive, IonIcon],
  template: `
    <nav class="patient-bottom-nav" *ngIf="isMobile">
      <a routerLink="/patient/dashboard" routerLinkActive="active" class="bottom-nav__item">
        <ion-icon name="home-outline"></ion-icon>
        <span>Home</span>
      </a>
      <a routerLink="/patient/bookings" routerLinkActive="active" class="bottom-nav__item">
        <ion-icon name="calendar-outline"></ion-icon>
        <span>Bookings</span>
      </a>
      <a routerLink="/patient/medical-records" routerLinkActive="active" class="bottom-nav__item">
        <ion-icon name="document-text-outline"></ion-icon>
        <span>Records</span>
      </a>
      <a routerLink="/patient/profile" routerLinkActive="active" class="bottom-nav__item">
        <ion-icon name="person-outline"></ion-icon>
        <span>Profile</span>
      </a>
    </nav>
  `,
  styleUrl: './patient-bottom-nav.component.scss'
})
export class PatientBottomNavComponent implements OnInit {
  isMobile = false;

  constructor() {
    addIcons({ homeOutline, calendarOutline, documentTextOutline, personOutline });
  }

  ngOnInit(): void {
    this.syncViewport();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.syncViewport();
  }

  private syncViewport(): void {
    this.isMobile = typeof window !== 'undefined' ? window.innerWidth <= 1024 : false;
  }
}
