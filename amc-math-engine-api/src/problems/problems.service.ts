import {
  AttemptOutcome,
  Prisma,
  ProgressStatus,
} from '@prisma/client';
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import type { JwtUser } from '../auth/jwt.strategy';
import { PrismaService } from '../prisma/prisma.service';
import { SubmitAttemptDto } from './dto/submit-attempt.dto';

export type ProblemWithRelations = Prisma.ProblemGetPayload<{
  include: {
    level: {
      select: {
        id: true;
        title: true;
        points: true;
        subpath: {
          select: {
            id: true;
            stage: true;
            title: true;
            path: {
              select: {
                slug: true;
                title: true;
              };
            };
          };
        };
      };
    };
    hints: {
      orderBy: {
        order: 'asc';
      };
    };
  };
}>;

type AttemptRecord = {
  id: string;
  outcome: AttemptOutcome;
  hintsUsed: number;
  timeSpentSec: number | null;
  submittedAt: Date;
};

@Injectable()
export class ProblemsService {
  constructor(private readonly prisma: PrismaService) {}

  async getProblem(problemId: string): Promise<ProblemWithRelations> {
    const problem = await this.prisma.problem.findUnique({
      where: { id: problemId },
      include: {
        level: {
          select: {
            id: true,
            title: true,
            points: true,
            subpath: {
              select: {
                id: true,
                stage: true,
                title: true,
              },
            },
          },
        },
        hints: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!problem) {
      throw new NotFoundException('Problem not found');
    }

    return problem;
  }

  async recordAttempt(
    problemId: string,
    user: JwtUser | undefined,
    dto: SubmitAttemptDto,
  ) {
    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    const problem = await this.prisma.problem.findUnique({
      where: { id: problemId },
      include: {
        level: {
          select: {
            id: true,
            points: true,
            subpath: {
              select: {
                path: {
                  select: {
                    slug: true,
                    title: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!problem) {
      throw new NotFoundException('Problem not found');
    }

    const attempt = await this.prisma.attempt.create({
      data: {
        userId: user.id,
        problemId: problem.id,
        outcome: dto.outcome,
        approach: dto.response,
        timeSpentSec: dto.timeSpentSec,
        hintsUsed: dto.hintsUsed ?? 0,
      },
      select: {
        id: true,
        outcome: true,
        hintsUsed: true,
        timeSpentSec: true,
        submittedAt: true,
      },
    });

    // Maintain level progress for future expansion
    await this.prisma.userProgress.upsert({
      where: {
        userId_levelId: {
          userId: user.id,
          levelId: problem.levelId,
        },
      },
      update: {
        status:
          dto.outcome === AttemptOutcome.CORRECT
            ? ProgressStatus.MASTERED
            : ProgressStatus.IN_PROGRESS,
        masteryScore:
          dto.outcome === AttemptOutcome.CORRECT ? problem.level.points ?? 0 : undefined,
        hintsUsed: dto.hintsUsed ?? 0,
        lastInteraction: new Date(),
        attemptsCount: { increment: 1 },
      },
      create: {
        user: { connect: { id: user.id } },
        level: { connect: { id: problem.levelId } },
        status:
          dto.outcome === AttemptOutcome.CORRECT
            ? ProgressStatus.MASTERED
            : ProgressStatus.IN_PROGRESS,
        masteryScore: dto.outcome === AttemptOutcome.CORRECT ? problem.level.points ?? 0 : 0,
        attemptsCount: 1,
        hintsUsed: dto.hintsUsed ?? 0,
        unlockedAt: new Date(),
        lastInteraction: new Date(),
      },
    });

    const summary = await this.getAttemptSummary(problemId, user.id);

    return {
      attempt,
      progress: summary.progress,
      level: summary.level,
      attempts: summary.attempts,
    };
  }

  async getAttemptSummary(problemId: string, userId: string) {
    const problem = await this.prisma.problem.findUnique({
      where: { id: problemId },
      include: {
        level: {
          select: {
            id: true,
            points: true,
          },
        },
      },
    });

    if (!problem) {
      throw new NotFoundException('Problem not found');
    }

    const attempts = await this.prisma.attempt.findMany({
      where: {
        userId,
        problemId: problem.id,
      },
      orderBy: {
        submittedAt: 'desc',
      },
      take: 10,
    });

    const latestAttempt = attempts[0];
    const mastered = attempts.some((attempt) => attempt.outcome === AttemptOutcome.CORRECT);
    const inProgress = !mastered && attempts.length > 0;
    const status = mastered
      ? ProgressStatus.MASTERED
      : inProgress
      ? ProgressStatus.IN_PROGRESS
      : ProgressStatus.AVAILABLE;

    return {
      progress: {
        status,
        masteryScore: mastered ? problem.level.points ?? 0 : 0,
        attemptsCount: attempts.length,
        hintsUsed: latestAttempt?.hintsUsed ?? 0,
        lastInteraction: latestAttempt?.submittedAt ?? null,
      },
      attempts: attempts as AttemptRecord[],
      level: {
        id: problem.level.id,
        points: problem.level.points ?? 0,
      },
    };
  }
}
