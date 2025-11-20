import { Injectable } from '@nestjs/common';
import { EnumUserStatus, User } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SignupDto } from '../auth/dto/signup.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: SignupDto, status: EnumUserStatus = 'NOT_CONFIRMED') {
    return await this.prisma.user.create({
      data: { ...data, status },
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

  async updateUser(email: string, data: SignupDto) {
    return await this.prisma.user.update({
      data: {
        password: data.password,
        additionalAddress: data.additionalAddress,
        extraEmail: data.extraEmail,
        username: data.username,
        zipCode: data.zipCode,
        address: data.address
      },
      where: {
        email,
      },
    });
  }
}
