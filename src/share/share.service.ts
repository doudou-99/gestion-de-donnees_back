import { ForbiddenException, Injectable, PreconditionFailedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SharesCreateDto } from './dto/shares.create.dto';
import { AccessShareDto } from './dto/access.share.dto';

@Injectable()
export class ShareService {
  constructor(private readonly prisma: PrismaService) {}

  private async validateFileOwnership(fileId: number, userId: number) {
    const file = await this.prisma.file.findUniqueOrThrow({ where: { id: fileId } });
    if (file.userId !== userId) throw new ForbiddenException('User is not connected');
  }

  private validateShareTargets(data: SharesCreateDto) {
    const hasUsers = data.users?.length > 0;
    const hasGroups = data.groups?.length > 0;
    if (!hasUsers && !hasGroups) throw new PreconditionFailedException('The body needs users or groups');
  }

  private async createUserShares(fileId: number, data: SharesCreateDto) {
    for (const userId of data.users ?? []) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user || user.status !== 'CONFIRMED') {
        throw new PreconditionFailedException("User doesn't exist or user account is not confirmed");
      }
      await this.prisma.shareWithUsers.create({
        data: { accessType: data.accessType, fileId, userId, expirationDate: data.expirationDate },
      });
    }
  }

  private async createGroupShares(fileId: number, data: SharesCreateDto) {
    for (const groupId of data.groups ?? []) {
      const group = await this.prisma.group.findUnique({ where: { id: groupId } });
      if (!group) throw new PreconditionFailedException("Group doesn't exist");
      await this.prisma.shareWithGroups.create({
        data: { accessType: data.accessType, fileId, groupId, expirationDate: data.expirationDate },
      });
    }
  }

  async createShares(fileId: number, userId: number, data: SharesCreateDto) {
    await this.validateFileOwnership(fileId, userId);
    this.validateShareTargets(data);
    await this.createUserShares(fileId, data);
    await this.createGroupShares(fileId, data);
    return this.prisma.file.findMany({
      select: { sharesGroups: true, sharesUsers: true },
      where: { id: fileId },
    });
  }

  async editAccessFileUser(idFile: number, idUser: number, data: AccessShareDto) {
    return await this.prisma.shareWithUsers.update({
      select: {
        fileId: true,
        userId: true,
        expirationDate: true,
        accessType: true,
      },
      data: {
        accessType: data.accessType,
      },
      where: {
        fileId_userId: { fileId: idFile, userId: idUser },
      },
    });
  }

  async editAccessFileGroup(idFile: number, idGroup: number, data: AccessShareDto) {
    return await this.prisma.shareWithGroups.update({
      select: {
        fileId: true,
        groupId: true,
        expirationDate: true,
        accessType: true,
      },
      data: {
        accessType: data.accessType,
      },
      where: {
        fileId_groupId: { fileId: idFile, groupId: idGroup },
      },
    });
  }

  /**
   *
   * @returns the list of users and groups
   */
  async getReceivers(idUser: number) {
    const users: { id: number; email: string }[] = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
      },
      where: {
        NOT: {
          id: idUser,
        },
      },
    });
    const groups = await this.prisma.group.findMany({
      select: {
        id: true,
        name: true,
      },
    });
    return {
      users,
      groups,
    };
  }
}
