import { Injectable } from '@nestjs/common';
import { EnumUserStatus, User } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SignupDto } from '../auth/dto/signup.dto';
import { UserEmailResponse } from './response/user.email.response';
import { UpdateUserDto } from './dto/update.user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: SignupDto): Promise<User> {
    return await this.prisma.user.create({
      data: { ...data, status: 'NOT_CONFIRMED' },
    });
  }

  async getById(id: number): Promise<User> {
    return await this.prisma.user.findUniqueOrThrow({
      where: { id },
    });
  }

  async getEmailById(id: number): Promise<UserEmailResponse> {
    return await this.prisma.user.findUniqueOrThrow({
      select: { email: true },
      where: { id },
    });
  }

  async getByEmail(email: string): Promise<User> {
    return await this.prisma.user.findUniqueOrThrow({
      where: { email },
    });
  }

  async updateUser(id: number, data: UpdateUserDto): Promise<User> {
    return await this.prisma.user.update({
      data,
      where: { id },
    });
  }
}
