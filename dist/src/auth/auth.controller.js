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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const signin_dto_1 = require("./dto/signin.dto");
const user_service_1 = require("../user/user.service");
const auth_service_1 = require("./auth.service");
const refresh_token_guard_1 = require("./guard/refresh.token.guard");
let AuthController = class AuthController {
    authService;
    userService;
    constructor(authService, userService) {
        this.authService = authService;
        this.userService = userService;
    }
    async signIn(body) {
        const user = await this.userService.getByEmail(body.email);
        const compare = await this.authService.compare(user.password, body.password);
        if (user.status === 'NOT_CONFIRMED') {
            throw new common_1.PreconditionFailedException();
        }
        if (!compare) {
            throw new common_1.PreconditionFailedException('Bad credentials');
        }
        const login = {
            id: user.id,
            email: user.email,
            password: user.password,
        };
        const access_token = await this.authService.generateToken({ sub: user.id }, {
            secret: process.env.SECRET_KEY,
            expiresIn: '60s',
        });
        const refresh_token = await this.authService.generateToken({ sub: user.id }, {
            algorithm: 'HS512',
            secret: process.env.SECRET_REFRESH_KEY,
            expiresIn: '240s',
        });
        await this.authService.upsertToken(user.id, await this.authService.hash(refresh_token));
        return {
            data: { user: login, access_token, refresh_token },
            message: 'The user is connected'
        };
    }
    async refresh(req) {
        const user = await this.userService.getById(req.user.sub);
        const tokenDB = await this.authService.findUniqueToken(req.user.sub);
        const compare = await this.authService.compare(tokenDB.token, req.refresh_token);
        if (!compare) {
            throw new common_1.UnauthorizedException();
        }
        const access_token = await this.authService.generateToken({ sub: user.id }, {
            secret: process.env.SECRET_KEY,
            expiresIn: '60s',
        });
        const refresh_token = await this.authService.generateToken({ sub: user.id }, {
            algorithm: 'HS512',
            secret: process.env.SECRET_REFRESH_KEY,
            expiresIn: '240s',
        });
        await this.authService.upsertToken(user.id, await this.authService.hash(refresh_token));
        return {
            data: { access_token, refresh_token },
            message: 'The refresh and access token is created'
        };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('signin'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [signin_dto_1.SigninDTO]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signIn", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(refresh_token_guard_1.RefreshTokenGuard),
    (0, common_1.Post)('refresh'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('api/v1/auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        user_service_1.UserService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map