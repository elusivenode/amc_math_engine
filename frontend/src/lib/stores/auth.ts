import { browser } from '$app/environment';
import { writable } from 'svelte/store';

export type AuthUser = {
  id: string;
  email: string;
  displayName?: string | null;
};

export type AuthState = {
  token: string;
  user: AuthUser;
};

const STORAGE_KEY = 'amc-auth';

function loadInitialState(): AuthState | null {
  if (!browser) return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as AuthState;
    if (!parsed?.token || !parsed?.user?.id) return null;
    return parsed;
  } catch (error) {
    console.warn('Failed to parse stored auth state', error);
    return null;
  }
}

export const authStore = writable<AuthState | null>(loadInitialState());

if (browser) {
  authStore.subscribe((value) => {
    if (!value) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  });
}

export function setAuth(state: AuthState): void {
  authStore.set(state);
}

export function clearAuth(): void {
  authStore.set(null);
}
