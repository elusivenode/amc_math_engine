import type { ProblemDefinition } from './schema';
import { sequence20thTerm } from './data/sequence-20th-term';
import { amc2001JuniorQ14 } from './data/amc-2001-junior-q14';

const problems: ProblemDefinition[] = [sequence20thTerm, amc2001JuniorQ14];

const problemsById = new Map<string, ProblemDefinition>(
  problems.map((problem) => [problem.id, problem])
);

export function getProblemById(id: string): ProblemDefinition | null {
  return problemsById.get(id) ?? null;
}

export function listProblems(): ProblemDefinition[] {
  return problems.slice();
}

export { type ProblemDefinition } from './schema';
