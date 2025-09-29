import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { JwtUser } from '../auth/jwt.strategy';
import { SubmitAttemptDto } from './dto/submit-attempt.dto';
import { ProblemsService } from './problems.service';

@Controller('problems')
export class ProblemsController {
  constructor(private readonly problemsService: ProblemsService) {}

  @Get(':id')
  getProblem(@Param('id') id: string) {
    return this.problemsService.getProblem(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/summary')
  getSummary(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as JwtUser;
    return this.problemsService.getAttemptSummary(id, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/attempts')
  submitAttempt(
    @Param('id') id: string,
    @Body() dto: SubmitAttemptDto,
    @Req() req: Request,
  ) {
    const user = req.user as JwtUser | undefined;
    return this.problemsService.recordAttempt(id, user, dto);
  }
}
