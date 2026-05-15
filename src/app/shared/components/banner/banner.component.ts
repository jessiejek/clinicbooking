import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIf } from '@angular/common';
import { IonButton, IonIcon } from '@ionic/angular/standalone';

export type BannerVariant = 'warning' | 'danger' | 'info';

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [NgIf, IonIcon, IonButton],
  template: `
    <div class="banner" [class]="bannerClass">
      <ion-icon [name]="iconName"></ion-icon>
      <div style="flex: 1">
        <div style="font-weight: var(--font-semibold)">{{ title }}</div>
        <div style="margin-top: 2px; opacity: 0.85">{{ message }}</div>
      </div>
      <ion-button *ngIf="closable" fill="clear" size="small" (click)="close.emit()">
        Close
      </ion-button>
    </div>
  `,
  styleUrl: './banner.component.scss'
})
export class BannerComponent {
  @Input() variant: BannerVariant = 'info';
  @Input({ required: true }) title!: string;
  @Input({ required: true }) message!: string;
  @Input() closable = false;
  @Output() close = new EventEmitter<void>();

  get bannerClass(): string {
    return `banner banner--${this.variant}`;
  }

  get iconName(): string {
    switch (this.variant) {
      case 'warning':
        return 'warning-outline';
      case 'danger':
        return 'alert-circle-outline';
      default:
        return 'information-circle-outline';
    }
  }
}

