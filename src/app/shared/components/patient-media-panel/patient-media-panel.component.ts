import { DatePipe, NgFor, NgIf } from '@angular/common';
import { Component, DestroyRef, Input, OnChanges, OnInit, SimpleChanges, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IonSearchbar, IonSpinner, ToastController } from '@ionic/angular/standalone';
import {
  PatientDocument,
  PatientDocumentUploadRequest,
  PatientLabResult,
  PatientLabResultUploadRequest
} from '../../../core/models';
import { PatientDocumentsService } from '../../../core/services/patient-documents.service';

type MediaKind = 'document' | 'lab-result';
type PatientMediaItem = PatientDocument | PatientLabResult;

@Component({
  selector: 'app-patient-media-panel',
  standalone: true,
  imports: [DatePipe, NgFor, NgIf, ReactiveFormsModule, IonSearchbar, IonSpinner],
  template: `
    <section class="patient-media-panel clinic-card">
      <div class="patient-media-panel__header">
        <div>
          <p class="section-heading">{{ eyebrow }}</p>
          <h3 class="patient-media-panel__title">{{ heading }}</h3>
          <p class="patient-media-panel__subtitle">{{ subheading }}</p>
        </div>

        <div class="patient-media-panel__count" *ngIf="!loading && !error">
          {{ filteredItems.length }} shown
        </div>
      </div>

      <form *ngIf="allowUpload" class="patient-media-panel__upload" [formGroup]="form" (ngSubmit)="upload()">
        <div class="patient-media-panel__upload-grid">
          <label class="media-field media-field--full">
            <span>{{ fileFieldLabel }}</span>
            <div class="file-picker" (click)="fileInput.click()">
              <strong>{{ selectedFileName || 'Choose a file' }}</strong>
              <small>No booking is required. Booking and consultation IDs are optional.</small>
            </div>
            <input #fileInput type="file" class="visually-hidden" (change)="onFileSelected($event)" />
          </label>

          <label class="media-field">
            <span>{{ titleFieldLabel }}</span>
            <input class="filter-input" [formControl]="form.controls.title" [placeholder]="titlePlaceholder" />
          </label>

          <label class="media-field">
            <span>{{ notesFieldLabel }}</span>
            <textarea class="filter-input" rows="3" [formControl]="form.controls.notes"></textarea>
          </label>

          <label class="media-field">
            <span>Booking ID (optional)</span>
            <input class="filter-input" [formControl]="form.controls.bookingId" placeholder="Booking ID" />
          </label>

          <label class="media-field">
            <span>Consultation ID (optional)</span>
            <input class="filter-input" [formControl]="form.controls.consultationId" placeholder="Consultation ID" />
          </label>
        </div>

        <div class="patient-media-panel__actions">
          <button type="submit" class="btn-primary" [disabled]="uploading || !selectedFile">
            {{ uploading ? uploadButtonLabel + '...' : uploadButtonLabel }}
          </button>
          <button type="button" class="btn-outline" (click)="resetUpload()" [disabled]="uploading && !selectedFile">
            Reset
          </button>
        </div>
      </form>

      <ion-searchbar
        class="patient-media-panel__search"
        placeholder="Search by file name, title, notes, or linked IDs"
        [value]="searchTerm"
        (ionInput)="onSearchChange($event.detail.value ?? '')"
      ></ion-searchbar>

      <div class="patient-media-panel__loading" *ngIf="loading">
        <ion-spinner name="crescent"></ion-spinner>
        <p>Loading {{ kindLabelLower }}...</p>
      </div>

      <div class="patient-media-panel__error" *ngIf="error">
        <div class="patient-media-panel__error-title">{{ errorHeader }}</div>
        <p>{{ error }}</p>
        <button type="button" class="btn-primary" (click)="loadRecords()">Retry</button>
      </div>

      <ng-container *ngIf="!loading && !error">
        <ng-container *ngIf="filteredItems.length > 0; else emptyTpl">
          <article class="media-card" *ngFor="let item of filteredItems">
            <div class="media-card__header">
              <div>
                <div class="media-card__date">{{ item.uploadedAt | date : 'MMM d, y' }}</div>
                <h4>{{ displayTitle(item) }}</h4>
              </div>
              <div class="media-card__tag">{{ tagLabel(item) }}</div>
            </div>

            <div class="media-card__grid">
              <div>
                <span>File</span>
                <p>{{ item.fileName }}</p>
              </div>
              <div>
                <span>{{ recordDetailLabel }}</span>
                <p>{{ recordDetailText(item) }}</p>
              </div>
              <div>
                <span>Booking</span>
                <p>{{ item.bookingId || 'Not linked' }}</p>
              </div>
              <div>
                <span>Consultation</span>
                <p>{{ item.consultationId || 'Not linked' }}</p>
              </div>
            </div>

            <div class="media-card__meta">
              <span>{{ secondaryMetaLabel }}: {{ secondaryMetaValue(item) }}</span>
              <span>{{ item.createdAt | date : 'MMM d, y, h:mm a' }}</span>
            </div>

            <div class="media-card__actions">
              <button
                type="button"
                class="btn-outline"
                [disabled]="isDownloading(item.id)"
                (click)="download(item)"
              >
                {{ isDownloading(item.id) ? 'Downloading...' : 'Download File' }}
              </button>
            </div>
          </article>
        </ng-container>
      </ng-container>

      <ng-template #emptyTpl>
        <div class="patient-media-panel__empty">
          <p class="patient-media-panel__empty-title">{{ emptyTitle }}</p>
          <p>{{ emptyDescription }}</p>
        </div>
      </ng-template>
    </section>
  `,
  styleUrl: './patient-media-panel.component.scss'
})
export class PatientMediaPanelComponent implements OnInit, OnChanges {
  @Input() kind: MediaKind = 'document';
  @Input() patientId = '';
  @Input() allowUpload = true;
  @Input() heading = '';
  @Input() subheading = '';
  @Input() errorTitle = '';

