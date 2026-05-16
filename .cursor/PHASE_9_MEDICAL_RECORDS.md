# PHASE 9 — Medical Records Module

## Clinic Management System · Angular 17 + Ionic 7 + NgRx
### AI Implementation Prompt Document

---

## PHASE IDENTITY

| Field | Value |
|---|---|
| Phase Number | 9 of 10 |
| Phase Name | Medical Records Module |
| Portals Affected | `/doctor/*`, `/admin/*`, `/patient/*` read-only refresh |
| Depends On | Phases 1–8 |
| Blocks | Phase 10 final polish |
| Estimated Complexity | Very High |
| Mock Data | Yes — NgRx + MockDataService only |
| Real API Calls | None |
| Git Tag | `phase-9-medical-records` |

---

## GOAL

Build the full mock medical records module for the MVP.

This phase turns the previous consultation stub into a working clinical workflow:

- Consultation form
- SOAP notes
- Vital signs
- BMI auto-calculation
- ICD-10 diagnosis search from local JSON
- Prescription creation
- Allergy warnings
- Lab request / lab result attachment UI
- Vaccination records
- Follow-up scheduling
- Admin/Doctor medical record history view
- Patient portal read-only medical records update

This is still mock/local data only. No backend, no file upload service, no real PDF generation.

---

## DO NOT MODIFY

- Do not rewrite existing portal layouts.
- Do not recreate existing shared components.
- Do not make HTTP calls.
- Do not implement real Cloudinary upload.
- Do not implement real ICD-10 API.
- Do not implement real prescription PDF generation.
- Do not add backend integration.
- Do not break patient portal read-only behavior.

Allowed updates:

- Replace Doctor consultation stub with real consultation page.
- Update Doctor appointment detail Start Consultation route.
- Update Admin patient-detail Medical Records tab.
- Update Patient medical records/prescriptions pages to read the new mock records.
- Add medical-records NgRx store.
- Add mock medical records helpers to MockDataService.

---

## FILES TO CREATE / UPDATE

```txt
src/app/store/medical-records/
├── medical-records.state.ts
├── medical-records.actions.ts
├── medical-records.reducer.ts
├── medical-records.effects.ts
└── medical-records.selectors.ts

src/app/portals/doctor/consultation/
├── doctor-consultation.page.ts
└── doctor-consultation.page.scss

src/app/portals/doctor/components/
├── vital-signs-form/
│   ├── vital-signs-form.component.ts
│   └── vital-signs-form.component.scss
├── soap-form/
│   ├── soap-form.component.ts
│   └── soap-form.component.scss
├── diagnosis-picker/
│   ├── diagnosis-picker.component.ts
│   └── diagnosis-picker.component.scss
├── prescription-builder/
│   ├── prescription-builder.component.ts
│   └── prescription-builder.component.scss
├── allergy-warning-banner/
│   ├── allergy-warning-banner.component.ts
│   └── allergy-warning-banner.component.scss
├── lab-request-form/
│   ├── lab-request-form.component.ts
│   └── lab-request-form.component.scss
├── follow-up-form/
│   ├── follow-up-form.component.ts
│   └── follow-up-form.component.scss
└── vitals-trend-chart/
    ├── vitals-trend-chart.component.ts
    └── vitals-trend-chart.component.scss

src/app/portals/admin/components/
├── medical-records-tab/
│   ├── medical-records-tab.component.ts
│   └── medical-records-tab.component.scss
└── consultation-timeline/
    ├── consultation-timeline.component.ts
    └── consultation-timeline.component.scss

src/assets/
└── icd10.json
```

Update:

```txt
src/app/portals/doctor/doctor.routes.ts
src/app/portals/doctor/appointment-detail/doctor-appointment-detail.page.ts
src/app/portals/admin/patient-detail/patient-detail.page.ts
src/app/portals/patient/medical-records/patient-medical-records.page.ts
src/app/portals/patient/prescriptions/patient-prescriptions.page.ts
src/app/core/services/mock-data.service.ts
src/app/app.config.ts
```

---

## DETAILED IMPLEMENTATION PROMPT

Copy everything below and paste into your AI coding tool.

