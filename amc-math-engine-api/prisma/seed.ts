// force reseed
import {
  PrismaClient,
  SubpathStage,
  LevelKind,
  Prisma,
} from '@prisma/client';

const prisma = new PrismaClient();

type LevelSeed = {
  order: number;
  kind: LevelKind;
  title: string;
  subtitle?: string;
  description?: string;
  estimatedMinutes?: number;
};

type SubpathSeed = {
  stage: SubpathStage;
  title: string;
  description?: string;
  order: number;
  levels: LevelSeed[];
};

type PathSeed = {
  slug: string;
  title: string;
  description?: string;
  themeColor?: string;
  order: number;
  subpaths: SubpathSeed[];
};

type ProblemSeed = {
  id: string;
  title: string;
  statement: string;
  solution: string;
  difficulty?: number;
  tags?: string[];
  metadata?: Prisma.JsonValue;
  hints: {
    order: number;
    content: string;
    isMajor?: boolean;
  }[];
};

const LEVEL_STAGE_POINTS: Record<SubpathStage, number> = {
  [SubpathStage.BASIC]: 3,
  [SubpathStage.INTERMEDIATE]: 4,
  [SubpathStage.ADVANCED]: 7,
  [SubpathStage.BOSS]: 10,
  [SubpathStage.FINAL]: 10,
};

