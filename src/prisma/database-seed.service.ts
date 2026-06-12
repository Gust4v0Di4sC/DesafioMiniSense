import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { seedReferenceData } from './seed-data';

@Injectable()
export class DatabaseSeedService implements OnApplicationBootstrap {
  constructor(private readonly prisma: PrismaService) {}

  async onApplicationBootstrap(): Promise<void> {
    await seedReferenceData(this.prisma);
  }
}
