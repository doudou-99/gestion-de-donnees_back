import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './utils/http.exception.filter';
import { PrismaExceptionFilter } from './utils/prisma.exception.filter';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Request, Response } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new HttpExceptionFilter(), new PrismaExceptionFilter())
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true
  }));
  app.use(cookieParser());
  app.use('/favicon.ico', (req: Request, res: Response) => res.status(204).end());
  app.enableCors({ origin: true, credentials: true })

  const config = new DocumentBuilder()
    .setTitle('Data management')
    .setDescription('API that allows each user to manage the files and groups.')
    .setVersion('1.0')
    .addTag('Data management')
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, documentFactory, {
    jsonDocumentUrl: 'swagger/json'
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
