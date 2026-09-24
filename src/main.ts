import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);

  // Cookie parser for JWT auth cookies
  app.use(cookieParser());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Enable CORS for client applications
  app.enableCors({
    origin: true,
    credentials: true,
  });

  await app.listen(port);
  logger.log(`Fruit Junction API is running on: http://localhost:${port}`);
  logger.log(`GraphQL Playground / Sandbox: http://localhost:${port}/graphql`);
}
bootstrap();
