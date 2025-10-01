import { PrismaClient } from '@prisma/client';
import { AddUserDTO } from 'src/auth/dto/add.user.dto';
const prisma = new PrismaClient();

const user1: AddUserDTO = {
    email: "alice@example.com",
    password: "Secret123!",
    username: "alice95",
    address: "24 Avenue des Champs",
    additionalAddress: "2e étage",
    zipCode: "69001",
    extraEmail: "pro.alice@example.org"
};

const upsertUser = async () => {
    const user = await prisma.user.upsert({
        where: {email: user1.email},
        update: {},
        create: {
            email: user1.email,
            password: user1.password,
            username: user1.username,
            address: user1.address,
            status: "CONFIRMED",
            additionalAddress: user1.additionalAddress,
            zipCode: user1.zipCode,
            extraEmail: user1.extraEmail
        }
    })
    console.log(user);
}

upsertUser()
.then(async () => {
    await prisma.$disconnect();
})
.catch(async (err) => {
    console.error(err)
    await prisma.$disconnect()
    process.exit(1)
});