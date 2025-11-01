import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

// Plugins
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import compress from '@fastify/compress';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  // Fastify plugins

  // CORS configuration
  await app.register(cors, {
    origin: ['*'], // ajusta a tus orígenes
    credentials: true,
  });

  // Helmet for security headers
  await app.register(helmet);

  // Compression
  await app.register(compress);

  // Global prefix
  app.setGlobalPrefix('api');

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Nest Challenge API')
    .setDescription('API Documentation of the Nest Challenge in Inswitch')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Enter JWT token',
      in: 'header',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const logger = new Logger('Main');
  await app.listen(process.env.PORT ?? 3000);

  logger.log(
    `App is ready and listening on port ${process.env.PORT ?? 3000} 🚀`,
  );
}
bootstrap();
