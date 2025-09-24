import { Controller, Get } from '@nestjs/common';
import { PathsService, PathWithContent } from './paths.service';

@Controller('paths')
export class PathsController {
  constructor(private readonly pathsService: PathsService) {}

  @Get()
  async getPaths(): Promise<PathWithContent[]> {
    return this.pathsService.findAll();
  }
}
