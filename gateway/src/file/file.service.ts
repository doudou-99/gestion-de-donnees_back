import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { File } from '@prisma/client';
import { importDto } from './dto/import.dto';
import { RenameFileDto } from './dto/rename.file.dto';
import { S3Client, ListObjectsV2Command, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, CopyObjectCommand } from '@aws-sdk/client-s3';
import 'multer';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { FilesDto } from './dto/files.dto';
import { SearchDto } from './dto/search.dto';

export type Sort = 'name' | 'date';
export type Order = 'ASC' | 'DESC';

@Injectable()
export class FileService {
  private readonly s3Client: S3Client;
  constructor(private readonly prisma: PrismaService) {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
      maxAttempts: 3,
    });
  }

  async importFiles(files: Array<Express.Multer.File>, userId: number): Promise<File[]> {
    const filesImport: File[] = [];
    const totalSizesBucket = await this.getTotalSizeObjets();
    if (totalSizesBucket >= 5 * 1024 * 1024 * 1024) throw new BadRequestException('Space in AWS S3 is filled.');
    for (let i = 0; i < files.length; i++) {
      const totalSizes: number = files.reduce<number>((prev, current) => prev + current.size, 0);
      const key = `${files[i].originalname}_user_${userId}`;
      if (totalSizes > 5 * 1024 * 1024 * 1024) throw new BadRequestException('The files are too large.');
      const dataFiles: importDto = {
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
          originalName: Buffer.from(files[i].originalname).toString('base64'),
        },
      };
      await this.s3Client.send(new PutObjectCommand(params));
      const addFile = await this.prisma.file.create({
        data: dataFiles,
      });
      filesImport.push(addFile);
    }
    return filesImport;
  }

  async getTotalSizeObjets() {
    const objects = new ListObjectsV2Command({
      Bucket: process.env.AWS_BUCKET_NAME,
    });
    const response = await this.s3Client.send(objects);
    if (!response.Contents || response.Contents.length === 0) {
      return 0;
    }

    const sizeFile = response.Contents.reduce((total, obj) => {
      return total + (obj.Size || 0);
    }, 0);

    return sizeFile;
  }

  /**
   * Get files by user id
   * page is used for the pagination of the list and limit is the number of files per page
   * sort is used for sorting the files by name or date
   * order for descending or ascending order of files
   */
  async getFiles(userId: number, params: FilesDto) {
    const all = await this.prisma.file.findMany({
      where: {
        userId,
        OR: [{ status: 'HOME' }, { status: null }],
      },
      orderBy: this.buildOrderBy(params.sort, params.order),
      ...this.buildPagination(params.page, params.limit),
    });
    return all;
  }

  /**
   * Get the url of file to view the file
   * @param id Id of file
   */
  async getFileUrl(id: number) {
    const fileDetail = await this.detailsFile(id);
    const key = `${fileDetail.name}_user_${fileDetail.userId}`;

    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      ResponseContentDisposition: 'inline',
    });
    const url = await getSignedUrl(this.s3Client, command, {
      expiresIn: 60 * 24 * 24,
    });
    return url;
  }

  private buildDateRange(updatedAt: string) {
    const d = new Date(Date.parse(updatedAt));
    return {
      gte: new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0)),
      lte: new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999)),
    };
  }

  private buildWhereFilters(dto: SearchDto): Record<string, unknown> {
    return {
      userId: dto.userId,
      OR: [{ status: 'HOME' }, { status: null }],
      ...(dto.name && { name: { contains: dto.name } }),
      ...(dto.typeFile && { mimeType: { contains: dto.typeFile } }),
      ...(dto.updatedAt &&
        typeof dto.updatedAt === 'string' && {
          updatedAt: this.buildDateRange(dto.updatedAt),
        }),
    };
  }

  private buildPagination(page?: number, limit: number = 10): { skip: number; take: number } | Record<never, never> {
    return page ? { skip: (page - 1) * limit, take: limit } : {};
  }

  private buildOrderBy(sort?: Sort, order?: Order) {
    const direction = order === 'DESC' ? 'desc' : 'asc';
    const sortFilter = sort === 'name' ? 'name' : 'updatedAt';
    if (sort) return { [sortFilter]: direction };
    return undefined;
  }

  /**
   * Search files of user by name, file type or updatedAt
   * page is used for the pagination of the list and limit is the number of files per page
   * sort is used for sorting the files by name or date
   * order for descending or ascending order of files
   */
  async searchFiles(dto: SearchDto) {
    if (!dto.name && !dto.typeFile && dto.updatedAt === null) return [];

    return this.prisma.file.findMany({
      where: this.buildWhereFilters(dto),
      orderBy: this.buildOrderBy(dto.sort, dto.order),
      ...this.buildPagination(dto.page, dto.limit),
    });
  }

  /**
   * Get the owner of the file by id
   */
  async getOwnerFile(idFile: number) {
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

  /**
   * Change status of file to BIN
   */
  async moveFileToBin(idFile: number) {
    return await this.prisma.file.update({
      data: {
        status: 'BIN',
      },
      where: {
        id: idFile,
      },
    });
  }

  /**
   * Get moved files in the bin
   * page is used for the pagination of the list and limit is the number of files per page
   * sort is used for sorting the files by name or date
   * order for descending or ascending order of files
   */
  async getFilesBin(userId: number, params: FilesDto) {
    return this.prisma.file.findMany({
      where: { userId, status: 'BIN' },
      orderBy: this.buildOrderBy(params.sort, params.order),
      ...this.buildPagination(params.page, params.limit),
    });
  }

  /**
   * Change status of file to HOME
   */
  async moveFileToHome(idFile: number) {
    return await this.prisma.file.update({
      data: {
        status: 'HOME',
      },
      where: {
        id: idFile,
      },
    });
  }

  async existsById(id: number) {
    return (
      (await this.prisma.file.count({
        where: {
          id,
        },
      })) === 1
    );
  }

  async getById(id: number) {
    return await this.prisma.file.findUniqueOrThrow({
      where: {
        id,
      },
    });
  }

  /**
   * Get all users and groups that have access to the file
   */
  async getAccessUsersGroupsFile(idFile: number) {
    return await this.prisma.file.findUniqueOrThrow({
      select: {
        sharesGroups: {
          select: {
            fileId: true,
            groupId: true,
            accessType: true,
            expirationDate: true,
          },
        },
        sharesUsers: {
          select: {
            accessType: true,
            fileId: true,
            userId: true,
            expirationDate: true,
          },
        },
      },
      where: {
        id: idFile,
      },
    });
  }

  /**
   * Rename file with a new name
   */
  async renameFile(id: number, data: RenameFileDto) {
    const file = await this.detailsFile(id);
    const key = `${file.name}_user_${file.userId}`;
    const keyDest = `${data.name}_user_${file.userId}`;

    const commandCopy = new CopyObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: keyDest,
      CopySource: `${process.env.AWS_BUCKET_NAME}/${key}`,
    });
    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    });
    await this.s3Client.send(commandCopy);
    await this.s3Client.send(command);
    return await this.prisma.file.update({
      data: { name: data.name, path: '/' + data.name },
      where: {
        id,
      },
    });
  }

  /**
   * Get the details of the file
   * @param id File id
   */
  async detailsFile(id: number) {
    return await this.prisma.file.findUniqueOrThrow({
      where: {
        id,
      },
    });
  }

  /**
   * Delete files
   */
  async deleteFiles(files: number[]) {
    for (const id of files) {
      const file = await this.detailsFile(id);
      const key = `${file.name}_user_${file.userId}`;

      const command = new DeleteObjectCommand({
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
}
