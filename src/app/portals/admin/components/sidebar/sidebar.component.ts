import { NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';
import { AvatarComponent } from '../../../../shared/components/avatar/avatar.component';
import { AuthUser, NavItem } from '../../../../core/models';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [NgFor, NgIf, RouterLink, RouterLinkActive, IonIcon, AvatarComponent],
  template: `
    <aside class="sidebar">
      <div class="sidebar__brand">
        <div class="sidebar__logo">G</div>
        <div>
          <div class="sidebar__clinic-name">{{ clinicName }}</div>
          <div class="sidebar__portal-label">{{ portalLabel }}</div>
        </div>
      </div>

      <nav class="sidebar__nav">
        <ng-container *ngFor="let item of navItems; let i = index">
          <div
            class="nav-section-label"
            *ngIf="item.section && (i === 0 || navItems[i - 1].section !== item.section)"
          >
            {{ item.section }}
          </div>
          <a
            [routerLink]="item.route"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: item.route.endsWith('/dashboard') }"
            class="nav-item"
          >
            <ion-icon class="nav-item__icon" [name]="item.icon"></ion-icon>
            <span>{{ item.label }}</span>
            <span *ngIf="item.badgeCount && item.badgeCount > 0" class="nav-item__badge">
              {{ item.badgeCount }}
            </span>
          </a>
        </ng-container>
      </nav>

      <div class="sidebar__footer" *ngIf="currentUser">
        <div class="sidebar__user" (click)="logout.emit()">
          <app-avatar [name]="currentUser.fullName" size="sm"></app-avatar>
          <div>
            <div class="sidebar__user-name">{{ currentUser.fullName }}</div>
            <div class="sidebar__user-role">{{ currentUser.role }} Account</div>
          </div>
          <ion-icon name="log-out-outline"></ion-icon>
        </div>
      </div>
    </aside>
  `,
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  @Input() navItems: NavItem[] = [];
  @Input() portalLabel = 'Portal';
  @Input() clinicName = 'Clinic';
  @Input() currentUser: AuthUser | null = null;

  @Output() logout = new EventEmitter<void>();
}
