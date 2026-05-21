import { NgFor, NgIf } from '@angular/common';
import {
  Component,
  DestroyRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject
} from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MockDataService } from '../../../../core/services/mock-data.service';
import { MockDrug, PrescriptionItem } from '../../../../core/models';
import {
  MEDICATION_FREQUENCY_MASTERS,
  MEDICATION_ROUTE_MASTERS,
  MEDICATION_UOM_MASTERS,
  MedicationFrequencyMaster,
  MedicationRouteMaster,
  MedicationUomMaster
} from './prescription-masters';
import {
  IonBadge,
  IonButton,
  IonCheckbox,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonSelect,
  IonSelectOption,
  IonTextarea
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-prescription-builder',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    ReactiveFormsModule,
    IonBadge,
    IonButton,
    IonCheckbox,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonSelect,
    IonSelectOption,
    IonTextarea
  ],
  template: `
    <section class="clinic-card section-card" [formGroup]="form">
      <div class="section-card__head">
        <h3>Prescription</h3>
        <p>Add one or more medicines for this consultation.</p>
      </div>

      <div class="prescription-list" formArrayName="items">
        <article class="prescription-item" *ngFor="let group of itemControls.controls; let i = index" [formGroupName]="i">
          <div class="prescription-item__head">
            <strong>Medicine {{ i + 1 }}</strong>
            <button *ngIf="!locked" type="button" class="btn-ghost" (click)="removeItem(i)">Remove</button>
          </div>

          <ion-item class="field">
            <ion-label position="stacked">Drug Name</ion-label>
            <ion-input
              formControlName="medicineName"
              placeholder="Start typing"
              [disabled]="locked"
              (ionFocus)="setActiveSuggestion(i)"
              (ionInput)="updateSuggestions(i, $event.detail.value)"
            ></ion-input>
          </ion-item>

          <div class="suggestions" *ngIf="activeSuggestionIndex === i && suggestions.length > 0">
            <button type="button" class="suggestion" *ngFor="let drug of suggestions" (click)="applySuggestion(i, drug)">
              <strong>{{ drug.medicineName }}</strong>
              <span>{{ drug.genericName || drug.medicineName }}</span>
            </button>
          </div>

          <div class="item-grid">
            <ion-item class="field">
              <ion-label position="stacked">Generic Name</ion-label>
              <ion-input formControlName="genericName" [disabled]="locked"></ion-input>
            </ion-item>
            <ion-item class="field">
              <ion-label position="stacked">Dosage Form</ion-label>
              <ion-select formControlName="dosageForm" interface="popover" [disabled]="locked">
                <ion-select-option value="Tablet">Tablet</ion-select-option>
                <ion-select-option value="Capsule">Capsule</ion-select-option>
                <ion-select-option value="Syrup">Syrup</ion-select-option>
                <ion-select-option value="Injection">Injection</ion-select-option>
                <ion-select-option value="Cream">Cream</ion-select-option>
                <ion-select-option value="Drops">Drops</ion-select-option>
                <ion-select-option value="Others">Others</ion-select-option>
              </ion-select>
            </ion-item>
            <ion-item class="field">
              <ion-label position="stacked">Strength</ion-label>
              <ion-input formControlName="strength" [disabled]="locked"></ion-input>
            </ion-item>
          </div>

          <div class="item-grid item-grid--triple">
            <ion-item class="field">
              <ion-label position="stacked">Unit of Measure</ion-label>
              <ion-select
                formControlName="unitOfMeasure"
                interface="popover"
                [disabled]="locked"
                (ionChange)="syncUnitOfMeasure(i)"
              >
                <ion-select-option *ngFor="let option of unitOfMeasureOptions" [value]="option.unit_of_measure">
                  {{ option.unit_of_measure }}{{ option.description ? ' - ' + option.description : '' }}
                </ion-select-option>
              </ion-select>
            </ion-item>
            <ion-item class="field">
              <ion-label position="stacked">Quantity</ion-label>
              <ion-input type="number" formControlName="quantity" [disabled]="locked"></ion-input>
            </ion-item>
            <ion-item class="field">
              <ion-label position="stacked">Frequency</ion-label>
              <ion-select
                formControlName="frequencyCode"
                interface="popover"
                [disabled]="locked"
                (ionChange)="syncFrequency(i)"
              >
                <ion-select-option *ngFor="let option of frequencyOptions" [value]="option.dosage_no">
                  {{ option.dosage_desc }}
                </ion-select-option>
              </ion-select>
            </ion-item>
          </div>

          <div class="item-grid">
            <ion-item class="field">
              <ion-label position="stacked">Route</ion-label>
              <ion-select
                formControlName="route"
                interface="popover"
                [disabled]="locked"
                (ionChange)="syncRoute(i)"
              >
                <ion-select-option *ngFor="let option of routeOptions" [value]="option.route_code">
                  {{ option.route_code }} - {{ option.route_description }}
                </ion-select-option>
              </ion-select>
            </ion-item>
            <ion-item class="field">
              <ion-label position="stacked">Duration</ion-label>
              <ion-input formControlName="duration" [disabled]="locked"></ion-input>
            </ion-item>
          </div>

          <ion-item class="field">
            <ion-label position="stacked">Sig</ion-label>
            <ion-textarea formControlName="sig" autoGrow="true" [disabled]="locked"></ion-textarea>
          </ion-item>

          <ion-item class="field">
            <ion-label position="stacked">Instructions</ion-label>
            <ion-textarea formControlName="instructions" autoGrow="true" [disabled]="locked"></ion-textarea>
          </ion-item>

          <div class="controlled-row">
            <ion-checkbox formControlName="isControlledSubstance" [disabled]="locked"></ion-checkbox>
            <span>Controlled substance</span>
            <ion-badge *ngIf="group.get('isControlledSubstance')?.value" color="warning">Warning</ion-badge>
          </div>
        </article>
      </div>

      <button *ngIf="!locked" type="button" class="btn-outline" (click)="addItem()">Add another drug</button>
    </section>
  `,
  styleUrl: './prescription-builder.component.scss'
})
export class PrescriptionBuilderComponent implements OnChanges {
  @Input() items: PrescriptionItem[] = [];
  @Input() locked = false;

