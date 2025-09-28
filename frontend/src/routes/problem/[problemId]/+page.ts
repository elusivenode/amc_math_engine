import type { PageLoad } from './$types';
import { getProblemById } from '$lib/problems';
import type { ProblemDefinition } from '$lib/problems';

type LoadOutput = {
  problemId: string;
  problem: ProblemDefinition | null;
  source: 'sample' | 'remote';
};

export const load = (({ params }) => {
  const { problemId } = params;
  const sampleProblem = getProblemById(problemId);

  if (sampleProblem) {
    return {
      problemId,
      problem: sampleProblem,
      source: 'sample' as const,
    };
  }

  return {
    problemId,
    problem: null,
    source: 'remote' as const,
  };
}) satisfies PageLoad<LoadOutput>;
