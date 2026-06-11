import { Injectable } from '@nestjs/common';
import {
  CreatedSensorDeviceResponseDto,
  MeasurementResponseDto,
  SensorDeviceResponseDto,
} from '../../common/dto/minisense-response.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SensorDevicesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async userExists(userId: number): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    return Boolean(user);
  }

  create(input: {
    key: string;
    label: string;
    description: string;
    userId: number;
  }): Promise<CreatedSensorDeviceResponseDto> {
    return this.prisma.sensorDevice.create({
      data: input,
      select: {
        id: true,
        key: true,
        label: true,
        description: true,
      },
    });
  }

  async findByUserId(userId: number): Promise<SensorDeviceResponseDto[]> {
    const devices = await this.prisma.sensorDevice.findMany({
      where: { userId },
      include: {
        streams: {
          include: { _count: { select: { measurements: true } } },
          orderBy: { id: 'asc' },
        },
      },
      orderBy: { id: 'asc' },
    });

    return devices.map((device) => ({
      id: device.id,
      key: device.key,
      label: device.label,
      description: device.description,
      streams: device.streams.map((stream) => ({
        id: stream.id,
        key: stream.key,
        label: stream.label,
        unitId: stream.unitId,
        deviceId: stream.deviceId,
        measurementCount: stream._count.measurements,
      })),
    }));
  }

  async findByKey(key: string): Promise<SensorDeviceResponseDto | null> {
    const device = await this.prisma.sensorDevice.findUnique({
      where: { key },
      include: {
        streams: {
          include: { _count: { select: { measurements: true } } },
          orderBy: { id: 'asc' },
        },
      },
    });

    if (!device) {
      return null;
    }

    const streams = await Promise.all(
      device.streams.map(async (stream) => ({
        id: stream.id,
        key: stream.key,
        label: stream.label,
        unitId: stream.unitId,
        deviceId: stream.deviceId,
        measurementCount: stream._count.measurements,
        measurements: await this.findRecentMeasurements(stream.id, 5),
      })),
    );

    return {
      id: device.id,
      key: device.key,
      label: device.label,
      description: device.description,
      streams,
    };
  }

  private findRecentMeasurements(
    streamId: number,
    limit: number,
  ): Promise<MeasurementResponseDto[]> {
    return this.prisma.sensorData.findMany({
      where: { streamId },
      select: {
        timestamp: true,
        value: true,
      },
      orderBy: [{ timestamp: 'desc' }, { id: 'desc' }],
      take: limit,
    });
  }
}