  @Output() itemsChange = new EventEmitter<PrescriptionItem[]>();

  private readonly fb = inject(FormBuilder);
  private readonly mockData = inject(MockDataService);
  private readonly destroyRef = inject(DestroyRef);

  readonly form = this.fb.group({
    items: this.fb.array([])
  });

  readonly unitOfMeasureOptions = MEDICATION_UOM_MASTERS.filter(
    (option) => option.unit_of_measure.trim().length > 0
  );
  readonly routeOptions = MEDICATION_ROUTE_MASTERS;
  readonly frequencyOptions = [...MEDICATION_FREQUENCY_MASTERS].sort(
    (a, b) => a.priority_order - b.priority_order || a.arrangement_count - b.arrangement_count
  );

  suggestions: MockDrug[] = [];
  activeSuggestionIndex = -1;

  get itemControls(): FormArray {
    return this.form.get('items') as FormArray;
  }

  constructor() {
    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.emitValue();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items']) {
      this.rebuildForm();
    }

    if (changes['locked']) {
      if (this.locked) {
        this.form.disable({ emitEvent: false });
      } else {
        this.form.enable({ emitEvent: false });
      }
    }
  }

  addItem(): void {
    if (this.locked) {
      return;
    }
    this.itemControls.push(this.createItemGroup());
    this.emitValue();
  }

  removeItem(index: number): void {
    if (this.locked || this.itemControls.length === 0) {
      return;
    }
    this.itemControls.removeAt(index);
    this.emitValue();
  }

  setActiveSuggestion(index: number): void {
    this.activeSuggestionIndex = index;
    const value = this.itemControls.at(index)?.get('medicineName')?.value as string | undefined;
    this.suggestions = this.lookupDrugs(value ?? '');
  }

  updateSuggestions(index: number, value: string | null | undefined): void {
    this.activeSuggestionIndex = index;
    this.suggestions = this.lookupDrugs(value ?? '');
  }

  syncUnitOfMeasure(index: number): void {
    const group = this.itemControls.at(index);
    const code = (group?.get('unitOfMeasure')?.value as string | undefined) ?? '';
    const match = this.unitOfMeasureOptions.find((option) => option.unit_of_measure === code);
    group?.patchValue(
      {
        unitOfMeasureDescription: match?.description || ''
      },
      { emitEvent: false }
    );
    this.emitValue();
  }

  syncRoute(index: number): void {
    const group = this.itemControls.at(index);
    const code = (group?.get('route')?.value as string | undefined) ?? '';
    const match = this.routeOptions.find((option) => option.route_code === code);
    group?.patchValue(
      {
        routeDescription: match?.route_description || ''
      },
      { emitEvent: false }
    );
    this.emitValue();
  }

  syncFrequency(index: number): void {
    const group = this.itemControls.at(index);
    const code = (group?.get('frequencyCode')?.value as string | undefined) ?? '';
    const match = this.frequencyOptions.find((option) => normalizeMasterCode(option.dosage_no) === code);
    group?.patchValue(
      {
        frequency: match?.dosage_desc || ''
      },
      { emitEvent: false }
    );
    this.emitValue();
  }

  applySuggestion(index: number, drug: MockDrug): void {
    const group = this.itemControls.at(index);
    if (!group || this.locked) {
      return;
    }
    group.patchValue(
      {
        medicineName: drug.medicineName,
        genericName: drug.genericName ?? drug.medicineName
      },
      { emitEvent: false }
    );
    this.emitValue();
    this.suggestions = [];
  }

  private rebuildForm(): void {
    while (this.itemControls.length > 0) {
      this.itemControls.removeAt(0);
    }

    const source = this.items.length > 0 ? this.items : [this.createDefaultItem()];
    source.forEach((item) => this.itemControls.push(this.createItemGroup(item)));
    if (!this.locked) {
      this.itemControls.markAsPristine();
    }
    this.emitValue();
  }

  private createDefaultItem(): PrescriptionItem {
    return {
      id: `rx-item-${Date.now()}`,
      medicineName: '',
      genericName: '',
      dosageForm: 'Tablet',
      strength: '',
      quantity: 1,
      sig: '',
      frequency: '',
      frequencyCode: '',
      duration: '',
      route: '',
      routeDescription: '',
      unitOfMeasure: '',
      unitOfMeasureDescription: '',
      instructions: '',
      isControlledSubstance: false
    };
  }

  private createItemGroup(item?: PrescriptionItem) {
    const frequencyCode =
      item?.frequencyCode ?? findFrequencyCode(item?.frequency, this.frequencyOptions) ?? '';

    return this.fb.group({
      id: [item?.id ?? `rx-item-${Date.now()}`],
      medicineName: [item?.medicineName ?? '', Validators.required],
      genericName: [item?.genericName ?? ''],
      dosageForm: [item?.dosageForm ?? 'Tablet', Validators.required],
      strength: [item?.strength ?? '', Validators.required],
      quantity: [item?.quantity ?? 1, [Validators.required, Validators.min(1)]],
      sig: [item?.sig ?? '', Validators.required],
      frequency: [item?.frequency ?? ''],
      frequencyCode: [frequencyCode],
      duration: [item?.duration ?? ''],
      route: [item?.route ?? ''],
      routeDescription: [item?.routeDescription ?? ''],
      unitOfMeasure: [item?.unitOfMeasure ?? ''],
      unitOfMeasureDescription: [item?.unitOfMeasureDescription ?? ''],
      instructions: [item?.instructions ?? ''],
      isControlledSubstance: [item?.isControlledSubstance ?? false]
    });
  }

  private lookupDrugs(query: string): MockDrug[] {
    const needle = query.trim().toLowerCase();
    if (!needle) {
      return [];
    }
    return this.mockData
      .getMockDrugList()
      .filter((drug) =>
        [drug.medicineName, drug.genericName ?? ''].join(' ').toLowerCase().includes(needle)
      )
      .slice(0, 5);
  }

  private emitValue(): void {
    const items = this.itemControls.controls
      .map((control) => control.getRawValue())
      .filter((item) => item.medicineName && item.strength && item.sig)
      .map((item) => ({
        id: item.id as string,
        medicineName: item.medicineName as string,
        genericName: (item.genericName as string) || undefined,
        dosageForm: item.dosageForm as PrescriptionItem['dosageForm'],
        strength: item.strength as string,
        quantity: Number(item.quantity) || 1,
        sig: item.sig as string,
        frequency: (item.frequency as string) || undefined,
        frequencyCode: (item.frequencyCode as string) || undefined,
        duration: (item.duration as string) || undefined,
        route: (item.route as string) || undefined,
        routeDescription: (item.routeDescription as string) || undefined,
        unitOfMeasure: (item.unitOfMeasure as string) || undefined,
        unitOfMeasureDescription: (item.unitOfMeasureDescription as string) || undefined,
        instructions: (item.instructions as string) || undefined,
        isControlledSubstance: Boolean(item.isControlledSubstance)
      }));

    this.itemsChange.emit(items);
  }
}

function normalizeMasterCode(value: string | null | undefined): string {
  return value?.trim() ?? '';
}

function findFrequencyCode(
  frequency: string | undefined,
  options: MedicationFrequencyMaster[]
): string | undefined {
  const normalizedFrequency = frequency?.trim().toLowerCase();
  if (!normalizedFrequency) {
    return undefined;
  }

  const match = options.find((option) => option.dosage_desc.trim().toLowerCase() === normalizedFrequency);
  return match ? normalizeMasterCode(match.dosage_no) : undefined;
}
