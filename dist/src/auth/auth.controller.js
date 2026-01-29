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
const response_message_with_data_1 = require("../responses/response.message.with.data");
const refresh_token_guard_1 = require("./guard/refresh.token.guard");
const signup_dto_1 = require("./dto/signup.dto");
const swagger_1 = require("@nestjs/swagger");
const access_token_guard_1 = require("./guard/access.token.guard");
const confirm_token_guard_1 = require("./guard/confirm.token.guard");
const response_message_1 = require("../responses/response.message");
const confirm_dto_1 = require("./dto/confirm.dto");
let AuthController = class AuthController {
    authService;
    userService;
    constructor(authService, userService) {
        this.authService = authService;
        this.userService = userService;
    }
    async signUp(body) {
        body.password = await this.authService.hash(body.password);
        if (body.extraEmail === undefined || body.extraEmail === '')
            body.extraEmail = undefined;
        const user = await this.userService.create(body);
        console.log('🚀 ~ auth.controller.ts:54 ~ AuthController ~ signUp ~ user:', user);
        const confirm_token = await this.authService.generateToken({ sub: user.id }, {
            secret: process.env.SECRET_CONFIRM_KEY,
            expiresIn: '2m',
        });
        const hashed = await this.authService.hash(confirm_token);
        await this.authService.upsertToken(user.id, hashed, 'ACTIVATEACCOUNT');
        await this.authService.sendConfirmEmail(body.email, confirm_token);
        return {
            data: { user },
            message: 'The user is created',
        };
    }
    async sendConfirm(confirmDto) {
        const user = await this.userService.getByEmail(confirmDto.email);
        const confirm_token = await this.authService.generateToken({ sub: user.id }, {
            secret: process.env.SECRET_CONFIRM_KEY,
            expiresIn: '2m',
        });
        const hashed = await this.authService.hash(confirm_token);
        await this.authService.upsertToken(user.id, hashed, 'ACTIVATEACCOUNT');
        await this.authService.sendConfirmEmail(user.email, confirm_token);
        return {
            message: 'Confirmation email sent',
        };
    }
    async confirm(req, token, res) {
        const tokenDB = await this.authService.findUniqueToken(req.user.sub, token);
        if (tokenDB.type !== 'ACTIVATEACCOUNT') {
            return res.redirect(process.env.FRONT_URL + '/signin');
        }
        const compare = await this.authService.compare(tokenDB.token, token);
        console.log('🚀 ~ auth.controller.ts:92 ~ AuthController ~ confirm ~ compare:', compare);
        if (!compare) {
            return res.redirect(process.env.FRONT_URL + '/signin');
        }
        let user = await this.userService.getById(req.user.sub);
        console.log('🚀 ~ auth.controller.ts:98 ~ AuthController ~ confirm ~ user:', user);
        if (user.status !== 'NOT_CONFIRMED') {
            return res.redirect(process.env.FRONT_URL + '/signin');
        }
        await this.userService.updateUser(req.user.sub, {
            status: 'CONFIRMED',
        });
        const updatedUser = await this.userService.getById(req.user.sub);
        if (updatedUser.status !== 'CONFIRMED') {
            return res.redirect(process.env.FRONT_URL + '/signin');
        }
        console.log('🚀 ~ auth.controller.ts:104 ~ AuthController ~ confirm ~ user:', updatedUser);
        await this.authService.deleteToken(tokenDB.userId, tokenDB.token);
        return res.redirect(process.env.FRONT_URL + '/confirmation');
    }
    async signIn(body, res) {
        const user = await this.userService.getByEmail(body.email);
        console.log("🚀 ~ auth.controller.ts:173 ~ AuthController ~ signIn ~ user:", user);
        const compare = await this.authService.compare(user.password, body.password);
        if (!compare) {
            throw new common_1.PreconditionFailedException('Bad credentials');
        }
        if (user.status === 'NOT_CONFIRMED') {
            throw new common_1.PreconditionFailedException('Not verified');
        }
        console.log(user, compare);
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
            expiresIn: '15m',
        });
        const hashedRefresh = await this.authService.hash(refresh_token);
        await this.authService.upsertToken(user.id, hashedRefresh);
        res.cookie('refreshToken', refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return {
            data: { user: login, access_token, refresh_token },
            message: 'The user is connected',
        };
    }
    async refresh(req, res) {
        const user = await this.userService.getById(req.user.sub);
        const tokenDB = await this.authService.findUniqueToken(req.user.sub, req.cookies['refreshToken']);
        console.log('🚀 ~ auth.controller.ts:161 ~ AuthController ~ refresh ~ tokenDB:', tokenDB);
        const compare = await this.authService.compare(tokenDB.token, req.cookies['refreshToken']);
        console.log('🚀 ~ auth.controller.ts:165 ~ AuthController ~ refresh ~ compare:', compare);
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
            expiresIn: '15m',
        });
        const hashedRefresh = await this.authService.hash(refresh_token);
        await this.authService.upsertToken(user.id, hashedRefresh, 'REFRESHTOKEN', tokenDB.token);
        res.cookie('refreshToken', refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return {
            data: { access_token, refresh_token },
            message: 'The refresh and access token is created',
        };
    }
    async getProfile(req) {
        const user = await this.userService.getById(req.user.sub);
        return {
            data: { user },
            message: 'User profile',
        };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiCreatedResponse)({
        type: (response_message_with_data_1.ResponseMessageWithData),
    }),
    (0, common_1.Post)('signup'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [signup_dto_1.SignupDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signUp", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOkResponse)({
        type: response_message_1.ResponseMessage,
    }),
    (0, common_1.Post)('resend'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [confirm_dto_1.ConfirmDTO]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "sendConfirm", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(confirm_token_guard_1.ConfirmTokenGuard),
    (0, swagger_1.ApiOkResponse)(),
    (0, common_1.Get)('confirm/:token'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('token')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "confirm", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOkResponse)({
        type: (response_message_with_data_1.ResponseMessageWithData),
    }),
    (0, common_1.Post)('signin'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [signin_dto_1.SigninDTO, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signIn", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOkResponse)({
        type: (response_message_with_data_1.ResponseMessageWithData),
    }),
    (0, common_1.UseGuards)(refresh_token_guard_1.RefreshTokenGuard),
    (0, common_1.Post)('refresh'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOkResponse)({
        type: (response_message_with_data_1.ResponseMessageWithData),
    }),
    (0, common_1.UseGuards)(access_token_guard_1.AccessTokenGuard),
    (0, common_1.Get)('profile'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getProfile", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('api/v1/auth'),
    (0, swagger_1.ApiTags)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        user_service_1.UserService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map