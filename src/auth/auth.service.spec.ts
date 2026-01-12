import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import {
  prismaMock,
  jwtMock,
  mailMock,
  mockPassword,
  mockHashedPassword,
  mockUserId,
  mockToken,
  optionsToken,
  mockPrismaNewToken,
  mockPrismaToken,
  mockHashedToken,
  mockHashedNewToken,
  mockHashedConfirmToken,
  mockEmail,
} from '../utils/tests/mockAuth';
import { MailService } from '../mail/mail.service';

describe('Testing AuthService', () => {
  let authService: AuthService;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: JwtService,
          useValue: jwtMock,
        },
        {
          provide: MailService,
          useValue: mailMock,
        },
      ],
    }).compile();

    authService = await module.get(AuthService);

    prismaMock.token.findMany.mockClear();
    prismaMock.token.upsert.mockClear();
    jwtMock.signAsync.mockClear();
    mailMock.sendEmail.mockClear();
  });

  describe('when the hash function is called', () => {
    it('should return the hashed string', async () => {
      const result = await authService.hash(mockPassword);
      expect(result).toBeTruthy();
      expect(authService.compare(result, mockPassword)).toBeTruthy();
    });
  });

  describe('when the compare function is called', () => {
    it('should return true if the string and the hashed string are equals', async () => {
      const result = await authService.compare(
        await mockHashedPassword,
        mockPassword,
      );
      expect(result).toBeTruthy();
    });
    it('should return false if the hashed string and the sentence are different', async () => {
      const result = await authService.compare(
        await mockHashedPassword,
        'motdepasse',
      );
      expect(result).toBeFalsy();
    });
  });

  describe('when the generateToken function is called', () => {
    it('should return the generated token', async () => {
      jwtMock.signAsync.mockResolvedValue(mockToken);
      const result = await authService.generateToken(
        { sub: mockUserId },
        optionsToken,
      );
      expect(result).toEqual(mockToken);
      expect(jwtMock.signAsync).toHaveBeenCalledTimes(1);
    });
  });

  describe('when the generateToken function is called', () => {
    it('should return the generated token', async () => {
      jwtMock.signAsync.mockResolvedValue(mockToken);
      const result = await authService.generateToken(
        { sub: mockUserId },
        optionsToken,
      );
      expect(result).toEqual(mockToken);
      expect(jwtMock.signAsync).toHaveBeenCalledTimes(1);
    });
  });

  describe('when the upsertToken function is called', () => {
    it('should return the created token ', async () => {
      mockPrismaToken.token = await mockHashedToken;
      prismaMock.token.upsert.mockResolvedValue(mockPrismaToken);
      const result = await authService.upsertToken(
        mockUserId,
        mockPrismaToken.token,
      );
      expect(result).toEqual(mockPrismaToken);
      expect(prismaMock.token.upsert).toHaveBeenCalledTimes(1);
      expect(prismaMock.token.upsert).toHaveBeenCalledWith({
        create: {
          token: mockPrismaToken.token,
          userId: mockUserId,
          type: mockPrismaToken.type,
        },
        update: {
          token: mockPrismaToken.token,
        },
        where: {
          token_userId: {
            token: mockPrismaToken.token,
            userId: mockPrismaToken.userId,
          },
          type: mockPrismaToken.type,
        },
      });
    });
    it('should return the updated token ', async () => {
      mockPrismaToken.token = await mockHashedToken;
      prismaMock.token.upsert.mockResolvedValue(mockPrismaToken);
      const res = await authService.upsertToken(mockUserId, mockToken);

      mockPrismaNewToken.token = await mockHashedNewToken;
      prismaMock.token.upsert.mockResolvedValue(mockPrismaNewToken);
      const result = await authService.upsertToken(
        res.userId,
        mockPrismaNewToken.token,
        'REFRESHTOKEN',
        res.token,
      );
      expect(result).toEqual(mockPrismaNewToken);
      expect(prismaMock.token.upsert).toHaveBeenCalledTimes(2);
      expect(prismaMock.token.upsert).toHaveBeenCalledWith({
        create: {
          token: mockPrismaNewToken.token,
          userId: mockPrismaToken.userId,
          type: mockPrismaNewToken.type,
        },
        update: {
          token: mockPrismaNewToken.token,
        },
        where: {
          token_userId: {
            token: mockPrismaToken.token,
            userId: mockPrismaNewToken.userId,
          },
          type: mockPrismaNewToken.type,
        },
      });
    });
    it("should return null when the token doesn't exist", async () => {
      prismaMock.token.upsert.mockResolvedValue(null);
      const result = await authService.upsertToken(0, 'vvjvhvhvhvh');
      expect(result).toEqual(null);
      expect(prismaMock.token.upsert).toHaveBeenCalledTimes(1);
    });
  });

  describe('when the findUniqueToken function is called', () => {
    it('should return the needed token', async () => {
      mockPrismaToken.token = await mockHashedToken;
      prismaMock.token.upsert.mockResolvedValue(mockPrismaToken);
      const res = await authService.upsertToken(mockUserId, mockToken);
      prismaMock.token.findMany.mockResolvedValue([res]);
      console.log(res);
      const result = await authService.findUniqueToken(mockUserId, mockToken);
      expect(result).toEqual(res);
      expect(prismaMock.token.upsert).toHaveBeenCalledTimes(1);
      expect(prismaMock.token.findMany).toHaveBeenCalledTimes(1);
      expect(prismaMock.token.findMany).toHaveBeenCalledWith({
        where: {
          userId: mockPrismaToken.userId,
        },
      });
    });
    it("should return null if the token doesn't exist", async () => {
      prismaMock.token.findMany.mockResolvedValue([]);
      const result = await authService.findUniqueToken(mockUserId, mockToken);
      expect(result).toEqual(null);
      expect(prismaMock.token.findMany).toHaveBeenCalledTimes(1);
      expect(prismaMock.token.findMany).toHaveBeenCalledWith({
        where: {
          userId: mockPrismaToken.userId,
        },
      });
    });
  });

  describe('when the sendConfirmEmail function is called', () => {
    it('should send an email', async () => {
      mailMock.sendEmail.mockReturnValue(undefined);
      await authService.sendConfirmEmail(mockEmail, await mockHashedConfirmToken)
      expect(mailMock.sendEmail).toHaveBeenCalledTimes(1);
    });
  });
});
