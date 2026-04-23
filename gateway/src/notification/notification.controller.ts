import { Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, MessageEvent, Param, Post, Req, Sse, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationRequest } from './dto/create.notification.request';
import { timeout, catchError, throwError, interval, map, Observable, merge, delay, of, finalize } from 'rxjs';
import { AccessTokenGuard } from '../auth/guard/access.token.guard';
import type { RequestPayload } from '../auth/interface/payload.interface';
import { SseAuthGuard } from './guard/sse.auth.guard';

@Controller('api/v1/notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AccessTokenGuard)
  @Post()
  create(@Body() createNotificationRequest: CreateNotificationRequest) {
    return this.notificationService.create(createNotificationRequest).pipe(
      timeout(20000),
      catchError((error: Error) => {
        console.error(`Error creating notification: ${error.message}`);
        return throwError(() => new HttpException(error.message || 'Failed to create notification', HttpStatus.INTERNAL_SERVER_ERROR));
      }),
    );
  }

  @Sse('events')
  @UseGuards(SseAuthGuard)
  events(@Req() req: RequestPayload): Observable<MessageEvent> {
    const initial = of({
      data: { userId: req.user.sub, tick: Date.now() },
      type: 'connected',
    }).pipe(delay(200));

    const events = this.notificationService.getAllNotRead(req.user.sub).pipe(
      map((notifications) => ({
        data: { type: 'initial', notifications },
        id: 'initial',
      })),
    );

    const stream = this.notificationService.subscribe(req.user.sub).pipe();

    const heartbeat = interval(1000).pipe(
      map(() => ({
        data: '',
        comment: 'ping',
      })),
    );

    return merge(initial, events, stream, heartbeat).pipe(
      finalize(() => {
        this.notificationService.disconnect(req.user.sub);
      }),
    );
  }

  @Get()
  findAll() {
    return this.notificationService.getAll().pipe(
      timeout(15000),
      catchError((error: Error) => {
        console.error(`Error fetching notifications: ${error.message}`);
        return throwError(() => new HttpException(error.message || 'Failed to fetch notifications', HttpStatus.INTERNAL_SERVER_ERROR));
      }),
    );
  }

  @Get('read/:id')
  @UseGuards(AccessTokenGuard)
  readNotification(@Param('id') id: string) {
    return this.notificationService.isRead(id).pipe(
      timeout(5000),
      catchError((error: Error) => {
        console.error(`Error notification ${id}: ${error.message}`);
        return throwError(() => new HttpException(error.message || 'Failed to check if notification is read', HttpStatus.INTERNAL_SERVER_ERROR));
      }),
    );
  }

  @Get('all')
  @UseGuards(AccessTokenGuard)
  findAllByUser(@Req() request: RequestPayload) {
    return this.notificationService.getAllByUser(request.user.sub).pipe(
      timeout(5000),
      catchError((error: Error) => {
        console.error(`Error fetching notifications: ${error.message}`);
        return throwError(() => new HttpException(error.message || 'Failed to fetch notifications', HttpStatus.INTERNAL_SERVER_ERROR));
      }),
    );
  }

  @Get('read')
  @UseGuards(AccessTokenGuard)
  findAllRead(@Req() req: RequestPayload) {
    return this.notificationService.getAllRead(req.user.sub).pipe(
      timeout(5000),
      catchError((error: Error) => {
        console.error(`Error fetching notifications: ${error.message}`);
        return throwError(() => new HttpException(error.message || 'Failed to fetch notifications', HttpStatus.INTERNAL_SERVER_ERROR));
      }),
    );
  }

  @Get('notread')
  @UseGuards(AccessTokenGuard)
  findAllNotRead(@Req() req: RequestPayload) {
    return this.notificationService.getAllNotRead(req.user.sub).pipe(
      timeout(5000),
      catchError((error: Error) => {
        console.error(`Error fetching notifications: ${error.message}`);
        return throwError(() => new HttpException(error.message || 'Failed to fetch notifications', HttpStatus.INTERNAL_SERVER_ERROR));
      }),
    );
  }

  @Get(':id')
  @UseGuards(AccessTokenGuard)
  findOne(@Param('id') id: string) {
    return this.notificationService.getById(id).pipe(
      timeout(10000),
      catchError((error: Error) => {
        console.error(`Error fetching notification ${id}: ${error.message}`);
        return throwError(() => new HttpException(error.message || 'Failed to fetch notification', HttpStatus.INTERNAL_SERVER_ERROR));
      }),
    );
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard)
  remove(@Param('id') id: string) {
    return this.notificationService.delete(id).pipe(
      timeout(5000),
      catchError((error: Error) => {
        console.error(`Error deleting notification ${id}: ${error.message}`);
        return throwError(() => new HttpException(error.message || 'Failed to delete notification', HttpStatus.INTERNAL_SERVER_ERROR));
      }),
    );
  }

  @Delete('expired')
  @UseGuards(AccessTokenGuard)
  expiredNotifications() {
    return this.notificationService.deleteExpired().pipe(
      timeout(5000),
      catchError((error: Error) => {
        console.error(`Error deleting expired notifications: ${error.message}`);
        return throwError(() => new HttpException(error.message || 'Failed to delete notification', HttpStatus.INTERNAL_SERVER_ERROR));
      }),
    );
  }
}
