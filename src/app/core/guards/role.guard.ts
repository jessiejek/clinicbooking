import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take } from 'rxjs';
import { Role } from '../models';
import { selectUserRole } from '../../store/auth/auth.selectors';

export const roleGuard: CanActivateFn = (route) => {
  const store = inject(Store);
  const router = inject(Router);
  const allowedRoles = (route.data['roles'] ?? []) as Role[];
  return store.select(selectUserRole).pipe(
    take(1),
    map((role) => {
      if (!role || !allowedRoles.includes(role)) {
        return router.createUrlTree(['/auth/login']);
      }
      return true;
    })
  );
};
