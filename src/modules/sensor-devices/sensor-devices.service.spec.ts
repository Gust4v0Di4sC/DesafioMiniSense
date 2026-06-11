import { NotFoundException } from '@nestjs/common';
import { SensorDevicesRepository } from './sensor-devices.repository';
import { SensorDevicesService } from './sensor-devices.service';

describe('SensorDevicesService', () => {
  let repository: jest.Mocked<
    Pick<
      SensorDevicesRepository,
      'userExists' | 'create' | 'findByUserId' | 'findByKey'
    >
  >;
  let service: SensorDevicesService;

  beforeEach(() => {
    repository = {
      userExists: jest.fn(),
      create: jest.fn(),
      findByUserId: jest.fn(),
      findByKey: jest.fn(),
    };
    service = new SensorDevicesService(repository as SensorDevicesRepository);
  });

  it('registers a device for an existing user', async () => {
    repository.userExists.mockResolvedValue(true);
    repository.create.mockResolvedValue({
      id: 1,
      key: '10dd35008a0f4d838c3dc22856660928',
      label: 'sensor 001',
      description: "Isaac's Room control",
    });

    const device = await service.create(1, {
      label: 'sensor 001',
      description: "Isaac's Room control",
    });

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        key: expect.any(String) as string,
        label: 'sensor 001',
        description: "Isaac's Room control",
        userId: 1,
      }),
    );
    expect(device.key).toHaveLength(32);
  });

  it('rejects device registration for an unknown user', async () => {
    repository.userExists.mockResolvedValue(false);

    await expect(
      service.create(999, { label: 'sensor', description: 'sensor' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('returns device details or 404 by key', async () => {
    repository.findByKey.mockResolvedValueOnce(null);

    await expect(service.getByKey('unknown')).rejects.toBeInstanceOf(
      NotFoundException,
    );

    repository.findByKey.mockResolvedValueOnce({
      id: 1,
      key: 'device-key',
      label: 'freezer',
      description: 'freezer',
      streams: [],
    });

    await expect(service.getByKey('device-key')).resolves.toMatchObject({
      key: 'device-key',
    });
  });
});
