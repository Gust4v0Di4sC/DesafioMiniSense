import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class DatabaseSeedService implements OnApplicationBootstrap {
  constructor(private readonly prisma: PrismaService) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.prisma.user.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1, name: 'Default User' },
    });

    const units = [
      { id: 1, symbol: '\u00baC', description: 'Celsius' },
      { id: 2, symbol: 'mg/m\u00b3', description: 'Megagram per cubic metre' },
      { id: 3, symbol: 'hPA', description: 'hectopasca' },
      { id: 4, symbol: 'lux', description: 'Lux' },
      { id: 5, symbol: '%', description: 'Percent' },
    ];

    for (const unit of units) {
      await this.prisma.measurementUnit.upsert({
        where: { id: unit.id },
        update: {
          symbol: unit.symbol,
          description: unit.description,
        },
        create: unit,
      });
    }
  }
}
