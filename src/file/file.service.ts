import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { File } from '@prisma/client';
import { importDto } from './dto/import.dto';

export type Sort = "name" | "updatedAt";
export type Order = "ASC" | "DESC";

@Injectable()
export class FileService {

    constructor(private readonly prisma: PrismaService) {}

    async importFiles(files: Array<Express.Multer.File>, userId: number): Promise<File[]>  {
        let filesImport: File[] = [];
        for (let i = 0; i < files.length; i++) {
            const dataFiles: importDto = {
                name: files[i].originalname.split(".")[0],
                mimeType: files[i].mimetype,
                path: files[i].originalname,
                size: files[i].size,
                userId,
                version: "1.0"
            };
            const addFile = await this.prisma.file.create({
                data: dataFiles,
            });
            filesImport.push(addFile);
        }
        console.log(filesImport);
        return filesImport;
    }

    async getFiles(userId: number, page?: number, sort?: Sort, limit: number = 10, order: Order = "ASC") {
        if (page) {
            if (sort) {
                let sortFilter = sort === 'name' ? 'name' : "updatedAt";
                const orderSort= order === "DESC" ? "DESC" : "ASC";
                console.log([sortFilter], page)
                return await this.prisma.file.findMany({
                    skip: (page - 1) * limit,
                    take: limit,
                    where: {
                        userId
                    },
                    orderBy: {
                        [sortFilter]: orderSort.toLowerCase()
                    }
                });
            } else {
                return await this.prisma.file.findMany({
                    skip: (page - 1) * limit,
                    take: limit,
                    where: {
                        userId
                    }
                });
            }
        }
        if (sort) {
            let sortFilter = sort === 'name' ? 'name' : "updatedAt";
            const orderSort= order === "DESC" ? "DESC" : "ASC";

            return await this.prisma.file.findMany({
                where: {
                    userId
                },
                orderBy: {
                    [sortFilter]: orderSort.toLowerCase()
                }
            });
        }
        return await this.prisma.file.findMany({
            where: {
                userId
            }
        });
    }
}
