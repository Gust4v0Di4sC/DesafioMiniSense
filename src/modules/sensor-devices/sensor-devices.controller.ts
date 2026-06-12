import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreatedSensorDeviceResponseDto,
  SensorDeviceResponseDto,
} from '../../common/dto/minisense-response.dto';
import { CreateSensorDeviceDto } from './dto/create-sensor-device.dto';
import { SensorDevicesService } from './sensor-devices.service';

const DEFAULT_USER_ID = 1;

@ApiTags('sensor-devices')
@Controller()
export class SensorDevicesController {
  constructor(private readonly service: SensorDevicesService) {}

  @Get('sensor-devices')
  @ApiOperation({ summary: 'Consultar dispositivos do usuário padrão' })
  @ApiOkResponse({ type: [SensorDeviceResponseDto] })
  listDefaultUserDevices(): Promise<SensorDeviceResponseDto[]> {
    return this.service.listByUser(DEFAULT_USER_ID);
  }

  @Get('users/:userId/devices')
  @ApiOperation({ summary: 'Consultar dispositivos de um usuário' })
  @ApiParam({ name: 'userId', example: 1 })
  @ApiOkResponse({ type: [SensorDeviceResponseDto] })
  listByUser(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<SensorDeviceResponseDto[]> {
    return this.service.listByUser(userId);
  }

  @Post('sensor-devices')
  @ApiOperation({ summary: 'Registrar dispositivo para o usuário padrão' })
  @ApiCreatedResponse({ type: CreatedSensorDeviceResponseDto })
  createForDefaultUser(
    @Body() body: CreateSensorDeviceDto,
  ): Promise<CreatedSensorDeviceResponseDto> {
    return this.service.create(DEFAULT_USER_ID, body);
  }

  @Post('users/:userId/devices')
  @ApiOperation({ summary: 'Registrar dispositivo para um usuário' })
  @ApiParam({ name: 'userId', example: 1 })
  @ApiCreatedResponse({ type: CreatedSensorDeviceResponseDto })
  create(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() body: CreateSensorDeviceDto,
  ): Promise<CreatedSensorDeviceResponseDto> {
    return this.service.create(userId, body);
  }

  @Get('sensor-devices/:deviceKey')
  @ApiOperation({
    summary: 'Consultar dispositivo por key com 5 medições recentes por stream',
  })
  @ApiParam({ name: 'deviceKey' })
  @ApiOkResponse({ type: SensorDeviceResponseDto })
  getSensorDeviceByKey(
    @Param('deviceKey') deviceKey: string,
  ): Promise<SensorDeviceResponseDto> {
    return this.service.getByKey(deviceKey);
  }

  @Get('devices/:deviceKey')
  @ApiOperation({
    summary: 'Consultar dispositivo por key com 5 medições recentes por stream',
  })
  @ApiParam({ name: 'deviceKey' })
  @ApiOkResponse({ type: SensorDeviceResponseDto })
  getByKey(
    @Param('deviceKey') deviceKey: string,
  ): Promise<SensorDeviceResponseDto> {
    return this.service.getByKey(deviceKey);
  }
}
