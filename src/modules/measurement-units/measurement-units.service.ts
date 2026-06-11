import { Injectable } from '@nestjs/common';
import { MeasurementUnitResponseDto } from '../../common/dto/minisense-response.dto';
import { MeasurementUnitsRepository } from './measurement-units.repository';

@Injectable()
export class MeasurementUnitsService {
  constructor(private readonly repository: MeasurementUnitsRepository) {}

  list(): Promise<MeasurementUnitResponseDto[]> {
    return this.repository.findAll();
  }
}
