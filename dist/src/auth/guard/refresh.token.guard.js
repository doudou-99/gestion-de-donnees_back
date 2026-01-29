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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenGuard = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
let RefreshTokenGuard = class RefreshTokenGuard {
    jwtService;
    constructor(jwtService) {
        this.jwtService = jwtService;
    }
    async canActivate(context) {
        const request = context
            .switchToHttp()
            .getRequest();
        console.log('All cookies:', request.cookies);
        console.log('Signed cookies:', request.signedCookies);
        const token = this.extractTokenFromCookie(request);
        console.log(token);
        if (!token) {
            throw new common_1.UnauthorizedException();
        }
        try {
            const payload = await this.jwtService.verifyAsync(token, {
                algorithms: ['HS512'],
                secret: process.env.SECRET_REFRESH_KEY,
            });
            request.user = payload;
        }
        catch (err) {
            throw new common_1.UnauthorizedException(err.message);
        }
        return true;
    }
    extractTokenFromCookie(request) {
        console.log(request.cookies);
        const token = request.cookies['refreshToken'] ?? undefined;
        return token;
    }
};
exports.RefreshTokenGuard = RefreshTokenGuard;
exports.RefreshTokenGuard = RefreshTokenGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService])
], RefreshTokenGuard);
//# sourceMappingURL=refresh.token.guard.js.map