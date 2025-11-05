import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { File } from '@prisma/client';
import { importDto } from './dto/import.dto';

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
}
