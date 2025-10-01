import type { ProblemDefinition } from '../schema';

const tex = String.raw;

export const amc2001JuniorQ14: ProblemDefinition = {
  id: 'amc-2001-junior-q14',
  title: 'Average Booster',
  tagline: 'AMC 2001 Junior · Question 14',
  difficulty: 'Junior · AMC 2001 Q14',
  objectives: [
    'Combine statistics across multiple games',
    'Convert percentages to counts to solve a weighted average'
  ],
  question:
    'Bill scored 12 goals from 30 shots in the first netball game this year. His shooting average was 40%. Next game he had 10 shots and raised his average over both games to 50%. How many of these 10 shots in the second game were goals?',
  hints: [
    {
      title: 'Hint 1 · Count the total shots',
      body: 'How many total shots has Bill taken over both games?'
    },
    {
      title: 'Hint 2 · Translate the average',
      body: 'If he averaged 50% overall, how many of his total shots did he make?'
    },
    {
      title: 'Hint 3 · Focus on game 2',
      body: 'To reach 20 total goals, how many must he make from his 10 second-game shots?'
    }
  ],
  solution: [
    {
      text: 'After two games Bill has taken 30 + 10 = 40 shots in total.',
      expression: '30 + 10 = 40'
    },
    {
      text: 'A 50% average over 40 shots means he must have 0.5 × 40 = 20 goals in total.',
      expression: tex`0.5 \times 40 = 20`
    },
    {
      text: 'Bill already scored 12 goals in the first game, so he needs 20 - 12 = 8 more goals in the second game.',
      expression: '20 - 12 = 8'
    },
    {
      text: 'Therefore Bill scored goals on 8 of his 10 second-game shots.',
      expression: '8'
    }
  ],
  answer: {
    type: 'numeric',
    value: 8,
    success: 'Exactly — 8 successful shots in game two lift his average to 50%.',
    failure: 'Not quite. Recalculate the total goals needed for a 50% average over all shots.'
  },
  pathSlug: 'algebra-avengers',
  metadata: {
    competition: 'AMC',
    division: 'Junior',
    year: 2001,
    questionNumber: 14
  }
};
