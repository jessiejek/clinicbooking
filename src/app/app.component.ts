import { Component, OnInit, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { AuthService } from './core/services/auth.service';
import { setUser } from './store/auth/auth.actions';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly authService = inject(AuthService);

  ngOnInit(): void {
    const user = this.authService.restoreSession();
    if (user) {
      this.store.dispatch(setUser({ user }));
    }
  }
}
