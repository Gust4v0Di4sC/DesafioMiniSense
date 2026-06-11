import { Module } from '@nestjs/common';
import { DatabaseSeedService } from './database-seed.service';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService, DatabaseSeedService],
  exports: [PrismaService],
})
export class PrismaModule {}
