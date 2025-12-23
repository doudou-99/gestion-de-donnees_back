import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import { fakerFR as faker } from '@faker-js/faker';

const prisma = new PrismaClient();

const upsertData = async () => {
  const pass = faker.internet.password({
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=(?:.*[0-9]){2})(?=.*[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]).+$/,
  });
  const user = await prisma.user.upsert({
    where: { email: faker.internet.email() },
    update: {},
    create: {
      email: faker.internet.email({ allowSpecialCharacters: true }),
      password: await argon2.hash(pass),
      username: faker.internet.username(),
      status: 'CONFIRMED',
      extraEmail: faker.internet.email({ allowSpecialCharacters: true }),
    },
  });
  console.log(user, pass);

  const group = await prisma.group.upsert({
    where: { id: faker.number.int() },
    update: {},
    create: {
      name: faker.string.alphanumeric(5),
      leaderId: user.id
    },
  });
  console.log(group);
};

const main = async (nbUser: number) => {
  for (let i = 0; i < nbUser; i++) {
    await upsertData();
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
