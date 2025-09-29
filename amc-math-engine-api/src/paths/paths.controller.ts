import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { JwtUser } from '../auth/jwt.strategy';
import { PathsService, PathWithContent, PathProgress } from './paths.service';

@Controller('paths')
export class PathsController {
  constructor(private readonly pathsService: PathsService) {}

  @Get()
  async getPaths(): Promise<PathWithContent[]> {
    return this.pathsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('progress')
  async getPathsWithProgress(@Req() req: Request): Promise<PathProgress[]> {
    const user = req.user as JwtUser;
    return this.pathsService.findAllWithProgress(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('progress/:slug')
  async getPathWithProgress(
    @Param('slug') slug: string,
    @Req() req: Request,
  ): Promise<PathProgress> {
    const user = req.user as JwtUser;
    return this.pathsService.findOneWithProgress(user.id, slug);
  }
}
