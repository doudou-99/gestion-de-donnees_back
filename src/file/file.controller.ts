import {
    BadRequestException,
  Body,
  Controller,
  Get,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AccessTokenGuard } from '../auth/guard/access.token.guard';
import type { RequestPayload } from '../auth/interface/payload.interface';
import { FileService, Order, Sort } from './file.service';
import { ResponseMessageWithData } from '../responses/response.message.with.data';
import { File } from '@prisma/client';
import { SearchDto } from './dto/search.dto';

@Controller('api/v1/files')
export class FileController {
    
  constructor(private readonly fileService: FileService) {}

  @Post('import')
  @UseInterceptors(FilesInterceptor('files'))
  @UseGuards(AccessTokenGuard)
  async uploadFile(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Req() req: RequestPayload,
  ): Promise<
    ResponseMessageWithData<{
      files: File[];
    }>
  > {
    if (files === undefined || files.length === 0) {
        throw new BadRequestException();
    }
    const filesImport = await this.fileService.importFiles(files, req.user.sub);
    return {
      data: { files: filesImport },
      message: 'Files imported successfully',
    };
  }

  @Get()
  @UseGuards(AccessTokenGuard)
  async getFiles(
    @Req() req: RequestPayload,
    @Query("page", new ParseIntPipe({optional: true})) page: number,
    @Query("limit", new ParseIntPipe({optional: true})) limit: number,
    @Query("sort") sort: string,
    @Query("order") order: string,
  ): Promise<
    ResponseMessageWithData<{
      files: File[];
    }>
  > {
    let files: File[] = [];
    if (page === undefined && limit === undefined && order === undefined && sort === undefined) {
      files = await this.fileService.getFiles(req.user.sub);
    } else {
      if (page) {
        if (sort) {
          if (limit) {
            if (order) {
              files = await this.fileService.getFiles(req.user.sub, page, sort as Sort, limit, order as Order)
            } else {
              files = await this.fileService.getFiles(req.user.sub, page, sort as Sort, limit)
            }
          } else {
            if (order) {
              files = await this.fileService.getFiles(req.user.sub, page, sort as Sort, undefined, order as Order);
            } else {
              files = await this.fileService.getFiles(req.user.sub, page, sort as Sort);
            }
          }
        } else {
          files = await this.fileService.getFiles(req.user.sub, page);
        }
      } 
      if (sort && page === undefined) {
        if (order) {
          files = await this.fileService.getFiles(req.user.sub, undefined, sort as Sort, undefined, order as Order);
        } else {
          files = await this.fileService.getFiles(req.user.sub, undefined, sort as Sort);
        }
      }
    }
    return {
      data: { files },
      message: 'Files imported successfully',
    };
  }

  @Get("search")
  @UseGuards(AccessTokenGuard)
  async searchFiles(
    @Body() searchDto: SearchDto,
    @Req() req: RequestPayload,
    @Query("page", new ParseIntPipe({optional: true})) page: number,
    @Query("limit", new ParseIntPipe({optional: true})) limit: number,
    @Query("sort") sort: string,
    @Query("order") order: string,
  ): Promise<
    ResponseMessageWithData<{
      files: File[];
      numberResults: number;
    }>
  > {
    let files: File[] = [];
    if (page === undefined && limit === undefined && order === undefined && sort === undefined) {
      files = await this.fileService.searchFiles(searchDto, req.user.sub);
    } else {
      if (page) {
        if (sort) {
          if (limit) {
            if (order) {
              files = await this.fileService.searchFiles(searchDto, req.user.sub, page, sort as Sort, limit, order as Order)
            } else {
              files = await this.fileService.searchFiles(searchDto, req.user.sub, page, sort as Sort, limit)
            }
          } else {
            if (order) {
              files = await this.fileService.searchFiles(searchDto, req.user.sub, page, sort as Sort, undefined, order as Order);
            } else {
              files = await this.fileService.searchFiles(searchDto, req.user.sub, page, sort as Sort);
            }
          }
        } else {
          files = await this.fileService.searchFiles(searchDto, req.user.sub, page);
        }
      } 
      if (sort && page === undefined) {
        if (order) {
          files = await this.fileService.searchFiles(searchDto, req.user.sub, undefined, sort as Sort, undefined, order as Order);
        } else {
          files = await this.fileService.searchFiles(searchDto, req.user.sub, undefined, sort as Sort);
        }
      }
    }
    console.log(files)
    return {
      data: { files, numberResults: files.length },
      message: 'Search results displayed successfully',
    };
  }
}
