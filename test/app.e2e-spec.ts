import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { execSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import request from 'supertest';
import { App } from 'supertest/types';
import { PrismaExceptionFilter } from './../src/common/filters/prisma-exception.filter';
import { AppModule } from './../src/app.module';

interface MeasurementUnitResponse {
  id: number;
  symbol: string;
  description: string;
}

interface CreatedDeviceResponse {
  id: number;
  key: string;
  label: string;
  description: string;
}

interface CreatedStreamResponse {
  id: number;
  key: string;
  label: string;
  unitId: number;
  deviceId: number;
  measurementCount: number;
}

interface MeasurementResponse {
  timestamp: number;
  value: number;
}

interface StreamWithMeasurementsResponse extends CreatedStreamResponse {
  measurements: MeasurementResponse[];
}

interface DeviceWithMeasurementsResponse extends CreatedDeviceResponse {
  streams: StreamWithMeasurementsResponse[];
}

interface ApiErrorResponse {
  statusCode: number;
  message: string | string[];
}

function expectCleanError(body: ApiErrorResponse, statusCode: number): void {
  expect(body.statusCode).toBe(statusCode);
  expect(body.message).toBeDefined();
  expect(body).not.toHaveProperty('stack');
  expect(JSON.stringify(body)).not.toContain('Prisma');
  expect(JSON.stringify(body)).not.toContain('prisma.');
  expect(JSON.stringify(body)).not.toContain('FOREIGN KEY');
}

describe('MiniSense API (e2e)', () => {
  let app: INestApplication<App>;
  let databaseFile: string;

  beforeEach(async () => {
    const databaseName = `test-${Date.now()}-${Math.random().toString(16).slice(2)}.sqlite`;
    const databaseDirectory = join(process.cwd(), 'data');
    mkdirSync(databaseDirectory, { recursive: true });
    databaseFile = join(databaseDirectory, databaseName);
    process.env.DATABASE_URL = `file:../data/${databaseName}`;

    execSync(
      [
        'npx prisma db execute',
        '--file prisma/migrations/20260610000000_init/migration.sql',
        '--schema prisma/schema.prisma',
      ].join(' '),
      { env: process.env, stdio: 'inherit' },
    );

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new PrismaExceptionFilter());
    app.useGlobalPipes(
      new ValidationPipe({
        forbidNonWhitelisted: true,
        transform: true,
        whitelist: true,
      }),
    );
    await app.init();
  });

  it('GET /', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          name: 'MiniSense API',
          status: 'ok',
          docs: '/docs',
          endpoints: expect.arrayContaining([
            '/measurement-units',
            '/sensor-devices',
            '/sensor-devices/{deviceKey}',
            '/data-streams/{streamKey}',
          ]) as string[],
        });
      });
  });

  it('GET /measurement-units', () => {
    return request(app.getHttpServer())
      .get('/measurement-units')
      .expect(200)
      .expect(({ body }) => {
        const units = body as MeasurementUnitResponse[];

        expect(units).toHaveLength(5);
        expect(units[0]).toMatchObject({
          id: 1,
          symbol: '°C',
          description: 'Celsius',
        });
        expect(units[1]).toMatchObject({
          id: 2,
          symbol: 'mg/m³',
          description: 'Miligrama por metro cúbico',
        });
        expect(units[2]).toMatchObject({
          id: 3,
          symbol: 'hPa',
          description: 'Hectopascal',
        });
      });
  });

  it('carrega base demo com npm run db:seed', async () => {
    execSync('npm run db:seed --silent', {
      env: process.env,
      stdio: 'pipe',
    });

    await request(app.getHttpServer())
      .get('/sensor-devices')
      .expect(200)
      .expect(({ body }) => {
        const devices = body as DeviceWithMeasurementsResponse[];

        expect(devices).toHaveLength(2);
        expect(devices[0]).toMatchObject({
          key: '10dd35008a0f4d838c3dc22856660928',
          label: 'sensor 001',
          streams: [
            {
              key: 'b4ea3ba494644200b679ac593f55cb87',
              label: 'temperature',
              measurementCount: 7,
            },
            {
              key: 'ae194d2b61e0496fbf601f9edcf8b0c5',
              label: 'humidity',
              measurementCount: 3,
            },
            {
              key: '3170f851fd9045ed99e5d86ababdb80e',
              label: 'carbon dioxide',
              measurementCount: 3,
            },
          ],
        });
        expect(devices[1]).toMatchObject({
          key: '27b26e48cd674cc38ec45808cf48fa07',
          label: "Kitchen's freezer sensor (Arduino)",
          streams: [
            {
              key: '8961bd9a4d1e439ebf3b86af5b9d5c1f',
              label: 'temperature',
              measurementCount: 6,
            },
            {
              key: '8f297f9866ed46b0bfc6e0dbef53fb44',
              label: 'luminosity',
              measurementCount: 3,
            },
          ],
        });
      });

    await request(app.getHttpServer())
      .get('/sensor-devices/27b26e48cd674cc38ec45808cf48fa07')
      .expect(200)
      .expect(({ body }) => {
        const device = body as DeviceWithMeasurementsResponse;
        const temperatureStream = device.streams.find(
          (stream) => stream.key === '8961bd9a4d1e439ebf3b86af5b9d5c1f',
        );

        expect(temperatureStream?.measurementCount).toBe(6);
        expect(temperatureStream?.measurements).toHaveLength(5);
        expect(temperatureStream?.measurements[0]).toMatchObject({
          timestamp: 1506521102,
          value: -6.53,
        });
      });

    await request(app.getHttpServer())
      .get('/data-streams/8961bd9a4d1e439ebf3b86af5b9d5c1f')
      .expect(200)
      .expect(({ body }) => {
        const stream = body as StreamWithMeasurementsResponse;

        expect(stream.measurementCount).toBe(6);
        expect(stream.measurements).toHaveLength(6);
      });
  });

  it('executa o fluxo de dispositivo, stream e medição', async () => {
    const deviceResponse = await request(app.getHttpServer())
      .post('/sensor-devices')
      .send({
        label: "Kitchen's freezer sensor (Arduino)",
        description: "Kitchen's freezer sensor (Arduino)",
      })
      .expect(201);
    const device = deviceResponse.body as CreatedDeviceResponse;

    const streamResponse = await request(app.getHttpServer())
      .post(`/sensor-devices/${device.key}/streams`)
      .send({ label: 'temperature', unitId: 1 })
      .expect(201);
    const stream = streamResponse.body as CreatedStreamResponse;

    for (const timestamp of [
      1506521101, 1506521102, 1506521103, 1506521104, 1506521105, 1506521106,
    ]) {
      await request(app.getHttpServer())
        .post(`/data-streams/${stream.key}/measurements`)
        .send({ timestamp, value: 28.5 })
        .expect(201);
    }

    await request(app.getHttpServer())
      .get('/sensor-devices')
      .expect(200)
      .expect(({ body }) => {
        const devices = body as DeviceWithMeasurementsResponse[];

        expect(devices).toHaveLength(1);
        expect(devices[0]).toMatchObject({
          id: device.id,
          key: device.key,
          streams: [
            {
              id: stream.id,
              key: stream.key,
              measurementCount: 6,
            },
          ],
        });
        expect(devices[0].streams[0].measurements).toBeUndefined();
      });

    await request(app.getHttpServer())
      .get(`/sensor-devices/${device.key}`)
      .expect(200)
      .expect(({ body }) => {
        const deviceDetail = body as DeviceWithMeasurementsResponse;

        expect(deviceDetail.streams[0].measurementCount).toBe(6);
        expect(deviceDetail.streams[0].measurements).toHaveLength(5);
        expect(deviceDetail.streams[0].measurements[0]).toMatchObject({
          timestamp: 1506521106,
          value: 28.5,
        });
      });

    await request(app.getHttpServer())
      .get(`/data-streams/${stream.key}`)
      .expect(200)
      .expect(({ body }) => {
        const streamDetail = body as StreamWithMeasurementsResponse;

        expect(streamDetail.measurementCount).toBe(6);
        expect(streamDetail.measurements).toHaveLength(6);
        expect(streamDetail.measurements[0].timestamp).toBe(1506521106);
      });
  });

  it('retorna 400 limpo para payloads inválidos', async () => {
    await request(app.getHttpServer())
      .post('/sensor-devices')
      .send({ description: 'missing label', unexpected: true })
      .expect(400)
      .expect(({ body }) => {
        const error = body as ApiErrorResponse;

        expectCleanError(error, 400);
        expect(error.message).toEqual(
          expect.arrayContaining([
            'property unexpected should not exist',
            'label should not be empty',
            'label must be a string',
          ]),
        );
      });

    return request(app.getHttpServer())
      .post('/sensor-devices/unknown/streams')
      .send({ label: '', unitId: 'abc' })
      .expect(400)
      .expect(({ body }) => {
        const error = body as ApiErrorResponse;

        expectCleanError(error, 400);
        expect(error.message).toEqual(
          expect.arrayContaining([
            'label should not be empty',
            'unitId must not be less than 1',
            'unitId must be an integer number',
          ]),
        );
      });
  });

  it('retorna erros limpos para recursos e relacionamentos inválidos', async () => {
    const deviceResponse = await request(app.getHttpServer())
      .post('/sensor-devices')
      .send({
        label: 'demo sensor',
        description: 'demo sensor',
      })
      .expect(201);
    const device = deviceResponse.body as CreatedDeviceResponse;

    await request(app.getHttpServer())
      .get('/users/999/devices')
      .expect(404)
      .expect(({ body }) => {
        expectCleanError(body as ApiErrorResponse, 404);
        expect((body as ApiErrorResponse).message).toBe(
          'Usuário não encontrado',
        );
      });

    await request(app.getHttpServer())
      .get('/sensor-devices/unknown')
      .expect(404)
      .expect(({ body }) => {
        expectCleanError(body as ApiErrorResponse, 404);
        expect((body as ApiErrorResponse).message).toBe(
          'Dispositivo sensor não encontrado',
        );
      });

    await request(app.getHttpServer())
      .post('/sensor-devices/unknown/streams')
      .send({ label: 'temperature', unitId: 1 })
      .expect(404)
      .expect(({ body }) => {
        expectCleanError(body as ApiErrorResponse, 404);
        expect((body as ApiErrorResponse).message).toBe(
          'Dispositivo sensor não encontrado',
        );
      });

    await request(app.getHttpServer())
      .post(`/sensor-devices/${device.key}/streams`)
      .send({ label: 'temperature', unitId: 999 })
      .expect(404)
      .expect(({ body }) => {
        expectCleanError(body as ApiErrorResponse, 404);
        expect((body as ApiErrorResponse).message).toBe(
          'Unidade de medida não encontrada',
        );
      });

    await request(app.getHttpServer())
      .get('/data-streams/unknown')
      .expect(404)
      .expect(({ body }) => {
        expectCleanError(body as ApiErrorResponse, 404);
        expect((body as ApiErrorResponse).message).toBe(
          'Stream de dados não encontrada',
        );
      });

    await request(app.getHttpServer())
      .post('/data-streams/unknown/measurements')
      .send({ timestamp: 1506521102, value: 28.5 })
      .expect(404)
      .expect(({ body }) => {
        expectCleanError(body as ApiErrorResponse, 404);
        expect((body as ApiErrorResponse).message).toBe(
          'Stream de dados não encontrada',
        );
      });
  });

  it('retorna 400 limpo para medições inválidas', async () => {
    const deviceResponse = await request(app.getHttpServer())
      .post('/sensor-devices')
      .send({
        label: 'demo sensor',
        description: 'demo sensor',
      })
      .expect(201);
    const device = deviceResponse.body as CreatedDeviceResponse;

    const streamResponse = await request(app.getHttpServer())
      .post(`/sensor-devices/${device.key}/streams`)
      .send({ label: 'temperature', unitId: 1 })
      .expect(201);
    const stream = streamResponse.body as CreatedStreamResponse;

    await request(app.getHttpServer())
      .post(`/data-streams/${stream.key}/measurements`)
      .send({ timestamp: 'today', value: 'hot' })
      .expect(400)
      .expect(({ body }) => {
        const error = body as ApiErrorResponse;

        expectCleanError(error, 400);
        expect(error.message).toEqual(
          expect.arrayContaining([
            'timestamp must not be less than 0',
            'timestamp must be an integer number',
            'value must be a number conforming to the specified constraints',
          ]),
        );
      });
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
    rmSync(databaseFile, { force: true });
  });
});
