"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const argon2 = __importStar(require("argon2"));
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../../prisma/prisma.service");
const mail_service_1 = require("../mail/mail.service");
let AuthService = class AuthService {
    jwtService;
    prisma;
    mailService;
    constructor(jwtService, prisma, mailService) {
        this.jwtService = jwtService;
        this.prisma = prisma;
        this.mailService = mailService;
    }
    async hash(elementToHash) {
        try {
            return await argon2.hash(elementToHash);
        }
        catch (err) {
            throw new common_1.BadRequestException('Hash error');
        }
    }
    async compare(hashed, notHashed) {
        try {
            return await argon2.verify(hashed, notHashed);
        }
        catch (err) {
            throw new common_1.BadRequestException('Compare error');
        }
    }
    async generateToken(payload, options) {
        const optionsJWT = {
            ...options,
            expiresIn: options.expiresIn
        };
        return await this.jwtService.signAsync(payload, optionsJWT);
    }
    async upsertToken(userId, token, type = 'REFRESHTOKEN', ancienToken, expiresAt) {
        const tokenJSON = ancienToken ? { token: ancienToken, userId } : { token, userId };
        return await this.prisma.token.upsert({
            create: {
                token,
                userId,
                type,
                expiresAt,
            },
            where: { token_userId: tokenJSON, type },
            update: { token, expiresAt },
        });
    }
    async findUniqueToken(userId, tokenClear) {
        const tokens = await this.prisma.token.findMany({
            where: { userId: userId }
        });
        for (let t of tokens) {
            console.log("🚀 ~ auth.service.ts:65 ~ AuthService ~ findUniqueToken ~ t:", t);
            const compareToken = await this.compare(t.token, tokenClear);
            if (compareToken) {
                console.log("🚀 ~ auth.service.ts:67 ~ AuthService ~ findUniqueToken ~ this.compare(t.token, tokenClear):", this.compare(t.token, tokenClear));
                return t;
            }
        }
        return null;
    }
    async deleteToken(userId, token) {
        await this.prisma.token.delete({
            where: {
                token_userId: { userId, token }
            }
        });
    }
    async sendConfirmEmail(email, token) {
        const url = `${process.env.BASE_URL}/api/v1/auth/confirm/${token}`;
        const message = `
    <p>
      Welcome to the app Gestion de données, click in the link to confirm the account: <a data-cy="linkConfirm" href=${url}>here</a>
    </p>
    <strong>
      The link is invalid after two minutes.
    </strong>
    `;
        this.mailService.sendEmail(email, process.env.MAIL_USERNAME, "Confirm mail", message);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        prisma_service_1.PrismaService,
        mail_service_1.MailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map