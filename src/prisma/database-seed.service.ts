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
      { id: 1, symbol: '°C', description: 'Celsius' },
      { id: 2, symbol: 'mg/m³', description: 'Miligrama por metro cúbico' },
      { id: 3, symbol: 'hPa', description: 'Hectopascal' },
      { id: 4, symbol: 'lux', description: 'Lux' },
      { id: 5, symbol: '%', description: 'Porcentagem' },
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
