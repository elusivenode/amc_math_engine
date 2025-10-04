import { storyBeats } from './beats';
import type { StoryBeat } from './types';

export type { StoryBeat, StoryContext } from './types';

function sortBySequence(beats: StoryBeat[]): StoryBeat[] {
  return [...beats].sort((a, b) => a.sequence - b.sequence);
}

export function getStoryBeatForPath(pathSlug: string): StoryBeat | null {
  const beats = sortBySequence(
    storyBeats.filter((beat) => beat.pathSlug === pathSlug && beat.context === 'path'),
  );

  return beats[0] ?? null;
}

export function getStoryBeatForProblem(
  pathSlug: string,
  problemOrder?: number,
): StoryBeat | null {
  const beats = sortBySequence(
    storyBeats.filter((beat) => beat.pathSlug === pathSlug && beat.context === 'problem'),
  );

  if (beats.length === 0) {
    return null;
  }

  if (typeof problemOrder !== 'number') {
    return beats[0];
  }

  const exact = beats.find((beat) => beat.problemOrder === problemOrder);
  if (exact) {
    return exact;
  }

  const fallback = beats
    .filter((beat) => typeof beat.problemOrder === 'number' && (beat.problemOrder ?? 0) <= problemOrder)
    .sort((a, b) => (b.problemOrder ?? 0) - (a.problemOrder ?? 0))[0];

  return fallback ?? beats[beats.length - 1];
}

export function getStoryBeatByProblemId(pathSlug: string, problemId: string): StoryBeat | null {
  return (
    storyBeats.find(
      (beat) =>
        beat.pathSlug === pathSlug &&
        beat.context === 'problem' &&
        beat.problemId === problemId,
    ) ?? null
  );
}
