import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, switchMap, tap, timer } from 'rxjs';
import { MockDataService } from '../../core/services/mock-data.service';
import {
  addAllergy,
  addFollowUp,
  addLabRequest,
  addLabResult,
  addPrescription,
  addPrescriptionSuccess,
  addVaccinationRecord,
  loadMedicalRecords,
  loadMedicalRecordsSuccess,
  lockConsultation,
  saveConsultation,
  saveConsultationSuccess,
  removeAllergy,
  updateConsultation,
  updateConsultationSuccess,
  updateAllergy
} from './medical-records.actions';

const buildId = (prefix: string, currentId?: string): string =>
  currentId && currentId.trim().length > 0 ? currentId : `${prefix}-${Date.now()}`;

@Injectable()
export class MedicalRecordsEffects {
  private readonly actions$ = inject(Actions);
  private readonly mockData = inject(MockDataService);

  loadMedicalRecords$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadMedicalRecords),
      switchMap(() =>
        timer(400).pipe(
          map(() =>
            loadMedicalRecordsSuccess({
              consultations: this.mockData.getConsultations(),
              prescriptions: this.mockData.getPrescriptions(),
              allergies: this.mockData.getAllergies(),
              labRequests: this.mockData.getLabRequests(),
              labResults: this.mockData.getLabResults(),
              vaccinations: this.mockData.getVaccinations(),
              followUps: this.mockData.getFollowUps()
            })
          )
        )
      )
    )
  );

  saveConsultation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(saveConsultation),
      switchMap(({ consultation }) => {
        const nextConsultation = {
          id: buildId('consult', consultation.id),
          bookingId: consultation.bookingId,
          patientId: consultation.patientId,
          doctorId: consultation.doctorId,
          consultationDate: consultation.consultationDate,
          consultationTime: consultation.consultationTime,
          chiefComplaint: consultation.chiefComplaint,
          subjective: consultation.subjective,
          objective: consultation.objective,
          assessment: consultation.assessment,
          plan: consultation.plan,
          vitalSigns: consultation.vitalSigns,
          diagnoses: consultation.diagnoses ?? [],
          prescriptionIds: consultation.prescriptionIds ?? [],
          labRequestIds: consultation.labRequestIds ?? [],
          followUpDate: consultation.followUpDate,
          status: consultation.status ?? 'Draft',
          isLocked: consultation.status === 'Completed' ? true : consultation.isLocked ?? false,
          createdAt: consultation.createdAt ?? new Date().toISOString(),
          updatedAt: consultation.updatedAt ?? new Date().toISOString(),
          historyOfPresentIllness: consultation.historyOfPresentIllness,
          peGeneralFindings: consultation.peGeneralFindings,
          visitSummaryUrl: consultation.visitSummaryUrl
        };

        return timer(400).pipe(
          map(() => {
            const saved = this.mockData.saveConsultation(nextConsultation);
            return saveConsultationSuccess({ consultation: saved });
          })
        );
      })
    )
  );

  updateConsultation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateConsultation),
      switchMap(({ consultation }) =>
        timer(250).pipe(
          map(() => {
            const saved = this.mockData.saveConsultation({
              ...consultation,
              updatedAt: consultation.updatedAt || new Date().toISOString()
            });
            return updateConsultationSuccess({ consultation: saved });
          })
        )
      )
    )
  );

  addPrescription$ = createEffect(() =>
    this.actions$.pipe(
      ofType(addPrescription),
      switchMap(({ prescription }) =>
        timer(350).pipe(
          map(() => {
            const nextPrescription = {
              ...prescription,
              id: buildId('rx', prescription.id),
              issuedAt: prescription.issuedAt ?? new Date().toISOString(),
              status: prescription.status ?? 'Active',
              items: (prescription.items ?? []).map((item, index) => ({
                ...item,
                id: item.id || `rx-item-${Date.now()}-${index + 1}`,
                medicineName: item.medicineName || item.genericName || ''
              }))
            };
            const saved = this.mockData.savePrescription(nextPrescription);
            return addPrescriptionSuccess({ prescription: saved });
          })
        )
      )
    )
  );

  lockConsultation$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(lockConsultation),
        tap(({ consultationId }) => {
          const consultation = this.mockData.getConsultationById(consultationId);
          if (consultation) {
            this.mockData.saveConsultation({
              ...consultation,
              isLocked: true,
              status: 'Locked' as const,
              updatedAt: new Date().toISOString()
            });
          }
        })
      ),
    { dispatch: false }
  );

  addAllergy$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(addAllergy),
        tap(({ allergy }) => {
          this.mockData.saveAllergy({
            ...allergy,
            id: buildId('allergy', allergy.id)
          });
        })
      ),
    { dispatch: false }
  );

  updateAllergy$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(updateAllergy),
        tap(({ allergy }) => {
          this.mockData.saveAllergy({
            ...allergy,
            id: buildId('allergy', allergy.id)
          });
        })
      ),
    { dispatch: false }
  );

  removeAllergy$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(removeAllergy),
        tap(({ allergyId }) => {
          this.mockData.removeAllergy(allergyId);
        })
      ),
    { dispatch: false }
  );

  addLabRequest$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(addLabRequest),
        tap(({ labRequest }) => {
          this.mockData.saveLabRequest({
            ...labRequest,
            id: buildId('labreq', labRequest.id),
            requestedAt: labRequest.requestedAt ?? new Date().toISOString(),
            status: labRequest.status ?? 'Requested'
          });
        })
      ),
    { dispatch: false }
  );

  addLabResult$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(addLabResult),
        tap(({ labResult }) => {
          this.mockData.saveLabResult({
            ...labResult,
            id: buildId('labres', labResult.id),
            resultDate: labResult.resultDate ?? new Date().toISOString()
          });
        })
      ),
    { dispatch: false }
  );

  addVaccinationRecord$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(addVaccinationRecord),
        tap(({ vaccinationRecord }) => {
          this.mockData.saveVaccinationRecord({
            ...vaccinationRecord,
            id: buildId('vac', vaccinationRecord.id)
          });
        })
      ),
    { dispatch: false }
  );

  addFollowUp$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(addFollowUp),
        tap(({ followUp }) => {
          this.mockData.saveFollowUp({
            ...followUp,
            id: buildId('fu', followUp.id)
          });
        })
      ),
    { dispatch: false }
  );
}
