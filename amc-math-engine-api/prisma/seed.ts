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
          success: 'Correct! (-216/125)^(-2/3) simplifies to 25/36.',
          failure: 'Check the cube root and the negative exponent carefully. Answer should be in simplest fractional form.',
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
