import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MeasurementUnitResponseDto } from '../../common/dto/minisense-response.dto';
import { MeasurementUnitsService } from './measurement-units.service';

@ApiTags('measurement-units')
@Controller('measurement-units')
export class MeasurementUnitsController {
  constructor(private readonly service: MeasurementUnitsService) {}

  @Get()
  @ApiOperation({ summary: 'Consultar unidades de medida' })
  @ApiOkResponse({ type: [MeasurementUnitResponseDto] })
  list(): Promise<MeasurementUnitResponseDto[]> {
    return this.service.list();
  }
}
