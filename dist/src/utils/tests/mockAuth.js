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
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockPrismaConfirmToken = exports.mockResponseSignin = exports.loginUser = exports.mockResponseRefresh = exports.mockResponseUser = exports.mockUserConfirmed = exports.mockUser = exports.mockErrorSignup = exports.mockSigninDtoError = exports.mockSigninDtoErrorPassword = exports.mockPasswordError = exports.mockSigninDto = exports.mockSignupDtoError = exports.mockPrismaNewRefreshToken = exports.mockSignupDto = exports.mockNewHashedRefreshToken = exports.mockNewRefreshToken = exports.mockAccessToken = exports.mockUsername = exports.mockExtraEmail = exports.mockEmail = exports.mockPrismaRefreshToken = exports.mockPrismaNewToken = exports.mockPrismaToken = exports.optionsConfirmToken = exports.optionsRefreshToken = exports.optionsToken = exports.dateExpire = exports.mockHashedConfirmToken = exports.mockHashedRefreshToken = exports.mockRefreshToken = exports.mockConfirmToken = exports.mockHashedNewToken = exports.mockNewToken = exports.mockHashedToken = exports.mockToken = exports.mockHashedPassword = exports.mockPassword = exports.mockUserId = exports.mailMock = exports.jwtMock = exports.prismaMock = void 0;
const faker_1 = require("@faker-js/faker");
const argon2 = __importStar(require("argon2"));
exports.prismaMock = {
    token: {
        findMany: jest.fn(),
        upsert: jest.fn(),
        delete: jest.fn()
    },
};
exports.jwtMock = {
    signAsync: jest.fn(),
};
exports.mailMock = {
    sendEmail: jest.fn(),
};
exports.mockUserId = faker_1.fakerFR.number.int({ min: 2 });
const generatePassword = () => {
    const lower = faker_1.fakerFR.string.alpha({ length: 1, casing: 'lower' });
    const upper = faker_1.fakerFR.string.alpha({ length: 1, casing: 'upper' });
    const numbers = faker_1.fakerFR.string.numeric(2);
    const special = faker_1.fakerFR.helpers.arrayElement([
        '!', '@', '#', '$', '%', '^', '&', '*', '?', '(', ')', '|', '-', '_', '~', '[', ']', '{', '}', '<', '>', "'", '"', '+', '.', ';',
    ]);
    return faker_1.fakerFR.helpers
        .shuffle((lower + upper + numbers + special + faker_1.fakerFR.string.alphanumeric(3)).split(''))
        .join('');
};
exports.mockPassword = generatePassword();
exports.mockHashedPassword = argon2.hash(exports.mockPassword);
exports.mockToken = faker_1.fakerFR.internet.jwt({ payload: { sub: exports.mockUserId } });
exports.mockHashedToken = argon2.hash(exports.mockToken);
exports.mockNewToken = faker_1.fakerFR.internet.jwt({ payload: { sub: exports.mockUserId } });
exports.mockHashedNewToken = argon2.hash(exports.mockNewToken);
exports.mockConfirmToken = faker_1.fakerFR.internet.jwt({ payload: { sub: exports.mockUserId } });
exports.mockRefreshToken = faker_1.fakerFR.internet.jwt({ payload: { sub: exports.mockUserId } });
exports.mockHashedRefreshToken = argon2.hash(exports.mockRefreshToken);
exports.mockHashedConfirmToken = argon2.hash(exports.mockToken);
exports.dateExpire = new Date(new Date().setMinutes(new Date().getMinutes() + 7));
exports.optionsToken = {
    secret: process.env.SECRET_KEY,
    expiresIn: '60s'
};
exports.optionsRefreshToken = {
    algorithm: 'HS512',
    secret: process.env.SECRET_REFRESH_KEY,
    expiresIn: '15m'
};
exports.optionsConfirmToken = {
    secret: process.env.SECRET_CONFIRM_KEY,
    expiresIn: '2m',
};
exports.mockPrismaToken = {
    userId: exports.mockUserId,
    token: exports.mockRefreshToken,
    type: 'REFRESHTOKEN',
    createdAt: new Date(),
    updatedAt: new Date(),
    expiresAt: undefined
};
exports.mockPrismaNewToken = {
    userId: exports.mockUserId,
    token: exports.mockNewToken,
    type: 'REFRESHTOKEN',
    createdAt: new Date(),
    updatedAt: new Date(),
    expiresAt: undefined
};
exports.mockPrismaRefreshToken = {
    userId: exports.mockUserId,
    token: exports.mockRefreshToken,
    type: 'REFRESHTOKEN',
    createdAt: new Date(),
    updatedAt: new Date(),
    expiresAt: undefined
};
exports.mockEmail = faker_1.fakerFR.internet.email({ allowSpecialCharacters: true });
exports.mockExtraEmail = faker_1.fakerFR.internet.email({ allowSpecialCharacters: true });
exports.mockUsername = faker_1.fakerFR.string.alphanumeric({ length: { min: 10, max: 50 } });
exports.mockAccessToken = faker_1.fakerFR.internet.jwt({ payload: { sub: exports.mockUserId } });
exports.mockNewRefreshToken = faker_1.fakerFR.internet.jwt({ payload: { sub: exports.mockUserId } });
exports.mockNewHashedRefreshToken = argon2.hash(exports.mockNewRefreshToken);
exports.mockSignupDto = {
    email: exports.mockEmail,
    password: exports.mockPassword,
    username: exports.mockUsername,
    extraEmail: exports.mockExtraEmail,
};
exports.mockPrismaNewRefreshToken = {
    userId: exports.mockUserId,
    token: exports.mockNewRefreshToken,
    type: 'REFRESHTOKEN',
    createdAt: new Date(),
    updatedAt: new Date(),
    expiresAt: undefined
};
exports.mockSignupDtoError = {
    email: exports.mockEmail,
    password: "",
    username: exports.mockUsername,
    extraEmail: exports.mockExtraEmail,
};
exports.mockSigninDto = {
    email: exports.mockEmail,
    password: exports.mockPassword
};
exports.mockPasswordError = "francis1256";
exports.mockSigninDtoErrorPassword = {
    email: exports.mockEmail,
    password: exports.mockPasswordError
};
exports.mockSigninDtoError = {
    email: "",
    password: exports.mockPassword
};
exports.mockErrorSignup = {
    status: 400,
    timestamp: new Date().toISOString(),
    message: "Bad request",
    path: "http://localhost:3000/api/v1/auth/signup",
};
exports.mockUser = {
    id: exports.mockUserId,
    email: exports.mockEmail,
    password: exports.mockPassword,
    username: exports.mockUsername,
    status: "NOT_CONFIRMED",
    extraEmail: exports.mockExtraEmail,
    createdAt: new Date(),
    updatedAt: new Date()
};
exports.mockUserConfirmed = {
    id: exports.mockUserId,
    email: exports.mockEmail,
    password: exports.mockPassword,
    username: exports.mockUsername,
    status: "CONFIRMED",
    extraEmail: exports.mockExtraEmail,
    createdAt: new Date(),
    updatedAt: new Date()
};
exports.mockResponseUser = {
    data: { user: exports.mockUser },
    message: 'The user is created'
};
exports.mockResponseRefresh = {
    data: { access_token: exports.mockToken, refresh_token: exports.mockRefreshToken },
    message: 'The refresh and access token is created'
};
exports.loginUser = {
    id: exports.mockUserConfirmed.id,
    email: exports.mockUserConfirmed.email,
    password: exports.mockUserConfirmed.password
};
exports.mockResponseSignin = {
    data: { user: exports.loginUser, access_token: exports.mockToken, refresh_token: exports.mockRefreshToken },
    message: 'The user is connected'
};
exports.mockPrismaConfirmToken = {
    userId: exports.mockUserId,
    token: exports.mockConfirmToken,
    type: "ACTIVATEACCOUNT",
    createdAt: new Date(),
    updatedAt: new Date(),
    expiresAt: undefined
};
//# sourceMappingURL=mockAuth.js.map