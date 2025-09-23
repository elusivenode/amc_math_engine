import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(private readonly configService: ConfigService) {
    const datasourceUrl =
      configService.get<string>('DATABASE_POOL_URL') ??
      configService.get<string>('DATABASE_URL');

    if (!datasourceUrl) {
      throw new Error('DATABASE_URL or DATABASE_POOL_URL must be configured');
    }

    super({
      datasourceUrl,
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      this.logger.log('Connected to database');
    } catch (error) {
      this.logger.error('Failed to connect to database', error as Error);
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
