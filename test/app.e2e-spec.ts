import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { execSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import { join } from 'node:path';
import request from 'supertest';
import { App } from 'supertest/types';
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

describe('MiniSense API (e2e)', () => {
  let app: INestApplication<App>;
  let databaseFile: string;

  beforeEach(async () => {
    const databaseName = `test-${Date.now()}-${Math.random().toString(16).slice(2)}.sqlite`;
    databaseFile = join(process.cwd(), 'data', databaseName);
    process.env.DATABASE_URL = `file:../data/${databaseName}`;

    execSync(
      [
        'npx prisma db execute',
        '--file prisma/migrations/20260610000000_init/migration.sql',
        '--schema prisma/schema.prisma',
      ].join(' '),
      { env: process.env, stdio: 'ignore' },
    );

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
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
          symbol: 'ºC',
          description: 'Celsius',
        });
        expect(units[1]).toMatchObject({
          id: 2,
          symbol: 'mg/m³',
          description: 'Megagram per cubic metre',
        });
        expect(units[2]).toMatchObject({
          id: 3,
          symbol: 'hPA',
          description: 'hectopasca',
        });
      });
  });

  it('runs the device, stream and measurement flow', async () => {
    const deviceResponse = await request(app.getHttpServer())
      .post('/users/1/devices')
      .send({
        label: "Kitchen's freezer sensor (Arduino)",
        description: "Kitchen's freezer sensor (Arduino)",
      })
      .expect(201);
    const device = deviceResponse.body as CreatedDeviceResponse;

    const streamResponse = await request(app.getHttpServer())
      .post(`/devices/${device.key}/streams`)
      .send({ label: 'temperature', unitId: 1 })
      .expect(201);
    const stream = streamResponse.body as CreatedStreamResponse;

    for (const timestamp of [
      1506521101, 1506521102, 1506521103, 1506521104, 1506521105, 1506521106,
    ]) {
      await request(app.getHttpServer())
        .post(`/streams/${stream.key}/measurements`)
        .send({ timestamp, value: 28.5 })
        .expect(201);
    }

    await request(app.getHttpServer())
      .get(`/devices/${device.key}`)
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
      .get(`/streams/${stream.key}`)
      .expect(200)
      .expect(({ body }) => {
        const streamDetail = body as StreamWithMeasurementsResponse;

        expect(streamDetail.measurementCount).toBe(6);
        expect(streamDetail.measurements).toHaveLength(6);
        expect(streamDetail.measurements[0].timestamp).toBe(1506521106);
      });
  });

  it('returns 400 for invalid payloads', () => {
    return request(app.getHttpServer())
      .post('/users/1/devices')
      .send({ description: 'missing label', unexpected: true })
      .expect(400);
  });

  it('returns 404 for unknown resources', async () => {
    await request(app.getHttpServer()).get('/users/999/devices').expect(404);
    await request(app.getHttpServer()).get('/devices/unknown').expect(404);
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
    rmSync(databaseFile, { force: true });
  });
});
