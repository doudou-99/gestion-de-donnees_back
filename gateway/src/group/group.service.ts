import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GroupService {
  constructor(private readonly prisma: PrismaService) {}

  async getById(id: number) {
    return this.prisma.group.findUniqueOrThrow({
      where: { id },
    });
  }

  async existsById(id: number) {
    return (
      (await this.prisma.group.count({
        where: {
          id,
        },
      })) === 1
    );
  }

  async getMembersGroup(id: number) {
    return await this.prisma.group.findUnique({
      select: { memberGroups: true },
      where: { id },
    });
  }
}
