import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '../../../core/services/mock-data.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { Service } from '../../../core/models';
import { IonModal } from '@ionic/angular/standalone';

interface AdminServiceRecord extends Service {
  isActive: boolean;
}

@Component({
  selector: 'app-admin-services-page',
  standalone: true,
  imports: [FormsModule, NgFor, NgIf, EmptyStateComponent, StatusBadgeComponent, IonModal],
  template: `
    <section class="page-shell">
      <div class="page-shell__header">
        <div>
          <h2 class="page-title">Services</h2>
          <p class="page-subtitle">Manage service catalog and assigned doctors.</p>
        </div>
        <button class="btn-primary" type="button" (click)="openModal()">Add Service</button>
      </div>

      <div class="clinic-card" *ngFor="let group of groupedServices">
        <div class="section-heading">{{ group.category }}</div>
        <div class="table-scroll-wrap">
        <table class="clinic-table">
          <thead>
            <tr><th>Name</th><th>Duration</th><th>Price</th><th>Assigned Doctors</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let service of group.items">
              <td>{{ service.name }}</td>
              <td>{{ service.estimatedDurationMinutes }} min</td>
              <td>₱{{ service.price }}</td>
              <td>{{ assignedDoctors(service).join(', ') }}</td>
              <td><app-status-badge [status]="service.isActive ? 'Active' : 'Inactive'"></app-status-badge></td>
              <td>
                <button class="btn-ghost" type="button" (click)="toggle(service.id)">{{ service.isActive ? 'Deactivate' : 'Activate' }}</button>
                <button class="btn-ghost" type="button" (click)="edit(service)">Edit</button>
                <button class="btn-ghost" type="button" (click)="remove(service.id)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
        </div>
      </div>
    </section>

    <ion-modal [isOpen]="modalOpen" (didDismiss)="modalOpen = false">
      <ng-template>
        <div class="modal-shell">
          <h3>{{ editingId ? 'Edit Service' : 'Add Service' }}</h3>
          <form class="modal-form" (ngSubmit)="save()">
            <input class="filter-input" name="name" [(ngModel)]="draft.name" placeholder="Service name" />
            <input class="filter-input" name="category" [(ngModel)]="draft.category" placeholder="Category" />
            <input class="filter-input" type="number" name="price" [(ngModel)]="draft.price" placeholder="Price" />
            <input class="filter-input" type="number" name="estimatedDurationMinutes" [(ngModel)]="draft.estimatedDurationMinutes" placeholder="Duration" />
            <label><input type="checkbox" name="isActive" [(ngModel)]="draft.isActive" /> Active</label>
            <div class="modal-actions">
              <button type="button" class="btn-ghost" (click)="modalOpen = false">Cancel</button>
              <button type="submit" class="btn-primary">Save</button>
            </div>
          </form>
        </div>
      </ng-template>
    </ion-modal>
  `,
  styleUrl: './services.page.scss'
})
export class ServicesPage implements OnInit {
  private readonly mockData = inject(MockDataService);
  services: AdminServiceRecord[] = [];
  modalOpen = false;
  editingId: string | null = null;
  draft: AdminServiceRecord = this.emptyDraft();

  ngOnInit(): void {
    this.services = this.mockData.getServices().map((service) => ({ ...service, isActive: true }));
  }

  get groupedServices(): Array<{ category: string; items: AdminServiceRecord[] }> {
    const categories = Array.from(new Set(this.services.map((service) => service.category)));
    return categories.map((category) => ({ category, items: this.services.filter((service) => service.category === category) }));
  }

  assignedDoctors(service: AdminServiceRecord): string[] {
    return this.mockData.getDoctors().filter((doctor) => service.doctorIds.includes(doctor.id)).map((doctor) => doctor.fullName);
  }

  openModal(): void {
    this.editingId = null;
    this.draft = this.emptyDraft();
    this.modalOpen = true;
  }

  edit(service: AdminServiceRecord): void {
    this.editingId = service.id;
    this.draft = { ...service };
    this.modalOpen = true;
  }

  toggle(id: string): void {
    this.services = this.services.map((service) => (service.id === id ? { ...service, isActive: !service.isActive } : service));
  }

  remove(id: string): void {
    this.services = this.services.filter((service) => service.id !== id);
  }

  save(): void {
    if (this.editingId) {
      this.services = this.services.map((service) => (service.id === this.editingId ? { ...this.draft } : service));
    } else {
      this.services = [...this.services, { ...this.draft, id: `svc-${Date.now()}` }];
    }
    this.modalOpen = false;
  }

  private emptyDraft(): AdminServiceRecord {
    return {
      id: '',
      name: '',
      category: 'Consultation',
      price: 0,
      estimatedDurationMinutes: 30,
      doctorIds: [],
      isActive: true
    };
  }
}
