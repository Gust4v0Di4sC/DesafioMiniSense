import { PrismaClient } from '@prisma/client';

export const DEFAULT_USER_ID = 1;

export const measurementUnits = [
  { id: 1, symbol: '°C', description: 'Celsius' },
  { id: 2, symbol: 'mg/m³', description: 'Miligrama por metro cúbico' },
  { id: 3, symbol: 'hPa', description: 'Hectopascal' },
  { id: 4, symbol: 'lux', description: 'Lux' },
  { id: 5, symbol: '%', description: 'Porcentagem' },
];

const demoDevices = [
  {
    key: '10dd35008a0f4d838c3dc22856660928',
    label: 'sensor 001',
    description: "Isaac's Room control",
    userId: DEFAULT_USER_ID,
  },
  {
    key: '27b26e48cd674cc38ec45808cf48fa07',
    label: "Kitchen's freezer sensor (Arduino)",
    description: "Kitchen's freezer sensor (Arduino)",
    userId: DEFAULT_USER_ID,
  },
];

const demoStreams = [
  {
    key: 'b4ea3ba494644200b679ac593f55cb87',
    label: 'temperature',
    unitId: 1,
    deviceKey: '10dd35008a0f4d838c3dc22856660928',
  },
  {
    key: '8961bd9a4d1e439ebf3b86af5b9d5c1f',
    label: 'temperature',
    unitId: 1,
    deviceKey: '27b26e48cd674cc38ec45808cf48fa07',
  },
  {
    key: 'ae194d2b61e0496fbf601f9edcf8b0c5',
    label: 'humidity',
    unitId: 5,
    deviceKey: '10dd35008a0f4d838c3dc22856660928',
  },
  {
    key: '3170f851fd9045ed99e5d86ababdb80e',
    label: 'carbon dioxide',
    unitId: 2,
    deviceKey: '10dd35008a0f4d838c3dc22856660928',
  },
  {
    key: '8f297f9866ed46b0bfc6e0dbef53fb44',
    label: 'luminosity',
    unitId: 4,
    deviceKey: '27b26e48cd674cc38ec45808cf48fa07',
  },
];

const demoMeasurements = [
  {
    id: 1001,
    streamKey: 'b4ea3ba494644200b679ac593f55cb87',
    timestamp: 1506455510,
    value: 24.11,
  },
  {
    id: 1002,
    streamKey: 'b4ea3ba494644200b679ac593f55cb87',
    timestamp: 1506455530,
    value: 24.18,
  },
  {
    id: 1003,
    streamKey: 'b4ea3ba494644200b679ac593f55cb87',
    timestamp: 1506455551,
    value: 24.24,
  },
  {
    id: 1004,
    streamKey: 'b4ea3ba494644200b679ac593f55cb87',
    timestamp: 1506455566,
    value: 24.33,
  },
  {
    id: 1005,
    streamKey: 'b4ea3ba494644200b679ac593f55cb87',
    timestamp: 1506455591,
    value: 24.39,
  },
  {
    id: 1006,
    streamKey: 'b4ea3ba494644200b679ac593f55cb87',
    timestamp: 1506455620,
    value: 24.45,
  },
  {
    id: 1007,
    streamKey: 'b4ea3ba494644200b679ac593f55cb87',
    timestamp: 1506455650,
    value: 24.5,
  },
  {
    id: 2001,
    streamKey: '8961bd9a4d1e439ebf3b86af5b9d5c1f',
    timestamp: 1506455510,
    value: -6.56,
  },
  {
    id: 2002,
    streamKey: '8961bd9a4d1e439ebf3b86af5b9d5c1f',
    timestamp: 1506455530,
    value: -6.55,
  },
  {
    id: 2003,
    streamKey: '8961bd9a4d1e439ebf3b86af5b9d5c1f',
    timestamp: 1506455551,
    value: -6.56,
  },
  {
    id: 2004,
    streamKey: '8961bd9a4d1e439ebf3b86af5b9d5c1f',
    timestamp: 1506455566,
    value: -6.54,
  },
  {
    id: 2005,
    streamKey: '8961bd9a4d1e439ebf3b86af5b9d5c1f',
    timestamp: 1506455591,
    value: -6.56,
  },
  {
    id: 2006,
    streamKey: '8961bd9a4d1e439ebf3b86af5b9d5c1f',
    timestamp: 1506521102,
    value: -6.53,
  },
  {
    id: 3001,
    streamKey: 'ae194d2b61e0496fbf601f9edcf8b0c5',
    timestamp: 1506455510,
    value: 42.2,
  },
  {
    id: 3002,
    streamKey: 'ae194d2b61e0496fbf601f9edcf8b0c5',
    timestamp: 1506455566,
    value: 42.5,
  },
  {
    id: 3003,
    streamKey: 'ae194d2b61e0496fbf601f9edcf8b0c5',
    timestamp: 1506455591,
    value: 42.8,
  },
  {
    id: 4001,
    streamKey: '3170f851fd9045ed99e5d86ababdb80e',
    timestamp: 1506455510,
    value: 0.62,
  },
  {
    id: 4002,
    streamKey: '3170f851fd9045ed99e5d86ababdb80e',
    timestamp: 1506455566,
    value: 0.64,
  },
  {
    id: 4003,
    streamKey: '3170f851fd9045ed99e5d86ababdb80e',
    timestamp: 1506455591,
    value: 0.67,
  },
  {
    id: 5001,
    streamKey: '8f297f9866ed46b0bfc6e0dbef53fb44',
    timestamp: 1506455510,
    value: 315,
  },
  {
    id: 5002,
    streamKey: '8f297f9866ed46b0bfc6e0dbef53fb44',
    timestamp: 1506455566,
    value: 322,
  },
  {
    id: 5003,
    streamKey: '8f297f9866ed46b0bfc6e0dbef53fb44',
    timestamp: 1506455591,
    value: 331,
  },
];

