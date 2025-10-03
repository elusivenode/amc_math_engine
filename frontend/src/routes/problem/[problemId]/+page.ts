import type { PageLoad } from './$types';
import { getProblemById } from '$lib/problems';
import type { ProblemDefinition } from '$lib/problems';

type LoadOutput = {
  problemId: string;
  problem: ProblemDefinition | null;
  source: 'sample' | 'remote';
  pathSlug: string | null;
  problemOrder: number | null;
};

export const load = (({ params, url }) => {
  const { problemId } = params;
  const pathSlug = url.searchParams.get('path');
  const orderParam = url.searchParams.get('order');
  const parsedOrder = orderParam ? Number.parseInt(orderParam, 10) : null;
  const problemOrder = parsedOrder !== null && !Number.isNaN(parsedOrder) ? parsedOrder : null;
  const sampleProblem = getProblemById(problemId);

  if (sampleProblem) {
    return {
      problemId,
      problem: sampleProblem,
      source: 'sample' as const,
      pathSlug,
      problemOrder,
    };
  }

  return {
    problemId,
    problem: null,
    source: 'remote' as const,
    pathSlug,
    problemOrder,
  };
}) satisfies PageLoad<LoadOutput>;
