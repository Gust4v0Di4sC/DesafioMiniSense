import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DataStreamResponseDto,
  MeasurementResponseDto,
} from '../../common/dto/minisense-response.dto';
import { generateSensorKey } from '../../common/key-generator';
import { DataStreamRecord } from './data-streams.repository';
import { CreateDataStreamDto } from './dto/create-data-stream.dto';
import { PublishSensorDataDto } from './dto/publish-sensor-data.dto';
import { DataStreamsRepository } from './data-streams.repository';

@Injectable()
export class DataStreamsService {
  constructor(private readonly repository: DataStreamsRepository) {}

  async create(
    deviceKey: string,
    input: CreateDataStreamDto,
  ): Promise<DataStreamResponseDto> {
    const deviceId = await this.repository.findDeviceIdByKey(deviceKey);

    if (!deviceId) {
      throw new NotFoundException('Dispositivo sensor não encontrado');
    }

    if (!(await this.repository.measurementUnitExists(input.unitId))) {
      throw new NotFoundException('Unidade de medida não encontrada');
    }

    return this.repository.create({
      key: generateSensorKey(),
      label: input.label,
      unitId: input.unitId,
      deviceId,
    });
  }

  async getByKey(streamKey: string): Promise<DataStreamResponseDto> {
    const stream = await this.findRequiredStream(streamKey);
    const measurements = await this.repository.findMeasurements(stream.id);

    return {
      id: stream.id,
      key: stream.key,
      label: stream.label,
      unitId: stream.unitId,
      deviceId: stream.deviceId,
      measurementCount: stream.measurementCount,
      measurements,
    };
  }

  async publishMeasurement(
    streamKey: string,
    input: PublishSensorDataDto,
  ): Promise<MeasurementResponseDto> {
    const stream = await this.findRequiredStream(streamKey);

    if (!stream.enabled) {
      throw new BadRequestException('Stream de dados está desabilitada');
    }

    return this.repository.createMeasurement({
      timestamp: input.timestamp,
      value: input.value,
      unitId: stream.unitId,
      streamId: stream.id,
    });
  }

  private async findRequiredStream(
    streamKey: string,
  ): Promise<DataStreamRecord> {
    const stream = await this.repository.findByKey(streamKey);

    if (!stream) {
      throw new NotFoundException('Stream de dados não encontrada');
    }

    return stream;
  }
}
