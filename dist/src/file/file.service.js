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
exports.FileService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
let FileService = class FileService {
    prisma;
    s3Client;
    constructor(prisma) {
        this.prisma = prisma;
        this.s3Client = new client_s3_1.S3Client({
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            },
            maxAttempts: 3,
        });
    }
    async importFiles(files, userId) {
        let filesImport = [];
        const totalSizesBucket = await this.getTotalSizeObjets();
        if (totalSizesBucket >= (5 * 1024 * 1024 * 1024))
            throw new common_1.BadRequestException("Space in AWS S3 is filled.");
        for (let i = 0; i < files.length; i++) {
            const totalSizes = files.reduce((prev, current) => prev + current.size, 0);
            const key = `${files[i].originalname}_user_${userId}`;
            if (totalSizes > (5 * 1024 * 1024 * 1024))
                throw new common_1.BadRequestException("The files are too large.");
            const dataFiles = {
                name: files[i].originalname,
                mimeType: files[i].mimetype,
                path: key,
                size: files[i].size,
                userId,
                version: '1.0',
            };
            const params = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: key,
                Body: files[i].buffer,
                ContentType: files[i].mimetype,
                Metadata: {
                    originalName: Buffer.from(files[i].originalname).toString('base64')
                }
            };
            await this.s3Client.send(new client_s3_1.PutObjectCommand(params));
            const addFile = await this.prisma.file.create({
                data: dataFiles,
            });
            filesImport.push(addFile);
        }
        console.log(filesImport);
        return filesImport;
    }
    async getTotalSizeObjets() {
        const objects = new client_s3_1.ListObjectsV2Command({ Bucket: process.env.AWS_BUCKET_NAME });
        const response = await this.s3Client.send(objects);
        console.log(response);
        if (!response.Contents || response.Contents.length === 0) {
            return 0;
        }
        const sizeFile = response.Contents.reduce((total, obj) => {
            return total + (obj.Size || 0);
        }, 0);
        console.log("🚀 ~ file.service.ts:89 ~ FileService ~ getTotalSizeObjets ~ sizeFile:", sizeFile);
        return sizeFile;
    }
    async getFiles(userId, page, sort, limit = 10, order = 'ASC') {
        const whereFilters = {
            userId,
            OR: [
                {
                    status: 'HOME',
                },
                {
                    status: null,
                },
            ],
        };
        if (page) {
            if (sort) {
                let sortFilter = sort === 'name' ? 'name' : 'updatedAt';
                const orderSort = order === 'DESC' ? 'DESC' : 'ASC';
                console.log([sortFilter], page);
                return await this.prisma.file.findMany({
                    skip: (page - 1) * limit,
                    take: limit,
                    where: whereFilters,
                    orderBy: {
                        [sortFilter]: orderSort.toLowerCase(),
                    },
                });
            }
            else {
                return await this.prisma.file.findMany({
                    skip: (page - 1) * limit,
                    take: limit,
                    where: whereFilters,
                });
            }
        }
        if (sort) {
            let sortFilter = sort === 'name' ? 'name' : 'updatedAt';
            const orderSort = order === 'DESC' ? 'DESC' : 'ASC';
            return await this.prisma.file.findMany({
                where: whereFilters,
                orderBy: {
                    [sortFilter]: orderSort.toLowerCase(),
                },
            });
        }
        return await this.prisma.file.findMany({
            where: whereFilters,
        });
    }
    async getFileUrl(id) {
        const fileDetail = await this.detailsFile(id);
        const key = `${fileDetail.name}_user_${fileDetail.userId}`;
        const command = new client_s3_1.GetObjectCommand({ Bucket: process.env.AWS_BUCKET_NAME, Key: key, ResponseContentDisposition: "inline" });
        const url = await (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, command, { expiresIn: 60 * 24 * 24 });
        return url;
    }
    async searchFiles(userId, updatedAt, name, typeFile, page, sort, limit = 10, order = 'ASC') {
        let whereFilters = {
            userId: userId,
            OR: [
                {
                    status: 'HOME',
                },
                {
                    status: null,
                },
            ],
        };
        if (name === undefined && typeFile === undefined && updatedAt === null) {
            return [];
        }
        else {
            if (name)
                whereFilters['name'] = { contains: name };
            if (typeFile)
                whereFilters['mimeType'] = { contains: typeFile };
            if (updatedAt && updatedAt !== null && typeof updatedAt === 'string') {
                const updated = new Date(Date.parse(updatedAt));
                const start = new Date(Date.UTC(updated.getFullYear(), updated.getMonth(), updated.getDate(), 0, 0, 0, 0));
                const end = new Date(Date.UTC(updated.getFullYear(), updated.getMonth(), updated.getDate(), 23, 59, 59, 999));
                whereFilters['updatedAt'] = {
                    gte: start,
                    lte: end,
                };
            }
            console.log(whereFilters);
            if (page) {
                if (sort) {
                    let sortFilter = sort === 'name' ? 'name' : 'updatedAt';
                    const orderSort = order === 'DESC' ? 'DESC' : 'ASC';
                    console.log([sortFilter], page, whereFilters);
                    return await this.prisma.file.findMany({
                        skip: (page - 1) * limit,
                        take: limit,
                        where: whereFilters,
                        orderBy: {
                            [sortFilter]: orderSort.toLowerCase(),
                        },
                    });
                }
                else {
                    return await this.prisma.file.findMany({
                        skip: (page - 1) * limit,
                        take: limit,
                        where: whereFilters,
                    });
                }
            }
            if (sort) {
                let sortFilter = sort === 'name' ? 'name' : 'updatedAt';
                const orderSort = order === 'DESC' ? 'DESC' : 'ASC';
                return await this.prisma.file.findMany({
                    where: whereFilters,
                    orderBy: {
                        [sortFilter]: orderSort.toLowerCase(),
                    },
                });
            }
            return await this.prisma.file.findMany({
                where: whereFilters,
            });
        }
    }
    async getOwnerFile(idFile) {
        return await this.prisma.file
            .findUniqueOrThrow({
            select: {
                user: true,
            },
            where: {
                id: idFile,
            },
        })
            .user();
    }
    async moveFileToBin(idFile) {
        return await this.prisma.file.update({
            data: {
                status: 'BIN',
            },
            where: {
                id: idFile,
            },
        });
    }
    async getFilesBin(userId, page, sort, limit = 10, order = 'ASC') {
        const whereFilters = {
            userId,
            status: 'BIN',
        };
        if (page) {
            if (sort) {
                let sortFilter = sort === 'name' ? 'name' : 'updatedAt';
                const orderSort = order === 'DESC' ? 'DESC' : 'ASC';
                console.log([sortFilter], page);
                return await this.prisma.file.findMany({
                    skip: (page - 1) * limit,
                    take: limit,
                    where: whereFilters,
                    orderBy: {
                        [sortFilter]: orderSort.toLowerCase(),
                    },
                });
            }
            else {
                return await this.prisma.file.findMany({
                    skip: (page - 1) * limit,
                    take: limit,
                    where: whereFilters,
                });
            }
        }
        if (sort) {
            let sortFilter = sort === 'name' ? 'name' : 'updatedAt';
            const orderSort = order === 'DESC' ? 'DESC' : 'ASC';
            return await this.prisma.file.findMany({
                where: whereFilters,
                orderBy: {
                    [sortFilter]: orderSort.toLowerCase(),
                },
            });
        }
        return await this.prisma.file.findMany({
            where: whereFilters,
        });
    }
    async moveFileToHome(idFile) {
        return await this.prisma.file.update({
            data: {
                status: 'HOME',
            },
            where: {
                id: idFile,
            },
        });
    }
    async getAccessUsersGroupsFile(idFile) {
        return await this.prisma.file.findUniqueOrThrow({
            select: {
                sharesGroups: {
                    select: {
                        fileId: true,
                        groupId: true,
                        accessType: true,
                        expirationDate: true,
                    }
                },
                sharesUsers: {
                    select: {
                        accessType: true,
                        fileId: true,
                        userId: true,
                        expirationDate: true
                    }
                },
            },
            where: {
                id: idFile
            },
        });
    }
    async renameFile(id, data) {
        const file = await this.detailsFile(id);
        const key = `${file.name}_user_${file.userId}`;
        const keyDest = `${data.name}_user_${file.userId}`;
        const commandCopy = new client_s3_1.CopyObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: keyDest,
            CopySource: `${process.env.AWS_BUCKET_NAME}/${key}`,
        });
        const command = new client_s3_1.DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key,
        });
        await this.s3Client.send(commandCopy);
        await this.s3Client.send(command);
        return await this.prisma.file.update({
            data: { name: data.name, path: "/" + data.name },
            where: {
                id
            }
        });
    }
    async detailsFile(id) {
        return await this.prisma.file.findUniqueOrThrow({
            where: {
                id
            }
        });
    }
    async deleteFiles(files) {
        for (let id of files) {
            const file = await this.detailsFile(id);
            const key = `${file.name}_user_${file.userId}`;
            const command = new client_s3_1.DeleteObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: key,
            });
            await this.s3Client.send(command);
            await this.prisma.file.delete({
                where: {
                    id,
                    status: 'BIN',
                },
            });
        }
    }
};
exports.FileService = FileService;
exports.FileService = FileService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FileService);
//# sourceMappingURL=file.service.js.map