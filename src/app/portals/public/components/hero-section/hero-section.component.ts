import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarOutline, medicalOutline, peopleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [RouterLink, IonIcon],
  template: `
    <section class="hero">
      <div class="content-container hero__content">
        <div class="hero__tag">Family Medicine / Adult & Pedia</div>
        <h1>Your Health, Our Priority</h1>
        <p class="hero__sub">
          Comprehensive medical care for all ages. Dr. Grace E. Gavino provides professional services tailored to your family's needs.
        </p>
        <div class="hero__actions">
          <a routerLink="/public/booking" class="hero__cta-primary">Book an Appointment</a>
          <a routerLink="/public/doctors" class="hero__cta-secondary">Meet Our Doctors</a>
        </div>
        <div class="hero__trust">
          <div class="trust-item">
            <ion-icon name="medical-outline" aria-hidden="true"></ion-icon>
            <span>3 Specialist Doctors</span>
          </div>
          <div class="trust-item">
            <ion-icon name="calendar-outline" aria-hidden="true"></ion-icon>
            <span>Available Mon-Sat</span>
          </div>
          <div class="trust-item">
            <ion-icon name="people-outline" aria-hidden="true"></ion-icon>
            <span>Accepting New Patients</span>
          </div>
        </div>
      </div>
    </section>
  `,
  styleUrl: './hero-section.component.scss'
})
export class HeroSectionComponent {
  constructor() {
    addIcons({ medicalOutline, calendarOutline, peopleOutline });
  }
}
