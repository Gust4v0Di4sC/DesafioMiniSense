import { Injectable } from '@nestjs/common';
import { MeasurementUnitResponseDto } from '../../common/dto/minisense-response.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MeasurementUnitsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<MeasurementUnitResponseDto[]> {
    return this.prisma.measurementUnit.findMany({ orderBy: { id: 'asc' } });
  }
}
