import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonModal,
  IonTextarea,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [
    NgIf,
    FormsModule,
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonTextarea
  ],
  template: `
    <ion-modal [isOpen]="isOpen" (didDismiss)="cancelled.emit()">
      <ion-header>
        <ion-toolbar>
          <ion-title>{{ title }}</ion-title>
          <ion-buttons slot="end">
            <ion-button fill="clear" (click)="cancelled.emit()">Close</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <p style="margin: 0 0 var(--space-4) 0; color: var(--clinic-text-secondary)">
          {{ message }}
        </p>
        <div *ngIf="requireReason" style="margin-bottom: var(--space-4)">
          <label style="display: block; font-size: var(--text-sm); margin-bottom: var(--space-2)">{{
            reasonLabel
          }}</label>
          <ion-textarea
            [(ngModel)]="reason"
            [rows]="4"
            [placeholder]="reasonLabel"
          ></ion-textarea>
        </div>
        <div style="display: flex; gap: var(--space-3); justify-content: flex-end">
          <button class="btn-ghost" type="button" (click)="cancelled.emit()">
            {{ cancelLabel }}
          </button>
          <button
            [class.btn-danger]="isDanger"
            [class.btn-primary]="!isDanger"
            type="button"
            [disabled]="requireReason && reasonTrimmed.length < 10"
            (click)="onConfirm()"
          >
            {{ confirmLabel }}
          </button>
        </div>
      </ion-content>
    </ion-modal>
  `,
  styleUrl: './confirm-modal.component.scss'
})
export class ConfirmModalComponent {
  @Input() isOpen = false;
  @Input() title = 'Confirm Action';
  @Input() message = 'Are you sure?';
  @Input() confirmLabel = 'Confirm';
  @Input() cancelLabel = 'Cancel';
  @Input() isDanger = false;
  @Input() requireReason = false;
  @Input() reasonLabel = 'Reason (required)';

  @Output() confirmed = new EventEmitter<string | undefined>();
  @Output() cancelled = new EventEmitter<void>();

  reason = '';

  get reasonTrimmed(): string {
    return this.reason.trim();
  }

  onConfirm(): void {
    this.confirmed.emit(this.requireReason ? this.reasonTrimmed : undefined);
  }
}
