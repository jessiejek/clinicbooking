import { CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  console.warn('Guard stub — Phase 2 will implement real logic');
  return true;
};
