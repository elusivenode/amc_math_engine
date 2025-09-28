import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export type PathWithContent = Prisma.PathGetPayload<{
  include: {
    subpaths: {
      include: {
        levels: {
          include: {
            problems: {
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

@Injectable()
export class PathsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<PathWithContent[]> {
    return this.prisma.path.findMany({
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
                  take: 1,
                },
              },
            },
          },
        },
      },
    });
  }
}
