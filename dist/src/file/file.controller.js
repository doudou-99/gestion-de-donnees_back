"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const access_token_guard_1 = require("../auth/guard/access.token.guard");
const file_service_1 = require("./file.service");
const response_message_with_data_1 = require("../responses/response.message.with.data");
const swagger_1 = require("@nestjs/swagger");
const response_message_1 = require("../responses/response.message");
const rename_file_dto_1 = require("./dto/rename.file.dto");
let FileController = class FileController {
    fileService;
    constructor(fileService) {
        this.fileService = fileService;
    }
    async uploadFile(files, req) {
        if (files === undefined || files.length === 0) {
            throw new common_1.BadRequestException();
        }
        const filesImport = await this.fileService.importFiles(files, req.user.sub);
        return {
            data: { files: filesImport },
            message: 'Files imported successfully',
        };
    }
    async getFiles(req, page, limit, sort, order) {
        let files = [];
        if (page === undefined &&
            limit === undefined &&
            order === undefined &&
            sort === undefined) {
            files = await this.fileService.getFiles(req.user.sub);
        }
        else {
            if (page) {
                if (sort) {
                    if (limit) {
                        if (order) {
                            files = await this.fileService.getFiles(req.user.sub, page, sort, limit, order);
                        }
                        else {
                            files = await this.fileService.getFiles(req.user.sub, page, sort, limit);
                        }
                    }
                    else {
                        if (order) {
                            files = await this.fileService.getFiles(req.user.sub, page, sort, undefined, order);
                        }
                        else {
                            files = await this.fileService.getFiles(req.user.sub, page, sort);
                        }
                    }
                }
                else {
                    files = await this.fileService.getFiles(req.user.sub, page);
                }
            }
            if (sort && page === undefined) {
                if (order) {
                    files = await this.fileService.getFiles(req.user.sub, undefined, sort, undefined, order);
                }
                else {
                    files = await this.fileService.getFiles(req.user.sub, undefined, sort);
                }
            }
        }
        return {
            data: { files },
            message: 'Files imported successfully',
        };
    }
    async getFilesBin(req, page, limit, sort, order) {
        let files = [];
        if (page === undefined &&
            limit === undefined &&
            order === undefined &&
            sort === undefined) {
            files = await this.fileService.getFilesBin(req.user.sub);
        }
        else {
            if (page) {
                if (sort) {
                    if (limit) {
                        if (order) {
                            files = await this.fileService.getFilesBin(req.user.sub, page, sort, limit, order);
                        }
                        else {
                            files = await this.fileService.getFilesBin(req.user.sub, page, sort, limit);
                        }
                    }
                    else {
                        if (order) {
                            files = await this.fileService.getFilesBin(req.user.sub, page, sort, undefined, order);
                        }
                        else {
                            files = await this.fileService.getFilesBin(req.user.sub, page, sort);
                        }
                    }
                }
                else {
                    files = await this.fileService.getFilesBin(req.user.sub, page);
                }
            }
            if (sort && page === undefined) {
                if (order) {
                    files = await this.fileService.getFilesBin(req.user.sub, undefined, sort, undefined, order);
                }
                else {
                    files = await this.fileService.getFilesBin(req.user.sub, undefined, sort);
                }
            }
        }
        return {
            data: { files },
            message: 'Files list in the bin',
        };
    }
    async deleteFiles(files) {
        await this.fileService.deleteFiles(files);
        console.log('Deleted files');
        return {
            message: 'Files deleted successfully',
        };
    }
    async searchFiles(name, typeFile, updatedAt, req, page, limit, sort, order) {
        let files = [];
        if (page === undefined &&
            limit === undefined &&
            order === undefined &&
            sort === undefined) {
            files = await this.fileService.searchFiles(req.user.sub, updatedAt, name, typeFile);
        }
        else {
            if (page) {
                if (sort) {
                    if (limit) {
                        if (order) {
                            files = await this.fileService.searchFiles(req.user.sub, updatedAt, name, typeFile, page, sort, limit, order);
                        }
                        else {
                            files = await this.fileService.searchFiles(req.user.sub, updatedAt, name, typeFile, page, sort, limit);
                        }
                    }
                    else {
                        if (order) {
                            files = await this.fileService.searchFiles(req.user.sub, updatedAt, name, typeFile, page, sort, undefined, order);
                        }
                        else {
                            files = await this.fileService.searchFiles(req.user.sub, updatedAt, name, typeFile, page, sort);
                        }
                    }
                }
                else {
                    files = await this.fileService.searchFiles(req.user.sub, updatedAt, name, typeFile, page);
                }
            }
            if (sort && page === undefined) {
                if (order) {
                    files = await this.fileService.searchFiles(req.user.sub, updatedAt, name, typeFile, undefined, sort, undefined, order);
                }
                else {
                    files = await this.fileService.searchFiles(req.user.sub, updatedAt, name, typeFile, undefined, sort);
                }
            }
        }
        console.log(files);
        return {
            data: { files, numberResults: files.length },
            message: 'Search results displayed successfully',
        };
    }
    async viewUrlFile(idFile) {
        const url = await this.fileService.getFileUrl(idFile);
        return {
            data: { url },
            message: 'File url displayed successfully',
        };
    }
    async getOwnerFile(idFile) {
        const owner = await this.fileService.getOwnerFile(idFile);
        console.log('🚀 ~ file.controller.ts:164 ~ FileController ~ getOwnerFile ~ owner:', owner);
        return {
            data: { owner },
            message: 'Owner of the file displayed successfully',
        };
    }
    async moveFileToBin(idFile) {
        const file = await this.fileService.moveFileToBin(idFile);
        console.log('🚀 ~ file.controller.ts:388 ~ FileController ~ moveFileToBin ~ file:', file);
        return {
            data: { file },
            message: 'File moved to the bin',
        };
    }
    async moveFileToHome(idFile) {
        const file = await this.fileService.moveFileToHome(idFile);
        console.log('🚀 ~ file.controller.ts:525 ~ FileController ~ moveFileToHome ~ file:', file);
        return {
            data: { file },
            message: 'File moved to the home',
        };
    }
    async renameFile(idFile, body) {
        const file = await this.fileService.renameFile(idFile, body);
        if (file === null) {
            throw new common_1.NotFoundException();
        }
        console.log("🚀 ~ file.controller.ts:572 ~ FileController ~ renameFile ~ file:", file);
        return {
            data: { file },
            message: 'Renamed file',
        };
    }
    async getReceiversShare(id) {
        const shareReceivers = await this.fileService.getAccessUsersGroupsFile(id);
        return {
            data: { shareReceivers },
            message: 'Users or groups that have access right to the file',
        };
    }
    async getDetailsFile(id) {
        const file = await this.fileService.detailsFile(id);
        console.log("🚀 ~ file.controller.ts:616 ~ FileController ~ getDetailsFile ~ file:", file);
        return {
            data: { file },
            message: 'File details displayed successfully',
        };
    }
};
exports.FileController = FileController;
__decorate([
    (0, common_1.Post)('import'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiCreatedResponse)({
        type: (response_message_with_data_1.ResponseMessageWithData),
        description: 'Imported files with message',
    }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files')),
    __param(0, (0, common_1.UploadedFiles)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object]),
    __metadata("design:returntype", Promise)
], FileController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiQuery)({
        name: 'page',
        type: 'number',
        required: false,
        description: 'Number of page used for the pagination of the results',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        type: 'number',
        required: false,
        description: 'Number of elements of page used for the pagination of the results',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'sort',
        type: 'string',
        required: false,
        description: 'Field (name,updatedAt) used to sort the results',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'order',
        type: 'string',
        required: false,
        description: 'Type of order used to sort the results(ASC, DESC)',
    }),
    (0, swagger_1.ApiOkResponse)({
        type: (response_message_with_data_1.ResponseMessageWithData),
        description: 'Files list with message',
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __param(2, (0, common_1.Query)('limit', new common_1.ParseIntPipe({ optional: true }))),
    __param(3, (0, common_1.Query)('sort')),
    __param(4, (0, common_1.Query)('order')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, String, String]),
    __metadata("design:returntype", Promise)
], FileController.prototype, "getFiles", null);
__decorate([
    (0, common_1.Get)('bin'),
    (0, swagger_1.ApiQuery)({
        name: 'page',
        type: 'number',
        required: false,
        description: 'Number of page used for the pagination of the results',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        type: 'number',
        required: false,
        description: 'Number of elements of page used for the pagination of the results',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'sort',
        type: 'string',
        required: false,
        description: 'Field (name,updatedAt) used to sort the results',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'order',
        type: 'string',
        required: false,
        description: 'Type of order used to sort the results(ASC, DESC)',
    }),
    (0, swagger_1.ApiOkResponse)({
        type: (response_message_with_data_1.ResponseMessageWithData),
        description: 'Moved files in the bin with message',
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __param(2, (0, common_1.Query)('limit', new common_1.ParseIntPipe({ optional: true }))),
    __param(3, (0, common_1.Query)('sort')),
    __param(4, (0, common_1.Query)('order')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, String, String]),
    __metadata("design:returntype", Promise)
], FileController.prototype, "getFilesBin", null);
__decorate([
    (0, common_1.Delete)('bin'),
    (0, swagger_1.ApiOkResponse)({
        type: response_message_1.ResponseMessage,
        description: 'Response message with deleted files',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], FileController.prototype, "deleteFiles", null);
__decorate([
    (0, common_1.Get)('search'),
    (0, swagger_1.ApiQuery)({
        name: 'name',
        type: 'string',
        required: false,
        description: 'Name of the file',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'typeFile',
        type: 'string',
        required: false,
        description: 'Type of the file',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'updatedAt',
        required: false,
        description: 'Update date of the file',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'page',
        type: 'number',
        required: false,
        description: 'Number of page used for the pagination of the results',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        type: 'number',
        required: false,
        description: 'Number of elements of page used for the pagination of the results',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'sort',
        type: 'string',
        required: false,
        description: 'Field (name,updatedAt) used to sort the results',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'order',
        type: 'string',
        required: false,
        description: 'Type of order used to sort the results (ASC, DESC)',
    }),
    (0, swagger_1.ApiOkResponse)({
        type: (response_message_with_data_1.ResponseMessageWithData),
        description: 'Search results with the number of results and the response message',
    }),
    __param(0, (0, common_1.Query)('name')),
    __param(1, (0, common_1.Query)('typeFile')),
    __param(2, (0, common_1.Query)('updatedAt')),
    __param(3, (0, common_1.Req)()),
    __param(4, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __param(5, (0, common_1.Query)('limit', new common_1.ParseIntPipe({ optional: true }))),
    __param(6, (0, common_1.Query)('sort')),
    __param(7, (0, common_1.Query)('order')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Date, Object, Number, Number, String, String]),
    __metadata("design:returntype", Promise)
], FileController.prototype, "searchFiles", null);
__decorate([
    (0, common_1.Get)('view/:idFile'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiParam)({ name: 'idFile', type: 'number', description: 'Id of file' }),
    (0, swagger_1.ApiOkResponse)({
        type: (response_message_with_data_1.ResponseMessageWithData),
        description: 'Url file',
    }),
    __param(0, (0, common_1.Param)('idFile', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], FileController.prototype, "viewUrlFile", null);
__decorate([
    (0, common_1.Get)(':idFile/owner'),
    (0, swagger_1.ApiParam)({ name: 'idFile', type: 'number', description: 'Id of file' }),
    (0, swagger_1.ApiOkResponse)({
        type: (response_message_with_data_1.ResponseMessageWithData),
        description: "File's owner with response message",
    }),
    __param(0, (0, common_1.Param)('idFile', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], FileController.prototype, "getOwnerFile", null);
__decorate([
    (0, common_1.Patch)(':idFile/move/bin'),
    (0, swagger_1.ApiParam)({ name: 'idFile', type: 'number', description: 'Id of file' }),
    (0, swagger_1.ApiOkResponse)({
        type: (response_message_with_data_1.ResponseMessageWithData),
        description: 'Moved file to the bin with response message',
    }),
    __param(0, (0, common_1.Param)('idFile', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], FileController.prototype, "moveFileToBin", null);
__decorate([
    (0, common_1.Patch)(':idFile/move/home'),
    (0, swagger_1.ApiParam)({ name: 'idFile', type: 'number', description: 'Id of file' }),
    (0, swagger_1.ApiOkResponse)({
        type: (response_message_with_data_1.ResponseMessageWithData),
        description: 'Moved file to the home with response message',
    }),
    __param(0, (0, common_1.Param)('idFile', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], FileController.prototype, "moveFileToHome", null);
__decorate([
    (0, common_1.Patch)(':idFile/rename'),
    (0, swagger_1.ApiParam)({ name: 'idFile', type: 'number', description: 'Id of file' }),
    (0, swagger_1.ApiOkResponse)({
        type: (response_message_with_data_1.ResponseMessageWithData),
        description: 'Renamed file',
    }),
    __param(0, (0, common_1.Param)('idFile', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, rename_file_dto_1.RenameFileDto]),
    __metadata("design:returntype", Promise)
], FileController.prototype, "renameFile", null);
__decorate([
    (0, common_1.Get)(':idFile/access_shares'),
    (0, swagger_1.ApiOkResponse)({
        type: (response_message_with_data_1.ResponseMessageWithData),
        description: 'Users or groups that have access right to the file',
    }),
    __param(0, (0, common_1.Param)('idFile', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], FileController.prototype, "getReceiversShare", null);
__decorate([
    (0, common_1.Get)(':idFile'),
    (0, swagger_1.ApiOkResponse)({
        type: (response_message_with_data_1.ResponseMessageWithData),
        description: 'File details displayed successfully',
    }),
    __param(0, (0, common_1.Param)('idFile', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], FileController.prototype, "getDetailsFile", null);
exports.FileController = FileController = __decorate([
    (0, common_1.Controller)('api/v1/files'),
    (0, swagger_1.ApiTags)('file'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(access_token_guard_1.AccessTokenGuard),
    __metadata("design:paramtypes", [file_service_1.FileService])
], FileController);
//# sourceMappingURL=file.controller.js.map