const PROBLEM_SEEDS: Record<string, ProblemSeed[]> = {
  'algebra-avengers:BASIC:1': [
    {
      id: 'algebra-avengers-basic-1-problem-1',
      title: 'Simple linear equation.',
      statement: 'Solve for $x$ in the equation $3x + 5 = 20$.',
      solution:
        'Subtract 5 from both sides to get $3x = 15$. Dividing both sides by 3 gives $x = 5$.',
      difficulty: 1,
      tags: ['algebra', 'equations', 'AMC warm-up'],
      metadata: {
        tagline: 'Refresh your skills in isolating variables to unlock the later paths.',
        objectives: [
          'Use inverse operations to isolate a variable in a one-step equation.',
          'Translate the warm-up into clean algebraic reasoning to prepare for harder levels.',
        ],
        answer: {
          type: 'numeric',
          value: 5,
          success: 'Correct! You isolated the variable cleanly.',
          failure: 'Check each algebraic step — keep both sides balanced.',
          tolerance: 0,
        },
        solutionSteps: [
          {
            text: 'Subtract 5 from both sides to move the constant away from the $x$ term.',
            expression: '3x = 20 - 5',
          },
          {
            text: 'Simplify the right-hand side.',
            expression: '3x = 15',
          },
          {
            text: 'Divide both sides by 3 to isolate $x$.',
            expression: 'x = 5',
          },
        ],
      },
      hints: [
        {
          order: 1,
          content: 'Move the constant term by subtracting 5 from both sides of the equation.',
        },
        {
          order: 2,
          content: 'After you have $3x = 15$, divide both sides by 3 to isolate $x$.',
        },
      ],
    },
    {
      id: 'algebra-avengers-basic-1-problem-2',
      title: 'Dealing with brackets.',
      statement: 'Solve for $x$ in the equation $4(x-2) = 12$.',
      solution:
        'Divide both sides by 4 to get $x - 2 = 3$, then add 2 to both sides to obtain $x = 5$.',
      difficulty: 1,
      tags: ['algebra', 'equations', 'AMC warm-up'],
      metadata: {
        tagline: 'Practice isolating variables in a two-step linear equation.',
        objectives: [
          'Use inverse operations to undo multiplication and addition.',
          'Decide whether to distribute or divide first when simplifying.',
        ],
        answer: {
          type: 'numeric',
          value: 5,
          success: 'Correct! Dividing first keeps the arithmetic clean.',
          failure: 'Revisit each inverse operation and keep both sides balanced.',
          tolerance: 0,
        },
        solutionSteps: [
          {
            text: 'Divide both sides of the equation by 4 to remove the coefficient on the bracket.',
            expression: 'x - 2 = 3',
          },
          {
            text: 'Add 2 to both sides to isolate $x$.',
            expression: 'x = 5',
          },
        ],
      },
      hints: [
        {
          order: 1,
          content: 'Can you isolate $x$ by undoing what is happening to it?',
        },
        {
          order: 2,
          content:
            'Is it easier to distribute the 4 through the brackets, or divide both sides by 4 right away?',
        },
      ],
    },
    {
      id: 'algebra-avengers-basic-1-problem-3',
      title: 'x on both sides.',
      statement: 'Solve for $x$ in the equation $2x + 5 = x + 11$.',
      solution:
        'Collect the x\'s on one side to get $x = 6$.',
      difficulty: 1,
      tags: ['algebra', 'equations', 'AMC warm-up'],
      metadata: {
        tagline: 'What you do to one side, you must do to the other.',
        objectives: [
          'Do the same operation on both sides.',
        ],
        answer: {
          type: 'numeric',
          value: 6,
          success: 'Correct! That was easy!.',
          failure: 'Revisit the reshuffle and keep both sides balanced.',
          tolerance: 0,
        },
        solutionSteps: [
          {
            text: 'Subtract $x$ from both sides.',
            expression: '2x + 5 - x = x + 11 - x',
          },
          {
            text: 'Subtract 5 from both sides.',
            expression: '2x + 5 - x - 5 = x + 11 - x - 5',
          },
          {
            text: 'Tidy up.',
            expression: 'x = 6',
          },
        ],
      },
      hints: [
        {
          order: 1,
          content: 'We still want to isolate $x$ by doing the same operation on both sides of the equation.',
        },
        {
          order: 2,
          content:
            'You can do 2 \'tidy up\' steps at the same time if you like!',
        },
      ],
    },
    {
      id: 'algebra-avengers-basic-1-problem-4',
      title: 'Extract an equation',
      statement: 'Sam is 5 years older the Alex. The sum of their ages is 27. How old is Alex?',
      solution:
        'Create a variable and write down an equation capturing the situation - $(x + 5) + x = 27$.',
      difficulty: 1,
      tags: ['algebra', 'equations', 'AMC warm-up'],
      metadata: {
        tagline: 'Turn words into equations.',
        objectives: [
          'Create an equation then solve for variable of interest.',
        ],
        answer: {
          type: 'numeric',
          value: 11,
          success: 'Correct! Ok, time to ramp it up.',
          failure: 'Think about the last problem.  Your equation should be along those lines.',
          tolerance: 0,
        },
        solutionSteps: [
          {
            text: 'Let Alex\'s age = x.',
            expression: '(x + 5) + x = 27',
          },
          {
            text: 'Collect the x\'s and isolate them.',
            expression: '2x = 22',
          },
          {
            text: 'Divide both sides by 2.',
            expression: 'x = 11',
          },
        ],
      },
      hints: [
        {
          order: 1,
          content: 'Let\'s create some variables.  One for Sam and one for Alex?',
        },
        {
          order: 2,
          content:
            'Only need one variable that relates Sam\'s and Alex\'s age together!',
        },
        {
          order: 3,
          content:
            'Should the variable represent Sam\'s age or Alex\'s? Be guided by the problem.',
        },
      ],
    },
    {
      id: 'algebra-avengers-basic-1-problem-5',
      title: 'Scaling of variable',
      statement:
        'A notebook costs \\$3 and a pen costs \\$2. Sarah buys 4 notebooks and some pens, spending \\$22 in total. How many pens did she buy?',
      solution:
        'Create a variable and write down an equation capturing the situation - $4 \\times 3 + 2x = 22$.',
      difficulty: 1,
      tags: ['algebra', 'equations', 'AMC warm-up'],
      metadata: {
        tagline: 'Buying a collection of items cam be turned in an algebraic equation.',
        objectives: [
          'Create an equation that captures the impact of those coefficients.',
        ],
        answer: {
          type: 'numeric',
          value: 5,
          success: 'Correct! Now you cooking with gas!',
          failure: 'Think about the items purchased and in what amounts.',
          tolerance: 0,
        },
        solutionSteps: [
          {
            text: 'Let the number of pens = x.',
            expression: '4 x 3 + 2x = 22',
          },
          {
            text: 'Isolate the x\'s.',
            expression: '2x = 10',
          },
          {
            text: 'Divide both sides by 2.',
            expression: 'x = 5',
          },
        ],
      },
      hints: [
        {
          order: 1,
          content: 'What is the unknown of interest?  Set a variable for it.',
        },
        {
          order: 2,
          content:
            'Can you write an equation capturing the numerical meaning of the sentence?',
        },
        {
          order: 3,
          content:
            'Did you get 4 x 3 + 2x = 22?  Isolate x.',
        },
      ],
    },
    {
      id: 'algebra-avengers-basic-1-problem-6',
      title: 'Slipping in a fraction.',
      statement: 'Jack gives one third of his cricket cards, plus 7 of his footy cards to Emmett.  These are Emmett\'s first 15 cards. How many cricket cards did Jack begin with?',
      solution:
        'Create a variable and write down an equation capturing the situation - $x/3 + 7 = 15$.',
      difficulty: 2,
      tags: ['algebra', 'equations', 'AMC warm-up'],
      metadata: {
        tagline: 'Don\'t be put off by fractions.  Treat them as any other number.',
        objectives: [
          'Handle fractions correctly when manipulating an equation.',
        ],
        answer: {
          type: 'numeric',
          value: 24,
          success: 'Correct! That was generous of Jack!',
          failure: 'Did you let x be Jack\'s initial number of cricket cards?.',
          tolerance: 0,
        },
        solutionSteps: [
          {
            text: 'Let the x be the number of cricket cards that Jack started with.',
            expression: 'x/3 + 7 = 15',
          },
          {
            text: 'Isolate the x\'s.',
            expression: 'x/3 = 8',
          },
          {
            text: 'Multiply both sides by 3.',
            expression: 'x = 24',
          },
        ],
      },
      hints: [
        {
          order: 1,
          content: 'What is the unknown of interest?  Set a variable for it.',
        },
        {
          order: 2,
          content:
            'How can write an equation capturing that fraction of one third?',
        },
        {
          order: 3,
          content:
            'Did you get x / 3 + 7 = 15?  Isolate x.',
        },
      ],
    },
    {
      id: 'algebra-avengers-basic-1-problem-7',
      title: 'A bit more than a fraction.',
      statement: 'Leo gives away one quarter of his comic books and 5 more. He now has 40 left. How many comic books did he start with?',
      solution:
        'Create a variable and write down an equation capturing the situation - $x − (x/4 + 5) = 40$.',
      difficulty: 2,
      tags: ['algebra', 'equations', 'AMC warm-up'],
      metadata: {
        tagline: 'Don\'t be put off by fractions.  Treat them as any other number.',
        objectives: [
          'Handle fractions correctly when manipulating an equation.',
        ],
        answer: {
          type: 'numeric',
          value: 60,
          success: 'Correct! Nice manipulation of the equation.',
          failure: '$x - \\left(\\frac{x}{4} + 5\\right) = 40$ is the equation you need.',
          tolerance: 0,
        },
        solutionSteps: [
          {
            text: 'Let x be the number of comic books Leo started with.',
            expression: 'x − (x/4 + 5) = 40',
          },
          {
            text: 'Combine the x\'s.',
            expression: '(3/4)x - 5 = 40',
          },
          {
            text: 'Isolate x.',
            expression: '(3/4)x = 45',
          },
          {
            text: 'Solve for x.',
            expression: 'x = 60',
          },
        ],
      },
      hints: [
        {
          order: 1,
          content: 'Let x be the number of comic books Leo started with.',
        },
        {
          order: 2,
          content:
            ' Gives away one quarter and 5 more” means he loses x/4 + 5.',
        },
        {
          order: 3,
          content:
            'Write the equation: x − (x/4 + 5) = 40.',
        },
        {
          order: 4,
          content:
            'Simplify: (3/4)x − 5 = 40 ⇒ (3/4)x = 45 ⇒ x=60.',
        },
      ],
    },
    {
      id: 'algebra-avengers-basic-1-problem-8',
      title: 'A rectangular riddle.',
      statement:
        'A rectangle has a perimeter of 30 cm. Its length is 3 cm longer than its width. What is its area?',
      solution:
        'Use the perimeter formula $2(l + w) = 30$ with $l = w + 3$ to find the width and length, then calculate the area.',
      difficulty: 3,
      tags: ['algebra', 'geometry', 'equations', 'AMC junior'],
      metadata: {
        tagline: 'Connect geometry formulas with algebra to solve for dimensions.',
        objectives: [
          'Set up and solve an equation from a geometry formula.',
          'Translate a word problem into algebraic expressions.',
          'Compute area after solving for dimensions.'
        ],
        answer: {
          type: 'numeric',
          value: 54,
          success: 'Correct! The rectangle’s area is 54 cm².',
          failure: 'First find the width using $2\\bigl(w + (w + 3)\\bigr) = 30$.',
          tolerance: 0,
        },
        solutionSteps: [
          {
            text: 'Let the width be $w$. Then the length is $w + 3$.',
            expression: 'l = w + 3',
          },
          {
            text: 'Use the perimeter formula.',
            expression: '2(w + (w + 3)) = 30',
          },
          {
            text: 'Simplify and solve for $w$.',
            expression: '2(2w + 3) = 30 ⇒ 4w + 6 = 30 ⇒ 4w = 24 ⇒ w = 6',
          },
          {
            text: 'Find the length.',
            expression: 'l = w + 3 = 9',
          },
          {
            text: 'Compute the area.',
            expression: 'A = l × w = 9 × 6 = 54',
          },
        ],
      },
      hints: [
        {
          order: 1,
          content: 'Let the width be $w$. The length is then $w + 3$.',
        },
        {
          order: 2,
          content: 'Use the perimeter formula $2(l + w) = 30$.',
        },
        {
          order: 3,
          content: 'Substitute $l = w + 3$ and solve for $w$.',
        },
        {
          order: 4,
          content: 'Once you know the dimensions, calculate the area $A = l × w$.',
        },
      ],
    },
    {
      id: 'algebra-avengers-basic-1-problem-9',
      title: 'Counting heads and legs.',
      statement:
        'A farmer has chickens and sheep. Together they have 20 heads and 56 legs. How many chickens and how many sheep are there? Enter your answer as "chickens,sheep".',
      solution:
        'Use two equations: $c + s = 20$ (heads) and $2c + 4s = 56$ (legs). Solve for $c$ and $s$.',
      difficulty: 3,
      tags: ['algebra', 'systems of equations', 'AMC junior'],
      metadata: {
        tagline: 'Translate word problems into a system of equations.',
        objectives: [
          'Set up two equations from a real-world scenario.',
          'Apply substitution or elimination to solve a system.',
          'Interpret the solution in context (number of animals).'
        ],
        answer: {
          type: 'pair',
          expected: { first: 12, second: 8 },
          firstLabel: 'chickens',
          secondLabel: 'sheep',
          separator: ',',
          inputHint: 'Enter chickens first, then sheep, separated by a comma — for example: 1,2.',
          success: 'Correct! There are 12 chickens and 8 sheep.',
          failure: 'Not quite. Enter chickens first, then sheep (e.g. 1,2) and re-check the equations.',
        },
        solutionSteps: [
          {
            text: 'Let $c$ = number of chickens and $s$ = number of sheep.',
            expression: 'c + s = 20',
          },
          {
            text: 'Use the leg count equation.',
            expression: '2c + 4s = 56',
          },
          {
            text: 'Simplify the second equation by dividing through by 2.',
            expression: 'c + 2s = 28',
          },
          {
            text: 'Subtract the first equation $(c + s = 20)$ from $(c + 2s = 28)$.',
            expression: 's = 8',
          },
          {
            text: 'Substitute back to find chickens.',
            expression: 'c + 8 = 20 ⇒ c = 12',
          },
        ],
      },
      hints: [
        {
          order: 1,
          content: 'Each animal has 1 head, so $c + s = 20$.',
        },
        {
          order: 2,
          content: 'Each chicken has 2 legs, each sheep has 4 legs, so $2c + 4s = 56$.',
        },
        {
          order: 3,
          content: 'Try simplifying the second equation by dividing through by 2.',
        },
        {
          order: 4,
          content: 'Use elimination or substitution to solve the system.',
        },
      ],
    },
    {
      id: 'algebra-avengers-basic-1-problem-10',
      title: 'Fruity ratios.',
      statement:
        'In a fruit punch mix, the ratio of orange juice to pineapple juice is 3:2. If the mix contains 25 litres in total, how many litres of orange juice does it contain?',
      solution:
        'The ratio 3:2 means there are 5 equal parts in total. Each part is $25 ÷ 5 = 5$ litres. Orange juice takes 3 parts, so $3 × 5 = 15$ litres.',
      difficulty: 3,
      tags: ['algebra', 'ratios', 'proportions', 'AMC basic'],
      metadata: {
        tagline: 'Use ratios to divide a whole into parts.',
        objectives: [
          'Understand and work with ratios.',
          'Apply proportional reasoning to find quantities.',
          'Connect ratios with fractions of a whole.',
        ],
        answer: {
          type: 'numeric',
          value: 15,
          success: 'Correct! There are 15 litres of orange juice.',
          failure: 'First find the total number of parts: $3 + 2 = 5$. Each part is $25 ÷ 5 = 5$.',
          tolerance: 0,
        },
        solutionSteps: [
          {
            text: 'Add the parts in the ratio: $3 + 2 = 5$.',
            expression: 'total parts = 5',
          },
          {
            text: 'Work out how many litres each part is worth.',
            expression: '25 ÷ 5 = 5',
          },
          {
            text: 'Orange juice is 3 parts.',
            expression: '3 × 5 = 15',
          },
        ],
      },
      hints: [
        {
          order: 1,
          content: 'Add the ratio parts: $3 + 2 = 5$.',
        },
        {
          order: 2,
          content: 'Each part is worth $25 ÷ 5 = 5$ litres.',
        },
        {
          order: 3,
          content: 'Orange juice is 3 parts, so multiply $3 × 5$.',
        },
      ],
    },
    {
      id: 'algebra-avengers-basic-1-problem-11',
      title: 'Currency confusion.',
      statement:
        'Suppose an Australian dollar is worth 55 US cents. An Australian tourist in the USA buys an item worth US\\$100 and pays A\\$200. What should the change be in US\\$?',
      solution:
        'First convert the A\\$200 into US dollars: 200 × 0.55 = 110. The tourist spends 100, so the change should be 110 − 100 = 10 US dollars.',
      difficulty: 3,
      tags: ['algebra', 'rates', 'currency conversion', 'AMC junior'],
      metadata: {
        tagline: 'Work carefully with exchange rates to find equivalent values.',
        objectives: [
          'Convert between currencies using an exchange rate.',
          'Subtract costs to determine change.',
          'Check units carefully to avoid mistakes.'
        ],
        answer: {
          type: 'numeric',
          value: 10,
          success: 'Correct! The change is $10 US.',
          failure: 'First convert $A200 into US dollars: $200 × 0.55 = $110. Then subtract the cost $100.',
          tolerance: 0,
        },
        solutionSteps: [
          {
            text: 'Convert the Australian dollars into US dollars.',
            expression: '200 × 0.55 = 110',
          },
          {
            text: 'Subtract the cost of the item in US dollars.',
            expression: '110 − 100 = 10',
          },
          {
            text: 'So the change is $10 US.',
            expression: '10',
          },
        ],
      },
      hints: [
        {
          order: 1,
          content: 'Start by converting the $A200 into US dollars.',
        },
        {
          order: 2,
          content: 'Use the exchange rate: 1 AUD = 0.55 USD.',
        },
        {
          order: 3,
          content: 'Now subtract the item cost of $100 from the converted value.',
        },
      ],
    },
    {
      id: 'algebra-avengers-basic-1-problem-12',
      title: 'A walk in directions.',
      statement:
        'Mila walks 1 km east, then 2 km south, 3 km west and finally 4 km north. How far is she from her starting point?',
      solution:
        'Track her net movement: East – West = 1 − 3 = −2 km (2 km west). North – South = 4 − 2 = 2 km (2 km north). Her displacement is the diagonal of a right triangle with sides 2 and 2, so distance = √(2² + 2²) = √8 = 2√2 km.',
      difficulty: 4,
      tags: ['algebra', 'geometry', 'Pythagoras', 'AMC junior'],
      metadata: {
        tagline: 'Use coordinates or Pythagoras’ theorem to calculate displacement.',
        objectives: [
          'Represent movements east/west and north/south as net displacements.',
          'Form a right triangle with the displacements as legs.',
          'Apply Pythagoras’ theorem to compute the final distance.'
        ],
        answer: {
          type: 'numeric',
          value: 2.828,
          success: 'Correct! Mila ends up about 2.83 km from her starting point.',
          failure: 'First find net movements: 2 km west, 2 km north. Then apply Pythagoras: √(2² + 2²).',
          tolerance: 0.01,
          supportsRadicals: true,
          inputHint: 'Use √ to enter radical forms like √8 or 2√2, or give a decimal to two decimal places.',
        },
        solutionSteps: [
          {
            text: 'Compute net east – west movement.',
            expression: '1 − 3 = − 2 (2 km west)',
          },
          {
            text: 'Compute net north – south movement.',
            expression: '4 − 2 = 2 (2 km north)',
          },
          {
            text: 'Form a right triangle with legs 2 and 2.',
            expression: 'legs = 2, 2',
          },
          {
            text: 'Apply Pythagoras’ theorem.',
            expression: '√(2² + 2²) = √8 = 2√2',
          },
          {
            text: 'Simplify result.',
            expression: '≈ 2.83 km',
          },
        ],
      },
      hints: [
        {
          order: 1,
          content: 'First find Mila’s net east–west movement.',
        },
        {
          order: 2,
          content: 'Then find her net north–south movement.',
        },
        {
          order: 3,
          content: 'Draw a right triangle using these net displacements.',
        },
        {
          order: 4,
          content: 'Use Pythagoras: √(a² + b²).',
        },
      ],
    },
    {
      id: 'algebra-avengers-basic-1-problem-13',
      title: 'Altitude of the 12-16-20 triangle.',
      statement:
        'In the triangle shown, the sides measure 16, 12, and 20 units as labelled. The height $h$ is drawn perpendicular to the base of length 20. Find the value of $h$.',
      solution:
        'Use the area of the right triangle to compute the altitude: $\\tfrac{1}{2} × 12 × 16 = 96$. Then $\\tfrac{1}{2} × 20 × h = 96$, giving $h = \\tfrac{192}{20} = 9.6$.',
      difficulty: 4,
      tags: ['algebra', 'geometry', 'area', 'AMC junior'],
      metadata: {
        tagline: 'Relate a right triangle’s area to the altitude on the hypotenuse.',
        objectives: [
          'Recall that two expressions for the area of the same triangle must match.',
          'Use the altitude-on-hypotenuse formula $h = \\frac{ab}{c}$ for a right triangle if you remember it.',
          'Solve a simple equation after equating the two area expressions.'
        ],
        diagram: {
          type: 'image',
          src: '/problems/algebra/basic/problem-13.png',
          alt: 'Right triangle with sides 16, 12, and 20 units and altitude h drawn to the base.',
          caption: 'Use the area of the 12-16-20 right triangle to determine the altitude on the hypotenuse.'
        },
        answer: {
          type: 'numeric',
          value: 9.6,
          tolerance: 0.01,
          success: 'Correct! Equating the two area expressions gives $h = 9.6$.',
          failure: 'Remember that the same triangle area can be written as $\\tfrac{1}{2}ab$ or $\\tfrac{1}{2}ch$ for a right triangle.',
          supportsRadicals: false,
          inputHint: 'Enter a decimal or fraction equivalent eg. 1.3'
        },
        solutionSteps: [
          {
            text: 'Compute the area using the legs that form the right angle.',
            expression: '\\tfrac{1}{2} × 12 × 16 = 96',
          },
          {
            text: 'Express the same area using the hypotenuse (length 20) and altitude $h$.',
            expression: '\\tfrac{1}{2} × 20 × h = 96',
          },
          {
            text: 'Solve the equation for $h$.',
            expression: 'h = \\frac{192}{20} = 9.6',
          },
        ],
      },
      hints: [
        {
          order: 1,
          content: 'Compute the area using the two legs that meet at the right angle.',
        },
        {
          order: 2,
          content: 'The same area can also be written as $\\tfrac{1}{2} \\times$ (base) $\\times$ (height).',
        },
        {
          order: 3,
          content: 'Set $\\tfrac{1}{2} × 12 × 16$ equal to $\\tfrac{1}{2} × 20 × h$ and solve for $h$.',
        },
      ],
    },
    {
      id: 'algebra-avengers-basic-1-problem-14',
      title: 'Hanako’s Marble Puzzle',
      statement:
        'Hanako has a bag that holds only black and white marbles. The ratio of black marbles to the total number of marbles is 2:5. If Hanako adds 4 black marbles and takes out 10 white marbles, there will be twice as many black marbles as white marbles. How many marbles did Hanako start with?',
      solution:
        'Let b be the number of black marbles and w be the number of white marbles. From the ratio, b/(b+w) = 2/5, which simplifies to 3b = 2w. After the change, (b+4)/(w−10) = 2, which gives b+4 = 2w−20. Solving these two equations gives b = 12 and w = 18. So Hanako started with 30 marbles.',
      difficulty: 4,
      tags: ['algebra', 'ratios', 'word problems', 'AMC junior'],
      metadata: {
        tagline: 'Use simultaneous equations from ratio conditions to find the initial marble counts.',
        objectives: [
          'Translate ratio conditions into algebraic equations.',
          'Apply changes to both black and white marbles.',
          'Solve simultaneous equations to find the unknowns.'
        ],
        answer: {
          type: 'numeric',
          value: 30,
          success: 'Correct! Hanako started with 30 marbles.',
          failure: 'Form the equations: 3b = 2w and b + 4 = 2w − 20. 2 equations, 2 unknowns.',
          tolerance: 0,
        },
        solutionSteps: [
          {
            text: 'Let b be the number of black marbles and w be the number of white marbles.',
            expression: 'b, w',
          },
          {
            text: 'Use the ratio: b / (b + w) = 2/5.',
            expression: '3b = 2w',
          },
          {
            text: 'After the change: (b + 4) / (w − 10) = 2.',
            expression: 'b + 4 = 2w − 20',
          },
          {
            text: 'Now you have 2 equations with 2 unknowns.',
            expression: '3b = 2w and b + 4 = 2w − 20',
          },
          {
            text: 'Substitute: b + 4 = 3b − 20.',
            expression: 'b + 4 = 3b − 20',
          },
          {
            text: 'Solve to find b = 12 and w = 18. Total marbles to start = 30.',
            expression: 'b = 12, w = 18, b + w = 30',
          }
        ],
      },
      hints: [
        {
          order: 1,
          content: 'Let b be black marbles and w be white marbles.',
        },
        {
          order: 2,
          content: 'Translate the ratio condition: b/(b+w) = 2/5.',
        },
        {
          order: 3,
          content: 'Translate the change condition: (b+4)/(w−10) = 2, then solve the two equations and add the two unknowns to get the total number of marbles.',
        },
      ],
    },
    {
      id: 'algebra-avengers-basic-1-problem-15',
      title: 'Coffee and Milk Mix-up',
      statement:
        'Hamish and Becky each bought 100 ml of coffee in a 150 ml cup. Hamish drank 20 ml of his coffee and then added 20 ml of milk. Becky added 20 ml of milk, stirred the coffee well, and then drank 20 ml. What is the resulting ratio of the amount of milk in Hamish\'s coffee to that in Becky\'s coffee? Submit your answer in the form hamish_milk:becky_milk.',
      solution:
        'Hamish: He drank 20 ml of pure coffee, leaving 80 ml of coffee. Then he added 20 ml of milk, giving 80 ml coffee and 20 ml milk. So his final milk amount is 20 ml. Becky: She added 20 ml of milk first, so her cup had 100 ml coffee + 20 ml milk = 120 ml total. Then she drank 20 ml of this mixture, which removed coffee and milk in the same proportion (coffee:milk = 100:20 = 5:1). So she drank away (100/120)×20 = 16.67 ml coffee and (20/120)×20 = 3.33 ml milk. Leftover = 83.33 ml coffee + 16.67 ml milk. So Becky has about 16.67 ml milk. The ratio of Hamish’s milk to Becky’s milk is 20:16.67, which simplifies to 6:5.',
      difficulty: 4,
      tags: ['algebra', 'ratios', 'mixtures', 'AMC junior'],
      metadata: {
        tagline: 'Compare how different mixing and drinking orders affect the final amount of milk.',
        objectives: [
          'Track step-by-step changes in volume for each person.',
          'Use proportional reasoning when removing a mixed solution.',
          'Compare final quantities to find a ratio.'
        ],
        answer: {
          type: 'ratio',
          format: 'hamish_milk:becky_milk',
          value: '6:5',
          success: 'Correct! Hamish has 20 ml milk and Becky has 16.67 ml milk, so the ratio is 6:5.',
          failure: 'Carefully track the amounts. Answer should be written as hamish_milk:becky_milk.',
          tolerance: 0,
        },
        solutionSteps: [
          {
            text: 'Let’s consider Hamish first. He drinks 20 ml of pure coffee, leaving 80 ml coffee.',
            expression: '80 ml coffee',
          },
          {
            text: 'Hamish adds 20 ml milk.',
            expression: '80 ml coffee + 20 ml milk',
          },
          {
            text: 'Now consider Becky. She adds 20 ml milk first: 100 ml coffee + 20 ml milk = 120 ml mixture.',
            expression: '100 ml coffee + 20 ml milk',
          },
          {
            text: 'Becky drinks 20 ml of the mixture, which is 1/6 milk and 5/6 coffee.',
            expression: 'removes 16.67 ml coffee and 3.33 ml milk',
          },
          {
            text: 'So Becky has left 83.33 ml coffee + 16.67 ml milk.',
            expression: '83.33 ml coffee + 16.67 ml milk',
          },
          {
            text: 'Compare final milk amounts: Hamish 20 ml, Becky 16.67 ml, ratio 20:16.67 = 6:5.',
            expression: 'hamish_milk:becky_milk = 6:5',
          }
        ],
      },
      hints: [
        {
          order: 1,
          content: 'Work out Hamish’s situation first: he drinks coffee before adding milk. What is his ratio of milk:coffee after he adds the milk?',
        },
        {
          order: 2,
          content: 'Becky adds the milk first and mixes throughly. What is the ratio of milk:coffee for her? It will remain so after she drinks 20ml.',
        },
        {
          order: 3,
          content: 'After they have both drunk, each has 100ml in their cup.  Hamish 1:4 and Becky 1:5 ... coffee to milk. How can you assess the ratio of amount of milk, hamish:becky?',
        },
        {
          order: 4,
          content: 'Consider each has 100ml total. Therefore you know ml of milk given earlier ratios.',
        },
      ],
    },
  ],
  'algebra-avengers:INTERMEDIATE:1': [
    {
      id: 'algebra-avengers-intermediate-1-problem-1',
      title: 'Exponent Shenanigans',
      statement:
        'Evaluate $(-216/125)^{-2/3}$. Give your answer as a simplified fraction.',
      solution:
        'We start with $(-216/125)^{-2/3}$. Notice that $-216/125 = (-6/5)^3$. Therefore $(-216/125)^{-2/3} = [(-6/5)^3]^{-2/3}$. Using the law $(a^m)^n = a^{mn}$, this simplifies to $(-6/5)^{-2}$. A negative exponent means we take the reciprocal: $1 / [(-6/5)^2]$. Squaring gives $(-6/5)^2 = 36/25$. Taking the reciprocal gives $25/36$. So the final answer is $25/36$.',
      difficulty: 5,
      tags: ['algebra', 'exponents', 'fractional exponents', 'AMC intermediate'],
      metadata: {
        tagline: 'Apply the laws of exponents to simplify a rational base with a fractional exponent.',
        objectives: [
          'Recognize a rational number as a perfect cube.',
          'Apply the rule $(a^m)^n = a^{mn}$ with fractional exponents.',
          'Handle negative exponents correctly by taking reciprocals.',
          'Simplify the resulting fraction to lowest terms.'
        ],
        answer: {
          type: 'fraction',
          format: 'a/b',
          value: '25/36',
          success: 'Correct! $(-216/125)^{-2/3}$ simplifies to $25/36$.',
          failure: 'Check the cube root and the negative exponent carefully. Make sure your answer is in simplest fractional form.',
          tolerance: 0,
        },
        solutionSteps: [
          {
            text: 'Rewrite the base: $-216/125 = (-6/5)^3$.',
            expression: '(-6/5)^3',
          },
          {
            text: 'Apply the exponent: $[(-6/5)^3]^{-2/3}$.',
            expression: '(-6/5)^{3 \times (-2/3)}',
          },
          {
            text: 'Simplify the exponents: $3 \times (-2/3) = -2$.',
            expression: '(-6/5)^{-2}',
          },
          {
            text: 'Apply the negative exponent rule: $a^{-n} = 1 / (a^n)$.',
            expression: '1 / [(-6/5)^2]',
          },
          {
            text: 'Compute the square: $(-6/5)^2 = 36/25$.',
            expression: '36/25',
          },
          {
            text: 'Take the reciprocal: $1 / (36/25) = 25/36$.',
            expression: '25/36',
          }
        ],
      },
      hints: [
        {
          order: 1,
          content: 'Try to express $-216/125$ as a perfect cube. What fraction raised to the third power gives this?',
        },
        {
          order: 2,
          content: 'Apply the exponent law $(a^m)^n = a^{mn}$. What do you get when you multiply $3$ by $-2/3$?',
        },
        {
          order: 3,
          content: 'A negative exponent means take the reciprocal. What happens to $(-6/5)^{-2}$?',
        },
        {
          order: 4,
          content: 'Simplify the reciprocal to get the final fraction.',
        },
      ],
    },
    {
      id: 'algebra-avengers-intermediate-1-problem-2',
      title: 'Tiny Percent, Big Power',
      statement: 'What is $0.032\\%$ of $5^5$?',
      solution:
        'We start with $5^5 = 3125$. To find $0.032\\%$ of this number, recall that $1\\% = 1/100$, so $0.032\\% = 0.032/100 = 0.00032$. Then $0.00032 \\times 3125 = 1.0$. Therefore, $0.032\\%$ of $5^5$ is exactly $1$.',
      difficulty: 4,
      tags: ['algebra', 'percentages', 'powers', 'AMC intermediate'],
      metadata: {
        tagline: 'Convert a small percentage into a decimal and apply it to a power of 5.',
        objectives: [
          'Convert a percentage with a decimal to its fractional or decimal form.',
          'Evaluate powers of whole numbers.',
          'Apply multiplication of a decimal by an integer.',
          'Recognize exact simplifications that yield whole numbers.'
        ],
        answer: {
          type: 'numeric',
          value: 1,
          success: 'Correct! $0.032\\%$ of $5^5$ is $1$.',
          failure: 'Remember to divide the percentage by $100$ twice—once for the percent sign, and once to convert $0.032\\% \\times 5^5$ into a decimal multiplication.',
          tolerance: 0,
        },
        solutionSteps: [
          {
            text: 'Interpret the expression as $0.032\\% \\times 5^5$.',
            expression: '0.032\\% \\times 5^5',
          },
          {
            text: 'Rewrite the percent: $0.032\\% = \\frac{32}{10^5}$, so the product becomes $\\frac{32}{10^5} \\times 5^5$.',
            expression: '\\frac{32}{10^5} \\times 5^5',
          },
          {
            text: 'Use $32 = 2^5$ to write $\\frac{32}{10^5} \\times 5^5 = \\frac{2^5}{10^5} \\times 5^5$.',
            expression: '\\frac{2^5}{10^5} \\times 5^5',
          },
          {
            text: 'Combine the powers of $2$ and $5$: $\\frac{2^5 \\cdot 5^5}{10^5} = \\frac{10^5}{10^5} = 1$.',
            expression: '1',
          }
        ],
      },
      hints: [
        {
          order: 1,
          content: 'Interpret the problem as the expression $0.032\\% \\times 5^5$.',
        },
        {
          order: 2,
          content:
            'Be careful with the percent sign. Rewrite $0.032\\% \\times 5^5$ as $\\frac{32}{10^5} \\times 5^5$; there is a factor of $\\frac{1}{10^3}$ in $0.032$ and another $\\frac{1}{10^2}$ coming from the percent.',
        },
        {
          order: 3,
          content:
            'Since $32 = 2^5$, you have $\\frac{32}{10^5} \\times 5^5 = \\frac{2^5}{10^5} \\times 5^5$.',
        },
        {
          order: 4,
          content: 'The resulting product should simplify all the way to $1$.',
        }
      ]
    },
    {
      "id": "algebra-avengers-intermediate-1-problem-3",
      "title": "Exponent Substitution",
      "statement": "If $3^{x - 1} = 2$, what is the value of $9^{x + 1}$?",
      "solution": "We start with $3^{x - 1} = 2$. Rewrite this as $3^x / 3 = 2$, which gives $3^x = 6$. Next, note that $9^{x + 1} = 9^x \\times 9$. Since $9 = 3^2$, we can write $9^x = (3^2)^x = (3^x)^2$. Substituting $3^x = 6$, we get $9^{x + 1} = (3^x)^2 \\times 9 = 6^2 \\times 9 = 36 \\times 9 = 324$. Thus, $9^{x + 1} = 324.$",
      "difficulty": 5,
      "tags": ["algebra", "exponents", "substitution", "AMC intermediate"],
      "metadata": {
        "tagline": "Use exponent laws and substitution to connect two exponential expressions.",
        "objectives": [
          "Manipulate powers with variable exponents using exponent laws.",
          "Express one exponential base in terms of another.",
          "Substitute known expressions to simplify.",
          "Evaluate the resulting numeric expression."
        ],
        "answer": {
          "type": "numeric",
          "value": 324,
          "success": "Correct! $9^{x + 1} = 324.$",
          "failure": "This is a tricky one. Remember your exponent rules: $(a^m)^n = a^{mn}$, $a^m \\cdot a^n = a^{m + n}$, and $a^{-n} = \\frac{1}{a^n}$.",
          "tolerance": 0
        },
        "solutionSteps": [
          {
            "text": "Rewrite $3^{x - 1}$ as $\\frac{3^x}{3}$.",
            "expression": "3^{x - 1} = \\frac{3^x}{3}"
          },
          {
            "text": "Multiply both sides by $3$ to get $3^x = 6.$",
            "expression": "3^x = 6"
          },
          {
            "text": "Rewrite $9^{x + 1}$ as $9^x \\times 9.$",
            "expression": "9^{x + 1} = 9^x \\times 9"
          },
          {
            "text": "Since $9 = 3^2$, replace it: $9^x = (3^2)^x.$",
            "expression": "(3^2)^x \\times 9"
          },
          {
            "text": "Simplify using the power rule: $(3^2)^x = (3^x)^2.$",
            "expression": "(3^x)^2 \\times 9"
          },
          {
            "text": "Substitute $3^x = 6$: $(3^x)^2 \\times 9 = 6^2 \\times 9 = 36 \\times 9 = 324.$",
            "expression": "9^{x + 1} = 324"
          }
        ]
      },
      "hints": [
        {
          "order": 1,
          "content": "Rewrite $3^{x - 1}$ in a simpler form. Can you express it as $\\frac{3^x}{3}$?"
        },
        {
          "order": 2,
          "content": "Multiply both sides by $3$ to isolate $3^x.$"
        },
        {
          "order": 3,
          "content": "Express $9^{x + 1}$ as $9^x \\times 9.$"
        },
        {
          "order": 4,
          "content": "Since $9 = 3^2$, rewrite $9^x$ as $(3^2)^x = (3^x)^2.$"
        },
        {
          "order": 5,
          "content": "Now substitute $3^x = 6$ and simplify to find the final value."
        }
      ]
    },
    {
      "id": "algebra-avengers-intermediate-1-problem-4",
      "title": "Radical Balancing Act",
      "statement": "Evaluate $\\sqrt{50} + \\sqrt{32} + 2\\sqrt{8} - \\sqrt{338}$.",
      "solution": "Factor $2$ out from each radicand to expose perfect squares: $\\sqrt{50} = \\sqrt{2 \\cdot 25}$, $\\sqrt{32} = \\sqrt{2 \\cdot 16}$, $2\\sqrt{8} = 2\\sqrt{2 \\cdot 4}$, and $\\sqrt{338} = \\sqrt{2 \\cdot 169}$. Simplifying the perfect squares yields $5\\sqrt{2} + 4\\sqrt{2} + 4\\sqrt{2} - 13\\sqrt{2}$. Factoring out $\\sqrt{2}$ gives $\\sqrt{2} (5 + 4 + 4 - 13) = \\sqrt{2} \\cdot 0 = 0$. Therefore, the expression evaluates to $0$.",
      "difficulty": 4,
      "tags": ["algebra", "radicals", "simplification", "AMC intermediate"],
      "metadata": {
        "tagline": "Combine square roots by exposing common radicals and simplifying perfect squares.",
        "objectives": [
          "Factor constants from radicands to identify common radicals.",
          "Recognize and simplify perfect squares within square roots.",
          "Factor common radical terms to combine like terms.",
          "Evaluate the resulting simplified expression."
        ],
        "answer": {
          "type": "numeric",
          "value": 0,
          "success": "Correct! $\\sqrt{50} + \\sqrt{32} + 2\\sqrt{8} - \\sqrt{338} = 0.$",
          "failure": "Rewrite each radical as $\\sqrt{2\\cdot k}$ for some perfect square $k$, simplify the roots, and then combine the like terms carefully.",
          "tolerance": 0,
          "supportsRadicals": true,
          "inputHint": "Tap the √ button to enter radicals like √2 or 2√5, or submit the simplified value."
        },
        "solutionSteps": [
          {
            "text": "Factor $2$ out from each radicand: $\\sqrt{50} = \\sqrt{2 \\cdot 25}$, $\\sqrt{32} = \\sqrt{2 \\cdot 16}$, $2\\sqrt{8} = 2\\sqrt{2 \\cdot 4}$, and $\\sqrt{338} = \\sqrt{2 \\cdot 169}$.",
            "expression": "\\sqrt{2 \\cdot 25} + \\sqrt{2 \\cdot 16} + 2\\sqrt{2 \\cdot 4} - \\sqrt{2 \\cdot 169}"
          },
          {
            "text": "Simplify the perfect squares: $\\sqrt{2 \\cdot 25} = 5\\sqrt{2}$, $\\sqrt{2 \\cdot 16} = 4\\sqrt{2}$, $2\\sqrt{2 \\cdot 4} = 4\\sqrt{2}$, and $\\sqrt{2 \\cdot 169} = 13\\sqrt{2}$.",
            "expression": "5\\sqrt{2} + 4\\sqrt{2} + 4\\sqrt{2} - 13\\sqrt{2}"
          },
          {
            "text": "Factor out the common $\\sqrt{2}$ factor.",
            "expression": "\\sqrt{2}(5 + 4 + 4 - 13)"
          },
          {
            "text": "Evaluate the sum inside the parentheses: $5 + 4 + 4 - 13 = 0$, giving $\\sqrt{2} \\cdot 0 = 0$.",
            "expression": "0"
          }
        ]
      },
      "hints": [
        {
          "order": 1,
          "content": "Look for a common factor inside each radical. Does the $\\sqrt{8}$ term suggest anything?"
        },
        {
          "order": 2,
          "content": "Factor a $2$ out of every radicand so each square root looks like $\\sqrt{2 \\cdot k}$."
        },
        {
          "order": 3,
          "content": "Once you see perfect squares under the radicals, simplify them to coefficients times $\\sqrt{2}$."
        },
        {
          "order": 4,
          "content": "Factor out the common $\\sqrt{2}$ and examine the sum that remains."
        }
      ]
    },
    {
      "id": "algebra-avengers-intermediate-1-problem-5",
      "title": "Book Budget Breakdown",
      "statement": "Jack has just spent \\$546 on new exercise books for the new school term. He goes through a notebook and an exercise book each week. There are 14 weeks in the term. Exercise books cost \\$1 more than notebooks. What is the ratio of exercise book : notebook in simplest terms? Submit your answer in the form $e:n$.",
      "solution": "Let $n$ be the cost of a notebook. Then an exercise book costs $n + 1$, and each week Jack buys one of each, so the weekly cost is $n + (n + 1) = 2n + 1$. Over 14 weeks the total is $14(2n + 1) = 546$, which simplifies to $2n + 1 = 39$. Solving gives $n = 19$, so an exercise book costs $n + 1 = 20$. Therefore the ratio $e:n$ is $20:19$.",
      "difficulty": 4,
      "tags": ["algebra", "linear equations", "ratios", "AMC intermediate"],
      "metadata": {
        "tagline": "Translate a verbal price relationship into an equation and form a ratio.",
        "objectives": [
          "Introduce a variable to represent an unknown price.",
          "Translate weekly purchases into a linear equation.",
          "Solve for the unknown and adjust for the price difference.",
          "Express the final answer as a ratio in the requested format."
        ],
        "answer": {
          "type": "ratio",
          "format": "e:n",
          "value": "20:19",
          "success": "Correct! Exercise books cost \\$20 and notebooks cost \\$19, so $e:n = 20:19$.",
          "failure": "Let $n$ be the notebook price. Solve $14(2n + 1) = 546$, then express $e:n$ with $e = n + 1$.",
          "tolerance": 0
        },
        "solutionSteps": [
          {
            "text": "Let $n$ represent the cost of a notebook in dollars.",
            "expression": "n"
          },
          {
            "text": "Set up the total cost equation: $14(n + (n + 1)) = 546$.",
            "expression": "14(n + n + 1) = 546"
          },
          {
            "text": "Simplify the parentheses to get $14(2n + 1) = 546$, so $2n + 1 = 39$ after dividing by 14.",
            "expression": "2n + 1 = 39"
          },
          {
            "text": "Solve for $n$: $n = 19$, hence $e = n + 1 = 20$.",
            "expression": "n = 19, e = 20"
          },
          {
            "text": "Write the ratio in the requested format $e:n = 20:19$.",
            "expression": "20:19"
          }
        ]
      },
      "hints": [
        {
          "order": 1,
          "content": "How many variables do you need to track the prices?"
        },
        {
          "order": 2,
          "content": "Let $n$ be the cost of a notebook in dollars."
        },
        {
          "order": 3,
          "content": "Translate the total $546$ into an equation using the weekly purchases."
        },
        {
          "order": 4,
          "content": "You should reach $14(n + n + 1) = 546$. Solve this equation for $n$."
        },
        {
          "order": 5,
          "content": "Once $n = 19$, compute the exercise book cost $e = n + 1 = 20$."
        },
        {
          "order": 6,
          "content": "Express the final answer as $e:n$."
        }
      ]
    },
    {
      "id": "algebra-avengers-intermediate-1-problem-6",
      "title": "Common Denominator Collapse",
      "statement": "An expression reads $\\frac{5y}{6x^2} - \\frac{4}{3xy}$. Convert it into a single fraction in simplest terms.",
      "solution": "Find a common denominator that covers both terms: $6x^2y$. Multiply $\\tfrac{5y}{6x^2}$ by $\\tfrac{y}{y}$ and $\\tfrac{4}{3xy}$ by $\\tfrac{2x}{2x}$ so each term shares the denominator $6x^2y$. This produces $\\tfrac{5y^2}{6x^2y} - \\tfrac{8x}{6x^2y}$. Combine the numerators over the common denominator to obtain $\\tfrac{5y^2 - 8x}{6x^2y}$. Thus the expression simplifies to a single fraction $\\dfrac{5y^2 - 8x}{6x^2y}$.",
      "difficulty": 5,
      "tags": ["algebra", "rational expressions", "simplification", "AMC intermediate"],
      "metadata": {
        "tagline": "Merge rational terms over a common denominator and simplify.",
        "objectives": [
          "Choose an appropriate common denominator for rational expressions.",
          "Multiply by forms of $1$ to match denominators without changing value.",
          "Combine like terms in the numerator once denominators align.",
          "Express the final answer as a single simplified fraction."
        ],
        "answer": {
          "type": "expression",
          "value": "(5y^2 - 8x)/(6x^2y)",
          "variables": ["x", "y"],
          "success": "Correct! $\\dfrac{5y}{6x^2} - \\dfrac{4}{3xy}$ collapses to $\\dfrac{5y^2 - 8x}{6x^2y}.$",
          "failure": "Rewrite each term over $6x^2y$ by multiplying by a form of $1$, then combine the numerators.",
          "inputHint": "Enter a single simplified fraction—for example $\\dfrac{3a^2 - 2b}{6ab}$. Equivalent algebraic forms are accepted."
        },
        "solutionSteps": [
          {
            "text": "Identify a common denominator that covers both terms; $6x^2y$ works for $\\frac{5y}{6x^2}$ and $\\frac{4}{3xy}$.",
            "expression": "6x^2y"
          },
          {
            "text": "Multiply each term by a form of $1$ so both share that denominator: $\\frac{5y}{6x^2} \\cdot \\frac{y}{y}$ and $\\frac{4}{3xy} \\cdot \\frac{2x}{2x}$.",
            "expression": "\\frac{5y}{6x^2} \\cdot \\frac{y}{y} - \\frac{4}{3xy} \\cdot \\frac{2x}{2x}"
          },
          {
            "text": "Write the adjusted terms over the common denominator.",
            "expression": "\\frac{5y^2}{6x^2y} - \\frac{8x}{6x^2y}"
          },
          {
            "text": "Combine the numerators: $\\frac{5y^2 - 8x}{6x^2y}$.",
            "expression": "\\frac{5y^2 - 8x}{6x^2y}"
          }
        ]
      },
      "hints": [
        {
          "order": 1,
          "content": "Recall how to express fractions over a common denominator. What denominator captures both terms?"
        },
        {
          "order": 2,
          "content": "$6x^2y$ is the simplest common denominator that covers both terms."
        },
        {
          "order": 3,
          "content": "To convert the first term, multiply by a form of $1$ so that the denominator becomes $6x^2y$."
        },
        {
          "order": 4,
          "content": "Use $\\frac{y}{y}$ for the first term and $\\frac{2x}{2x}$ for the second to reach the common denominator."
        },
        {
          "order": 5,
          "content": "After adjustment, the terms should read $\\frac{5y^2}{6x^2y}$ and $-\\frac{8x}{6x^2y}$."
        },
        {
          "order": 6,
          "content": "Combine the numerators over $6x^2y$ to finish the simplification."
        }
      ]
    },
    {
      "id": "algebra-avengers-intermediate-1-problem-7",
      "title": "Cake Weight Confusion",
      "statement": "Hamish and Becky have been eating a lot of cakes. \"Goodness,\" says Hamish. \"The sum of your weight and twice mine is now 361 kg!\" \"You're getting confused,\" Becky replies. \"The sum of your weight and twice mine is 362 kg.\" How much do Hamish and Becky weigh in kilograms combined?",
      "solution": "Let $h$ be Hamish's weight and $b$ Becky's weight. Hamish's comment translates to $h + 2b = 361$, while Becky's statement gives $2h + b = 362$. Multiply the first equation by $2$ to get $2h + 4b = 722$. Subtract the second equation to eliminate $h$, producing $3b = 360$ and $b = 120$. Substitute back into $h + 2b = 361$ to obtain $h + 2(120) = 361$, so $h = 121$. Together they weigh $h + b = 121 + 120 = 241$ kilograms.",
      "difficulty": 4,
      "tags": ["algebra", "systems of equations", "linear equations", "AMC intermediate"],
      "metadata": {
        "tagline": "Resolve conflicting weight claims with a simple system of equations.",
        "objectives": [
          "Define variables representing each person's weight.",
          "Translate the story statements into simultaneous linear equations.",
          "Use elimination to solve the system for one variable.",
          "Substitute to find the remaining weight and the requested sum."
        ],
        "answer": {
          "type": "numeric",
          "value": 241,
          "success": "Correct! Together Hamish and Becky weigh 241 kilograms.",
          "failure": "Set up the equations $h + 2b = 361$ and $2h + b = 362$, use elimination to solve for one variable, then find the sum.",
          "tolerance": 0,
          "inputHint": "Enter the total weight of Hamish and Becky as a whole number."
        },
        "solutionSteps": [
          {
            "text": "Let $h$ represent Hamish's weight in kilograms and $b$ represent Becky's weight.",
            "expression": "h, b"
          },
          {
            "text": "Translate the statements into equations: $h + 2b = 361$ and $2h + b = 362$.",
            "expression": "h + 2b = 361; 2h + b = 362"
          },
          {
            "text": "Multiply the first equation by $2$ and subtract the second to eliminate $h$: $2(h + 2b) - (2h + b) = 360$, yielding $3b = 360$ so $b = 120$.",
            "expression": "b = 120"
          },
          {
            "text": "Substitute $b = 120$ into $h + 2b = 361$ to solve for $h$: $h + 2(120) = 361$, so $h = 121$.",
            "expression": "h = 121"
          },
          {
            "text": "Add the weights to answer the question: $h + b = 121 + 120 = 241$ kilograms.",
            "expression": "241"
          }
        ]
      },
      "hints": [
        {
          "order": 1,
          "content": "How many variables should you use for this scenario?"
        },
        {
          "order": 2,
          "content": "Model it as 2 equations with 2 unknowns."
        },
        {
          "order": 3,
          "content": "$h + 2b = 361$ and $2h + b = 362.$"
        },
        {
          "order": 4,
          "content": "You want to eliminate $h$ or $b$."
        },
        {
          "order": 5,
          "content": "Compute $2(h + 2b = 361) - (2h + b = 362)$ to eliminate $h$, giving $3b = 360$ and $b = 120.$"
        },
        {
          "order": 6,
          "content": "Can you get $h$ now, knowing $b$?"
        },
        {
          "order": 7,
          "content": "Plug $b = 120$ into either equation. You should find $h = 121.$"
        },
        {
          "order": 8,
          "content": "The question requires the combined weight. $h + b = 241.$"
        }
      ]
    },
    {
      "id": "algebra-avengers-intermediate-1-problem-8",
      "title": "Nested Radical Face-Off",
      "statement": "Which is larger: $\\sqrt{3\\sqrt{6\\sqrt{2}}}$ or $\\sqrt{6\\sqrt{2\\sqrt{3}}}$?",
      "solution": "Label the expressions $A = \\sqrt{3\\sqrt{6\\sqrt{2}}}$ and $B = \\sqrt{6\\sqrt{2\\sqrt{3}}}$. Simplify $A$ by working from the innermost radical outward. First, $\\sqrt{6\\sqrt{2}} = (6\\cdot 2^{1/2})^{1/2} = 6^{1/2} \\cdot 2^{1/4}$. Multiplying by $3$ gives $3 \\cdot 6^{1/2} \\cdot 2^{1/4} = 3^{3/2} \\cdot 2^{3/4}$, and taking the outer square root yields $A = 3^{3/4} \\cdot 2^{3/8}$. The same process on $B$ gives $\\sqrt{2\\sqrt{3}} = (2\\cdot 3^{1/2})^{1/2} = 2^{1/2} \\cdot 3^{1/4}$, so $6\\sqrt{2\\sqrt{3}} = 2^{3/2} \\cdot 3^{5/4}$ and $B = 2^{3/4} \\cdot 3^{5/8}$. Compare $A$ and $B$ by examining the ratio $\\frac{A}{B} = 2^{-3/8} \\cdot 3^{1/8} = \\left(\\frac{3}{8}\\right)^{1/8}$, which is less than $1$. Therefore $A < B$, so $\\sqrt{6\\sqrt{2\\sqrt{3}}}$ is larger.",
      "difficulty": 5,
      "tags": ["algebra", "radicals", "exponents", "comparison", "AMC intermediate"],
      "metadata": {
        "tagline": "Tame deeply nested radicals by turning everything into fractional exponents.",
        "objectives": [
          "Rewrite nested radicals using fractional exponents.",
          "Systematically simplify from the innermost radical outward.",
          "Compare two expressions by forming their ratio.",
          "Decide which radical expression is larger from the comparison."
        ],
        "answer": {
          "type": "expression",
          "value": "B",
          "success": "Correct! $\\sqrt{6\\sqrt{2\\sqrt{3}}}$ (choice B) is larger.",
          "failure": "Simplify both expressions into powers of $2$ and $3$, then compare by taking their ratio.",
          "inputHint": "Enter either A or B.",
          "variables": ["A", "B"],
          "shortcuts": ["A", "B"],
          "includeExponentTwo": false
        },
        "solutionSteps": [
          {
            "text": "Let $A = \\sqrt{3\\sqrt{6\\sqrt{2}}}$ and $B = \\sqrt{6\\sqrt{2\\sqrt{3}}}$ so you can track the two expressions.",
            "expression": "A = \\sqrt{3\\sqrt{6\\sqrt{2}}},\\ B = \\sqrt{6\\sqrt{2\\sqrt{3}}}"
          },
          {
            "text": "Simplify the inner radicals for $A$: $\\sqrt{6\\sqrt{2}} = 6^{1/2} \\cdot 2^{1/4}$, so $A = (3 \\cdot 6^{1/2} \\cdot 2^{1/4})^{1/2} = 3^{3/4} \\cdot 2^{3/8}.$",
            "expression": "A = 3^{3/4} \\cdot 2^{3/8}"
          },
          {
            "text": "Do the same for $B$: $\\sqrt{2\\sqrt{3}} = 2^{1/2} \\cdot 3^{1/4}$, so $B = (6 \\cdot 2^{1/2} \\cdot 3^{1/4})^{1/2} = 2^{3/4} \\cdot 3^{5/8}.$",
            "expression": "B = 2^{3/4} \\cdot 3^{5/8}"
          },
          {
            "text": "Compare by forming $A/B = 2^{-3/8} \\cdot 3^{1/8} = \\left(\\frac{3}{8}\\right)^{1/8}$, which is less than $1$ because $\\frac{3}{8} < 1.$",
            "expression": "\\frac{A}{B} = \\left(\\frac{3}{8}\\right)^{1/8}"
          },
          {
            "text": "Since $A/B < 1$, $A < B$ and choice $B$ is larger.",
            "expression": "B"
          }
        ]
      },
      "hints": [
        {
          "order": 1,
          "content": "Which exponent rules let you convert nested square roots into fractional powers?"
        },
        {
          "order": 2,
          "content": "Work from the innermost radical outward, rewriting each square root as a $1/2$ power."
        },
        {
          "order": 3,
          "content": "Once each expression is in terms of powers of $2$ and $3$, line them up for comparison."
        },
        {
          "order": 4,
          "content": "Form the ratio $A/B$ to see which expression is larger."
        }
      ]
    },
    {
      "id": "algebra-avengers-intermediate-1-problem-9",
      "title": "Scanning a Feasible Window",
      "statement": "Find the sum of the maximum and minimum values of $4x + y$ over all $(x, y)$ that satisfy the system $-2 \\le y \\le 2$, $y \\le -3x + 5$, and $y \\le 3x + 5$. These inequalities carve out a trapezoid in the coordinate plane.",
      "solution": "The inequalities create a bounded window in the plane. The horizontal lines $y = 2$ and $y = -2$ sandwich the region vertically, while $y = -3x + 5$ and $y = 3x + 5$ provide slanted upper bounds. Their intersection points give the trapezoid's vertices: $y = 2$ with $y = -3x + 5$ gives $(1, 2)$; $y = -2$ with $y = -3x + 5$ gives $(\\tfrac{7}{3}, -2)$; $y = 2$ with $y = 3x + 5$ gives $(-1, 2)$; and $y = -2$ with $y = 3x + 5$ gives $(-\\tfrac{7}{3}, -2)$. Evaluate $4x + y$ at each vertex: $4(1) + 2 = 6$, $4(\\tfrac{7}{3}) - 2 = \\tfrac{22}{3}$, $4(-1) + 2 = -2$, and $4(-\\tfrac{7}{3}) - 2 = -\\tfrac{34}{3}$. The maximum value is $\\tfrac{22}{3}$ at $(\\tfrac{7}{3}, -2)$ and the minimum is $-\\tfrac{34}{3}$ at $(-\\tfrac{7}{3}, -2)$. Their sum is $\\tfrac{22}{3} + (-\\tfrac{34}{3}) = -\\tfrac{12}{3} = -4$.",
      "difficulty": 5,
      "tags": ["algebra", "inequalities", "optimization", "AMC intermediate"],
      "metadata": {
        "tagline": "Sweep a linear objective across a trapezoidal feasible region.",
        "objectives": [
          "Interpret a system of linear inequalities as a bounded region in the coordinate plane.",
          "Find intersection points of boundary lines to identify feasible vertices.",
          "Evaluate a linear objective function at candidate vertices.",
          "Combine extreme values according to the problem's request."
        ],
        "diagram": {
          "type": "image",
          "src": "/problems/algebra/intermediate/problem-9.png",
          "alt": "Trapezoid formed by the lines y = 2, y = -2, y = -3x + 5, and y = 3x + 5.",
          "caption": "Feasible region bounded by the four inequalities.",
          "display": "popover"
        },
        "answer": {
          "type": "numeric",
          "value": -4,
          "success": "Correct! The maximum and minimum values of $4x + y$ sum to $-4$.",
          "failure": "Identify the feasible region's corner points, evaluate $4x + y$ at each, and then add the extreme values.",
          "tolerance": 0,
          "inputHint": "Enter the sum of the maximum and minimum values of $4x + y$."
        },
        "solutionSteps": [
          {
            "text": "Sketch the feasible region defined by $-2 \\le y \\le 2$, $y \\le -3x + 5$, and $y \\le 3x + 5$; it forms a trapezoid (see graph).",
            "expression": "Feasible region = trapezoid"
          },
          {
            "text": "Find the vertices by intersecting the boundary lines: $(1, 2)$, $(\\tfrac{7}{3}, -2)$, $(-1, 2)$, and $(-\\tfrac{7}{3}, -2)$.",
            "expression": "(1,2), (7/3,-2), (-1,2), (-7/3,-2)"
          },
          {
            "text": "Evaluate $4x + y$ at each vertex: $6$, $\\tfrac{22}{3}$, $-2$, and $-\\tfrac{34}{3}$.",
            "expression": "4x + y = \\{6,\\ 22/3,\\ -2,\\ -34/3\\}"
          },
          {
            "text": "Identify the extreme values: maximum $\\tfrac{22}{3}$ and minimum $-\\tfrac{34}{3}$.",
            "expression": "max = 22/3, min = -34/3"
          },
          {
            "text": "Add the extremes: $\\tfrac{22}{3} + (-\\tfrac{34}{3}) = -4$.",
            "expression": "sum = -4"
          }
        ]
      },
      "hints": [
        {
          "order": 1,
          "content": "Can you picture the lines in these inequalities on the coordinate plane?"
        },
        {
          "order": 2,
          "content": "Sketch the trapezoid bounded by the lines to orient yourself."
        },
        {
          "order": 3,
          "content": "Sliding lines of the form $4x + y = k$ across the region will touch the extremes at the vertices."
        },
        {
          "order": 4,
          "content": "Compute the intersection points of the four boundary lines to list the vertices."
        },
        {
          "order": 5,
          "content": "Evaluate $4x + y$ at each vertex, then add the maximum and minimum results."
        }
      ]
    },
    {
      "id": "algebra-avengers-intermediate-1-problem-10",
      "title": "Factoring for Roots",
      "statement": "Suppose $(x + r)(x + s) = x^2 + 8x + 15$. Find all solutions to $x^2 + 8x + 15 = 0$ without using the quadratic formula. Submit your answer as $x_1,x_2$.",
      "solution": "Start by expanding $(x + r)(x + s)$ into $x^2 + (r + s)x + rs$. Matching coefficients with $x^2 + 8x + 15$ shows that $r + s = 8$ and $rs = 15$. A quick search of factor pairs of $15$ that also sum to $8$ reveals $r = 3$ and $s = 5$. Therefore $x^2 + 8x + 15$ factors as $(x + 3)(x + 5)$. Setting each factor equal to zero gives the roots $x = -3$ and $x = -5$, so the requested answer is $-3,-5$ (order does not matter).",
      "difficulty": 3,
      "tags": ["algebra", "quadratics", "factoring", "AMC intermediate"],
      "metadata": {
        "tagline": "Match factor sums and products to bypass the quadratic formula.",
        "objectives": [
          "Expand a binomial product to express coefficients in terms of $r$ and $s$.",
          "Set up equations for the sum and product of the constants based on coefficient comparison.",
          "Identify constants that satisfy both conditions and factor the quadratic.",
          "Read the roots directly from the factored form."
        ],
        "answer": {
          "type": "pair",
          "expected": {
            "first": -3,
            "second": -5
          },
          "separator": ",",
          "orderMatters": false,
          "success": "Correct! $(x + 3)(x + 5) = x^2 + 8x + 15$, so the roots are $-3$ and $-5$.",
          "failure": "Compare $(x + r)(x + s)$ with $x^2 + 8x + 15$ to find $r$ and $s$, factor, then write the roots.",
          "inputHint": "Enter the two roots separated by a comma, e.g. 1,1."
        },
        "solutionSteps": [
          {
            "text": "Expand $(x + r)(x + s)$ to obtain $x^2 + (r + s)x + rs$.",
            "expression": "x^2 + (r + s)x + rs"
          },
          {
            "text": "Match coefficients with $x^2 + 8x + 15$ so that $r + s = 8$ and $rs = 15$.",
            "expression": "r + s = 8,\\ rs = 15"
          },
          {
            "text": "Find constants satisfying both conditions: $r = 3$ and $s = 5$ work.",
            "expression": "r = 3,\\ s = 5"
          },
          {
            "text": "Rewrite the quadratic as $(x + 3)(x + 5) = 0$.",
            "expression": "(x + 3)(x + 5)"
          },
          {
            "text": "Set each factor equal to zero to get $x = -3$ and $x = -5$.",
            "expression": "x = -3,\\ x = -5"
          }
        ]
      },
      "hints": [
        {
          "order": 1,
          "content": "Expand $(x + r)(x + s)$ so you can compare it with $x^2 + 8x + 15$."
        },
        {
          "order": 2,
          "content": "What value must $rs$ take to match the constant term?"
        },
        {
          "order": 3,
          "content": "Search for numbers with sum $8$ and product $15$ to determine $r$ and $s$."
        },
        {
          "order": 4,
          "content": "Substitute your $r$ and $s$ back into $(x + r)(x + s)$ to factor the quadratic."
        },
        {
          "order": 5,
          "content": "Which $x$ values make each factor zero?"
        }
      ]
    },
    {
      "id": "algebra-avengers-intermediate-1-problem-11",
      "title": "Function Composition Rig",
      "statement": "A company designs two machines, Machine F and Machine G, to process data values. Machine F squares an input value and then reduces the result by 3. Machine G takes any value it receives and adds 3 to it. A new machinist rigs up a machine that feeds the output of Machine F directly into Machine G, creating a combined process. What does the new machine return for every $x$ entered?",
      "solution": "Model the two machines as functions. Machine F squares the input and subtracts 3, so $f(x) = x^2 - 3$. Machine G adds 3, so $g(x) = x + 3$. The combined machine calculates $g(f(x))$, which becomes $g(f(x)) = f(x) + 3 = (x^2 - 3) + 3 = x^2$. Therefore, the new machine returns $x^2$ for any input $x$.",
      "difficulty": 3,
      "tags": ["algebra", "functions", "composition", "AMC intermediate"],
      "metadata": {
        "tagline": "Track a composite machine by composing its component functions.",
        "objectives": [
          "Represent verbal machine descriptions as function definitions.",
          "Compose two functions to build a combined process.",
          "Simplify the composed expression carefully.",
          "Identify the resulting function returned by the combined machine."
        ],
        "answer": {
          "type": "expression",
          "value": "x^2",
          "variables": ["x"],
          "shortcuts": ["x"],
          "success": "Correct! Feeding Machine F into Machine G yields $g(f(x)) = (x^2 - 3) + 3 = x^2.$",
          "failure": "Find $f(x)$ and $g(x)$, then substitute the output of F into G to simplify $g(f(x)).$",
          "inputHint": "Enter the resulting expression in terms of $x$."
        },
        "solutionSteps": [
          {
            "text": "Describe Machine F as $f(x) = x^2 - 3$ since it squares the input and subtracts 3.",
            "expression": "f(x) = x^2 - 3"
          },
          {
            "text": "Describe Machine G as $g(x) = x + 3$ because it adds 3 to whatever it receives.",
            "expression": "g(x) = x + 3"
          },
          {
            "text": "Compose the machines: $g(f(x)) = (x^2 - 3) + 3 = x^2$.",
            "expression": "g(f(x)) = x^2"
          }
        ]
      },
      "hints": [
        {
          "order": 1,
          "content": "Do you recall how composition of functions works?"
        },
        {
          "order": 2,
          "content": "Think of a function as a machine that maps an input to an output."
        },
        {
          "order": 3,
          "content": "Write equations for the two machines, calling them $f(x)$ and $g(x)$."
        },
        {
          "order": 4,
          "content": "Machine F squares the input, then subtracts 3: $f(x) = x^2 - 3$."
        },
        {
          "order": 5,
          "content": "Machine G adds 3, so $g(x) = x + 3$."
        },
        {
          "order": 6,
          "content": "Feed the output of Machine F into Machine G: compute $g(f(x))."
        }
      ]
    },
    {
      "id": "algebra-avengers-intermediate-1-problem-12",
      "title": "Exponential Cascade",
      "statement": "Given $2^x = 6$, evaluate $2^{3x - 1}.$",
      "solution": "Start by rewriting the target exponent: $2^{3x - 1} = \\frac{2^{3x}}{2^1}$. Use the rule $(2^x)^3 = 2^{3x}$ to get $(2^x)^3 = 6^3 = 216$. Dividing by $2$ gives $2^{3x - 1} = \\frac{216}{2} = 108.$",
      "difficulty": 3,
      "tags": ["algebra", "exponents", "AMC intermediate"],
      "metadata": {
        "tagline": "Chain exponent rules to evaluate a disguised power.",
        "objectives": [
          "Apply $a^{m - n} = \\frac{a^m}{a^n}$ to separate an exponent difference.",
          "Use $(a^m)^n = a^{mn}$ to raise a substituted power.",
          "Substitute the known value $2^x = 6$ to evaluate higher powers.",
          "Simplify the resulting expression to a numeric value."
        ],
        "answer": {
          "type": "numeric",
          "value": 108,
          "success": "Correct! $2^{3x - 1} = \\frac{(2^x)^3}{2} = \\frac{6^3}{2} = 108.$",
          "failure": "This is a fiddly one, but yields to careful application of the exponent rules.",
          "inputHint": "Enter the simplified numeric value."
        },
        "solutionSteps": [
          {
            "text": "Rewrite the exponent using $a^{m - n} = \\frac{a^m}{a^n}$: $2^{3x - 1} = \\frac{2^{3x}}{2^1}$.",
            "expression": "2^{3x - 1} = \\frac{2^{3x}}{2}"
          },
          {
            "text": "Convert $2^{3x}$ using $(2^x)^3 = 2^{3x}$ and substitute $2^x = 6$: $2^{3x} = (2^x)^3 = 6^3 = 216.$",
            "expression": "(2^x)^3 = 6^3 = 216"
          },
          {
            "text": "Divide by $2$ to obtain $2^{3x - 1} = \\frac{216}{2} = 108.$",
            "expression": "108"
          }
        ]
      },
      "hints": [
        {
          "order": 1,
          "content": "List the exponent rules you might need."
        },
        {
          "order": 2,
          "content": "Use $a^{m - n} = \\frac{a^m}{a^n}$ to separate $2^{3x - 1}$."
        },
        {
          "order": 3,
          "content": "Remember that $(a^m)^n = a^{mn}$ when raising powers."
        }
      ]
    },
    {
      "id": "algebra-avengers-intermediate-1-problem-13",
      "title": "Exponent Tangle",
      "statement": "Solve for $x$ if $25^{-2} = \\dfrac{5^{48/x}}{5^{26/x} \\cdot 25^{17/x}}.$",
      "solution": "Rewrite powers of 25 in terms of 5. The left-hand side becomes $25^{-2} = (5^2)^{-2} = 5^{-4}$. On the right-hand side, divide the numerator and denominator exponents: $\\frac{5^{48/x}}{5^{26/x} \\cdot 25^{17/x}} = 5^{48/x} \\cdot 5^{-26/x} \\cdot (5^2)^{-17/x} = 5^{48/x} \\cdot 5^{-26/x} \\cdot 5^{-34/x}$. Combine exponents to get $5^{48/x - 26/x - 34/x} = 5^{-12/x}$. Setting $5^{-4} = 5^{-12/x}$ gives $-4 = -12/x$, so $x = 3.$",
      "difficulty": 4,
      "tags": ["algebra", "exponents", "AMC intermediate"],
      "metadata": {
        "tagline": "Tame a messy tower of exponents by rewriting everything with the same base.",
        "objectives": [
          "Express all powers using a common base to compare exponents.",
          "Apply quotient and power rules for exponents systematically.",
          "Combine exponent terms by adding and subtracting appropriately.",
          "Solve the resulting linear equation in the exponent."
        ],
        "answer": {
          "type": "numeric",
          "value": 3,
          "success": "Correct! Rewriting in base 5 leads to $5^{-4} = 5^{-12/x}$, so $x = 3.$",
          "failure": "Rewrite $25$ as $5^2$, simplify the exponents, equate $5^a = 5^b$, and solve for $x$.",
          "inputHint": "Enter the value of $x$."
        },
        "solutionSteps": [
          {
            "text": "Convert the left side to base 5: $25^{-2} = (5^2)^{-2} = 5^{-4}.$",
            "expression": "25^{-2} = 5^{-4}"
          },
          {
            "text": "Rewrite the right side using base 5: $\\frac{5^{48/x}}{5^{26/x} \\cdot 25^{17/x}} = 5^{48/x} \\cdot 5^{-26/x} \\cdot (5^2)^{-17/x}.$",
            "expression": "5^{48/x} \\cdot 5^{-26/x} \\cdot 5^{-34/x}"
          },
          {
            "text": "Combine exponents: $5^{48/x - 26/x - 34/x} = 5^{-12/x}.$",
            "expression": "5^{-12/x}"
          },
          {
            "text": "Match exponents: $5^{-4} = 5^{-12/x}$ implies $-4 = -12/x$, giving $x = 3.$",
            "expression": "x = 3"
          }
        ]
      },
      "hints": [
        {
          "order": 1,
          "content": "List the exponent rules you may need."
        },
        {
          "order": 2,
          "content": "Remember $a^{m - n} = \\frac{a^m}{a^n}$."
        },
        {
          "order": 3,
          "content": "Use $(a^m)^n = a^{mn}$ to rewrite powers of powers."
        },
        {
          "order": 4,
          "content": "Combine exponents with $a^m \\cdot a^n = a^{m + n}$ to simplify."
        }
      ]
    },
    {
      "id": "algebra-avengers-intermediate-1-problem-14",
      "title": "Chocolate Factory Timing",
      "statement": "Amy, Bomani, and Charlie work in a chocolate factory. On Monday, they started working at 1:00 PM and were able to pack 4, 3, and 3 packages, respectively, every 3 minutes. At some later time, Daria joined the group. Daria was able to pack 5 packages every 4 minutes. Together, they finished packing 450 packages at exactly 2:45 PM. At what time did Daria join the group? Please answer with a time under a 12-hour clock, e.g. 5:45. [Source: AMC 10A, 2024]",
      "solution": "Between 1:00 PM and 2:45 PM there are 105 minutes. Amy, Bomani, and Charlie collectively pack $(4 + 3 + 3) = 10$ packages every 3 minutes, or $\\tfrac{10}{3}$ packages per minute. Let $t$ be the number of minutes after 1:00 PM when Daria starts. She packs for $105 - t$ minutes at a rate of $\\tfrac{5}{4}$ packages per minute. The total packages are $\\frac{10}{3} \\cdot 105 + \\frac{5}{4} (105 - t) = 450$. Simplifying gives $350 + \\frac{5}{4}(105 - t) = 450$, so $\\frac{5}{4}(105 - t) = 100$ and $105 - t = 80$. Therefore $t = 25$ and Daria arrived 25 minutes after 1:00 PM, which is 1:25 PM.",
      "difficulty": 4,
      "tags": ["algebra", "rates", "word problems", "AMC intermediate"],
      "metadata": {
        "tagline": "Track staggered work rates to pinpoint a late arrival.",
        "objectives": [
          "Interpret a multi-person rate problem and translate it into equations.",
          "Introduce a variable for missing time and relate it to total work.",
          "Convert individual rates into combined rates over matching units.",
          "Solve the resulting linear equation and interpret the time."
        ],
        "answer": {
          "type": "ratio",
          "value": "1:25",
          "success": "Correct! Daria joined at 1:25 PM.",
          "failure": "Let $t$ be the minutes Daria was late. Combine the packages packed by the first three workers and by Daria to total 450 packages.",
          "inputHint": "Enter the time Daria arrived in the form h:mm, e.g. 5:55."
        },
        "solutionSteps": [
          {
            "text": "Compute the total minutes of work: $2{:}45 - 1{:}00 = 105$ minutes.",
            "expression": "105 \\text{ minutes}"
          },
          {
            "text": "Amy, Bomani, and Charlie together pack $10$ packages every 3 minutes, or $\\tfrac{10}{3}$ packages per minute.",
            "expression": "\\frac{10}{3} \\text{ packages/minute}"
          },
          {
            "text": "Let $t$ be the number of minutes after 1:00 PM when Daria arrives; she works for $105 - t$ minutes at $\\tfrac{5}{4}$ packages per minute.",
            "expression": "t \\text{ minutes late}"
          },
          {
            "text": "Set up the total package equation: $\\tfrac{10}{3} \\cdot 105 + \\tfrac{5}{4}(105 - t) = 450.$",
            "expression": "\\frac{10}{3} \\cdot 105 + \\frac{5}{4}(105 - t) = 450"
          },
          {
            "text": "Solve for $t$: the equation simplifies to $t = 25$, so Daria arrived 25 minutes after 1:00 PM, which is 1:25 PM.",
            "expression": "t = 25 \\Rightarrow 1{:}25"
          }
        ]
      },
      "hints": [
        {
          "order": 1,
          "content": "Think in terms of rates and total work—check the units."
        },
        {
          "order": 2,
          "content": "Introduce a variable for how late Daria arrives."
        },
        {
          "order": 3,
          "content": "Let $t$ be the number of minutes Daria is late; you will convert that to a time at the end."
        },
        {
          "order": 4,
          "content": "Write an equation that sums the packages packed by the original trio and by Daria."
        },
        {
          "order": 5,
          "content": "How many minutes do Amy, Bomani, and Charlie work, and at what combined rate?"
        },
        {
          "order": 6,
          "content": "They pack 10 packages every 3 minutes, so $\\tfrac{10}{3}$ packages per minute."
        },
        {
          "order": 7,
          "content": "Daria packs at $\\tfrac{5}{4}$ packages per minute but only for $105 - t$ minutes."
        }
      ]
    },
    {
      "id": "algebra-avengers-intermediate-1-problem-15",
      "title": "Nested Linear Function",
      "statement": "Let $f(x) = ax + b$ where $a$ and $b$ are real numbers. Suppose that for all real $x$, $f(f(x)) = 4x + 3$. Find all possible values of $a + b$.",
      "solution": "Start from $f(x) = ax + b$. Then $f(f(x)) = a(ax + b) + b = a^2 x + ab + b$. Matching coefficients with $4x + 3$ gives $a^2 = 4$ and $b(a + 1) = 3.\n\nCase 1: $a = 2$. Then $(2 + 1)b = 3$, so $b = 1$ and $a + b = 3$.\n\nCase 2: $a = -2$. Then $(-2 + 1)b = 3$, so $-b = 3$ giving $b = -3$ and $a + b = -5$. Thus the possible values are $3$ and $-5$.",
      "difficulty": 5,
      "tags": ["algebra", "functions", "composition", "AMC intermediate"],
      "metadata": {
        "tagline": "Compare coefficients after composing a linear function with itself.",
        "objectives": [
          "Recognize that composing a linear function produces another linear function.",
          "Set up equations by equating coefficients of like terms.",
          "Resolve multiple cases for parameters and interpret the context to select the valid one.",
          "Compute the requested sum once parameters are determined."
        ],
        "answer": {
          "type": "expression",
          "value": ["3,-5", "-5,3"],
          "success": "Correct! The two cases yield $a + b = 3$ and $a + b = -5$.",
          "failure": "Compute both cases from $a^2 = 4$ and list the two values of $a + b$ separated by a comma.",
          "inputHint": "Enter both values separated by a comma, e.g. 3,-5."
        },
        "solutionSteps": [
          {
            "text": "Compute $f(f(x)) = a(ax + b) + b = a^2 x + ab + b$ and match it with $4x + 3$ to obtain $a^2 = 4$ and $b(a + 1) = 3$.",
            "expression": "a^2 = 4,\ b(a + 1) = 3"
          },
          {
            "text": "Case 1: $a = 2$. Solve $(2 + 1)b = 3$ to get $b = 1$ and $a + b = 3$.",
            "expression": "a = 2,\ b = 1 \Rightarrow a + b = 3"
          },
          {
            "text": "Case 2: $a = -2$. Solve $(-2 + 1)b = 3$ to get $b = -3$ and $a + b = -5$.",
            "expression": "a = -2,\ b = -3 \Rightarrow a + b = -5"
          }
        ]
      },
      "hints": [
        {
          "order": 1,
          "content": "When you compose a linear function with itself, the result is still linear."
        },
        {
          "order": 2,
          "content": "Compute $f(f(x))$ explicitly in terms of $a$ and $b$."
        },
        {
          "order": 3,
          "content": "Match coefficients with $4x + 3$ to form equations for $a$ and $b$."
        },
        {
          "order": 4,
          "content": "Solve both cases for $a$ and list the resulting $a + b$ values."
        }
      ]
    }
  ],
};

