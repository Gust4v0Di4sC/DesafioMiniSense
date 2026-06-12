import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreatedSensorDeviceResponseDto,
  SensorDeviceResponseDto,
} from '../../common/dto/minisense-response.dto';
import { generateSensorKey } from '../../common/key-generator';
import { CreateSensorDeviceDto } from './dto/create-sensor-device.dto';
import { SensorDevicesRepository } from './sensor-devices.repository';

@Injectable()
export class SensorDevicesService {
  constructor(private readonly repository: SensorDevicesRepository) {}

  async listByUser(userId: number): Promise<SensorDeviceResponseDto[]> {
    await this.ensureUserExists(userId);
    return this.repository.findByUserId(userId);
  }

  async create(
    userId: number,
    input: CreateSensorDeviceDto,
  ): Promise<CreatedSensorDeviceResponseDto> {
    await this.ensureUserExists(userId);

    return this.repository.create({
      key: generateSensorKey(),
      label: input.label,
      description: input.description,
      userId,
    });
  }

  async getByKey(deviceKey: string): Promise<SensorDeviceResponseDto> {
    const device = await this.repository.findByKey(deviceKey);

    if (!device) {
      throw new NotFoundException('Dispositivo sensor não encontrado');
    }

    return device;
  }

  private async ensureUserExists(userId: number): Promise<void> {
    if (!(await this.repository.userExists(userId))) {
      throw new NotFoundException('Usuário não encontrado');
    }
  }
}
