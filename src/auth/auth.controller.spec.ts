import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UserService } from "../user/user.service";
import { mockAccessToken, mockConfirmToken, mockEmail, mockErrorSignup, mockHashedConfirmToken, mockHashedPassword, mockHashedRefreshToken, mockNewHashedRefreshToken, mockNewRefreshToken, mockNewToken, mockPassword, mockPasswordError, mockPrismaConfirmToken, mockPrismaNewRefreshToken, mockPrismaRefreshToken, mockRefreshToken, mockResponseRefresh, mockResponseSignin, mockResponseUser, mockSigninDto, mockSigninDtoError, mockSigninDtoErrorPassword, mockSignupDto, mockSignupDtoError, mockToken, mockUser, mockUserConfirmed, mockUserId, optionsConfirmToken, optionsRefreshToken, optionsToken } from "../utils/tests/mockAuth";
import { JwtService } from "@nestjs/jwt";
import { ConfirmTokenGuard } from "./guard/confirm.token.guard";
import { validate } from "class-validator";
import { BadRequestException, PreconditionFailedException, UnauthorizedException } from "@nestjs/common";
import { response } from "express";
import { RequestPayload } from "./interface/payload.interface";
import * as argon2 from 'argon2';
import { ConfirmDTO } from "./dto/confirm.dto";

