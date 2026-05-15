import { CanActivateFn } from '@angular/router';

export const firstLoginGuard: CanActivateFn = () => {
  console.warn('[Phase 1] firstLoginGuard is stubbed and always returns true.');
  return true;
};

