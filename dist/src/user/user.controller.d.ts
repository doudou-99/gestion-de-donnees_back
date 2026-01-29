import { UserService } from './user.service';
import { ResponseMessageWithData } from '../responses/response.message.with.data';
import { UserEmailResponse } from './response/user.email.response';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    getEmailById(id: number): Promise<ResponseMessageWithData<{
        email: UserEmailResponse;
    }>>;
}
