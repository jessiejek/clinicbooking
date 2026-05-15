import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TokenService {
  // Phase 1: in-memory stub only, no real JWT
  getAccessToken(): string | null {
    return null;
  }
}

