import type { ProblemDefinition } from '../schema';
import diagramUrl from '$lib/problems/diagrams/diagram_AMC_junior_2001_q_13.png?url';

const tex = String.raw;

export const amc2001JuniorQ13: ProblemDefinition = {
  id: 'amc-2001-junior-q13',
  title: 'Angle Parallel Play',
  tagline: 'AMC 2001 Junior · Question 13',
  difficulty: 'Junior · AMC 2001 Q13',
  objectives: [
    'Use corresponding and complementary angles with parallel lines',
    'Apply the angle sum of a triangle to find an unknown angle'
  ],
  question:
    'In the diagram, lines PQ and RS are parallel. The angle at Q is 76° and the angle at S is 55°. What is the value of angle x?',
  diagram: {
    type: 'image',
    src: diagramUrl,
    alt: 'Diagram showing parallel lines PQ and RS with marked angles 76°, 55°, and x°.',
    caption: 'PQ ∥ RS with marked angles helping determine x.'
  },
  hints: [
    {
      title: 'Hint 1 · Drop a perpendicular',
      body: 'Because PQ ∥ RS, insert a perpendicular between the lines to create a right angle you can reuse.'
    },
    {
      title: 'Hint 2 · Complementary angle',
      body: 'At the top right you now have a right angle split by the 76° angle. What is 90° - 76°?'
    },
    {
      title: 'Hint 3 · Triangle sum',
      body: 'Inside the triangle touching RS you know two angles: the 55° from the diagram and the 14° you just found. Use the 180° sum to solve for x.'
    }
  ],
  solution: [
    {
      text: 'Draw a perpendicular through the point of intersection so you have a right angle between PQ and the new segment. Because PQ ∥ RS, that perpendicular also meets RS at 90°.'
    },
    {
      text: 'Within that right angle, the 76° given angle leaves a complementary acute angle of 90° − 76° = 14°.',
      expression: tex`90^{\circ} - 76^{\circ} = 14^{\circ}`
    },
    {
      text: 'In the triangle that includes the 55° angle on RS, the known angles are 55° and 14°. Subtract their sum from 180° to obtain x.',
      expression: tex`x = 180^{\circ} - (55^{\circ} + 14^{\circ}) = 111^{\circ}`
    },
    {
      text: 'Therefore angle x equals 111°, combining parallel-line relationships with the triangle angle sum.',
      expression: tex`x = 111^{\circ}`
    }
  ],
  answer: {
    type: 'numeric',
    value: 111,
    success: 'Correct — x = 111° once you account for the complementary angle and the triangle sum.',
    failure: 'Not quite. Revisit how the 76° angle complements the right angle and use the triangle sum again.'
  },
  metadata: {
    competition: 'AMC',
    division: 'Junior',
    year: 2001,
    questionNumber: 13
  }
};
