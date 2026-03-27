import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GroupService {
  constructor(private readonly prisma: PrismaService) {}

  async getById(id: number) {
    return await this.prisma.group.findUniqueOrThrow({
      where: { id },
    });
  }
}
