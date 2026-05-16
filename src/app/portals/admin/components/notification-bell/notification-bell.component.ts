import { NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { IonIcon, IonPopover } from '@ionic/angular/standalone';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [NgIf, IonIcon, IonPopover],
  template: `
    <button id="notification-bell-trigger" type="button" class="notification-bell">
      <ion-icon name="notifications-outline"></ion-icon>
      <span *ngIf="unreadCount > 0" class="notification-badge">{{ unreadCount }}</span>
    </button>

    <ion-popover trigger="notification-bell-trigger" triggerAction="click" side="bottom" alignment="end">
      <ng-template>
        <div class="notification-popover">
          <strong>{{ unreadCount }} unread notifications</strong>
          <p>Full notification panel coming in Phase 10.</p>
        </div>
      </ng-template>
    </ion-popover>
  `,
  styleUrl: './notification-bell.component.scss'
})
export class NotificationBellComponent {
  @Input() unreadCount = 0;
}
