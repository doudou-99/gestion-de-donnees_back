import { Inject, Injectable, MessageEvent } from '@nestjs/common';
import { CreateNotificationRequest } from './dto/create.notification.request';
import { ClientProxy } from '@nestjs/microservices';
import { finalize, Observable, Subject, tap } from 'rxjs';
import { NotificationResponse } from './dto/notification.response';

@Injectable()
export class NotificationService {

    private subjects = new Map<number, Subject<MessageEvent>>();

    constructor(
        @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
    ){}

    create(notificationDto: CreateNotificationRequest): Observable<NotificationResponse> {
        const nats = this.natsClient.send('notification.create', notificationDto).pipe(tap({
            next: () => {
                this.emit(notificationDto.recipientId, notificationDto);
            }
        }));
        console.log(nats);
        return nats
    }

    subscribe(userId: number): Observable<MessageEvent> {
      if (!this.subjects.has(userId)) {
        this.subjects.set(userId, new Subject());
      }
      return this.subjects.get(userId).asObservable();
    }
  
    emit(userId: number, data: NotificationResponse | CreateNotificationRequest) {
      this.subjects.get(userId)?.next({ data, type: "notification" });
    }

    getAll(): Observable<NotificationResponse[]> {
        return this.natsClient.send('notification.getAll', {});
    }

    getAllByUser(id: number): Observable<NotificationResponse[]> {
        return this.natsClient.send('notification.getAllByUser', {id});
    }

    getAllRead(id: number): Observable<NotificationResponse[]> {
        return this.natsClient.send('notification.getAllRead', {id});
    }

    getAllNotRead(id: number): Observable<NotificationResponse[]> {
        return this.natsClient.send('notification.getAllNotRead', {id});
    }

    getById(id: string): Observable<NotificationResponse> {
        return this.natsClient.send('notification.getById', {id});
    }

    isRead(id: string): Observable<NotificationResponse> {
        return this.natsClient.send('notification.read', {id});
    }

    delete(id: string): Observable<NotificationResponse> {
        return this.natsClient.send('notification.delete', {id});
    }

    deleteExpired(): Observable<NotificationResponse> {
        return this.natsClient.send('notification.expiredNotifications', {});
    } 
}
