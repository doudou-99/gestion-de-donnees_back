import { Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationRequest } from './dto/create.notification.request';
import { timeout, catchError, throwError } from 'rxjs';
import express from 'express';
import { AccessTokenGuard } from '../auth/guard/access.token.guard';
import type { RequestPayload } from '../auth/interface/payload.interface';

@Controller('api/v1/notification')
export class NotificationController {

    constructor(private readonly notificationService: NotificationService){}

    @HttpCode(HttpStatus.CREATED)
    @UseGuards(AccessTokenGuard)
    @Post()
    create(@Body() createNotificationRequest: CreateNotificationRequest, @Req() req: express.Request) {
      return this.notificationService.create(createNotificationRequest).pipe(
        timeout(20000),
        catchError((error) => {
          console.error(`Error creating notification: ${error.message}`);
          return throwError(() =>
            new HttpException(
              error.message || 'Failed to create notification',
              error.status || HttpStatus.INTERNAL_SERVER_ERROR,
            ),
          );
        }),
      );
    }
  
    @Get()
    findAll() {
      return this.notificationService.getAll().pipe(
        timeout(15000),
        catchError((error) => {
          console.error(`Error fetching notifications: ${error.message}`);
          return throwError(() =>
            new HttpException(
              error.message || 'Failed to fetch notifications',
              error.status || HttpStatus.INTERNAL_SERVER_ERROR,
            ),
          );
        }),
      );
    }

    @Get('read/:id')
    @UseGuards(AccessTokenGuard)
    readNotification(@Param('id') id: string) {
      return this.notificationService.isRead(id).pipe(
        timeout(5000),
        catchError((error) => {
          console.error(`Error notification ${id}: ${error.message}`);
          return throwError(() =>
            new HttpException(
              error.message || 'Failed to check if notification is read',
              error.status || HttpStatus.INTERNAL_SERVER_ERROR,
            ),
          );
        }),
      );
    }

    @Get("all")
    @UseGuards(AccessTokenGuard)
    findAllByUser(@Req() request: RequestPayload) {
      return this.notificationService.getAllByUser(request.user.sub).pipe(
        timeout(5000),
        catchError((error) => {
          console.error(`Error fetching notifications: ${error.message}`);
          return throwError(() =>
            new HttpException(
              error.message || 'Failed to fetch notifications',
              error.status || HttpStatus.INTERNAL_SERVER_ERROR,
            ),
          );
        }),
      );
    }

    @Get("read")
    @UseGuards(AccessTokenGuard)
    findAllRead(@Req() req: RequestPayload) {
      return this.notificationService.getAllRead(req.user.sub).pipe(
        timeout(5000),
        catchError((error) => {
          console.error(`Error fetching notifications: ${error.message}`);
          return throwError(() =>
            new HttpException(
              error.message || 'Failed to fetch notifications',
              error.status || HttpStatus.INTERNAL_SERVER_ERROR,
            ),
          );
        }),
      );
    }

    @Get("notread")
    @UseGuards(AccessTokenGuard)
    findAllNotRead(@Req() req: RequestPayload) {
      return this.notificationService.getAllNotRead(req.user.sub).pipe(
        timeout(5000),
        catchError((error) => {
          console.error(`Error fetching notifications: ${error.message}`);
          return throwError(() =>
            new HttpException(
              error.message || 'Failed to fetch notifications',
              error.status || HttpStatus.INTERNAL_SERVER_ERROR,
            ),
          );
        }),
      );
    }
  
    @Get(':id')
    @UseGuards(AccessTokenGuard)
    findOne(@Param('id') id: string) {
      return this.notificationService.getById(id).pipe(
        timeout(10000),
        catchError((error) => {
          console.error(`Error fetching notification ${id}: ${error.message}`);
          return throwError(() =>
            new HttpException(
              error.message || 'Failed to fetch notification',
              error.status || HttpStatus.INTERNAL_SERVER_ERROR,
            ),
          );
        }),
      );
    }
  

  
    @Delete(':id')
    @UseGuards(AccessTokenGuard)
    remove(@Param('id') id: string) {
      return this.notificationService.delete(id).pipe(
        timeout(5000),
        catchError((error) => {
          console.error(`Error deleting notification ${id}: ${error.message}`);
          return throwError(() =>
            new HttpException(
              error.message || 'Failed to delete notification',
              error.status || HttpStatus.INTERNAL_SERVER_ERROR,
            ),
          );
        }),
      );
    }
}
