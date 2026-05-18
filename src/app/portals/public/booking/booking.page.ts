import { Component, DestroyRef, OnInit, ViewChild, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { skip } from 'rxjs/operators';
import { MockDataService } from '../../../core/services/mock-data.service';
import { BookingWizardService } from '../../../core/services/booking-wizard.service';
import { BookingWizardComponent } from '../components/booking-wizard/booking-wizard.component';

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
  private readonly wizardService = inject(BookingWizardService);
  private readonly route = inject(ActivatedRoute);
  private readonly mockData = inject(MockDataService);
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild('scrollContainer', { static: true }) private content!: IonContent;

  ngOnInit(): void {
    this.wizardService.reset();

    const params = this.route.snapshot.queryParamMap;
    const serviceId = params.get('serviceId');
    const doctorIdParam = params.get('doctorId');
    const service = serviceId ? this.mockData.getServices().find((item) => item.id === serviceId) : null;
    const doctorId = doctorIdParam ?? service?.doctorIds[0] ?? null;

    if (doctorId) {
      this.wizardService.selectDoctor(doctorId);
    }

    if (serviceId) {
      this.wizardService.selectService(serviceId);
    }

    this.wizardService.currentStep$
      .pipe(skip(1), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.content.scrollToTop(300);
      });
  }
}
