import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="hero">
      <div class="content-container hero__content">
        <div class="hero__tag">✚ Trusted Healthcare</div>
        <h1>Your Health, Our Priority</h1>
        <p class="hero__sub">
          Professional medical care tailored to you and your family. Book appointments online, get
          seen faster.
        </p>
        <div class="hero__actions">
          <a routerLink="/public/booking" class="hero-btn-primary hero-link">Book an Appointment</a>
          <a routerLink="/public/doctors" class="hero-btn-outline hero-link">Meet Our Doctors</a>
        </div>
        <div class="hero__badges">
          <span class="hero__badge">🏥 3 Specialist Doctors</span>
          <span class="hero__badge">📅 Available Mon–Sat</span>
          <span class="hero__badge">👥 Accepting New Patients</span>
        </div>
      </div>
    </section>
  `,
  styleUrl: './hero-section.component.scss'
})
export class HeroSectionComponent {}