```txt
You are building Phase 9 (Medical Records Module) of the Clinic Management System.

Phases 1–8 are complete.

CRITICAL RULES:
1. Angular 17 standalone components only.
2. Ionic 7 components.
3. Use Reactive Forms only.
4. Use NgRx for medical records state.
5. No HTTP calls.
6. ICD-10 search must read from local src/assets/icd10.json only.
7. Lab attachment is UI only. Store fake file name in mock state.
8. No real PDF generation.
9. Patient portal remains read-only.
10. No `any` TypeScript types.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 1 — MEDICAL RECORDS STORE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create:

src/app/store/medical-records/

medical-records.state.ts:

export interface MedicalRecordsState {
  consultations: Consultation[];
  prescriptions: Prescription[];
  allergies: Allergy[];
  labRequests: LabRequest[];
  labResults: LabResult[];
  vaccinations: VaccinationRecord[];
  followUps: FollowUp[];
  isLoading: boolean;
  error: string | null;
}

export const initialMedicalRecordsState: MedicalRecordsState = {
  consultations: [],
  prescriptions: [],
  allergies: [],
  labRequests: [],
  labResults: [],
  vaccinations: [],
  followUps: [],
  isLoading: false,
  error: null,
};

medical-records.actions.ts:

Create actions:
- loadMedicalRecords
- loadMedicalRecordsSuccess
- loadMedicalRecordsFailure
- saveConsultation
- saveConsultationSuccess
- updateConsultation
- updateConsultationSuccess
- lockConsultation
- addPrescription
- addPrescriptionSuccess
- addAllergy
- updateAllergy
- removeAllergy
- addLabRequest
- addLabResult
- addVaccinationRecord
- addFollowUp

medical-records.effects.ts:

- loadMedicalRecords$ reads from MockDataService with timer(400)
- saveConsultation$ generates id and saves to mock state
- addPrescription$ generates id and saves to mock state
- lab/vaccine/follow-up actions update mock state only

medical-records.selectors.ts:

- selectAllConsultations
- selectConsultationById(id)
- selectConsultationsByPatientId(patientId)
- selectConsultationsByDoctorId(doctorId)
- selectPrescriptionsByPatientId(patientId)
- selectPrescriptionsByConsultationId(consultationId)
- selectAllergiesByPatientId(patientId)
- selectLabResultsByPatientId(patientId)
- selectVaccinationsByPatientId(patientId)
- selectFollowUpsByPatientId(patientId)
- selectMedicalRecordsLoading

Register the feature store and effects in app.config.ts.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 2 — EXTEND / ALIGN MODELS IF MISSING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

If these interfaces do not exist in core/models/index.ts, add them.

Do not duplicate existing model names.

Required model shapes:

export interface Consultation {
  id: string;
  bookingId: string;
  patientId: string;
  doctorId: string;
  consultationDate: string;
  chiefComplaint: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  vitalSigns?: VitalSigns;
  diagnoses: Diagnosis[];
  prescriptionIds: string[];
  labRequestIds: string[];
  followUpDate?: string;
  status: 'Draft' | 'Completed' | 'Locked' | 'Amended';
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VitalSigns {
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  respiratoryRate?: number;
  temperatureCelsius?: number;
  oxygenSaturation?: number;
  weightKg?: number;
  heightCm?: number;
  bmi?: number;
}

export interface Diagnosis {
  id: string;
  code: string;
  description: string;
  type: 'Primary' | 'Secondary' | 'Differential';
}

export interface Prescription {
  id: string;
  consultationId: string;
  patientId: string;
  doctorId: string;
  issuedAt: string;
  status: 'Active' | 'Completed' | 'Cancelled';
  items: PrescriptionItem[];
}

export interface PrescriptionItem {
  id: string;
  medicineName: string;
  genericName?: string;
  dosageForm: 'Tablet' | 'Capsule' | 'Syrup' | 'Injection' | 'Cream' | 'Drops' | 'Others';
  strength: string;
  quantity: number;
  sig: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
  isControlledSubstance?: boolean;
}

export interface Allergy {
  id: string;
  patientId: string;
  allergen: string;
  reaction: string;
  severity: 'Mild' | 'Moderate' | 'Severe';
  notes?: string;
}

export interface LabRequest {
  id: string;
  consultationId: string;
  patientId: string;
  doctorId: string;
  testName: string;
  reason?: string;
  status: 'Requested' | 'Completed' | 'Cancelled';
  requestedAt: string;
}

export interface LabResult {
  id: string;
  labRequestId: string;
  patientId: string;
  fileName: string;
  resultDate: string;
  notes?: string;
}

export interface VaccinationRecord {
  id: string;
  patientId: string;
  vaccineName: string;
  doseNumber?: string;
  dateGiven: string;
  administeredBy?: string;
  remarks?: string;
}

export interface FollowUp {
  id: string;
  consultationId: string;
  patientId: string;
  doctorId: string;
  followUpDate: string;
  reason: string;
  status: 'Pending' | 'Completed' | 'Cancelled';
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 3 — MOCK DATA SERVICE ADDITIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Add methods to MockDataService if missing:

- getConsultations(): Consultation[]
- getPrescriptions(): Prescription[]
- getAllergies(): Allergy[]
- getLabRequests(): LabRequest[]
- getLabResults(): LabResult[]
- getVaccinations(): VaccinationRecord[]
- getFollowUps(): FollowUp[]
- getMockDrugList(): MockDrug[]
- saveConsultation(consultation: Consultation): Consultation
- savePrescription(prescription: Prescription): Prescription
- saveLabRequest(labRequest: LabRequest): LabRequest
- saveLabResult(labResult: LabResult): LabResult
- saveVaccinationRecord(record: VaccinationRecord): VaccinationRecord
- saveFollowUp(followUp: FollowUp): FollowUp

Mock allergy required:
- Patient pat-1 must have Penicillin allergy.
- Severity: Severe.
- Reaction: Rash and difficulty breathing.

Mock drug list:
- Paracetamol
- Amoxicillin
- Penicillin V
- Cetirizine
- Salbutamol
- Metformin
- Losartan
- Omeprazole

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 4 — LOCAL ICD-10 JSON
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create:

src/assets/icd10.json

Use at least 30 mock ICD-10 entries.

Example items:

[
  { "code": "J06.9", "description": "Acute upper respiratory infection, unspecified" },
  { "code": "I10", "description": "Essential primary hypertension" },
  { "code": "E11.9", "description": "Type 2 diabetes mellitus without complications" },
  { "code": "R50.9", "description": "Fever, unspecified" },
  { "code": "R05", "description": "Cough" }
]

The diagnosis search must filter by code OR description.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 5 — REPLACE DOCTOR CONSULTATION STUB WITH REAL PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Replace:

src/app/portals/doctor/consultation/doctor-consultation-stub.page.ts

With:

src/app/portals/doctor/consultation/doctor-consultation.page.ts

Route:
- /doctor/consultation/:bookingId

Page sections:
1. Header:
   - "Consultation"
   - Patient name
   - Booking ID
   - Appointment date/time
   - Save Draft button
   - Complete Consultation button

2. Patient summary card:
   - Age / sex
   - Allergies
   - Last visit
   - Existing conditions if available

3. Vitals:
   - VitalSignsFormComponent

4. SOAP:
   - SoapFormComponent
   - Chief complaint required

5. Diagnosis:
   - DiagnosisPickerComponent
   - Selected diagnoses displayed as chips
   - Primary diagnosis required before completion

6. Prescription:
   - PrescriptionBuilderComponent
   - AllergyWarningBannerComponent if medicine conflicts with allergies

7. Labs:
   - LabRequestFormComponent
   - Optional lab request list

8. Follow-up:
   - FollowUpFormComponent
   - Optional follow-up date and reason

9. Previous vitals:
   - VitalsTrendChartComponent using last 5 consultations

Behavior:
- Save Draft saves status Draft.
- Complete Consultation validates required fields and saves status Completed.
- Completed consultation isLocked = true.
- After completion, update booking status to Completed.
- Show toast: "Consultation completed."
- Navigate back to /doctor/appointments/:bookingId or patient detail.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 6 — VITAL SIGNS FORM COMPONENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create:

src/app/portals/doctor/components/vital-signs-form/

Reactive form fields:
- Blood pressure systolic
- Blood pressure diastolic
- Heart rate
- Respiratory rate
- Temperature Celsius
- Oxygen saturation
- Weight kg
- Height cm
- BMI read-only

BMI formula:
bmi = weightKg / ((heightCm / 100) * (heightCm / 100))

Display BMI to 1 decimal place.

Validation:
- Weight must be > 0 if entered
- Height must be > 0 if entered
- O2 saturation must be 0–100
- Temperature must be 30–45

Emit updated VitalSigns on form changes.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 7 — SOAP FORM COMPONENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create:

src/app/portals/doctor/components/soap-form/

Fields:
- Chief complaint required
- Subjective
- Objective
- Assessment
- Plan

Use Reactive Forms.

Output:
- Emit SOAP form value on change.
- Emit validity state.

If consultation is locked:
- Render form as read-only.
- Show BannerComponent:
  "This consultation is locked. Create an amendment for changes."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 8 — DIAGNOSIS PICKER COMPONENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create:

src/app/portals/doctor/components/diagnosis-picker/

Features:
- Search input
- Reads src/assets/icd10.json
- Filters by code or description
- Shows dropdown of matching results
- On select, adds diagnosis chip
- Diagnosis type dropdown: Primary | Secondary | Differential
- Remove diagnosis chip

Validation:
- At least one Primary diagnosis required before completing consultation.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 9 — PRESCRIPTION BUILDER COMPONENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create:

src/app/portals/doctor/components/prescription-builder/

Prescription form:
- Drug name input with typeahead from mock drug list
- Generic name optional
- Dosage form dropdown: Tablet | Capsule | Syrup | Injection | Cream | Drops | Others
- Strength input
- Quantity input
- Sig textarea
- Frequency input
- Duration input
- Instructions textarea
- Controlled substance checkbox
- Add another drug button
- Remove item button

Controlled substance:
- Show warning badge if checked.

Emit PrescriptionItem[] to parent.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 10 — ALLERGY WARNING BANNER COMPONENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create:

src/app/portals/doctor/components/allergy-warning-banner/

Inputs:
- allergies: Allergy[]
- prescriptionItems: PrescriptionItem[]

Logic:
- Case-insensitive substring match.
- If prescription item medicineName or genericName contains an allergy allergen, show warning.

Message:
"Allergy warning: Patient is allergic to Penicillin. Please review before prescribing."

User can dismiss warning, but warning reappears if offending medicine changes.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 11 — LAB REQUEST FORM COMPONENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create:

src/app/portals/doctor/components/lab-request-form/

Fields:
- Test name
- Reason
- Add request button

Common quick buttons:
- CBC
- Urinalysis
- Chest X-ray
- Fasting Blood Sugar
- Lipid Profile

Lab attachment UI:
- File input placeholder only
- Store selected file name only
- No upload

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 12 — FOLLOW-UP FORM COMPONENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create:

src/app/portals/doctor/components/follow-up-form/

Fields:
- Follow-up date
- Reason
- Optional reminder checkbox

Behavior:
- Creates mock FollowUp item if date and reason are provided.
- Follow-up appears in Phase 10 reports.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 13 — VITALS TREND CHART COMPONENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create:

src/app/portals/doctor/components/vitals-trend-chart/

Use ng-apexcharts.

Inputs:
- consultations: Consultation[]

Metrics:
- BP
- HR
- Weight
- O2Sat

Display:
- Last 5 consultations.
- Empty state if fewer than 2 consultations.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 14 — ADMIN PATIENT DETAIL MEDICAL RECORDS TAB
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Update Admin patient-detail Medical Records tab.

Replace Phase 5 stub with:

- Consultation timeline
- Prescriptions list
- Allergies list
- Lab results list
- Vaccination records
- Vitals trend summary

Admin can view records.
Admin cannot edit doctor SOAP notes.
Admin can add allergy/vaccination/lab result mock entry if needed.

Use:
- MedicalRecordsTabComponent
- ConsultationTimelineComponent

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 15 — PATIENT PORTAL READ-ONLY REFRESH
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Update:

- /patient/medical-records
- /patient/prescriptions

They must read from medical-records store instead of static local arrays.

Rules:
- Patient sees only own records.
- Patient cannot edit records.
- Patient cannot see other patients.
- Prescription PDF button remains a stub.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCOPE RULES — STRICTLY ENFORCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DO NOT implement:
- Real backend persistence
- Real file upload
- Real PDF generation
- Real ICD-10 API
- Real pharmacy integration
- Real lab integration
- Admin editing SOAP notes
- Patient editing medical records

DO implement:
- Consultation form
- SOAP notes
- Vital signs + BMI calculation
- ICD-10 local search
- Prescription builder
- Allergy warning
- Lab request/file-name UI
- Follow-up scheduling
- Medical records store
- Admin/doctor/patient record views

STOP when consultation can be saved and appears in doctor/admin/patient record views.
```

