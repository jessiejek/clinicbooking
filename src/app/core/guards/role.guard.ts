import { CanActivateFn } from '@angular/router';

export const roleGuard: CanActivateFn = () => {
  console.warn('[Phase 1] roleGuard is stubbed and always returns true.');
  return true;
};

