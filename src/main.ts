import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      transform: true,
      whitelist: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('MiniSense API')
    .setDescription(
      'API REST para gerenciamento de dispositivos IoT e streams de dados.',
    )
    .setVersion('1.0')
    .addTag('measurement-units')
    .addTag('devices')
    .addTag('streams')
    .build();

  SwaggerModule.setup(
    'docs',
    app,
    SwaggerModule.createDocument(app, swaggerConfig),
  );

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);

  const baseUrl = `http://localhost:${port}`;
  logger.log(`API rodando em: ${baseUrl}`);
  logger.log(`Documentação Swagger: ${baseUrl}/docs`);
}
void bootstrap();
