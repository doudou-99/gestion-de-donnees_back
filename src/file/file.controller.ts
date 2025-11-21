import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AccessTokenGuard } from '../auth/guard/access.token.guard';
import type { RequestPayload } from '../auth/interface/payload.interface';
import { FileService, Order, Sort } from './file.service';
import { ResponseMessageWithData } from '../responses/response.message.with.data';
import { File, User } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { FileResponse } from './responses/file.response';
import { ResponseMessage } from '../responses/response.message';
import { ShareGroupsUsersResponse } from './responses/shares.groups.users';

@Controller('api/v1/files')
@ApiTags('file')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('import')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({
    type: ResponseMessageWithData<{
      files: FileResponse[];
    }>,
    description: 'Imported files with message',
  })
  @UseInterceptors(FilesInterceptor('files'))
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
  @ApiQuery({
    name: 'page',
    type: 'number',
    required: false,
    description: 'Number of page used for the pagination of the results',
  })
  @ApiQuery({
    name: 'limit',
    type: 'number',
    required: false,
    description:
      'Number of elements of page used for the pagination of the results',
  })
  @ApiQuery({
    name: 'sort',
    type: 'string',
    required: false,
    description: 'Field (name,updatedAt) used to sort the results',
  })
  @ApiQuery({
    name: 'order',
    type: 'string',
    required: false,
    description: 'Type of order used to sort the results(ASC, DESC)',
  })
  @ApiOkResponse({
    type: ResponseMessageWithData<{
      files: FileResponse[];
    }>,
    description: 'Files list with message',
  })
  async getFiles(
    @Req() req: RequestPayload,
    @Query('page', new ParseIntPipe({ optional: true })) page: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number,
    @Query('sort') sort: string,
    @Query('order') order: string,
  ): Promise<
    ResponseMessageWithData<{
      files: File[];
    }>
  > {
    let files: File[] = [];
    if (
      page === undefined &&
      limit === undefined &&
      order === undefined &&
      sort === undefined
    ) {
      files = await this.fileService.getFiles(req.user.sub);
    } else {
      if (page) {
        if (sort) {
          if (limit) {
            if (order) {
              files = await this.fileService.getFiles(
                req.user.sub,
                page,
                sort as Sort,
                limit,
                order as Order,
              );
            } else {
              files = await this.fileService.getFiles(
                req.user.sub,
                page,
                sort as Sort,
                limit,
              );
            }
          } else {
            if (order) {
              files = await this.fileService.getFiles(
                req.user.sub,
                page,
                sort as Sort,
                undefined,
                order as Order,
              );
            } else {
              files = await this.fileService.getFiles(
                req.user.sub,
                page,
                sort as Sort,
              );
            }
          }
        } else {
          files = await this.fileService.getFiles(req.user.sub, page);
        }
      }
      if (sort && page === undefined) {
        if (order) {
          files = await this.fileService.getFiles(
            req.user.sub,
            undefined,
            sort as Sort,
            undefined,
            order as Order,
          );
        } else {
          files = await this.fileService.getFiles(
            req.user.sub,
            undefined,
            sort as Sort,
          );
        }
      }
    }
    return {
      data: { files },
      message: 'Files imported successfully',
    };
  }

  @Get('bin')
  @ApiQuery({
    name: 'page',
    type: 'number',
    required: false,
    description: 'Number of page used for the pagination of the results',
  })
  @ApiQuery({
    name: 'limit',
    type: 'number',
    required: false,
    description:
      'Number of elements of page used for the pagination of the results',
  })
  @ApiQuery({
    name: 'sort',
    type: 'string',
    required: false,
    description: 'Field (name,updatedAt) used to sort the results',
  })
  @ApiQuery({
    name: 'order',
    type: 'string',
    required: false,
    description: 'Type of order used to sort the results(ASC, DESC)',
  })
  @ApiOkResponse({
    type: ResponseMessageWithData<{
      files: FileResponse[];
    }>,
    description: 'Moved files in the bin with message',
  })
  async getFilesBin(
    @Req() req: RequestPayload,
    @Query('page', new ParseIntPipe({ optional: true })) page: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number,
    @Query('sort') sort: string,
    @Query('order') order: string,
  ): Promise<
    ResponseMessageWithData<{
      files: File[];
    }>
  > {
    let files: File[] = [];
    if (
      page === undefined &&
      limit === undefined &&
      order === undefined &&
      sort === undefined
    ) {
      files = await this.fileService.getFilesBin(req.user.sub);
    } else {
      if (page) {
        if (sort) {
          if (limit) {
            if (order) {
              files = await this.fileService.getFilesBin(
                req.user.sub,
                page,
                sort as Sort,
                limit,
                order as Order,
              );
            } else {
              files = await this.fileService.getFilesBin(
                req.user.sub,
                page,
                sort as Sort,
                limit,
              );
            }
          } else {
            if (order) {
              files = await this.fileService.getFilesBin(
                req.user.sub,
                page,
                sort as Sort,
                undefined,
                order as Order,
              );
            } else {
              files = await this.fileService.getFilesBin(
                req.user.sub,
                page,
                sort as Sort,
              );
            }
          }
        } else {
          files = await this.fileService.getFilesBin(req.user.sub, page);
        }
      }
      if (sort && page === undefined) {
        if (order) {
          files = await this.fileService.getFilesBin(
            req.user.sub,
            undefined,
            sort as Sort,
            undefined,
            order as Order,
          );
        } else {
          files = await this.fileService.getFilesBin(
            req.user.sub,
            undefined,
            sort as Sort,
          );
        }
      }
    }
    return {
      data: { files },
      message: 'Files list in the bin',
    };
  }

  @Delete('bin')
  @ApiOkResponse({
    type: ResponseMessage,
    description: 'Response message with deleted files',
  })
  async deleteFiles(@Body() files: number[]): Promise<ResponseMessage> {
    await this.fileService.deleteFiles(files);
    console.log('Deleted files');
    return {
      message: 'Files deleted successfully',
    };
  }

  @Get('search')
  @ApiQuery({
    name: 'name',
    type: 'string',
    required: false,
    description: 'Name of the file',
  })
  @ApiQuery({
    name: 'typeFile',
    type: 'string',
    required: false,
    description: 'Type of the file',
  })
  @ApiQuery({
    name: 'updatedAt',
    required: false,
    description: 'Update date of the file',
  })
  @ApiQuery({
    name: 'page',
    type: 'number',
    required: false,
    description: 'Number of page used for the pagination of the results',
  })
  @ApiQuery({
    name: 'limit',
    type: 'number',
    required: false,
    description:
      'Number of elements of page used for the pagination of the results',
  })
  @ApiQuery({
    name: 'sort',
    type: 'string',
    required: false,
    description: 'Field (name,updatedAt) used to sort the results',
  })
  @ApiQuery({
    name: 'order',
    type: 'string',
    required: false,
    description: 'Type of order used to sort the results (ASC, DESC)',
  })
  @ApiOkResponse({
    type: ResponseMessageWithData<{
      files: FileResponse[];
    }>,
    description:
      'Search results with the number of results and the response message',
  })
  async searchFiles(
    @Query('name') name: string,
    @Query('typeFile') typeFile: string,
    @Query('updatedAt') updatedAt: Date,
    @Req() req: RequestPayload,
    @Query('page', new ParseIntPipe({ optional: true })) page: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number,
    @Query('sort') sort: string,
    @Query('order') order: string,
  ): Promise<
    ResponseMessageWithData<{
      files: File[];
      numberResults: number;
    }>
  > {
    let files: File[] = [];
    if (
      page === undefined &&
      limit === undefined &&
      order === undefined &&
      sort === undefined
    ) {
      files = await this.fileService.searchFiles(
        req.user.sub,
        updatedAt,
        name,
        typeFile,
      );
    } else {
      if (page) {
        if (sort) {
          if (limit) {
            if (order) {
              files = await this.fileService.searchFiles(
                req.user.sub,
                updatedAt,
                name,
                typeFile,
                page,
                sort as Sort,
                limit,
                order as Order,
              );
            } else {
              files = await this.fileService.searchFiles(
                req.user.sub,
                updatedAt,
                name,
                typeFile,
                page,
                sort as Sort,
                limit,
              );
            }
          } else {
            if (order) {
              files = await this.fileService.searchFiles(
                req.user.sub,
                updatedAt,
                name,
                typeFile,
                page,
                sort as Sort,
                undefined,
                order as Order,
              );
            } else {
              files = await this.fileService.searchFiles(
                req.user.sub,
                updatedAt,
                name,
                typeFile,
                page,
                sort as Sort,
              );
            }
          }
        } else {
          files = await this.fileService.searchFiles(
            req.user.sub,
            updatedAt,
            name,
            typeFile,
            page,
          );
        }
      }
      if (sort && page === undefined) {
        if (order) {
          files = await this.fileService.searchFiles(
            req.user.sub,
            updatedAt,
            name,
            typeFile,
            undefined,
            sort as Sort,
            undefined,
            order as Order,
          );
        } else {
          files = await this.fileService.searchFiles(
            req.user.sub,
            updatedAt,
            name,
            typeFile,
            undefined,
            sort as Sort,
          );
        }
      }
    }
    console.log(files);
    return {
      data: { files, numberResults: files.length },
      message: 'Search results displayed successfully',
    };
  }

  @Get(':idFile/owner')
  @ApiParam({ name: 'idFile', type: 'number', description: 'Id of file' })
  @ApiOkResponse({
    type: ResponseMessageWithData<{
      owner: User;
    }>,
    description: "File's owner with response message",
  })
  async getOwnerFile(@Param('idFile', ParseIntPipe) idFile: number): Promise<
    ResponseMessageWithData<{
      owner: User;
    }>
  > {
    const owner = await this.fileService.getOwnerFile(idFile);
    console.log(
      '🚀 ~ file.controller.ts:164 ~ FileController ~ getOwnerFile ~ owner:',
      owner,
    );
    return {
      data: { owner },
      message: 'Owner of the file displayed successfully',
    };
  }

  @Patch(':idFile/move/bin')
  @ApiParam({ name: 'idFile', type: 'number', description: 'Id of file' })
  @ApiOkResponse({
    type: ResponseMessageWithData<{
      file: FileResponse;
    }>,
    description: 'Moved file to the bin with response message',
  })
  async moveFileToBin(@Param('idFile', ParseIntPipe) idFile: number): Promise<
    ResponseMessageWithData<{
      file: File;
    }>
  > {
    const file = await this.fileService.moveFileToBin(idFile);
    console.log(
      '🚀 ~ file.controller.ts:388 ~ FileController ~ moveFileToBin ~ file:',
      file,
    );
    return {
      data: { file },
      message: 'File moved to the bin',
    };
  }

  @Patch(':idFile/move/home')
  @ApiParam({ name: 'idFile', type: 'number', description: 'Id of file' })
  @ApiOkResponse({
    type: ResponseMessageWithData<{
      file: FileResponse;
    }>,
    description: 'Moved file to the home with response message',
  })
  async moveFileToHome(@Param('idFile', ParseIntPipe) idFile: number): Promise<
    ResponseMessageWithData<{
      file: File;
    }>
  > {
    const file = await this.fileService.moveFileToHome(idFile);
    console.log(
      '🚀 ~ file.controller.ts:525 ~ FileController ~ moveFileToHome ~ file:',
      file,
    );
    return {
      data: { file },
      message: 'File moved to the home',
    };
  }

  @Get(':idFile/access_shares')
  @ApiOkResponse({
    type: ResponseMessageWithData<{
      shareReceivers: any;
    }>,
    description: 'Users or groups that have access right to the file',
  })
  async getReceiversShare(@Param('idFile', ParseIntPipe) id: number): Promise<
    ResponseMessageWithData<{
      shareReceivers: ShareGroupsUsersResponse[];
    }>
  > {
    const shareReceivers = await this.fileService.getAccessUsersGroupsFile(id);
    return {
      data: { shareReceivers },
      message: 'Users or groups that have access right to the file',
    };
  }
}
