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
          },
        },
      },
    });

    if (!problem) {
      throw new NotFoundException('Problem not found');
    }

    const existingProgress = await this.prisma.userProgress.findUnique({
      where: {
        userId_levelId: {
          userId: user.id,
          levelId: problem.levelId,
        },
      },
    });

    const levelPoints = problem.level.points ?? 0;
    const now = new Date();
    const alreadyMastered =
      existingProgress?.status === ProgressStatus.MASTERED &&
      (existingProgress.masteryScore ?? 0) >= levelPoints;
    const completed = dto.outcome === AttemptOutcome.CORRECT || alreadyMastered;
    const nextStatus = completed ? ProgressStatus.MASTERED : ProgressStatus.IN_PROGRESS;
    const masteryScore = completed ? levelPoints : existingProgress?.masteryScore ?? 0;

    return this.prisma.$transaction(async (tx) => {
      const attempt = await tx.attempt.create({
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

      const updateData: Prisma.UserProgressUpdateInput = {
        status: nextStatus,
        masteryScore,
        hintsUsed: dto.hintsUsed ?? 0,
        lastInteraction: now,
        attemptsCount: { increment: 1 },
      };

      const createData: Prisma.UserProgressCreateInput = {
        user: { connect: { id: user.id } },
        level: { connect: { id: problem.levelId } },
        status: nextStatus,
        masteryScore,
        attemptsCount: 1,
        hintsUsed: dto.hintsUsed ?? 0,
        unlockedAt: now,
        lastInteraction: now,
      };

      const progress = await tx.userProgress.upsert({
        where: {
          userId_levelId: {
            userId: user.id,
            levelId: problem.levelId,
          },
        },
        update: updateData,
        create: createData,
        select: {
          status: true,
          masteryScore: true,
          attemptsCount: true,
          hintsUsed: true,
          lastInteraction: true,
        },
      });

      return {
        attempt,
        progress,
        level: {
          id: problem.levelId,
          points: levelPoints,
        },
      };
    });
  }
}