  private readonly documentsService = inject(PatientDocumentsService);
  private readonly fb = inject(FormBuilder);
  private readonly toastCtrl = inject(ToastController);
  private readonly destroyRef = inject(DestroyRef);

  readonly form = this.fb.nonNullable.group({
    title: [''],
    notes: [''],
    bookingId: [''],
    consultationId: ['']
  });

  items: PatientMediaItem[] = [];
  filteredItems: PatientMediaItem[] = [];
  loading = false;
  uploading = false;
  error = '';
  searchTerm = '';
  selectedFile: File | null = null;
  selectedFileName = '';
  private readonly downloading = new Set<string>();
  private loadToken = 0;

  ngOnInit(): void {
    this.loadRecords();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['kind'] || changes['patientId']) {
      this.loadRecords();
      this.resetUpload();
    }
  }

  get eyebrow(): string {
    return this.kind === 'document' ? 'Uploads' : 'Lab Records';
  }

  get kindLabelLower(): string {
    return this.kind === 'document' ? 'documents' : 'lab results';
  }

  get titleFieldLabel(): string {
    return this.kind === 'document' ? 'Document Title' : 'Result Title';
  }

  get titlePlaceholder(): string {
    return this.kind === 'document' ? 'Optional document title' : 'Optional result title';
  }

  get notesFieldLabel(): string {
    return this.kind === 'document' ? 'Description' : 'Result Notes';
  }

  get recordDetailLabel(): string {
    return this.kind === 'document' ? 'Description' : 'Notes';
  }

  get fileFieldLabel(): string {
    return this.kind === 'document' ? 'Select Document File' : 'Select Lab Result File';
  }

  get uploadButtonLabel(): string {
    return this.kind === 'document' ? 'Upload Document' : 'Upload Result';
  }

  get emptyTitle(): string {
    return this.kind === 'document' ? 'No documents yet' : 'No lab results yet';
  }

  get emptyDescription(): string {
    return this.kind === 'document'
      ? 'Upload supporting documents anytime, even if there is no booking attached.'
      : 'Upload lab result files anytime, even if there is no booking attached.';
  }

  get errorHeader(): string {
    return this.errorTitle || (this.kind === 'document' ? 'Unable to load documents' : 'Unable to load lab results');
  }

  get secondaryMetaLabel(): string {
    return this.kind === 'document' ? 'Source' : 'Status';
  }

  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.applyFilter();
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.selectedFile = file;
    this.selectedFileName = file?.name ?? '';
  }

  resetUpload(): void {
    this.form.reset({
      title: '',
      notes: '',
      bookingId: '',
      consultationId: ''
    });
    this.selectedFile = null;
    this.selectedFileName = '';
  }

  upload(): void {
    if (!this.allowUpload || this.uploading || !this.selectedFile) {
      return;
    }

    const values = this.form.getRawValue();
    const bookingId = normalizeOptionalString(values.bookingId);
    const consultationId = normalizeOptionalString(values.consultationId);

    this.uploading = true;

    if (this.kind === 'document') {
      const request: PatientDocumentUploadRequest = {
        file: this.selectedFile,
        bookingId,
        consultationId,
        title: normalizeOptionalString(values.title),
        description: normalizeOptionalString(values.notes)
      };

      const upload$ = this.patientId
        ? this.documentsService.uploadPatientDocument(this.patientId, request)
        : this.documentsService.uploadMyDocument(request);

      upload$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => this.finishUpload('Document uploaded successfully.'),
        error: (error) => this.failUpload(extractMessage(error, 'Failed to upload document.'))
      });
      return;
    }

    const request: PatientLabResultUploadRequest = {
      file: this.selectedFile,
      bookingId,
      consultationId,
      resultTitle: normalizeOptionalString(values.title),
      resultText: normalizeOptionalString(values.notes)
    };

    const upload$ = this.patientId
      ? this.documentsService.uploadPatientLabResult(this.patientId, request)
      : this.documentsService.uploadMyLabResult(request);

    upload$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => this.finishUpload('Lab result uploaded successfully.'),
      error: (error) => this.failUpload(extractMessage(error, 'Failed to upload lab result.'))
    });
  }

  download(item: PatientMediaItem): void {
    if (this.isDownloading(item.id) || !item.fileUrl) {
      return;
    }

    this.downloading.add(item.id);
    this.documentsService.downloadFile(item.fileUrl).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (blob) => {
        this.saveBlob(blob, item.fileName || `${item.id}.bin`);
        this.downloading.delete(item.id);
      },
      error: async (error) => {
        this.downloading.delete(item.id);
        await this.presentToast(extractMessage(error, 'Document not available yet.'));
      }
    });
  }

  isDownloading(id: string): boolean {
    return this.downloading.has(id);
  }

  displayTitle(item: PatientMediaItem): string {
    if (this.kind === 'document') {
      const document = item as PatientDocument;
      return document.title || document.fileName || 'Document';
    }

    const labResult = item as PatientLabResult;
    return labResult.resultTitle || labResult.fileName || 'Lab Result';
  }

  tagLabel(item: PatientMediaItem): string {
    return this.kind === 'document'
      ? (item as PatientDocument).documentType || 'Other'
      : (item as PatientLabResult).status || 'Uploaded';
  }

  secondaryMetaValue(item: PatientMediaItem): string {
    if (this.kind === 'document') {
      const source = (item as PatientDocument).source;
      if (!source) {
        return 'Unknown';
      }

      if (source === 'PatientPortal') {
        return 'Patient Portal';
      }

      if (source === 'StaffUpload') {
        return 'Staff Upload';
      }

      return source;
    }

    return (item as PatientLabResult).status || 'Uploaded';
  }

  recordDetailText(item: PatientMediaItem): string {
    if (this.kind === 'document') {
      return (item as PatientDocument).description || 'No description recorded.';
    }

    return (item as PatientLabResult).resultText || 'No notes recorded.';
  }

  loadRecords(): void {
    const version = ++this.loadToken;
    this.loading = true;
    this.error = '';

    if (this.kind === 'document') {
      const request$ = this.patientId
        ? this.documentsService.getPatientDocuments(this.patientId)
        : this.documentsService.getMyDocuments();

      request$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (records: PatientDocument[]) => {
          if (version !== this.loadToken) {
            return;
          }

          this.items = records;
          this.applyFilter();
          this.loading = false;
        },
        error: (error: unknown) => {
          if (version !== this.loadToken) {
            return;
          }

          this.items = [];
          this.filteredItems = [];
          this.loading = false;
          this.error = extractMessage(error, `Unable to load ${this.kindLabelLower}. Please try again.`);
        }
      });
      return;
    }

    const request$ = this.patientId
      ? this.documentsService.getPatientLabResults(this.patientId)
      : this.documentsService.getMyLabResults();

    request$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (records: PatientLabResult[]) => {
        if (version !== this.loadToken) {
          return;
        }

        this.items = records;
        this.applyFilter();
        this.loading = false;
      },
      error: (error: unknown) => {
        if (version !== this.loadToken) {
          return;
        }

        this.items = [];
        this.filteredItems = [];
        this.loading = false;
        this.error = extractMessage(error, `Unable to load ${this.kindLabelLower}. Please try again.`);
      }
    });
  }

  private applyFilter(): void {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      this.filteredItems = [...this.items];
      return;
    }

    this.filteredItems = this.items.filter((item) => {
      const values =
        this.kind === 'document'
          ? [
              (item as PatientDocument).title,
              (item as PatientDocument).documentType,
              (item as PatientDocument).description,
              (item as PatientDocument).fileName,
              (item as PatientDocument).bookingId,
              (item as PatientDocument).consultationId,
              (item as PatientDocument).source
            ]
          : [
              (item as PatientLabResult).resultTitle,
              (item as PatientLabResult).resultText,
              (item as PatientLabResult).fileName,
              (item as PatientLabResult).bookingId,
              (item as PatientLabResult).consultationId,
              (item as PatientLabResult).status
            ];

      const haystack = values
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(term);
    });
  }

  private finishUpload(message: string): void {
    this.uploading = false;
    this.resetUpload();
    this.loadRecords();
    void this.presentToast(message);
  }

  private failUpload(message: string): void {
    this.uploading = false;
    void this.presentToast(message, 'danger');
  }

  private saveBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  private async presentToast(message: string, color: 'success' | 'danger' = 'success'): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2200,
      color,
      position: 'top'
    });
    await toast.present();
  }
}

function normalizeOptionalString(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function extractMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null) {
    const apiError = error as { error?: { message?: unknown }; message?: unknown };
    const direct = apiError.error?.message ?? apiError.message;
    if (typeof direct === 'string' && direct.trim()) {
      return direct;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}
