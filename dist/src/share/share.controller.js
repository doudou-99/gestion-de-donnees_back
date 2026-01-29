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
exports.ShareController = void 0;
const common_1 = require("@nestjs/common");
const shares_create_dto_1 = require("./dto/shares.create.dto");
const share_service_1 = require("./share.service");
const response_message_with_data_1 = require("../responses/response.message.with.data");
const access_token_guard_1 = require("../auth/guard/access.token.guard");
const swagger_1 = require("@nestjs/swagger");
const access_share_dto_1 = require("./dto/access.share.dto");
let ShareController = class ShareController {
    shareService;
    constructor(shareService) {
        this.shareService = shareService;
    }
    async createShares(id, data, req) {
        if (data.users !== undefined && data.users.includes(req.user.sub)) {
            throw new common_1.BadRequestException();
        }
        const shares = await this.shareService.createShares(id, req.user.sub, data);
        return {
            data: { shares },
            message: 'Shares of users or groups that have access right to the file',
        };
    }
    async editAccessTypeShareUser(id, idUser, data) {
        const share = await this.shareService.editAccessFileUser(id, idUser, data);
        return {
            data: { share },
            message: 'User that have access right to the file'
        };
    }
    async editAccessTypeShareGroup(id, idGroup, data) {
        const share = await this.shareService.editAccessFileGroup(id, idGroup, data);
        return {
            data: { share },
            message: 'Change of the access type of the group that have access right to the file completed successfully'
        };
    }
    async getReceivers(req) {
        const receivers = await this.shareService.getReceivers(req.user.sub);
        console.log("🚀 ~ share.controller.ts:124 ~ ShareController ~ getReceivers ~ receivers:", receivers);
        return {
            data: { receivers },
            message: 'Users and groups list'
        };
    }
};
exports.ShareController = ShareController;
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiCreatedResponse)({
        type: (response_message_with_data_1.ResponseMessageWithData),
        description: 'Shares of users or groups that have access right to the file',
    }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)(':idFile'),
    __param(0, (0, common_1.Param)('idFile', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, shares_create_dto_1.SharesCreateDto, Object]),
    __metadata("design:returntype", Promise)
], ShareController.prototype, "createShares", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOkResponse)({
        type: (response_message_with_data_1.ResponseMessageWithData),
        description: 'User that have access right to the file',
    }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Patch)(':idFile/access/user/:idUser'),
    __param(0, (0, common_1.Param)('idFile', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('idUser', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, access_share_dto_1.AccessShareDto]),
    __metadata("design:returntype", Promise)
], ShareController.prototype, "editAccessTypeShareUser", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOkResponse)({
        type: (response_message_with_data_1.ResponseMessageWithData),
        description: 'Change access type of the group that have access right to the file',
    }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Patch)(':idFile/access/group/:idGroup'),
    __param(0, (0, common_1.Param)('idFile', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('idGroup', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, access_share_dto_1.AccessShareDto]),
    __metadata("design:returntype", Promise)
], ShareController.prototype, "editAccessTypeShareGroup", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOkResponse)({
        type: (response_message_with_data_1.ResponseMessageWithData),
        description: 'Users and groups list',
    }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('receivers'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ShareController.prototype, "getReceivers", null);
exports.ShareController = ShareController = __decorate([
    (0, common_1.Controller)('api/v1/shares'),
    (0, common_1.UseGuards)(access_token_guard_1.AccessTokenGuard),
    __metadata("design:paramtypes", [share_service_1.ShareService])
], ShareController);
//# sourceMappingURL=share.controller.js.map