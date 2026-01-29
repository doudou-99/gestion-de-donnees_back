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
exports.GroupController = void 0;
const common_1 = require("@nestjs/common");
const group_service_1 = require("./group.service");
const swagger_1 = require("@nestjs/swagger");
const response_message_with_data_1 = require("../responses/response.message.with.data");
const access_token_guard_1 = require("../auth/guard/access.token.guard");
let GroupController = class GroupController {
    groupService;
    constructor(groupService) {
        this.groupService = groupService;
    }
    async getById(idGroup) {
        const group = await this.groupService.getById(idGroup);
        console.log('🚀 ~ group.controller.ts:23 ~ GroupController ~ getById ~ group:', group);
        return {
            data: { group },
            message: 'Group is displayed successfully',
        };
    }
};
exports.GroupController = GroupController;
__decorate([
    (0, common_1.Get)(':idGroup'),
    (0, swagger_1.ApiParam)({ name: 'idGroup', type: 'number', description: 'Id of group' }),
    (0, swagger_1.ApiOkResponse)({
        type: (response_message_with_data_1.ResponseMessageWithData),
        description: 'Group is displayed successfully',
    }),
    __param(0, (0, common_1.Param)('idGroup', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "getById", null);
exports.GroupController = GroupController = __decorate([
    (0, common_1.Controller)('api/v1/groups'),
    (0, common_1.UseGuards)(access_token_guard_1.AccessTokenGuard),
    __metadata("design:paramtypes", [group_service_1.GroupService])
], GroupController);
//# sourceMappingURL=group.controller.js.map