import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const main = () => {
    this.prisma.user.upsert({
        data: {

        }
    })
}

