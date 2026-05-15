import { CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  console.warn('[Phase 1] authGuard is stubbed and always returns true.');
  return true;
};

