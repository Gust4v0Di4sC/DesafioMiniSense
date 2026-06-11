import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { SensorDevicesController } from './sensor-devices.controller';
import { SensorDevicesRepository } from './sensor-devices.repository';
import { SensorDevicesService } from './sensor-devices.service';

@Module({
  imports: [PrismaModule],
  controllers: [SensorDevicesController],
  providers: [SensorDevicesService, SensorDevicesRepository],
})
export class SensorDevicesModule {}
