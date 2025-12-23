import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { File } from '@prisma/client';
import { importDto } from './dto/import.dto';
import { RenameFileDto } from './dto/rename.file.dto';

export type Sort = 'name' | 'updatedAt';
export type Order = 'ASC' | 'DESC';

@Injectable()
export class FileService {
  constructor(private readonly prisma: PrismaService) {}

  async importFiles(
    files: Array<Express.Multer.File>,
    userId: number,
  ): Promise<File[]> {
    let filesImport: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const dataFiles: importDto = {
        name: files[i].originalname.split('.')[0],
        mimeType: files[i].mimetype,
        path: files[i].originalname,
        size: files[i].size,
        userId,
        version: '1.0',
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

  async existsById(id: number) {
    return await this.prisma.file.count({
      where: {
        id
      }
    }) === 1;
  }

  async getById(id: number) {
    return await this.prisma.file.findUniqueOrThrow({
      where: {
        id
      }
    })
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
    console.log(data)
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
      await this.prisma.file.delete({
        where: {
          id,
          status: 'BIN',
        },
      });
    }
  }
}
