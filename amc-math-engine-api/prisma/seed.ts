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
          failure: '$x − (x/4 + 5) = 40$ is the equation you need.',
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
          failure: 'First find the width using $2(w + w+3) = 30$.',
          tolerance: 0,
        },
        solutionSteps: [
          {
            text: 'Let the width be $w$. Then the length is $w + 3$.',
            expression: 'l = w + 3',
          },
          {
            text: 'Use the perimeter formula.',
            expression: '2(w + (w+3)) = 30',
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
