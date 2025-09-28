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
      title: 'Linear Warm-up: Solve 3x + 5 = 20',
      statement: 'Solve for $x$ in the equation $3x + 5 = 20$.',
      solution:
        'Subtract 5 from both sides to get $3x = 15$. Dividing both sides by 3 gives $x = 5$.',
      difficulty: 1,
      tags: ['algebra', 'equations', 'AMC warm-up'],
      metadata: {
        tagline: 'Refresh isolating variables to unlock the Algebra Avengers path.',
        objectives: [
          'Use inverse operations to isolate a variable in a one-step equation.',
          'Translate the warm-up into clean algebraic reasoning to prepare for harder levels.',
        ],
        answer: {
          type: 'numeric',
          value: 5,
          success: 'Correct! You isolated the variable cleanly.',
          failure: 'Check each algebraic step—keep both sides balanced.',
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
    order: 3,
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
    order: 4,
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
