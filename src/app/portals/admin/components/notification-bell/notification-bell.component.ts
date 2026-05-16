import { NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { IonIcon, IonPopover } from '@ionic/angular/standalone';
import { NotificationPanelComponent } from '../../../../shared/components/notification-panel/notification-panel.component';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [NgIf, IonIcon, IonPopover, NotificationPanelComponent],
  template: `
    <button id="notification-bell-trigger" type="button" class="notification-bell">
      <ion-icon name="notifications-outline"></ion-icon>
      <span *ngIf="unreadCount > 0" class="notification-badge">{{ unreadCount }}</span>
    </button>

    <ion-popover
      trigger="notification-bell-trigger"
      triggerAction="click"
      side="bottom"
      alignment="end"
      [dismissOnSelect]="false"
      cssClass="notification-popover-shell"
    >
      <ng-template>
        <app-notification-panel></app-notification-panel>
      </ng-template>
    </ion-popover>
  `,
  styleUrl: './notification-bell.component.scss'
})
export class NotificationBellComponent {
  @Input() unreadCount = 0;
}
