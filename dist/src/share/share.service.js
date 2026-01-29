"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShareService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let ShareService = class ShareService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createShares(fileId, userId, data) {
        console.log(data.users === undefined);
        const file = await this.prisma.file.findUniqueOrThrow({ where: { id: fileId } });
        if (file.userId !== userId) {
            throw new common_1.ForbiddenException("User is not connected");
        }
        if ((data.users === undefined ||
            (data.users !== undefined && data.users.length === 0)) &&
            (data.groups === undefined ||
                (data.groups !== undefined && data.groups.length === 0))) {
            throw new common_1.PreconditionFailedException('The body needs users or groups');
        }
        else {
            if (data.users && data.users.length !== 0) {
                for (let idUser of data.users) {
                    const user = await this.prisma.user.findUnique({ where: { id: idUser } });
                    if (user === null || user.status !== 'CONFIRMED') {
                        throw new common_1.PreconditionFailedException("User doesn't exist or user account is not confirmed");
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
                    const group = this.prisma.group.findUnique({ where: { id: idGroup } });
                    if (group === null) {
                        throw new common_1.PreconditionFailedException("Group doesn't exist");
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
    async editAccessFileUser(idFile, idUser, data) {
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
                fileId_userId: { fileId: idFile, userId: idUser }
            }
        });
    }
    async editAccessFileGroup(idFile, idGroup, data) {
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
                fileId_groupId: { fileId: idFile, groupId: idGroup }
            }
        });
    }
    async getReceivers(idUser) {
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
        };
    }
};
exports.ShareService = ShareService;
exports.ShareService = ShareService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ShareService);
//# sourceMappingURL=share.service.js.map