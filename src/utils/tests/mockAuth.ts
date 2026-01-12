import { fakerFR as faker } from '@faker-js/faker';
import { Token, User } from "@prisma/client";
import * as argon2 from 'argon2';
import { JwtOptionsInterface } from '../../auth/interface/jwt.options.interface';
import { SignupDto } from '../../auth/dto/signup.dto';
import { SigninDTO } from '../../auth/dto/signin.dto';
import { ResponseMessageWithData } from '../../responses/response.message.with.data';
import { loginInterface } from '../../auth/interface/logininterface';
export const prismaMock = {
  token: {
    findMany: jest.fn(),
    upsert: jest.fn(),
  },
};

export const jwtMock = {
  signAsync: jest.fn(),
};

export const mailMock = {
  sendEmail: jest.fn(),
};

export const mockUserId = faker.number.int({min: 2});
const generatePassword = (): string => {
    const lower = faker.string.alpha({ length: 1, casing: 'lower' });
    const upper = faker.string.alpha({ length: 1, casing: 'upper' });
    const numbers = faker.string.numeric(2);
    const special = faker.helpers.arrayElement([
      '!','@','#','$','%','^','&','*','?','(',')','|','-','_','~','[',']','{','}','<','>',"'",'"','+','.',';',
    ]);
  
    return faker.helpers
      .shuffle(
        (lower + upper + numbers + special + faker.string.alphanumeric(3)).split(
          '',
        ),
      )
      .join('');
};

export const mockPassword = generatePassword();
export const mockHashedPassword = argon2.hash(mockPassword);
export const mockToken = faker.internet.jwt({payload: {sub: mockUserId}})
export const mockHashedToken = argon2.hash(mockToken)
export const mockNewToken = faker.internet.jwt({payload: {sub: mockUserId}})
export const mockHashedNewToken = argon2.hash(mockNewToken)
export const mockConfirmToken = faker.internet.jwt({payload: {sub: mockUserId}})
export const mockRefreshToken = faker.internet.jwt({payload: {sub: mockUserId}})
export const mockHashedRefreshToken = argon2.hash(mockRefreshToken)

export const mockHashedConfirmToken = argon2.hash(mockToken)

export const dateExpire = new Date(new Date().setMinutes(new Date().getMinutes()+ 7))
export const optionsToken: JwtOptionsInterface = {
  secret: process.env.SECRET_KEY,
  expiresIn: '60s'
}

export const optionsRefreshToken: JwtOptionsInterface = {
  algorithm: 'HS512',
  secret: process.env.SECRET_REFRESH_KEY,
  expiresIn: '15m'
}

export const optionsConfirmToken: JwtOptionsInterface = {
  secret: process.env.SECRET_CONFIRM_KEY,
  expiresIn: '60s',
}

export const mockPrismaToken: Token = {
    userId: mockUserId,
    token: mockRefreshToken,
    type: 'REFRESHTOKEN',
    createdAt: new Date(),
    updatedAt: new Date(),
    expiresAt: undefined
}

export const mockPrismaNewToken: Token = {
    userId: mockUserId,
    token: mockNewToken,
    type: 'REFRESHTOKEN',
    createdAt: new Date(),
    updatedAt: new Date(),
    expiresAt: undefined
}


export const mockPrismaRefreshToken: Token = {
  userId: mockUserId,
  token: mockRefreshToken,
  type: 'REFRESHTOKEN',
  createdAt: new Date(),
  updatedAt: new Date(),
  expiresAt: undefined
}


export const mockEmail = faker.internet.email({allowSpecialCharacters: true});
export const mockExtraEmail = faker.internet.email({allowSpecialCharacters: true})

export const mockUsername = faker.string.alphanumeric({length: {min: 10, max: 50}})

export const mockAccessToken = faker.internet.jwt({payload: {sub: mockUserId}})
export const mockNewRefreshToken = faker.internet.jwt({payload: {sub: mockUserId}})
export const mockNewHashedRefreshToken = argon2.hash(mockNewRefreshToken)
export const mockSignupDto: SignupDto = {
  email: mockEmail,
  password: mockPassword,
  username: mockUsername,
  extraEmail: mockExtraEmail,
}

export const mockPrismaNewRefreshToken: Token = {
  userId: mockUserId,
  token: mockNewRefreshToken,
  type: 'REFRESHTOKEN',
  createdAt: new Date(),
  updatedAt: new Date(),
  expiresAt: undefined
}

export const mockSignupDtoError: SignupDto = {
  email: mockEmail,
  password: "",
  username: mockUsername,
  extraEmail: mockExtraEmail,
}

export const mockSigninDto: SigninDTO = {
  email: mockEmail,
  password: mockPassword
}

export const mockPasswordError = "francis1256"
export const mockSigninDtoErrorPassword: SigninDTO = {
  email: mockEmail,
  password: mockPasswordError
}

export const mockSigninDtoError: SigninDTO = {
  email: "",
  password: mockPassword
}

export const mockErrorSignup = {
  status: 400,
  timestamp: new Date().toISOString(),
  message: "Bad request",
  path: "http://localhost:3000/api/v1/auth/signup",
}

export const mockUser: User = {
    id: mockUserId,
    email: mockEmail,
    password: mockPassword,
    username: mockUsername,
    status: "NOT_CONFIRMED",
    extraEmail: mockExtraEmail,
    createdAt: new Date(),
    updatedAt: new Date()
}


export const mockUserConfirmed: User = {
  id: mockUserId,
  email: mockEmail,
  password: mockPassword,
  username: mockUsername,
  status: "CONFIRMED",
  extraEmail: mockExtraEmail,
  createdAt: new Date(),
  updatedAt: new Date()
}

export const mockResponseUser: ResponseMessageWithData<{user: User}> = {
  data: {user: mockUser},
  message: 'The user is created'
}

export const mockResponseRefresh: ResponseMessageWithData<{access_token: string, refresh_token: string}> = {
  data: {access_token: mockToken, refresh_token: mockRefreshToken},
  message: 'The refresh and access token is created'
}

export const loginUser: loginInterface = {
  id: mockUserConfirmed.id,
  email: mockUserConfirmed.email,
  password: mockUserConfirmed.password
}

export const mockResponseSignin: ResponseMessageWithData<{user: loginInterface;
  access_token: string;
  refresh_token: string;}> = {
  data: {user: loginUser, access_token: mockToken, refresh_token: mockRefreshToken},
  message: 'The user is connected'
}

export const mockPrismaConfirmToken: Token = {
    userId: mockUserId,
    token: mockConfirmToken,
    type: "ACTIVATEACCOUNT",
    createdAt: new Date(),
    updatedAt: new Date(),
    expiresAt: undefined
}



