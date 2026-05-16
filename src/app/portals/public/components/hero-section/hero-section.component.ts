import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="hero">
      <div class="content-container hero__content">
        <div class="hero__tag">✚ Family Medicine / Adult & Pedia</div>
        <h1>Your Health, Our Priority</h1>
        <p class="hero__sub">
          Comprehensive medical care for all ages. Dr. Grace E. Gavino provides professional services tailored to your family's needs.
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
