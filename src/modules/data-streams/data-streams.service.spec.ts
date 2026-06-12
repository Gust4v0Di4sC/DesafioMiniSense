import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DataStreamsRepository } from './data-streams.repository';
import { DataStreamsService } from './data-streams.service';

describe('DataStreamsService', () => {
  let repository: jest.Mocked<
    Pick<
      DataStreamsRepository,
      | 'findDeviceIdByKey'
      | 'measurementUnitExists'
      | 'create'
      | 'findByKey'
      | 'findMeasurements'
      | 'createMeasurement'
    >
  >;
  let service: DataStreamsService;

  beforeEach(() => {
    repository = {
      findDeviceIdByKey: jest.fn(),
      measurementUnitExists: jest.fn(),
      create: jest.fn(),
      findByKey: jest.fn(),
      findMeasurements: jest.fn(),
      createMeasurement: jest.fn(),
    };
    service = new DataStreamsService(repository as DataStreamsRepository);
  });

  it('registra uma stream com dispositivo e unidade válidos', async () => {
    repository.findDeviceIdByKey.mockResolvedValue(2);
    repository.measurementUnitExists.mockResolvedValue(true);
    repository.create.mockResolvedValue({
      id: 1,
      key: 'stream-key',
      label: 'temperature',
      unitId: 1,
      deviceId: 2,
      measurementCount: 0,
    });

    const stream = await service.create('device-key', {
      label: 'temperature',
      unitId: 1,
    });

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        key: expect.any(String) as string,
        label: 'temperature',
        unitId: 1,
        deviceId: 2,
      }),
    );
    expect(stream.measurementCount).toBe(0);
  });

  it('rejeita cadastro de stream com dispositivo ou unidade inválidos', async () => {
    repository.findDeviceIdByKey.mockResolvedValueOnce(null);

    await expect(
      service.create('unknown', { label: 'temperature', unitId: 1 }),
    ).rejects.toBeInstanceOf(NotFoundException);

    repository.findDeviceIdByKey.mockResolvedValueOnce(2);
    repository.measurementUnitExists.mockResolvedValueOnce(false);

    await expect(
      service.create('device-key', { label: 'temperature', unitId: 999 }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('publica uma medição copiando a unidade da stream', async () => {
    repository.findByKey.mockResolvedValue({
      id: 1,
      key: 'stream-key',
      label: 'temperature',
      unitId: 1,
      deviceId: 2,
      enabled: true,
      measurementCount: 0,
    });
    repository.createMeasurement.mockResolvedValue({
      id: 123,
      timestamp: 1506521102,
      value: 28.5,
      unitId: 1,
    });

    await expect(
      service.publishMeasurement('stream-key', {
        timestamp: 1506521102,
        value: 28.5,
      }),
    ).resolves.toMatchObject({ unitId: 1 });
  });

  it('rejeita medições para streams desabilitadas', async () => {
    repository.findByKey.mockResolvedValue({
      id: 1,
      key: 'stream-key',
      label: 'temperature',
      unitId: 1,
      deviceId: 2,
      enabled: false,
      measurementCount: 0,
    });

    await expect(
      service.publishMeasurement('stream-key', { timestamp: 1, value: 10 }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
