import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IonButton, IonButtons, IonContent, IonHeader, IonModal, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent],
  template: `
    <ion-modal [isOpen]="isOpen" (didDismiss)="dismiss.emit()">
      <ion-header>
        <ion-toolbar>
          <ion-title>{{ title }}</ion-title>
          <ion-buttons slot="end">
            <ion-button fill="clear" (click)="dismiss.emit()">Close</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <p style="margin: 0 0 var(--space-6) 0; color: var(--clinic-text-secondary)">
          {{ message }}
        </p>
        <div style="display: flex; gap: var(--space-3); justify-content: flex-end">
          <button class="btn-ghost" type="button" (click)="cancel.emit()">
            {{ cancelText }}
          </button>
          <button class="btn-danger" type="button" (click)="confirm.emit()">
            {{ confirmText }}
          </button>
        </div>
      </ion-content>
    </ion-modal>
  `,
  styleUrl: './confirm-modal.component.scss'
})
export class ConfirmModalComponent {
  @Input() isOpen = false;
  @Input() title = 'Confirm';
  @Input() message = 'Are you sure?';
  @Input() confirmText = 'Confirm';
  @Input() cancelText = 'Cancel';

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() dismiss = new EventEmitter<void>();
}

