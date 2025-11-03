import { SigninDTO } from './dto/signin.dto';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { ResponseMessageWithData } from '../responses/response.message.with.data';
import { loginInterface } from './interface/logininterface';
import type { RequestPayloadWithRefresh } from './interface/payload.interface';
export declare class AuthController {
    private readonly authService;
    private readonly userService;
    constructor(authService: AuthService, userService: UserService);
    signIn(body: SigninDTO): Promise<ResponseMessageWithData<{
        user: loginInterface;
        access_token: string;
        refresh_token: string;
    }>>;
    refresh(req: RequestPayloadWithRefresh): Promise<ResponseMessageWithData<{
        access_token: string;
        refresh_token: string;
    }>>;
}
