import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Service, ServiceCategory } from '../../../core/models';
import { PublicService } from '../services/public.service';
import { ServiceCategoryCardComponent } from '../components/service-category-card/service-category-card.component';
import { PesoPipe } from '../../../shared/pipes/peso.pipe';

@Component({
  selector: 'app-services-page',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, ServiceCategoryCardComponent, PesoPipe],
  template: `
    <div class="page-wrap">
      <div class="content-container">
        <header class="page-header">
          <h1 class="page-title">Our Services</h1>
          <p class="page-subtitle">Explore consultations, labs, procedures, and diagnostics.</p>
        </header>

        <div class="filter-row" *ngIf="categories.length">
          <button
            type="button"
            *ngFor="let cat of categories"
            class="filter-pill"
            [class.filter-pill--active]="cat === selectedCategory"
            (click)="selectedCategory = cat"
          >
            {{ cat === 'All' ? 'All' : cat }}
          </button>
        </div>

        <ng-container *ngIf="services.length">
          <section *ngFor="let block of categoryBlocks" class="category-block">
            <app-service-category-card
              [category]="block.key"
              [count]="block.services.length"
              [description]="categoryDescription(block.key)"
              (selected)="selectedCategory = $event"
            />
            <div class="service-items">
              <div
                class="service-item clinic-card clinic-card--accent-green"
                *ngFor="let service of block.services"
              >
                <div class="service-item__header">
                  <h4 class="service-item__name">{{ service.name }}</h4>
                  <span class="badge" [ngClass]="badgeClass(service.category)">{{ service.category }}</span>
                </div>
                <p class="service-item__desc">{{ service.description || '—' }}</p>
                <div class="service-item__meta">
                  <span>⏱ {{ service.estimatedDurationMinutes }} min</span>
                  <span class="service-item__fee">{{
                    service.price === 0 ? 'Included in consultation' : (service.price | peso)
                  }}</span>
                </div>
              </div>
            </div>
          </section>
        </ng-container>
      </div>
    </div>
  `,
  styleUrl: './services.page.scss'
})
export class ServicesPage implements OnInit {
  private readonly publicService = inject(PublicService);
  private readonly route = inject(ActivatedRoute);

  services: Service[] = [];
  selectedCategory: ServiceCategory | 'All' = 'All';

  readonly allOrder: ServiceCategory[] = ['Consultation', 'Procedure', 'Laboratory', 'Diagnostic'];

  get categories(): (ServiceCategory | 'All')[] {
    return ['All', ...this.allOrder];
  }

  get categoryBlocks(): { key: ServiceCategory; services: Service[] }[] {
    const byCat = (c: ServiceCategory) => this.filteredServices.filter((s) => s.category === c);
    if (this.selectedCategory !== 'All') {
      const list = byCat(this.selectedCategory);
      return list.length ? [{ key: this.selectedCategory, services: list }] : [];
    }
    return this.allOrder
      .map((key) => ({ key, services: byCat(key) }))
      .filter((b) => b.services.length > 0);
  }

  get filteredServices(): Service[] {
    if (this.selectedCategory === 'All') {
      return this.services;
    }
    return this.services.filter((s) => s.category === this.selectedCategory);
  }

  categoryDescription(key: ServiceCategory): string {
    const map: Record<ServiceCategory, string> = {
      Consultation: 'Primary care visits and professional medical advice.',
      Procedure: 'In-clinic procedures performed by qualified clinicians.',
      Laboratory: 'Trusted lab tests and health screenings.',
      Diagnostic: 'Imaging and studies that support your diagnosis.'
    };
    return map[key];
  }

  badgeClass(cat: ServiceCategory): string {
    const kebab = cat.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    return `badge--${kebab} badge--category`;
  }

  ngOnInit(): void {
    this.publicService.getServices().subscribe((list) => {
      this.services = list;
    });
    const qp = this.route.snapshot.queryParamMap.get('category');
    if (qp && this.allOrder.includes(qp as ServiceCategory)) {
      this.selectedCategory = qp as ServiceCategory;
    }
  }
}
