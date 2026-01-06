import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import { fakerFR as faker } from '@faker-js/faker';

const prisma = new PrismaClient();

const generatePassword = (): string => {
  const lower = faker.string.alpha({ length: 2, casing: 'lower' });
  const upper = faker.string.alpha({ length: 2, casing: 'upper' });
  const numbers = faker.string.numeric(2);
  const special = faker.helpers.arrayElement([
    '!',
    '@',
    '#',
    '$',
    '%',
    '^',
    '&',
    '*',
    '?',
    '(',
    ')',
    '|',
    '-',
    '_',
    '~',
    '[',
    ']',
    '{',
    '}',
    '<',
    '>',
    "'",
    '"',
    '+',
    '.',
    ';',
  ]);

  return faker.helpers
    .shuffle(
      (lower + upper + numbers + special + faker.string.alphanumeric(3)).split(
        '',
      ),
    )
    .join('');
};

const upsertData = async () => {
  const pass = generatePassword();
  const emailUser = faker.internet.email({ allowSpecialCharacters: true });
  const user = await prisma.user.create({
    data: {
      email: emailUser,
      password: await argon2.hash(pass),
      username: faker.internet.username(),
      status: 'CONFIRMED',
      extraEmail: faker.internet.email({ allowSpecialCharacters: true }),
    },
  });
  console.log(user, pass);
  const groupName = faker.string.alphanumeric(5);

  const group = await prisma.group.create({
    data: {
      name: groupName,
      leaderId: user.id,
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
