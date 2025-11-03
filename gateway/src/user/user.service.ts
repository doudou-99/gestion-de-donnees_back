import { Inject, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService, @Inject('NATS_SERVICE') private client: ClientProxy){}

  async getById(id: number): Promise<User> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id },
    });
    return user
  }

  async getRecipientById(id: number): Promise<any> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id },
    });
    const request = await lastValueFrom(this.client.send("recipient.id", {"id": user.id, "email":user.email, "type": "user"}))
    return await request;
  } 

  async getByEmail(email: string): Promise<User> {
    return await this.prisma.user.findUniqueOrThrow({
      where: { email },
    });
  }
}
