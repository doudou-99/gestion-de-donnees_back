import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { File } from '@prisma/client';
import { importDto } from './dto/import.dto';
import { SearchDto } from './dto/search.dto';

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

    /**
     * Get files by user id
     * page is used for the pagination of the list and limit is the number of files per page
     * sort is used for sorting the files by name or date 
     * order for descending or ascending order of files
     */
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

    /**
     * Search files of user by name, file type or updatedAt
     * page is used for the pagination of the list and limit is the number of files per page
     * sort is used for sorting the files by name or date 
     * order for descending or ascending order of files
     */
    async searchFiles(search: SearchDto, userId: number, page?: number, sort?: Sort, limit: number = 10, order: Order = "ASC") {
        let whereFilters: Record<string, any> = {"userId": userId};
        if (search.name === undefined && search.typeFile === undefined && search.updatedAt === null) {
            return []
        } else {
            if (search.name) whereFilters["name"]= { contains: search.name};
            if (search.typeFile) whereFilters["mimeType"]= { contains: search.typeFile};
            if (search.updatedAt && search.updatedAt !== null && typeof search.updatedAt === "string") {
                const updated = new Date(Date.parse(search.updatedAt));
                const start = new Date(Date.UTC(updated.getFullYear(), updated.getMonth(), updated.getDate(),0,0,0,0));
                const end = new Date(Date.UTC(updated.getFullYear(), updated.getMonth(), updated.getDate(),23,59,59,999));
                whereFilters["updatedAt"] = {
                    gte: start,
                    lte: end
                };
            }
    
            console.log(whereFilters);
            if (page) {
                if (sort) {
                    let sortFilter = sort === 'name' ? 'name' : "updatedAt";
                    const orderSort= order === "DESC" ? "DESC" : "ASC";
                    console.log([sortFilter], page, whereFilters)
                    return await this.prisma.file.findMany({
                        skip: (page - 1) * limit,
                        take: limit,
                        where: whereFilters,
                        orderBy: {
                            [sortFilter]: orderSort.toLowerCase()
                        }
                    });
                } else {
                    return await this.prisma.file.findMany({
                        skip: (page - 1) * limit,
                        take: limit,
                        where: whereFilters
                    });
                }
            }
            if (sort) {
                let sortFilter = sort === 'name' ? 'name' : "updatedAt";
                const orderSort= order === "DESC" ? "DESC" : "ASC";
    
                return await this.prisma.file.findMany({
                    where: whereFilters,
                    orderBy: {
                        [sortFilter]: orderSort.toLowerCase()
                    }
                });
            }
            return await this.prisma.file.findMany({
                where: whereFilters,
            });
        }
    }
}