describe('Testing AuthController', () => {
    let controller: AuthController

    const mockAuthService = {
        hash: jest.fn(),
        compare: jest.fn(),
        generateToken: jest.fn(),
        upsertToken: jest.fn(),
        findUniqueToken: jest.fn(),
        sendConfirmEmail: jest.fn(),
        deleteToken: jest.fn()
    };

    const mockUserService = {
        create: jest.fn(),
        getByEmail: jest.fn(),
        getById: jest.fn(),
        getEmailById: jest.fn(),
        updateUser: jest.fn()
    };

    const mockRequest: RequestPayload = {
        user: {sub: mockUserId}
    } as RequestPayload;

    beforeEach(async () => {
        jest.clearAllMocks();
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: mockAuthService,
                },
                {
                    provide: UserService,
                    useValue: mockUserService,
                },
                JwtService,
                ConfirmTokenGuard
            ],
        }).compile();

        controller = module.get<AuthController>(AuthController);
    });

    afterEach(() => {
        jest.clearAllMocks();
    })

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe("when the signup function is called", () => {
        it("should return the user created", async () => {
            const user = mockUser;
            const hashedPassword = mockHashedPassword
            jest.spyOn(mockAuthService, "hash").mockReturnValue(hashedPassword);
            jest.spyOn(mockUserService, "create").mockReturnValue(user);
            jest.spyOn(mockAuthService, "generateToken").mockReturnValue(mockConfirmToken);
            jest.spyOn(mockAuthService, "hash").mockReturnValue(mockHashedConfirmToken);
            jest.spyOn(mockAuthService, "upsertToken").mockReturnValue(mockPrismaConfirmToken);
            jest.spyOn(mockAuthService, "sendConfirmEmail").mockReturnValue(undefined);
            const result = await controller.signUp(mockSignupDto);
            expect(result).toEqual(mockResponseUser);        
        });
        it("should throw error if one or more signup dto fields are invalid", async () => {
            const errors = await validate(mockSignupDtoError);
            expect(errors.length).toBeGreaterThan(0);
        });

        it("should throw error if the user exists", async () => {
            const hashedPassword = mockHashedPassword
            jest.spyOn(mockAuthService, "hash").mockReturnValue(hashedPassword);
            jest.spyOn(mockUserService, "create").mockRejectedValue(new PreconditionFailedException(mockErrorSignup));
            await expect(mockUserService.create).rejects.toThrow(new PreconditionFailedException(mockErrorSignup))
            await expect(controller.signUp(mockSignupDto)).rejects.toThrow();
            expect(mockUserService.create).toHaveBeenCalled(); 
            expect(mockAuthService.sendConfirmEmail).not.toHaveBeenCalled();
        });
    });

    describe("when the signin function is called", () => {
        it("should return the connected user", async () => {
            const user = mockUserConfirmed;
            const hashedPassword = await mockHashedPassword;
            const hashedRefreshToken = await mockHashedRefreshToken;
            user.password = hashedPassword;

            mockPrismaRefreshToken.token = hashedRefreshToken;
            jest.spyOn(mockUserService, "getByEmail").mockReturnValue(user);
            jest.spyOn(mockAuthService, "compare").mockReturnValue(true);
            jest.spyOn(mockAuthService, "generateToken").mockReturnValue(mockToken);
            jest.spyOn(mockAuthService, "generateToken").mockReturnValue(mockRefreshToken);
            jest.spyOn(mockAuthService, "hash").mockReturnValue(hashedRefreshToken);
            jest.spyOn(response, "cookie").mockReturnValue(response)
            jest.spyOn(mockAuthService, "upsertToken").mockReturnValue(mockPrismaRefreshToken);
            jest.spyOn(mockAuthService, "sendConfirmEmail").mockReturnValue(undefined);
            mockResponseSignin.data.user.password = hashedPassword;
            const result = await controller.signIn(mockSigninDto, response);
            result.data.user.password = hashedPassword;
            result.data.access_token = mockToken;

            expect(result).toEqual(mockResponseSignin);     
            expect(mockUserService.getByEmail).toHaveBeenCalledWith(mockEmail);
            expect(mockAuthService.compare).toHaveBeenCalledWith(hashedPassword, mockPassword);

            expect(mockAuthService.generateToken).toHaveBeenCalledTimes(2);
            expect(mockAuthService.generateToken).toHaveBeenCalledWith({sub: mockUserId}, optionsToken);
            expect(mockAuthService.generateToken).toHaveBeenCalledWith({sub: mockUserId}, optionsRefreshToken);
            expect(mockAuthService.hash).toHaveBeenCalledWith(mockRefreshToken);
            expect(response.cookie).toHaveBeenCalled();
            expect(mockAuthService.upsertToken).toHaveBeenCalledWith(mockUserId, hashedRefreshToken);
        });
        it("should throw error if user doesn't exist", async () => {
            jest.spyOn(mockUserService, "getByEmail").mockRejectedValue(new BadRequestException());
            await expect(controller.signIn(mockSigninDto, response)).rejects.toThrow();
        })
        it("should throw error if one or more signup dto fields are invalid", async () => {
            const errors = await validate(mockSigninDtoError);
            expect(errors.length).toBeGreaterThan(0);
        });

        it("should throw error if the user didn't verify his account", async () => {
            jest.spyOn(mockUserService, "getByEmail").mockRejectedValue(new PreconditionFailedException("Not verified"));
            await expect(controller.signIn(mockSigninDto, response)).rejects.toThrow(new PreconditionFailedException("Not verified"));
            expect(mockUserService.getByEmail).toHaveBeenCalledWith(mockEmail) 
        });
        it("should throw error if the hashed password and the password aren't equals", async () => {
            const user = mockUserConfirmed;
            const hashedPassword = await mockHashedPassword;
            user.password = hashedPassword;
            jest.spyOn(mockUserService, "getByEmail").mockReturnValue(user);
            jest.spyOn(mockAuthService, "compare").mockRejectedValue(new PreconditionFailedException("Bad credentials"));
            await expect(controller.signIn(mockSigninDtoErrorPassword, response)).rejects.toThrow(new PreconditionFailedException("Bad credentials"));
            expect(mockUserService.getByEmail).toHaveBeenCalledWith(mockEmail);
            expect(mockAuthService.compare).toHaveBeenCalledWith(hashedPassword, mockPasswordError);
        });
    });

    describe("when the refresh function is called", () => {
        it("should return the new refresh token and the access token", async () => {
            const user = mockUserConfirmed;
            const hashedPassword = await mockHashedPassword;
            user.password = hashedPassword;
            const refreshToken = mockRefreshToken;
            const hashedRefreshToken = await argon2.hash(refreshToken);
            const newHashedRefreshToken = await mockNewHashedRefreshToken;
            mockPrismaRefreshToken.token = hashedRefreshToken;
            jest.spyOn(mockUserService, "getById").mockReturnValue(user);
            mockRequest.cookies = {"refreshToken": refreshToken};
            jest.spyOn(mockAuthService, "findUniqueToken").mockReturnValue(mockPrismaRefreshToken);
            jest.spyOn(mockAuthService, "compare").mockReturnValue(true);
            jest.spyOn(mockAuthService, "generateToken").mockReturnValueOnce(mockAccessToken).mockReturnValueOnce(mockNewRefreshToken);
            jest.spyOn(mockAuthService, "hash").mockReturnValue(newHashedRefreshToken);
            mockPrismaNewRefreshToken.token = newHashedRefreshToken;
            jest.spyOn(mockAuthService, "upsertToken").mockReturnValue(mockPrismaNewRefreshToken);
            jest.spyOn(response, "cookie").mockReturnValue(response);
            const result = await controller.refresh(mockRequest, response);
            mockResponseRefresh.data.refresh_token = mockNewRefreshToken;
            mockResponseRefresh.data.access_token = mockAccessToken;

            expect(result).toEqual(mockResponseRefresh);     
            expect(mockUserService.getById).toHaveBeenCalledWith(mockRequest.user.sub);
            expect(mockAuthService.findUniqueToken).toHaveBeenCalledWith(mockRequest.user.sub, refreshToken);
            expect(mockAuthService.compare).toHaveBeenCalledWith(hashedRefreshToken, refreshToken);
            expect(mockAuthService.generateToken).toHaveBeenCalledTimes(2);
            expect(mockAuthService.generateToken).toHaveBeenCalledWith({sub: mockUserId}, optionsToken);
            expect(mockAuthService.generateToken).toHaveBeenCalledWith({sub: mockUserId}, optionsRefreshToken);
            expect(mockAuthService.hash).toHaveBeenCalledWith(mockNewRefreshToken);
            expect(response.cookie).toHaveBeenCalled();
            expect(mockAuthService.upsertToken).toHaveBeenCalledWith(mockUserId, newHashedRefreshToken, "REFRESHTOKEN", hashedRefreshToken);
        });
        it("should throw error if user doesn't exist", async () => {
            jest.spyOn(mockUserService, "getById").mockRejectedValue(new BadRequestException());
            await expect(controller.refresh(mockRequest, response)).rejects.toThrow();
        })

        it("should throw error if the token in the DB doesn't exist", async () => {
            const user = mockUserConfirmed;
            const hashedPassword = await mockHashedPassword;
            user.password = hashedPassword;
            mockRequest.cookies = {};
            jest.spyOn(mockUserService, "getById").mockReturnValue(user);
            jest.spyOn(mockAuthService, "findUniqueToken").mockRejectedValue(new BadRequestException());

            await expect(controller.refresh(mockRequest, response)).rejects.toThrow();
            expect(mockUserService.getById).toHaveBeenCalledWith(mockUserId);
            expect(mockAuthService.findUniqueToken).toHaveBeenCalledWith(mockUserId, undefined);
        });
        it("should throw error if the hashed token and the refresh token aren't equals", async () => {
            const user = mockUserConfirmed;
            const hashedPassword = await mockHashedPassword;
            user.password = hashedPassword;
            jest.spyOn(mockUserService, "getById").mockReturnValue(user);
            jest.spyOn(mockAuthService, "compare").mockRejectedValue(new UnauthorizedException());
            await expect(controller.refresh(mockRequest, response)).rejects.toThrow();
            expect(mockUserService.getById).toHaveBeenCalledWith(mockUserId);
        });
    });

    describe("when the confirm function is called", () => {
        it("should redirect to the page of confirmation and the access token", async () => {
            const user = mockUser;
            const hashedPassword = await mockHashedPassword;
            user.password = hashedPassword;
            mockRequest.user = {sub: mockUserId}
            const hashedConfirm = await mockHashedConfirmToken
            mockPrismaConfirmToken.token = hashedConfirm;
            jest.spyOn(mockAuthService, "findUniqueToken").mockResolvedValue(mockPrismaConfirmToken);
            jest.spyOn(mockAuthService, "compare").mockResolvedValue(true);
            jest.spyOn(mockUserService, "getById").mockResolvedValueOnce(user).mockResolvedValueOnce(mockUserConfirmed);
            jest.spyOn(mockUserService, "updateUser").mockResolvedValue(mockUserConfirmed);
            jest.spyOn(mockAuthService, "deleteToken").mockResolvedValue(undefined);

            jest.spyOn(response, "redirect").mockImplementation(() => undefined);
            const result = await controller.confirm(mockRequest, mockConfirmToken, response);
           
            expect(result).toEqual(undefined);   
            expect(mockAuthService.findUniqueToken).toHaveBeenCalledWith(mockRequest.user.sub, mockConfirmToken);
            expect(mockAuthService.compare).toHaveBeenCalledWith(hashedConfirm, mockConfirmToken);  
            expect(mockUserService.getById).toHaveBeenCalledWith(mockRequest.user.sub);
            expect(mockUserService.updateUser).toHaveBeenCalledWith(mockRequest.user.sub, {status: "CONFIRMED"});

            expect(mockUserService.getById).toHaveBeenCalledTimes(2);
            expect(mockAuthService.deleteToken).toHaveBeenCalledWith(mockRequest.user.sub, mockPrismaConfirmToken.token);

            expect(response.redirect).toHaveBeenCalledWith(process.env.FRONT_URL+"/confirmation")
        });
        it("should redirect to signin page if the token doesn't exist", async () => {
            mockRequest.user = {sub: mockUserId}
            jest.spyOn(mockAuthService, "findUniqueToken").mockRejectedValue(new BadRequestException());
            await expect(controller.confirm(mockRequest, mockConfirmToken,response)).rejects.toThrow(new BadRequestException());
        })

        it("should throw error if the type of token is different", async () => {
            mockRequest.user = {sub: mockUserId}
            const hashedRefresh = await mockHashedRefreshToken;
            mockPrismaRefreshToken.token = hashedRefresh;           
            jest.spyOn(mockAuthService, "findUniqueToken").mockReturnValue(mockPrismaRefreshToken);
            const result = await controller.confirm(mockRequest, mockRefreshToken,response); 
            expect(result).toEqual(undefined);              
            expect(mockAuthService.findUniqueToken).toHaveBeenCalledWith(mockUserId, mockRefreshToken);
            expect(mockPrismaRefreshToken.type).not.toEqual("ACTIVATEACCOUNT");
            expect(response.redirect).toHaveBeenCalledWith(process.env.FRONT_URL+"/signin")
        });
        it("should throw error if the user doesn't exist", async () => {
            mockRequest.user = {sub: 0}
            const hashedConfirm = await mockHashedConfirmToken
            mockPrismaConfirmToken.token = hashedConfirm;
            jest.spyOn(mockAuthService, "findUniqueToken").mockReturnValue(mockPrismaConfirmToken);
            jest.spyOn(mockAuthService, "compare").mockReturnValue(true);
            jest.spyOn(mockUserService, "getById").mockRejectedValue(new PreconditionFailedException());
           
            await expect(controller.confirm(mockRequest, mockConfirmToken,response)).rejects.toThrow();
            expect(mockAuthService.findUniqueToken).toHaveBeenCalledWith(mockRequest.user.sub, mockConfirmToken);
            expect(mockAuthService.compare).toHaveBeenCalledWith(hashedConfirm, mockConfirmToken);  
        });
        it("should throw error if the user status is incorrect", async () => {
            const user = mockUserConfirmed;
            const hashedPassword = await mockHashedPassword;
            user.password = hashedPassword;
            mockRequest.user = {sub: mockUserId}
            const hashedConfirm = await mockHashedConfirmToken
            mockPrismaConfirmToken.token = hashedConfirm;
            jest.spyOn(mockAuthService, "findUniqueToken").mockReturnValue(mockPrismaConfirmToken);
            jest.spyOn(mockAuthService, "compare").mockReturnValue(true);
            jest.spyOn(mockUserService, "getById").mockReturnValue(user);
           
            const result = await controller.confirm(mockRequest, mockConfirmToken,response); 
            expect(result).toEqual(undefined);             
            expect(mockAuthService.findUniqueToken).toHaveBeenCalledWith(mockRequest.user.sub, mockConfirmToken);
            expect(mockAuthService.compare).toHaveBeenCalledWith(hashedConfirm, mockConfirmToken);  
            expect(mockUserService.getById).toHaveBeenCalledWith(mockRequest.user.sub);
            expect(user.status).not.toEqual("NOT_CONFIRMED");
            expect(response.redirect).toHaveBeenCalledWith(process.env.FRONT_URL+"/signin")

        });
    });

    describe("when the sendConfirm function is called", () => {
        it("should send confirmation email to the user", async () => {
            const user = mockUser;
            const hashedPassword = await mockHashedPassword;
            user.password = hashedPassword;
            mockRequest.user = {sub: mockUserId}
            const confirmDto: ConfirmDTO = {email: mockEmail};
            const hashedConfirm = await mockHashedConfirmToken
            mockPrismaConfirmToken.token = hashedConfirm;
            jest.spyOn(mockUserService, "getByEmail").mockReturnValue(user);
            jest.spyOn(mockAuthService, "generateToken").mockReturnValue(mockConfirmToken);
            jest.spyOn(mockAuthService, "hash").mockReturnValue(hashedConfirm);
            jest.spyOn(mockAuthService, "upsertToken").mockReturnValue(mockPrismaConfirmToken);
            jest.spyOn(mockAuthService, "sendConfirmEmail").mockReturnValue(undefined);
            jest.spyOn(response, "redirect").mockReturnValue(undefined);
            const result = await controller.sendConfirm(confirmDto);
           
            expect(result).toEqual({message: "Confirmation email sent"}); 
            expect(mockUserService.getByEmail).toHaveBeenCalledWith(mockEmail);
            expect(mockAuthService.generateToken).toHaveBeenCalledWith({sub: mockUserId}, optionsConfirmToken);
            expect(mockAuthService.hash).toHaveBeenCalledWith(mockConfirmToken); 
            expect(mockAuthService.upsertToken).toHaveBeenCalledWith(mockRequest.user.sub, hashedConfirm, "ACTIVATEACCOUNT");
            expect(mockAuthService.sendConfirmEmail).toHaveBeenCalledWith(mockEmail, mockConfirmToken);
        });

        it("should throw error if the user doesn't exist", async () => {
            mockRequest.user = {sub: mockUserId}
            const confirmDto: ConfirmDTO = {email: "admin@gmail.com"};
            jest.spyOn(mockUserService, "getByEmail").mockRejectedValue(new BadRequestException());
            await expect(controller.sendConfirm(confirmDto)).rejects.toThrow(new BadRequestException());
        });
    });
    

    describe("when the getProfile function is called", () => {
        it("should return the informations of the user", async () => {
            const user = mockUserConfirmed;
            const hashedPassword = await mockHashedPassword;
            user.password = hashedPassword;
            mockRequest.user = {sub: mockUserId}
            jest.spyOn(mockUserService, "getById").mockReturnValue(user);
            const result = await controller.getProfile(mockRequest);
            expect(result).toEqual({data: {user},message: "User profile"}); 
            expect(mockUserService.getById).toHaveBeenCalledWith(mockUserId);
        });

        it("should throw error if the user doesn't exist", async () => {
            mockRequest.user = {sub: 0}
            jest.spyOn(mockUserService, "getById").mockRejectedValue(new BadRequestException());
            await expect(controller.getProfile(mockRequest)).rejects.toThrow(new BadRequestException());
        });
    });

});
