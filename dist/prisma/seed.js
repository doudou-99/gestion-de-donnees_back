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
const client_1 = require("@prisma/client");
const argon2 = __importStar(require("argon2"));
const faker_1 = require("@faker-js/faker");
const prisma = new client_1.PrismaClient();
const upsertUser = async () => {
    const pass = faker_1.fakerFR.internet.password({
        pattern: /^[A-Za-z0-9*.!@#$%^&(){}[]:;<>,.?\/~_+-=|\]*$/,
    });
    const user = await prisma.user.upsert({
        where: { email: faker_1.fakerFR.internet.email() },
        update: {},
        create: {
            email: faker_1.fakerFR.internet.email({ allowSpecialCharacters: true }),
            password: await argon2.hash(pass),
            username: faker_1.fakerFR.internet.username(),
            address: faker_1.fakerFR.location.streetAddress(),
            status: 'CONFIRMED',
            additionalAddress: faker_1.fakerFR.location.secondaryAddress(),
            zipCode: faker_1.fakerFR.location.zipCode(),
            extraEmail: faker_1.fakerFR.internet.email({ allowSpecialCharacters: true }),
        },
    });
    console.log(user, pass);
};
const main = async (nbUser) => {
    for (let i = 0; i < nbUser; i++) {
        await upsertUser();
    }
};
main(2)
    .then(async () => {
    await prisma.$disconnect();
})
    .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
});
//# sourceMappingURL=seed.js.map