import type { ProblemDefinition } from '../schema';

const tex = String.raw;

export const sequence20thTerm: ProblemDefinition = {
  id: 'sequence-20th-term',
  title: 'Arithmetic Ladder',
  tagline: 'Warm-up inspired by the Australian Mathematics Competition',
  difficulty: 'Junior · Warm-up',
  objectives: [
    'Identify the common difference of an arithmetic sequence',
    'Apply the nth-term formula'
  ],
  question: 'The sequence 1, 4, 7, ... increases by the same amount each time. What is the value of the 20th term?',
  hints: [
    {
      title: 'Step 1 · Spot the pattern',
      body: 'Write down the first few terms. How much is added each time you move to the next term?'
    },
    {
      title: 'Step 2 · Name the formula',
      body: 'An arithmetic sequence with first term a_1 and difference d satisfies',
      expression: tex`a_n = a_1 + (n - 1) \times d`
    },
    {
      title: 'Step 3 · Substitute values',
      body: 'Here a_1 = 1, d = 3, and n = 20. Plug these into the formula before simplifying.',
      expression: tex`a_{20} = 1 + (20 - 1) \times 3`
    }
  ],
  solution: [
    {
      text: 'The first term is 1 and each successive term increases by 3, so d = 3.'
    },
    {
      text: 'Use the nth-term formula for an arithmetic sequence.',
      expression: tex`a_n = a_1 + (n - 1) d`
    },
    {
      text: 'Substitute n = 20, a_1 = 1 and d = 3.',
      expression: tex`a_{20} = 1 + (20 - 1) \times 3`
    },
    {
      text: 'Evaluate the product and sum to reach the final value.',
      expression: tex`a_{20} = 1 + 19 \times 3 = 58`
    }
  ],
  answer: {
    type: 'numeric',
    value: 58,
    tolerance: 1e-6,
    success: 'Correct! You applied the arithmetic sequence formula cleanly.',
    failure: 'Not quite. Double-check the difference and your substitution into the formula.'
  },
  metadata: {
    competition: 'AMC',
    division: 'Junior',
    year: 2023,
    questionNumber: 0
  }
};
