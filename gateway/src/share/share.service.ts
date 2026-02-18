import { ForbiddenException, Injectable, PreconditionFailedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SharesCreateDto } from './dto/shares.create.dto';
import { AccessShareDto } from './dto/access.share.dto';
import { NotificationService } from '../notification/notification.service';
import { TypeChannel } from '../notification/enums/EnumTypeChannel';
import { TypeNotification } from '../notification/enums/EnumTypeNotification';
import { TypeRecipient } from '../notification/enums/EnumTypeRecipient';

@Injectable()
export class ShareService {
  constructor(private readonly prisma: PrismaService, private readonly notificationService: NotificationService) {}

  async createShares(fileId: number, userId: number, data: SharesCreateDto) {
    console.log(data.users === undefined);
    const file = await this.prisma.file.findUniqueOrThrow({where: {id: fileId}});
    if (file.userId !== userId) {
      throw new ForbiddenException("User is not connected")
    }
    if (
      (data.users === undefined ||
        (data.users !== undefined && data.users.length === 0)) &&
      (data.groups === undefined ||
        (data.groups !== undefined && data.groups.length === 0))
    ) {
      throw new PreconditionFailedException('The body needs users or groups');
    } else {
      if (data.users && data.users.length !== 0) {
        for (let idUser of data.users) {
          const user = await this.prisma.user.findUnique({where: {id: idUser}});
          if (user === null || user.status !== 'CONFIRMED') {
            throw new PreconditionFailedException(
              "User doesn't exist or user account is not confirmed",
            );
          }
          await this.prisma.shareWithUsers.create({
            data: {
              accessType: data.accessType,
              fileId,
              userId: idUser,
              expirationDate: data.expirationDate
            },
          });
          const file = await this.prisma.file.findUniqueOrThrow({where: {id: fileId}});
          const msg = "<div>Share of file " + file.name + " from user "+ user.email + "</div>";
          this.notificationService.create({message: msg, recipientType: TypeRecipient.USER, type: TypeNotification.SHAREFILE, typeChannel: TypeChannel.EMAIL, metadata: {recipient: user.email, fileId: fileId, fileName: file.name, urlShare: ""}, recipientId: user.id}).subscribe();
        }
      }
      if (data.groups && data.groups.length !== 0) {
        for (let idGroup of data.groups) {
          const group = this.prisma.group.findUnique({where: { id: idGroup }});
          if (group === null) {
            throw new PreconditionFailedException("Group doesn't exist");
          }
          await this.prisma.shareWithGroups.create({
            data: {
                accessType: data.accessType,
                fileId,
                groupId: idGroup,
                expirationDate: data.expirationDate
            },
          });
          const members = await group.memberGroups();
          if (members.length === 0) throw new PreconditionFailedException("Members empty");
          for (let member of members) {
            const user = await this.prisma.user.findUnique({where: {id: member.userId}});
            if (user === null) throw new PreconditionFailedException("User not found");
            const file = await this.prisma.file.findUniqueOrThrow({where: {id: fileId}});
            const msg = "<div>Share of file " + file.name + " from user "+ user.email + "</div>";
            this.notificationService.create({message: msg, recipientType: TypeRecipient.GROUP, type: TypeNotification.SHAREFILE, typeChannel: TypeChannel.EMAIL, metadata: {recipient: user.email, fileId: fileId, fileName: file.name}, recipientId: user.id}).subscribe();
          }
        }
      }
      const sharesReceivers = this.prisma.file.findMany({
        select: {
          sharesGroups: true,
          sharesUsers: true
        },
        where: {
          id: fileId
        },
      });
      return sharesReceivers;
    }
  }

  async editAccessFileUser(idFile: number, idUser: number, data: AccessShareDto) {
    return await this.prisma.shareWithUsers.update({
      select: {
        fileId: true,
        userId: true,
        expirationDate: true,
        accessType: true
      },
      data: {
        accessType: data.accessType
      },
      where: {
        fileId_userId: {fileId: idFile, userId: idUser}
      }
    });
  }

  async editAccessFileGroup(idFile: number, idGroup: number, data: AccessShareDto) {
    return await this.prisma.shareWithGroups.update({
      select: {
        fileId: true,
        groupId: true,
        expirationDate: true,
        accessType: true
      },
      data: {
        accessType: data.accessType
      },
      where: {
        fileId_groupId: {fileId: idFile, groupId: idGroup}
      }
    });
  }

  /**
   * 
   * @returns the list of users and groups
   */
  async getReceivers(idUser: number) {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true
      },
      where: {
        NOT: {
          id: idUser
        }
      }
    });
    const groups = await this.prisma.group.findMany({
      select: {
        id: true,
        name: true
      }
    });
    return {
      users, groups
    }
  }
}