---

## VALIDATION CHECKLIST

```txt
[ ] Doctor clicks Start Consultation and real consultation form loads
[ ] Chief complaint is required
[ ] BMI auto-calculates from weight and height
[ ] ICD-10 search filters by code and description
[ ] Selected diagnosis appears as chip
[ ] Complete Consultation requires a Primary diagnosis
[ ] Prescription builder adds multiple medicines
[ ] Adding Penicillin for patient with Penicillin allergy shows warning
[ ] Controlled substance checkbox shows warning badge
[ ] Lab request can be added with mock file name
[ ] Follow-up can be scheduled
[ ] Save Draft stores consultation as Draft
[ ] Complete Consultation stores consultation as Completed and locked
[ ] Locked consultation renders read-only
[ ] Admin patient detail Medical Records tab shows consultation timeline
[ ] Patient medical records page shows completed consultation read-only
[ ] Patient prescriptions page shows prescription read-only
[ ] Vitals trend chart renders with mock data
[ ] ng serve has zero errors
```

---

## GIT COMMIT

```bash
git add .
git commit -m "phase-9: medical records — consultation form, prescriptions, vitals, ICD-10, allergy warning, labs"
git push
```

---

## STOP AFTER THIS PHASE

Wait for human validation and git commit before proceeding to Phase 10.
