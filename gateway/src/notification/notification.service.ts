import { Inject, Injectable } from '@nestjs/common';
import { CreateNotificationRequest } from './dto/create.notification.request';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { NotificationResponse } from './dto/notification.response';

@Injectable()
export class NotificationService {

    constructor(
        @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
    ){}

    create(notificationDto: CreateNotificationRequest): Observable<NotificationResponse> {
        const nats = this.natsClient.send('notification.create', notificationDto);
        console.log(nats);
        return nats
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
}
