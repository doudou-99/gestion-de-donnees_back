import { Injectable } from '@nestjs/common';
import { EnumUserStatus, User } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { AddUserDTO } from 'src/auth/dto/add.user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

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
