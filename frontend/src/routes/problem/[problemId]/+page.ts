import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { getProblemById } from '$lib/problems';

export const load: PageLoad = ({ params }) => {
  const problem = getProblemById(params.problemId);
  if (!problem) {
    throw error(404, 'Problem not found');
  }

  return { problem };
};