const PATH_SEEDS: PathSeed[] = [
  {
    slug: 'algebra-avengers',
    title: 'Algebra Avengers',
    description: 'Sharpen algebraic instincts from fundamentals through Olympiad-grade boss fights.',
    themeColor: '#ef476f',
    order: 1,
    subpaths: [
      {
        stage: SubpathStage.BASIC,
        title: 'Basic prep and warm-up',
        description: 'Refresh equations, inequalities, and algebraic fluency.',
        order: 1,
        levels: [
          {
            order: 1,
            kind: LevelKind.PRACTICE,
            title: 'Foundations of Algebra',
            subtitle: 'Placeholder warm-up level',
            description: 'Populate with linear equations, factoring, and substitution drills.',
            estimatedMinutes: 20,
          },
        ],
      },
      {
        stage: SubpathStage.INTERMEDIATE,
        title: 'Intermediate problem solving and techniques',
        description: 'Pivot into clever substitutions and clever manipulations.',
        order: 2,
        levels: [
          {
            order: 1,
            kind: LevelKind.PRACTICE,
            title: 'Algebraic Tactics',
            subtitle: 'Placeholder intermediate level',
            description: 'Introduce inequalities, clever factoring, and bounding arguments.',
            estimatedMinutes: 25,
          },
        ],
      },
      {
        stage: SubpathStage.ADVANCED,
        title: 'Advance problem solving and techniques',
        description: 'Explore functional equations, symmetric sums, and Olympiad patterns.',
        order: 3,
        levels: [
          {
            order: 1,
            kind: LevelKind.PRACTICE,
            title: 'Advanced Algebra Lab',
            subtitle: 'Placeholder advanced level',
            description: 'Add problems exploring transformations and invariants.',
            estimatedMinutes: 30,
          },
        ],
      },
      {
        stage: SubpathStage.BOSS,
        title: 'Boss fight',
        description: 'Face a multi-step algebraic gauntlet.',
        order: 4,
        levels: [
          {
            order: 1,
            kind: LevelKind.BOSS,
            title: 'Algebra Boss Battle',
            subtitle: 'Placeholder boss level',
            description: 'Bundle a culminating set of problems once authored.',
            estimatedMinutes: 35,
          },
        ],
      },
    ],
  },
  {
    slug: 'combinatoric-crusaders',
    title: 'Combinatoric Crusaders',
    description: 'Count, construct, and conquer combinatorics challenges.',
    themeColor: '#ffd166',
    order: 2,
    subpaths: [
      {
        stage: SubpathStage.BASIC,
        title: 'Basic prep and warm-up',
        description: 'Counting principles, permutations, and simple recursion.',
        order: 1,
        levels: [
          {
            order: 1,
            kind: LevelKind.PRACTICE,
            title: 'Counting Kick-off',
            subtitle: 'Placeholder warm-up level',
            description: 'Populate with sum/product rule, simple binomial coefficient problems.',
            estimatedMinutes: 20,
          },
        ],
      },
      {
        stage: SubpathStage.INTERMEDIATE,
        title: 'Intermediate problem solving and techniques',
        description: 'Pigeonhole, inclusion-exclusion, and recursion patterns.',
        order: 2,
        levels: [
          {
            order: 1,
            kind: LevelKind.PRACTICE,
            title: 'Combinatoric Tactics',
            subtitle: 'Placeholder intermediate level',
            description: 'Add problems on bijections, recursion, and combinatorial identities.',
            estimatedMinutes: 25,
          },
        ],
      },
      {
        stage: SubpathStage.ADVANCED,
        title: 'Advance problem solving and techniques',
        description: 'Intricate counting arguments and invariants.',
        order: 3,
        levels: [
          {
            order: 1,
            kind: LevelKind.PRACTICE,
            title: 'Advanced Combinatorics Lab',
            subtitle: 'Placeholder advanced level',
            description: 'Designed for casework-heavy counting and construction problems.',
            estimatedMinutes: 30,
          },
        ],
      },
      {
        stage: SubpathStage.BOSS,
        title: 'Boss fight',
        description: 'High-stakes combinatorics showdown.',
        order: 4,
        levels: [
          {
            order: 1,
            kind: LevelKind.BOSS,
            title: 'Combinatoric Boss Battle',
            subtitle: 'Placeholder boss level',
            description: 'Pair multiple themes into a final sequence.',
            estimatedMinutes: 35,
          },
        ],
      },
    ],
  },
  {
    slug: 'guild-of-the-geometers',
    title: 'Guild of the Geometers',
    description: 'Visual intuition and geometric power tools for competitions.',
    themeColor: '#06d6a0',
    order: 4,
    subpaths: [
      {
        stage: SubpathStage.BASIC,
        title: 'Basic prep and warm-up',
        description: 'Angles, similarity, area, and standard tools refresher.',
        order: 1,
        levels: [
          {
            order: 1,
            kind: LevelKind.PRACTICE,
            title: 'Geometry Foundations',
            subtitle: 'Placeholder warm-up level',
            description: 'Fill with classical triangle and circle exercises.',
            estimatedMinutes: 20,
          },
        ],
      },
      {
        stage: SubpathStage.INTERMEDIATE,
        title: 'Intermediate problem solving and techniques',
        description: 'Power of a point, homothety, and coordinate geometry.',
        order: 2,
        levels: [
          {
            order: 1,
            kind: LevelKind.PRACTICE,
            title: 'Geometry Tactics',
            subtitle: 'Placeholder intermediate level',
            description: 'Add problems with transformations and barycentric thinking.',
            estimatedMinutes: 25,
          },
        ],
      },
      {
        stage: SubpathStage.ADVANCED,
        title: 'Advance problem solving and techniques',
        description: 'Olympiad-level geometry chains and configurations.',
        order: 3,
        levels: [
          {
            order: 1,
            kind: LevelKind.PRACTICE,
            title: 'Advanced Geometry Lab',
            subtitle: 'Placeholder advanced level',
            description: 'Insert heavy geometry problems with inversion or projective ideas.',
            estimatedMinutes: 30,
          },
        ],
      },
      {
        stage: SubpathStage.BOSS,
        title: 'Boss fight',
        description: 'Master geometry boss encounter.',
        order: 4,
        levels: [
          {
            order: 1,
            kind: LevelKind.BOSS,
            title: 'Geometry Boss Battle',
            subtitle: 'Placeholder boss level',
            description: 'Combine multiple lemmas in a final scenario.',
            estimatedMinutes: 35,
          },
        ],
      },
    ],
  },
  {
    slug: 'knights-of-number',
    title: 'Knights of Number',
    description: 'Number theory resilience for modular mayhem.',
    themeColor: '#118ab2',
    order: 3,
    subpaths: [
      {
        stage: SubpathStage.BASIC,
        title: 'Basic prep and warm-up',
        description: 'Divisibility, primes, and modular arithmetic basics.',
        order: 1,
        levels: [
          {
            order: 1,
            kind: LevelKind.PRACTICE,
            title: 'Number Theory Foundations',
            subtitle: 'Placeholder warm-up level',
            description: 'Populate with gcd, lcm, and modular arithmetic drills.',
            estimatedMinutes: 20,
          },
        ],
      },
      {
        stage: SubpathStage.INTERMEDIATE,
        title: 'Intermediate problem solving and techniques',
        description: 'Primes, residues, and clever factorisations.',
        order: 2,
        levels: [
          {
            order: 1,
            kind: LevelKind.PRACTICE,
            title: 'Number Theory Tactics',
            subtitle: 'Placeholder intermediate level',
            description: 'Add problems on Diophantine equations and lifting exponent ideas.',
            estimatedMinutes: 25,
          },
        ],
      },
      {
        stage: SubpathStage.ADVANCED,
        title: 'Advance problem solving and techniques',
        description: 'Higher-order congruences, orders, and classical theorems.',
        order: 3,
        levels: [
          {
            order: 1,
            kind: LevelKind.PRACTICE,
            title: 'Advanced Number Theory Lab',
            subtitle: 'Placeholder advanced level',
            description: 'Prepare for multiplicative functions and order arguments.',
            estimatedMinutes: 30,
          },
        ],
      },
      {
        stage: SubpathStage.BOSS,
        title: 'Boss fight',
        description: 'Number theory final duel.',
        order: 4,
        levels: [
          {
            order: 1,
            kind: LevelKind.BOSS,
            title: 'Number Theory Boss Battle',
            subtitle: 'Placeholder boss level',
            description: 'Blend congruence, factorisation, and growth tactics.',
            estimatedMinutes: 35,
          },
        ],
      },
    ],
  },
  {
    slug: 'order-of-the-olympiad',
    title: 'The Order of the Olympiad',
    description: 'Capstone gauntlet pulling from every discipline.',
    themeColor: '#8338ec',
    order: 5,
    subpaths: [
      {
        stage: SubpathStage.FINAL,
        title: 'Final Trials',
        description: 'Unlocks once core paths are mastered.',
        order: 1,
        levels: [
          {
            order: 1,
            kind: LevelKind.OLYMPIAD,
            title: 'Order of the Olympiad',
            subtitle: 'Placeholder final level',
            description: 'Add mixed-discipline boss problems and story beats here.',
            estimatedMinutes: 45,
          },
        ],
      },
    ],
  },
];

