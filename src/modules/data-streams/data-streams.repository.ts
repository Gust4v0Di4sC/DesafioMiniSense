import { Injectable } from '@nestjs/common';
import {
  DataStreamResponseDto,
  MeasurementResponseDto,
} from '../../common/dto/minisense-response.dto';
import { PrismaService } from '../../prisma/prisma.service';

export type DataStreamRecord = DataStreamResponseDto & {
  enabled: boolean;
};

@Injectable()
export class DataStreamsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findDeviceIdByKey(deviceKey: string): Promise<number | null> {
    const device = await this.prisma.sensorDevice.findUnique({
      where: { key: deviceKey },
      select: { id: true },
    });

    return device?.id ?? null;
  }

  async measurementUnitExists(unitId: number): Promise<boolean> {
    const unit = await this.prisma.measurementUnit.findUnique({
      where: { id: unitId },
      select: { id: true },
    });

    return Boolean(unit);
  }

  async create(input: {
    key: string;
    label: string;
    unitId: number;
    deviceId: number;
  }): Promise<DataStreamResponseDto> {
    const stream = await this.prisma.dataStream.create({ data: input });

    return {
      id: stream.id,
      key: stream.key,
      label: stream.label,
      unitId: stream.unitId,
      deviceId: stream.deviceId,
      measurementCount: 0,
    };
  }

  async findByKey(streamKey: string): Promise<DataStreamRecord | null> {
    const stream = await this.prisma.dataStream.findUnique({
      where: { key: streamKey },
      include: { _count: { select: { measurements: true } } },
    });

    if (!stream) {
      return null;
    }

    return {
      id: stream.id,
      key: stream.key,
      label: stream.label,
      unitId: stream.unitId,
      deviceId: stream.deviceId,
      enabled: stream.enabled,
      measurementCount: stream._count.measurements,
    };
  }

  findMeasurements(streamId: number): Promise<MeasurementResponseDto[]> {
    return this.prisma.sensorData.findMany({
      where: { streamId },
      select: {
        timestamp: true,
        value: true,
      },
      orderBy: [{ timestamp: 'desc' }, { id: 'desc' }],
    });
  }

  createMeasurement(input: {
    timestamp: number;
    value: number;
    unitId: number;
    streamId: number;
  }): Promise<Required<MeasurementResponseDto>> {
    return this.prisma.sensorData.create({
      data: input,
      select: {
        id: true,
        timestamp: true,
        value: true,
        unitId: true,
      },
    });
  }
}
