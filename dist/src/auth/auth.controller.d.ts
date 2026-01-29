import { SigninDTO } from './dto/signin.dto';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { ResponseMessageWithData } from '../responses/response.message.with.data';
import { loginInterface } from './interface/logininterface';
import type { RequestPayload } from './interface/payload.interface';
import { SignupDto } from './dto/signup.dto';
import { User } from '@prisma/client';
import type { Response } from 'express';
import { ResponseMessage } from '../responses/response.message';
import { ConfirmDTO } from './dto/confirm.dto';
export declare class AuthController {
    private readonly authService;
    private readonly userService;
    constructor(authService: AuthService, userService: UserService);
    signUp(body: SignupDto): Promise<ResponseMessageWithData<{
        user: User;
    }>>;
    sendConfirm(confirmDto: ConfirmDTO): Promise<ResponseMessage>;
    confirm(req: RequestPayload, token: string, res: Response): Promise<void>;
    signIn(body: SigninDTO, res: Response): Promise<ResponseMessageWithData<{
        user: loginInterface;
        access_token: string;
        refresh_token: string;
    }>>;
    refresh(req: RequestPayload, res: Response): Promise<ResponseMessageWithData<{
        access_token: string;
        refresh_token: string;
    }>>;
    getProfile(req: RequestPayload): Promise<ResponseMessageWithData<{
        user: User;
    }>>;
}
