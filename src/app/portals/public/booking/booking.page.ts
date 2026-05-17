import { Component, DestroyRef, OnInit, ViewChild, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { skip } from 'rxjs/operators';
import { MockDataService } from '../../../core/services/mock-data.service';
import { BookingWizardComponent } from '../components/booking-wizard/booking-wizard.component';
import { resetWizard, selectDoctor, selectService } from '../../../store/bookings/bookings.actions';
import { selectCurrentStep } from '../../../store/bookings/bookings.selectors';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-booking-page',
  standalone: true,
  imports: [IonContent, BookingWizardComponent],
  template: `
    <ion-content #scrollContainer>
      <div class="booking-page-container page-enter">
        <app-booking-wizard></app-booking-wizard>
      </div>
    </ion-content>
  `,
  styleUrl: './booking.page.scss'
})
export class BookingPage implements OnInit {
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);
  private readonly mockData = inject(MockDataService);
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild('scrollContainer', { static: true }) private content!: IonContent;

  ngOnInit(): void {
    this.store.dispatch(resetWizard());

    const params = this.route.snapshot.queryParamMap;
    const serviceId = params.get('serviceId');
    const doctorIdParam = params.get('doctorId');
    const service = serviceId ? this.mockData.getServices().find((item) => item.id === serviceId) : null;
    const doctorId = doctorIdParam ?? service?.doctorIds[0] ?? null;

    if (doctorId) {
      this.store.dispatch(selectDoctor({ doctorId }));
    }

    if (serviceId) {
      this.store.dispatch(selectService({ serviceId }));
    }

    this.store
      .select(selectCurrentStep)
      .pipe(skip(1), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.content.scrollToTop(300);
      });
  }
}
