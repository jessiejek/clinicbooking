import { AuthUser } from '../../core/models';

const AUTH_USER_KEY = 'clinic-auth-user';
const AUTH_TOKEN_KEY = 'clinic-auth-token';

function getStorage(): Storage | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}

export function loadStoredAuthUser(): AuthUser | null {
  const storage = getStorage();
  if (!storage) {
    return null;
  }

  const raw = storage.getItem(AUTH_USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    storage.removeItem(AUTH_USER_KEY);
    return null;
  }
}

export function loadStoredAuthToken(): string | null {
  const storage = getStorage();
  return storage?.getItem(AUTH_TOKEN_KEY) ?? null;
}

export function saveAuthSession(user: AuthUser, token: string | null = null): void {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  storage.setItem(AUTH_USER_KEY, JSON.stringify(user));

  if (token) {
    storage.setItem(AUTH_TOKEN_KEY, token);
  } else {
    storage.removeItem(AUTH_TOKEN_KEY);
  }
}

export function clearAuthSession(): void {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  storage.removeItem(AUTH_USER_KEY);
  storage.removeItem(AUTH_TOKEN_KEY);
}
