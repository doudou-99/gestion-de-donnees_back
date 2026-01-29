import type { RequestPayload } from '../auth/interface/payload.interface';
import { FileService } from './file.service';
import { ResponseMessageWithData } from '../responses/response.message.with.data';
import { File, User } from '@prisma/client';
import { FileResponse } from './responses/file.response';
import { ResponseMessage } from '../responses/response.message';
import { ShareGroupsUsersResponse } from './responses/shares.groups.users';
import { RenameFileDto } from './dto/rename.file.dto';
export declare class FileController {
    private readonly fileService;
    constructor(fileService: FileService);
    uploadFile(files: Array<Express.Multer.File>, req: RequestPayload): Promise<ResponseMessageWithData<{
        files: File[];
    }>>;
    getFiles(req: RequestPayload, page: number, limit: number, sort: string, order: string): Promise<ResponseMessageWithData<{
        files: File[];
    }>>;
    getFilesBin(req: RequestPayload, page: number, limit: number, sort: string, order: string): Promise<ResponseMessageWithData<{
        files: File[];
    }>>;
    deleteFiles(files: number[]): Promise<ResponseMessage>;
    searchFiles(name: string, typeFile: string, updatedAt: Date, req: RequestPayload, page: number, limit: number, sort: string, order: string): Promise<ResponseMessageWithData<{
        files: File[];
        numberResults: number;
    }>>;
    viewUrlFile(idFile: number): Promise<ResponseMessageWithData<{
        url: string;
    }>>;
    getOwnerFile(idFile: number): Promise<ResponseMessageWithData<{
        owner: User;
    }>>;
    moveFileToBin(idFile: number): Promise<ResponseMessageWithData<{
        file: File;
    }>>;
    moveFileToHome(idFile: number): Promise<ResponseMessageWithData<{
        file: File;
    }>>;
    renameFile(idFile: number, body: RenameFileDto): Promise<ResponseMessageWithData<{
        file: File;
    }>>;
    getReceiversShare(id: number): Promise<ResponseMessageWithData<{
        shareReceivers: ShareGroupsUsersResponse;
    }>>;
    getDetailsFile(id: number): Promise<ResponseMessageWithData<{
        file: FileResponse;
    }>>;
}
