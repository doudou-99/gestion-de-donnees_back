import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SignupDto } from '../auth/dto/signup.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService){}

  async create(data: SignupDto) {
    return await this.prisma.user.create({
      data: {...data, status: 'NOT_CONFIRMED'}
    });
  }

  async getById(id: number): Promise<User> {
    return await this.prisma.user.findUniqueOrThrow({
      where: { id },
    });
  }

  async getByEmail(email: string): Promise<User> {
    return await this.prisma.user.findUniqueOrThrow({
      where: { email },
    });
  }
}

