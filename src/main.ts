import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './utils/http.exception.filter';
import { PrismaExceptionFilter } from './utils/prisma.exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new HttpExceptionFilter(), new PrismaExceptionFilter())
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true
  }));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
