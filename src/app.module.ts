import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DataStreamsModule } from './modules/data-streams/data-streams.module';
import { MeasurementUnitsModule } from './modules/measurement-units/measurement-units.module';
import { SensorDevicesModule } from './modules/sensor-devices/sensor-devices.module';

@Module({
  controllers: [AppController],
  imports: [MeasurementUnitsModule, SensorDevicesModule, DataStreamsModule],
})
export class AppModule {}
