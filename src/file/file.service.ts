import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { File } from '@prisma/client';
import { importDto } from './dto/import.dto';
import { RenameFileDto } from './dto/rename.file.dto';
import {S3Client, ListObjectsV2Command, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, RenameObjectCommand, CopyObjectCommand} from '@aws-sdk/client-s3';
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";

export type Sort = 'name' | 'updatedAt';
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

  async importFiles(
    files: Array<Express.Multer.File>,
    userId: number,
  ): Promise<File[]> {
    let filesImport: File[] = [];
    const totalSizesBucket = await this.getTotalSizeObjets();
    if (totalSizesBucket >= (5 * 1024 * 1024 *1024)) throw new BadRequestException("Space in AWS S3 is filled.")
    for (let i = 0; i < files.length; i++) {
      const totalSizes: number = files.reduce<number>((prev, current) => prev+current.size,0);
      const key = `${files[i].originalname}_user_${userId}`;
      if (totalSizes > (5 * 1024 *1024 *1024)) throw new BadRequestException("The files are too large.")
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
          originalName: Buffer.from(files[i].originalname).toString('base64')        
        }
      };
      await this.s3Client.send(new PutObjectCommand(params));
      const addFile = await this.prisma.file.create({
        data: dataFiles,
      });
      filesImport.push(addFile);
    }
    console.log(filesImport);
    return filesImport;
  }

  async getTotalSizeObjets() {
    const objects = new ListObjectsV2Command({Bucket: process.env.AWS_BUCKET_NAME});
    const response = await this.s3Client.send(objects);
    console.log(response);
    if (!response.Contents || response.Contents.length === 0) {
        return 0;
    }

    const sizeFile = response.Contents.reduce((total, obj) => {
      return total + (obj.Size || 0);
    }, 0);
    console.log("🚀 ~ file.service.ts:89 ~ FileService ~ getTotalSizeObjets ~ sizeFile:", sizeFile)

    
    return sizeFile;
  }

  /**
   * Get files by user id
   * page is used for the pagination of the list and limit is the number of files per page
   * sort is used for sorting the files by name or date
   * order for descending or ascending order of files
   */
  async getFiles(
    userId: number,
    page?: number,
    sort?: Sort,
    limit: number = 10,
    order: Order = 'ASC',
  ) {
    const whereFilters: Record<string, any> = {
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
      } else {
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


  /**
   * Get the url of file to view the file
   * @param id Id of file
   */
  async getFileUrl(id: number) {
    const fileDetail = await this.detailsFile(id);
    const key = `${fileDetail.name}_user_${fileDetail.userId}`;

    const command = new GetObjectCommand({Bucket: process.env.AWS_BUCKET_NAME, Key: key, ResponseContentDisposition: "inline"});
    const url = await getSignedUrl(this.s3Client, command, {expiresIn: 60 * 24 *24})
    return url;
  }

  /**
   * Search files of user by name, file type or updatedAt
   * page is used for the pagination of the list and limit is the number of files per page
   * sort is used for sorting the files by name or date
   * order for descending or ascending order of files
   */
  async searchFiles(
    userId: number,
    updatedAt: Date | null,
    name?: string,
    typeFile?: string,
    page?: number,
    sort?: Sort,
    limit: number = 10,
    order: Order = 'ASC',
  ) {
    let whereFilters: Record<string, any> = {
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
    } else {
      if (name) whereFilters['name'] = { contains: name };
      if (typeFile) whereFilters['mimeType'] = { contains: typeFile };
      if (updatedAt && updatedAt !== null && typeof updatedAt === 'string') {
        const updated = new Date(Date.parse(updatedAt));
        const start = new Date(
          Date.UTC(
            updated.getFullYear(),
            updated.getMonth(),
            updated.getDate(),
            0,
            0,
            0,
            0,
          ),
        );
        const end = new Date(
          Date.UTC(
            updated.getFullYear(),
            updated.getMonth(),
            updated.getDate(),
            23,
            59,
            59,
            999,
          ),
        );
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
        } else {
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
  async getFilesBin(
    userId: number,
    page?: number,
    sort?: Sort,
    limit: number = 10,
    order: Order = 'ASC',
  ) {
    const whereFilters: Record<string, any> = {
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
      } else {
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
      data: { name: data.name, path: "/"+data.name},
      where: {
        id
      }
    })
  }

  /**
   * Get the details of the file
   * @param id File id
   */
  async detailsFile(id: number) {
    return await this.prisma.file.findUniqueOrThrow({
      where: {
        id
      }
    })
  }

  /**
   * Delete files
   */
  async deleteFiles(files: number[]) {
    for (let id of files) {
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