export async function seedReferenceData(prisma: PrismaClient): Promise<void> {
  await prisma.user.upsert({
    where: { id: DEFAULT_USER_ID },
    update: { name: 'Default User' },
    create: { id: DEFAULT_USER_ID, name: 'Default User' },
  });

  for (const unit of measurementUnits) {
    await prisma.measurementUnit.upsert({
      where: { id: unit.id },
      update: {
        symbol: unit.symbol,
        description: unit.description,
      },
      create: unit,
    });
  }
}

export async function seedDemoData(prisma: PrismaClient): Promise<void> {
  await seedReferenceData(prisma);

  const seededDeviceIds = new Map<string, number>();

  for (const device of demoDevices) {
    const seededDevice = await prisma.sensorDevice.upsert({
      where: { key: device.key },
      update: {
        label: device.label,
        description: device.description,
        userId: device.userId,
      },
      create: device,
    });
    seededDeviceIds.set(seededDevice.key, seededDevice.id);
  }

  const seededStreams = new Map<string, { id: number; unitId: number }>();

  for (const stream of demoStreams) {
    const deviceId = seededDeviceIds.get(stream.deviceKey);

    if (!deviceId) {
      throw new Error(`Dispositivo demo não encontrado: ${stream.deviceKey}`);
    }

    const seededStream = await prisma.dataStream.upsert({
      where: { key: stream.key },
      update: {
        label: stream.label,
        unitId: stream.unitId,
        deviceId,
        enabled: true,
      },
      create: {
        key: stream.key,
        label: stream.label,
        unitId: stream.unitId,
        deviceId,
      },
    });
    seededStreams.set(seededStream.key, {
      id: seededStream.id,
      unitId: seededStream.unitId,
    });
  }

  for (const measurement of demoMeasurements) {
    const stream = seededStreams.get(measurement.streamKey);

    if (!stream) {
      throw new Error(`Stream demo não encontrada: ${measurement.streamKey}`);
    }

    await prisma.sensorData.upsert({
      where: { id: measurement.id },
      update: {
        timestamp: measurement.timestamp,
        value: measurement.value,
        unitId: stream.unitId,
        streamId: stream.id,
      },
      create: {
        id: measurement.id,
        timestamp: measurement.timestamp,
        value: measurement.value,
        unitId: stream.unitId,
        streamId: stream.id,
      },
    });
  }
}
