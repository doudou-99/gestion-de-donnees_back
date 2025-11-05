import {
    BadRequestException,
  Controller,
  Post,
  Req,
  UploadedFiles,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AccessTokenGuard } from '../auth/guard/access.token.guard';
import type { RequestPayload } from '../auth/interface/payload.interface';
import { FileService } from './file.service';
import { ResponseMessageWithData } from '../responses/response.message.with.data';
import { File } from '@prisma/client';

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
}
