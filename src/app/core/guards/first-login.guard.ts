import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take } from 'rxjs';
import { selectCurrentUser } from '../../store/auth/auth.selectors';

export const firstLoginGuard: CanActivateFn = () => {
  const store = inject(Store);
  const router = inject(Router);
  return store.select(selectCurrentUser).pipe(
    take(1),
    map((user) => {
      if (!user) {
        return router.createUrlTree(['/auth/login']);
      }
      if (user.isFirstLogin) {
        return router.createUrlTree(['/auth/set-password']);
      }
      return true;
    })
  );
};
