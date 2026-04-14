import { ForbiddenException, Injectable, PreconditionFailedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SharesCreateDto, SharesCreateGroupDto, SharesCreateUserDto } from './dto/shares.create.dto';
import { AccessShareDto } from './dto/access.share.dto';
import { NotificationService } from '../notification/notification.service';
import { TypeChannel } from '../notification/enums/EnumTypeChannel';
import { TypeNotification } from '../notification/enums/EnumTypeNotification';
import { TypeRecipient } from '../notification/enums/EnumTypeRecipient';
import { GroupService } from '../group/group.service';

@Injectable()
export class ShareService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly groupService: GroupService,
    private readonly notificationService: NotificationService,
  ) {}

  async createShareUsers(fileId: number, data: SharesCreateUserDto) {
    for (const idUser of data.users) {
      const user = await this.prisma.user.findUnique({ where: { id: idUser } });
      if (user === null || user.status !== 'CONFIRMED') {
        throw new PreconditionFailedException("User doesn't exist or user account is not confirmed");
      }
      await this.prisma.shareWithUsers.create({
        data: {
          accessType: data.accessType,
          fileId,
          userId: idUser,
          expirationDate: data.expirationDate,
        },
      });
      const file = await this.prisma.file.findUniqueOrThrow({ where: { id: fileId } });
      const msg = '<div>Share of file ' + file.name + ' from user ' + user.email + '</div>';
      this.notificationService
        .create({
          recipientType: TypeRecipient.USER,
          type: TypeNotification.SHAREFILE,
          typeChannel: TypeChannel.EMAIL,
          metadata: { recipient: user.email, fileId: fileId, fileName: file.name, urlShare: '', message: msg },
          recipientId: user.id,
        })
        .subscribe();
    }
  }

  async createShareGroup(fileId: number, data: SharesCreateGroupDto) {
    for (const idGroup of data.groups) {
      const group = this.prisma.group.findUnique({ where: { id: idGroup } });
      if (group === null) throw new PreconditionFailedException("Group doesn't exist");
      await this.prisma.shareWithGroups.create({
        data: {
          accessType: data.accessType,
          fileId,
          groupId: idGroup,
          expirationDate: data.expirationDate,
        },
      });
      const members = await group.memberGroups();
      const file = await this.prisma.file.findUniqueOrThrow({ where: { id: fileId } });
      if (members.length === 0) throw new PreconditionFailedException('Members empty');
      await Promise.all(
        members.map(async (member) => {
          const user = await this.prisma.user.findUnique({ where: { id: member.userId } });
          if (user === null) throw new PreconditionFailedException('User not found');
          const msg = '<div>Share of file ' + file.name + ' from user ' + user.email + '</div>';
          this.notificationService
            .create({
              recipientType: TypeRecipient.GROUP,
              type: TypeNotification.SHAREFILE,
              typeChannel: TypeChannel.EMAIL,
              metadata: { recipient: user.email, fileId: fileId, fileName: file.name, message: msg },
              recipientId: user.id,
            })
            .subscribe();
        }),
      );
    }
  }

  private hasItems(arr?: unknown[]): boolean {
    return (arr?.length ?? 0) > 0;
  }

  private validateShareData(data: SharesCreateDto): void {
    if (!this.hasItems(data.users) && !this.hasItems(data.groups)) throw new PreconditionFailedException('The body needs users or groups');
  }

  async createShares(fileId: number, userId: number, data: SharesCreateDto) {
    const file = await this.prisma.file.findUniqueOrThrow({ where: { id: fileId } });

    if (file.userId !== userId) throw new ForbiddenException('User is not connected');

    this.validateShareData(data);
    if (this.hasItems(data.users))
      await this.createShareUsers(fileId, {
        users: data.users,
        accessType: data.accessType,
        expirationDate: data.expirationDate,
      });

    if (this.hasItems(data.groups))
      await this.createShareGroup(fileId, {
        groups: data.groups,
        accessType: data.accessType,
        expirationDate: data.expirationDate,
      });

    return this.prisma.file.findMany({
      select: { sharesGroups: true, sharesUsers: true },
      where: { id: fileId },
    });
  }

  async editAccessFileUser(idFile: number, idUser: number, data: AccessShareDto) {
    const access = await this.prisma.shareWithUsers.update({
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
    const file = await this.prisma.file.findUniqueOrThrow({ where: { id: idFile } });
    const user = await this.prisma.user.findUnique({ where: { id: idUser } });
    const message = `File ${file.name} of user ${user.username} shared with success!`;

    this.notificationService
      .create({
        recipientType: TypeRecipient.USER,
        type: TypeNotification.ACCESSFILE,
        typeChannel: TypeChannel.EMAIL,
        metadata: { recipient: user.email, fileId: idFile, fileName: file.name, message },
        recipientId: user.id,
      })
      .subscribe();
    return access;
  }

  async editAccessFileGroup(idFile: number, idGroup: number, data: AccessShareDto) {
    const access = await this.prisma.shareWithGroups.update({
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
    const file = await this.prisma.file.findUniqueOrThrow({ where: { id: idFile } });
    const group = await this.groupService.getById(access.groupId);
    const members = await this.groupService.getMembersGroup(access.groupId);
    for (const member of members.memberGroups) {
      const user = await this.prisma.user.findUnique({ where: { id: member.userId } });
      const message = `File ${file.name} of member ${user.username} of the group ${group.name} shared with success!`;
      this.notificationService
        .create({
          recipientType: TypeRecipient.GROUP,
          type: TypeNotification.ACCESSFILE,
          typeChannel: TypeChannel.EMAIL,
          metadata: { recipient: user.email, fileId: idFile, fileName: file.name, message },
          recipientId: user.id,
        })
        .subscribe();
    }
    return access;
  }

  /**
   *
   * @returns the list of users and groups
   */
  async getReceivers(idUser: number) {
    const users = await this.prisma.user.findMany({
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
