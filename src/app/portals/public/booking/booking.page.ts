import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { MockDataService } from '../../../core/services/mock-data.service';
import { BookingWizardComponent } from '../components/booking-wizard/booking-wizard.component';
import { resetWizard, selectDoctor, selectService } from '../../../store/bookings/bookings.actions';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-booking-page',
  standalone: true,
  imports: [IonContent, BookingWizardComponent],
  template: `
    <ion-content>
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
  }
}
