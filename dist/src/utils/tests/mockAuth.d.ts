import { Token, User } from "@prisma/client";
import { JwtOptionsInterface } from '../../auth/interface/jwt.options.interface';
import { SignupDto } from '../../auth/dto/signup.dto';
import { SigninDTO } from '../../auth/dto/signin.dto';
import { ResponseMessageWithData } from '../../responses/response.message.with.data';
import { loginInterface } from '../../auth/interface/logininterface';
export declare const prismaMock: {
    token: {
        findMany: jest.Mock<any, any, any>;
        upsert: jest.Mock<any, any, any>;
        delete: jest.Mock<any, any, any>;
    };
};
export declare const jwtMock: {
    signAsync: jest.Mock<any, any, any>;
};
export declare const mailMock: {
    sendEmail: jest.Mock<any, any, any>;
};
export declare const mockUserId: number;
export declare const mockPassword: string;
export declare const mockHashedPassword: Promise<string>;
export declare const mockToken: string;
export declare const mockHashedToken: Promise<string>;
export declare const mockNewToken: string;
export declare const mockHashedNewToken: Promise<string>;
export declare const mockConfirmToken: string;
export declare const mockRefreshToken: string;
export declare const mockHashedRefreshToken: Promise<string>;
export declare const mockHashedConfirmToken: Promise<string>;
export declare const dateExpire: Date;
export declare const optionsToken: JwtOptionsInterface;
export declare const optionsRefreshToken: JwtOptionsInterface;
export declare const optionsConfirmToken: JwtOptionsInterface;
export declare const mockPrismaToken: Token;
export declare const mockPrismaNewToken: Token;
export declare const mockPrismaRefreshToken: Token;
export declare const mockEmail: string;
export declare const mockExtraEmail: string;
export declare const mockUsername: string;
export declare const mockAccessToken: string;
export declare const mockNewRefreshToken: string;
export declare const mockNewHashedRefreshToken: Promise<string>;
export declare const mockSignupDto: SignupDto;
export declare const mockPrismaNewRefreshToken: Token;
export declare const mockSignupDtoError: SignupDto;
export declare const mockSigninDto: SigninDTO;
export declare const mockPasswordError = "francis1256";
export declare const mockSigninDtoErrorPassword: SigninDTO;
export declare const mockSigninDtoError: SigninDTO;
export declare const mockErrorSignup: {
    status: number;
    timestamp: string;
    message: string;
    path: string;
};
export declare const mockUser: User;
export declare const mockUserConfirmed: User;
export declare const mockResponseUser: ResponseMessageWithData<{
    user: User;
}>;
export declare const mockResponseRefresh: ResponseMessageWithData<{
    access_token: string;
    refresh_token: string;
}>;
export declare const loginUser: loginInterface;
export declare const mockResponseSignin: ResponseMessageWithData<{
    user: loginInterface;
    access_token: string;
    refresh_token: string;
}>;
export declare const mockPrismaConfirmToken: Token;
