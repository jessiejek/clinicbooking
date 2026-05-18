import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgIf } from '@angular/common';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonIcon
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline, printOutline } from 'ionicons/icons';
import { ReceiptData } from '../../../core/models';
import { ReceiptViewComponent } from '../receipt-view/receipt-view.component';

@Component({
  selector: 'app-receipt-modal',
  standalone: true,
  imports: [
    NgIf,
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonIcon,
    ReceiptViewComponent
  ],
  template: `
    <ion-modal [isOpen]="isOpen" (didDismiss)="closed.emit()">
      <ng-template>
        <ion-header>
          <ion-toolbar>
            <ion-title>Payment Receipt</ion-title>
            <ion-buttons slot="end">
              <ion-button fill="clear" (click)="closed.emit()">
                <ion-icon name="close-outline"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <app-receipt-view *ngIf="data" [data]="data"></app-receipt-view>
          <div class="modal-actions no-print" style="margin-top: var(--space-6);">
            <button class="btn-ghost" type="button" (click)="closed.emit()">Close</button>
            <button class="btn-primary" type="button" (click)="print()">
              <ion-icon name="print-outline"></ion-icon>
              Print Receipt
            </button>
          </div>
        </ion-content>
      </ng-template>
    </ion-modal>
  `,
  styleUrls: ['./receipt-modal.component.scss']
})
export class ReceiptModalComponent {
  @Input() isOpen = false;
  @Input() data: ReceiptData | null = null;
  @Output() closed = new EventEmitter<void>();

  constructor() {
    addIcons({ closeOutline, printOutline });
  }

  print(): void {
    window.print();
  }
}
