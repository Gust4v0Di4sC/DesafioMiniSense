import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import {
  DataStreamResponseDto,
  MeasurementResponseDto,
} from '../../common/dto/minisense-response.dto';
import { DataStreamsService } from './data-streams.service';
import { CreateDataStreamDto } from './dto/create-data-stream.dto';
import { PublishSensorDataDto } from './dto/publish-sensor-data.dto';

@ApiTags('data-streams')
@Controller()
export class DataStreamsController {
  constructor(private readonly service: DataStreamsService) {}

  @Post('sensor-devices/:deviceKey/streams')
  @ApiOperation({ summary: 'Registrar stream em um dispositivo' })
  @ApiParam({ name: 'deviceKey' })
  @ApiCreatedResponse({ type: DataStreamResponseDto })
  createForSensorDevice(
    @Param('deviceKey') deviceKey: string,
    @Body() body: CreateDataStreamDto,
  ): Promise<DataStreamResponseDto> {
    return this.service.create(deviceKey, body);
  }

  @Post('devices/:deviceKey/streams')
  @ApiOperation({ summary: 'Registrar stream em um dispositivo' })
  @ApiParam({ name: 'deviceKey' })
  @ApiCreatedResponse({ type: DataStreamResponseDto })
  create(
    @Param('deviceKey') deviceKey: string,
    @Body() body: CreateDataStreamDto,
  ): Promise<DataStreamResponseDto> {
    return this.service.create(deviceKey, body);
  }

  @Get('data-streams/:streamKey')
  @ApiOperation({ summary: 'Consultar dados de uma stream' })
  @ApiParam({ name: 'streamKey' })
  @ApiOkResponse({ type: DataStreamResponseDto })
  getDataStreamByKey(
    @Param('streamKey') streamKey: string,
  ): Promise<DataStreamResponseDto> {
    return this.service.getByKey(streamKey);
  }

  @Get('streams/:streamKey')
  @ApiOperation({ summary: 'Consultar dados de uma stream' })
  @ApiParam({ name: 'streamKey' })
  @ApiOkResponse({ type: DataStreamResponseDto })
  getByKey(
    @Param('streamKey') streamKey: string,
  ): Promise<DataStreamResponseDto> {
    return this.service.getByKey(streamKey);
  }

  @Post('data-streams/:streamKey/measurements')
  @ApiOperation({ summary: 'Publicar medição em uma stream' })
  @ApiParam({ name: 'streamKey' })
  @ApiCreatedResponse({ type: MeasurementResponseDto })
  publishDataStreamMeasurement(
    @Param('streamKey') streamKey: string,
    @Body() body: PublishSensorDataDto,
  ): Promise<MeasurementResponseDto> {
    return this.service.publishMeasurement(streamKey, body);
  }

  @Post('streams/:streamKey/measurements')
  @ApiOperation({ summary: 'Publicar medição em uma stream' })
  @ApiParam({ name: 'streamKey' })
  @ApiCreatedResponse({ type: MeasurementResponseDto })
  publishMeasurement(
    @Param('streamKey') streamKey: string,
    @Body() body: PublishSensorDataDto,
  ): Promise<MeasurementResponseDto> {
    return this.service.publishMeasurement(streamKey, body);
  }
}
