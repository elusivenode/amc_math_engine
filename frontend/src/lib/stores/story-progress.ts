import { get, writable } from 'svelte/store';

const acknowledgedIds = writable<Set<string>>(new Set());

export function markStoryBeatAcknowledged(id: string | null | undefined): void {
  if (!id) return;
  acknowledgedIds.update((current) => {
    if (current.has(id)) return current;
    const next = new Set(current);
    next.add(id);
    return next;
  });
}

export function hasAcknowledgedStoryBeat(id: string | null | undefined): boolean {
  if (!id) return false;
  return get(acknowledgedIds).has(id);
}

export function resetAcknowledgedStoryBeats(): void {
  acknowledgedIds.set(new Set());
}
