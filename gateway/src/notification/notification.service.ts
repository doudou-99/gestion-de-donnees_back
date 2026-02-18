import { Inject, Injectable, MessageEvent } from '@nestjs/common';
import { CreateNotificationRequest } from './dto/create.notification.request';
import { ClientProxy } from '@nestjs/microservices';
import { finalize, Observable, ReplaySubject, Subject, tap } from 'rxjs';
import { NotificationResponse } from './dto/notification.response';

@Injectable()
export class NotificationService {
  private subjects = new Map<number, Subject<MessageEvent>>();

  constructor(
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) {}

  create(
    notificationDto: CreateNotificationRequest,
  ): Observable<NotificationResponse> {
    const nats = this.natsClient
      .send('notification.create', notificationDto)
      .pipe(
        tap((response) => {
          console.log(
            '✅ Notification créée, émission vers userId:',
            notificationDto.recipientId,
          );
          this.emit(notificationDto.recipientId, response);
        }),
      );
    console.log(nats);
    return nats;
  }

  subscribe(userId: number): Observable<MessageEvent> {
    if (!this.subjects.has(userId)) {
      console.log('Création Subject userId:', userId);
      this.subjects.set(userId, new Subject<MessageEvent>());
    }
    return this.subjects.get(userId).asObservable();
  }

  emit(userId: number, data: any) {
    const subject = this.subjects.get(userId);
    if (!subject) return;

    subject.next({
      data,
      type: 'notification',
      id: Date.now().toString(),
    });
  }

  disconnect(userId: number) {
    const subject = this.subjects.get(userId);
    if (subject) {
      subject.complete();
      this.subjects.delete(userId);
      console.log('🧹 Nettoyage Subject userId:', userId);
    }
  }

  getAll(): Observable<NotificationResponse[]> {
    return this.natsClient.send('notification.getAll', {});
  }

  getAllByUser(id: number): Observable<NotificationResponse[]> {
    return this.natsClient.send('notification.getAllByUser', { id });
  }

  getAllRead(id: number): Observable<NotificationResponse[]> {
    return this.natsClient.send('notification.getAllRead', { id });
  }

  getAllNotRead(id: number): Observable<NotificationResponse[]> {
    return this.natsClient.send('notification.getAllNotRead', { id });
  }

  getById(id: string): Observable<NotificationResponse> {
    return this.natsClient.send('notification.getById', { id });
  }

  isRead(id: string): Observable<NotificationResponse> {
    return this.natsClient.send('notification.read', { id });
  }

  delete(id: string): Observable<NotificationResponse> {
    return this.natsClient.send('notification.delete', { id });
  }

  deleteExpired(): Observable<NotificationResponse> {
    return this.natsClient.send('notification.expiredNotifications', {});
  }
}
