import { Component, OnInit, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { ClinicSettingsService } from './core/services/clinic-settings.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  private readonly clinicSettingsService = inject(ClinicSettingsService);

  ngOnInit(): void {
    void this.clinicSettingsService.getSettings().subscribe({ error: () => undefined });
  }
}
