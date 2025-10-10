import { get, writable } from 'svelte/store';

const STORAGE_KEY = 'amc-math-subpath-celebrations';

function loadInitial(): Set<string> {
  if (typeof window === 'undefined') {
    return new Set<string>();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return new Set<string>();
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return new Set<string>();
    }

    return new Set(parsed.filter((item): item is string => typeof item === 'string'));
  } catch (error) {
    console.warn('Failed to read subpath celebrations from storage', error);
    return new Set<string>();
  }
}

const celebratedIds = writable<Set<string>>(loadInitial());

if (typeof window !== 'undefined') {
  celebratedIds.subscribe((value) => {
    try {
      const payload = JSON.stringify(Array.from(value));
      window.localStorage.setItem(STORAGE_KEY, payload);
    } catch (error) {
      console.warn('Failed to persist subpath celebrations', error);
    }
  });
}

export function markSubpathCelebrated(id: string | null | undefined): void {
  if (!id) return;

  celebratedIds.update((current) => {
    if (current.has(id)) {
      return current;
    }
    const next = new Set(current);
    next.add(id);
    return next;
  });
}

export function hasCelebratedSubpath(id: string | null | undefined): boolean {
  if (!id) return false;
  return get(celebratedIds).has(id);
}

export function resetSubpathCelebrations(): void {
  celebratedIds.set(new Set());
}
