import { Body, Controller, HttpCode, HttpStatus, Post, PreconditionFailedException, UseGuards } from '@nestjs/common';
import { SigninDTO } from './dto/signin.dto';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { ResponseMessageWithData } from 'src/responses/response.message.with.data';
import { loginInterface } from "./interface/logininterface";

@Controller('api/v1/auth')
export class AuthController {
    constructor(private readonly authService: AuthService, private readonly userService: UserService){}

    @HttpCode(HttpStatus.OK)
    @Post("signin")
    async signIn(@Body() body: SigninDTO): Promise<ResponseMessageWithData<{user: loginInterface, access_token: string, refresh_token: string}>> {
        const user = await this.userService.getByEmail(body.email);
        const compare = this.authService.compare(user.password, body.password);
        if (user.status === "NOT_CONFIRMED") {
            throw new PreconditionFailedException();
        }
        if (!compare) {
            throw new PreconditionFailedException("Bad credentials");
        }
        const login: loginInterface = {id: user.id, email: user.email, password: user.password};
        const access_token = await this.authService.generateToken({sub: user.id}, {
            secret: process.env.SECRET_KEY,
            expiresIn: "60s"
        });
        const refresh_token = await this.authService.generateToken({sub: user.id}, {
            algorithm: "HS512",
            secret: process.env.SECRET_REFRESH_KEY,
            expiresIn: "240s"
        });
        await this.authService.upsertToken(user.id, refresh_token);
        return {
            data: {user: login, access_token, refresh_token},
            message: "The user is connected"
        }
    }
}