async function upsertPath(seed: PathSeed) {
  const path = await prisma.path.upsert({
    where: { slug: seed.slug },
    update: {
      title: seed.title,
      description: seed.description,
      themeColor: seed.themeColor,
      order: seed.order,
    },
    create: {
      slug: seed.slug,
      title: seed.title,
      description: seed.description,
      themeColor: seed.themeColor,
      order: seed.order,
    },
  });

  for (const subpathSeed of seed.subpaths) {
    const subpath = await prisma.subpath.upsert({
      where: {
        pathId_stage: {
          pathId: path.id,
          stage: subpathSeed.stage,
        },
      },
      update: {
        title: subpathSeed.title,
        description: subpathSeed.description,
        order: subpathSeed.order,
      },
      create: {
        pathId: path.id,
        stage: subpathSeed.stage,
        title: subpathSeed.title,
        description: subpathSeed.description,
        order: subpathSeed.order,
      },
    });

    for (const levelSeed of subpathSeed.levels) {
      const levelKey = `${seed.slug}:${subpathSeed.stage}:${levelSeed.order}`;
      const problemSeeds = PROBLEM_SEEDS[levelKey] ?? [];
      const points = LEVEL_STAGE_POINTS[subpathSeed.stage];

      const level = await prisma.level.upsert({
        where: {
          subpathId_order: {
            subpathId: subpath.id,
            order: levelSeed.order,
          },
        },
        update: {
          title: levelSeed.title,
          subtitle: levelSeed.subtitle,
          description: levelSeed.description,
          kind: levelSeed.kind,
          estimatedMinutes: levelSeed.estimatedMinutes,
          points,
          isPublished: problemSeeds.length > 0,
        },
        create: {
          subpathId: subpath.id,
          kind: levelSeed.kind,
          order: levelSeed.order,
          title: levelSeed.title,
          subtitle: levelSeed.subtitle,
          description: levelSeed.description,
          estimatedMinutes: levelSeed.estimatedMinutes,
          points,
          isPublished: problemSeeds.length > 0,
        },
      });

      if (problemSeeds.length > 0) {
        await prisma.problem.deleteMany({
          where: {
            levelId: level.id,
            id: { notIn: problemSeeds.map((problem) => problem.id) },
          },
        });

        for (const problemSeed of problemSeeds) {
          const metadata = problemSeed.metadata ?? Prisma.JsonNull;

          const problem = await prisma.problem.upsert({
            where: { id: problemSeed.id },
            update: {
              levelId: level.id,
              title: problemSeed.title,
              statement: problemSeed.statement,
              solution: problemSeed.solution,
              difficulty: problemSeed.difficulty,
              tags: problemSeed.tags ?? [],
              metadata,
            },
            create: {
              id: problemSeed.id,
              levelId: level.id,
              title: problemSeed.title,
              statement: problemSeed.statement,
              solution: problemSeed.solution,
              difficulty: problemSeed.difficulty,
              tags: problemSeed.tags ?? [],
              metadata,
            },
          });

          await prisma.problemHint.deleteMany({ where: { problemId: problem.id } });

          for (const hint of problemSeed.hints) {
            await prisma.problemHint.create({
              data: {
                problemId: problem.id,
                order: hint.order,
                content: hint.content,
                isMajor: hint.isMajor ?? false,
              },
            });
          }
        }
      }
    }
  }
}

async function main() {
  for (const seed of PATH_SEEDS) {
    await upsertPath(seed);
  }
}

main()
  .then(async () => {
    console.log('Seed data applied successfully.');
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error('Seed failed', error);
    await prisma.$disconnect();
    process.exit(1);
  });
