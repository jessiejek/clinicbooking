import { Component, Input } from '@angular/core';
import { NgClass, NgStyle } from '@angular/common';

export type SkeletonVariant = 'text' | 'title' | 'card' | 'avatar' | 'stat' | 'row';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [NgClass, NgStyle],
  template: `
    <div
      class="skeleton"
      [ngClass]="variantClass"
      [ngStyle]="{ width: width ?? null }"
      aria-hidden="true"
    ></div>
  `,
  styleUrl: './skeleton.component.scss'
})
export class SkeletonComponent {
  @Input() variant: SkeletonVariant = 'text';
  @Input() width?: string;

  get variantClass(): string {
    return `skeleton-${this.variant}`;
  }
}

