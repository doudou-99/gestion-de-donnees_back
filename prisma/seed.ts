import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import { fakerFR as faker } from '@faker-js/faker';

const prisma = new PrismaClient();

const upsertUser = async () => {
  const pass = faker.internet.password({
    pattern: /^[A-Za-z0-9*.!@#$%^&(){}[]:;<>,.?\/~_+-=|\]*$/,
  });
  const user = await prisma.user.upsert({
    where: { email: faker.internet.email() },
    update: {},
    create: {
      email: faker.internet.email({ allowSpecialCharacters: true }),
      password: await argon2.hash(pass),
      username: faker.internet.username(),
      address: faker.location.streetAddress(),
      status: 'CONFIRMED',
      additionalAddress: faker.location.secondaryAddress(),
      zipCode: faker.location.zipCode(),
      extraEmail: faker.internet.email({ allowSpecialCharacters: true }),
    },
  });
  console.log(user, pass);
};

const main = async (nbUser: number) => {
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
