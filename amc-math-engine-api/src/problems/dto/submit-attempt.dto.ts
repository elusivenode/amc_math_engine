import { AttemptOutcome } from '@prisma/client';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class SubmitAttemptDto {
  @IsEnum(AttemptOutcome)
  outcome!: AttemptOutcome;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  response?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  reflection?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  hintsUsed?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  timeSpentSec?: number;
}
