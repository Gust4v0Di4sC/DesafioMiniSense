import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { MeasurementUnitsController } from './measurement-units.controller';
import { MeasurementUnitsRepository } from './measurement-units.repository';
import { MeasurementUnitsService } from './measurement-units.service';

@Module({
  imports: [PrismaModule],
  controllers: [MeasurementUnitsController],
  providers: [MeasurementUnitsService, MeasurementUnitsRepository],
})
export class MeasurementUnitsModule {}
