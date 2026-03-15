import Bugsnag from '@bugsnag/node';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import session from 'express-session';
import { DataSource } from 'typeorm';
import { ISession, TypeormStore } from 'connect-typeorm';
import { SessionEntity } from '@auth-lib/nest';
import { AppModule } from './app/app.module';
import { BugsnagExceptionFilter } from './app/bugsnag.filter';
import { environment } from './environments/environment';

if (environment.bugsnagApiKey) {
  Bugsnag.start({ apiKey: environment.bugsnagApiKey });
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const dataSource: DataSource = app.get(DataSource);
  const sessionRepository = dataSource.getRepository<ISession>(SessionEntity);

  app.use(
    session({
      secret: process.env['SESSION_SECRET'] || 'task-manager-dev-secret',
      resave: false,
      saveUninitialized: false,
      store: new TypeormStore({ cleanupLimit: 2 }).connect(sessionRepository),
      cookie: {
        httpOnly: true,
        secure: environment.isProd,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      },
    }),
  );

  app.useGlobalFilters(new BugsnagExceptionFilter());

  const port: string | number = process.env['PORT'] || 3333;
  await app.listen(port);
  Logger.log(`Application is running on: http://localhost:${port}/${globalPrefix}`);
}

bootstrap();
