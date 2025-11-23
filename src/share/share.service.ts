import { Injectable, PreconditionFailedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SharesCreateDto } from './dto/shares.create.dto';
import { AccessShareDto } from './dto/access.share.dto';

@Injectable()
export class ShareService {
  constructor(private readonly prisma: PrismaService) {}

  async createShares(fileId: number, data: SharesCreateDto) {
    console.log(data.users === undefined);
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
        }
      }
      return this.prisma.file.findMany({
        select: {
          sharesGroups: true,
          sharesUsers: true
        },
        where: {
          id: fileId
        },
      });
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
}
