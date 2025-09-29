import { Injectable, NotFoundException } from '@nestjs/common';
import { Attempt, AttemptOutcome, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export type PathWithContent = Prisma.PathGetPayload<{
  include: {
    subpaths: {
      include: {
        levels: {
          include: {
            problems: {
              orderBy: {
                createdAt: 'asc';
              };
              select: {
                id: true;
                title: true;
                createdAt: true;
              };
            };
          };
        };
      };
    };
  };
}>;

export type ProblemTileStatus = 'LOCKED' | 'READY' | 'IN_PROGRESS' | 'MASTERED' | 'COMING_SOON';

type ProblemTileSummary = {
  order: number;
  title: string;
  status: ProblemTileStatus;
  isPlaceholder: boolean;
  isAccessible: boolean;
  problemId?: string;
};

type LevelSummary = {
  id: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  tiles: ProblemTileSummary[];
  isCompleted: boolean;
};

type StageStats = {
  mastered: number;
  total: number;
  inProgress: number;
};

type SubpathSummary = {
  id: string;
  title: string;
  description?: string | null;
  stage: string;
  isUnlocked: boolean;
  isCompleted: boolean;
  levels: LevelSummary[];
  stats: StageStats;
};

export type PathProgress = {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  themeColor?: string | null;
  order: number | null;
  subpaths: SubpathSummary[];
  summary: StageStats;
};

const PROBLEMS_PER_LEVEL = 15;

@Injectable()
export class PathsService {
  constructor(private readonly prisma: PrismaService) {}

  private buildPathQuery(where?: Prisma.PathWhereInput): Prisma.PathFindManyArgs {
    return {
      where,
      orderBy: { order: 'asc' },
      include: {
        subpaths: {
          orderBy: { order: 'asc' },
          include: {
            levels: {
              orderBy: { order: 'asc' },
              include: {
                problems: {
                  orderBy: { createdAt: 'asc' },
                  select: {
                    id: true,
                    title: true,
                    createdAt: true,
                  },
                },
              },
            },
          },
        },
      },
    };
  }

  private async createAttemptsMap(
    userId: string,
    paths: PathWithContent[],
  ): Promise<Map<string, Attempt[]>> {
    const problemIds = new Set<string>();

    for (const path of paths) {
      for (const subpath of path.subpaths) {
        for (const level of subpath.levels) {
          for (const problem of level.problems) {
            problemIds.add(problem.id);
          }
        }
      }
    }

    if (problemIds.size === 0) {
      return new Map<string, Attempt[]>();
    }

    const attempts = await this.prisma.attempt.findMany({
      where: {
        userId,
        problemId: { in: Array.from(problemIds) },
      },
      orderBy: { submittedAt: 'desc' },
    });

    const attemptsByProblem = new Map<string, Attempt[]>();

    for (const attempt of attempts) {
      if (!attemptsByProblem.has(attempt.problemId)) {
        attemptsByProblem.set(attempt.problemId, []);
      }
      attemptsByProblem.get(attempt.problemId)!.push(attempt);
    }

    return attemptsByProblem;
  }

  private buildProgress(
    paths: PathWithContent[],
    attemptsByProblem: Map<string, Attempt[]>,
  ): PathProgress[] {
    const getStatus = (
      problemId: string,
      isUnlocked: boolean,
      arePreviousMastered: boolean,
    ): ProblemTileStatus => {
      if (!isUnlocked || !arePreviousMastered) {
        return 'LOCKED';
      }

      const attemptList = attemptsByProblem.get(problemId) ?? [];
      if (attemptList.length === 0) {
        return 'READY';
      }
      if (attemptList.some((attempt) => attempt.outcome === AttemptOutcome.CORRECT)) {
        return 'MASTERED';
      }
      return 'IN_PROGRESS';
    };

    return paths.map((path) => {
      const sortedSubpaths = [...path.subpaths].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      let previousCompleted = true;
      let totalMastered = 0;
      let totalProblems = 0;
      let totalInProgress = 0;

      const subpathSummaries = sortedSubpaths.map((subpath) => {
        const isUnlocked = previousCompleted;
        let stageMastered = 0;
        let stageTotal = 0;
        let stageInProgress = 0;

        const levelSummaries = subpath.levels.map((level) => {
          const problems = level.problems ?? [];
          const tiles: ProblemTileSummary[] = [];

          let allPreviousMastered = true;

          problems.forEach((problem, index) => {
            const status = getStatus(problem.id, isUnlocked, allPreviousMastered);
            tiles.push({
              order: index + 1,
              title: problem.title ?? `Problem ${index + 1}`,
              status,
              isPlaceholder: false,
              isAccessible: status !== 'LOCKED',
              problemId: problem.id,
            });

            if (status !== 'MASTERED') {
              allPreviousMastered = false;
            }
          });

          for (let i = problems.length; i < PROBLEMS_PER_LEVEL; i += 1) {
            tiles.push({
              order: i + 1,
              title: 'Under construction',
              status: 'COMING_SOON',
              isPlaceholder: true,
              isAccessible: false,
            });
          }

          const levelMastered = tiles.filter((tile) => tile.status === 'MASTERED').length;
          const levelInProgress = tiles.filter((tile) => tile.status === 'IN_PROGRESS').length;
          const levelTotal = tiles.length;

          stageMastered += levelMastered;
          stageInProgress += levelInProgress;
          stageTotal += levelTotal;

          totalMastered += levelMastered;
          totalInProgress += levelInProgress;
          totalProblems += levelTotal;

          const levelCompleted =
            levelTotal === PROBLEMS_PER_LEVEL && levelMastered === levelTotal;

          return {
            id: level.id,
            title: level.title,
            subtitle: level.subtitle,
            description: level.description,
            tiles,
            isCompleted: levelCompleted,
          } satisfies LevelSummary;
        });

        const subpathCompleted = stageTotal > 0 && stageMastered === stageTotal;

        const summary: SubpathSummary = {
          id: subpath.id,
          title: subpath.title,
          description: subpath.description,
          stage: subpath.stage,
          isUnlocked,
          isCompleted: subpathCompleted,
          levels: levelSummaries,
          stats: {
            mastered: stageMastered,
            total: stageTotal,
            inProgress: stageInProgress,
          },
        };

        previousCompleted = previousCompleted && subpathCompleted;
        return summary;
      });

      return {
        id: path.id,
        slug: path.slug,
        title: path.title,
        description: path.description,
        themeColor: path.themeColor,
        order: path.order ?? null,
        subpaths: subpathSummaries,
        summary: {
          mastered: totalMastered,
          total: totalProblems,
          inProgress: totalInProgress,
        },
      } satisfies PathProgress;
    });
  }

  async findAll(): Promise<PathWithContent[]> {
    const paths = await this.prisma.path.findMany(this.buildPathQuery());
    return paths as PathWithContent[];
  }

  async findAllWithProgress(userId: string): Promise<PathProgress[]> {
    const paths = (await this.prisma.path.findMany(this.buildPathQuery())) as PathWithContent[];
    const attemptsByProblem = await this.createAttemptsMap(userId, paths);
    return this.buildProgress(paths, attemptsByProblem);
  }

  async findOneWithProgress(userId: string, slug: string): Promise<PathProgress> {
    const paths = (await this.prisma.path.findMany(this.buildPathQuery({ slug }))) as PathWithContent[];

    if (paths.length === 0) {
      throw new NotFoundException('Path not found');
    }

    const attemptsByProblem = await this.createAttemptsMap(userId, paths);
    return this.buildProgress(paths, attemptsByProblem)[0];
  }
}
