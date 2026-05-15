import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIf } from '@angular/common';
import { IonButton, IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [NgIf, IonIcon, IonButton],
  template: `
    <div class="empty-state">
      <div class="empty-state__icon" *ngIf="icon">
        <ion-icon [name]="icon"></ion-icon>
      </div>
      <div class="empty-state__title">{{ title }}</div>
      <div class="empty-state__description">{{ description }}</div>

      <ion-button *ngIf="ctaText" class="btn-primary" fill="clear" (click)="cta.emit()">
        {{ ctaText }}
      </ion-button>
    </div>
  `,
  styleUrl: './empty-state.component.scss'
})
export class EmptyStateComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) description!: string;
  @Input() icon?: string;
  @Input() ctaText?: string;
  @Output() cta = new EventEmitter<void>();
}

