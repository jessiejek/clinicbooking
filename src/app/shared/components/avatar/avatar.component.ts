import { Component, Input } from '@angular/core';
import { NgIf, NgOptimizedImage } from '@angular/common';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [NgIf, NgOptimizedImage],
  template: `
    <div class="avatar" [class]="avatarClass" [attr.aria-label]="name">
      <img
        *ngIf="src; else initialsTpl"
        [ngSrc]="src"
        [alt]="name"
        width="80"
        height="80"
        style="width: 100%; height: 100%; border-radius: var(--radius-full)"
      />
      <ng-template #initialsTpl>{{ initials }}</ng-template>
    </div>
  `,
  styleUrl: './avatar.component.scss'
})
export class AvatarComponent {
  @Input({ required: true }) name!: string;
  @Input() src: string | null = null;
  @Input() size: AvatarSize = 'md';

  get avatarClass(): string {
    return `avatar avatar--${this.size}`;
  }

  get initials(): string {
    const parts = this.name
      .split(' ')
      .map((p) => p.trim())
      .filter(Boolean);
    const a = parts.at(0)?.[0] ?? '';
    const b = parts.length > 1 ? parts.at(-1)?.[0] ?? '' : '';
    return (a + b).toUpperCase();
  }
}

