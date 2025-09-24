import type { AuthState } from '$lib/stores/auth';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3000';

type FetchOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  token?: string;
  headers?: Record<string, string>;
};

export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers ?? {}),
  };

  const token = options.token;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    let message = response.statusText;
    try {
      const data = await response.json();
      if (data?.message) {
        message = Array.isArray(data.message) ? data.message.join(', ') : data.message;
      }
    } catch (error) {
      // ignore JSON parse errors and use status text instead
    }
    throw new Error(message);
  }

  return (await response.json()) as T;
}

export type AuthResponse = AuthState;
