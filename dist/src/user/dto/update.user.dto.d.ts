import { EnumUserStatus } from "@prisma/client";
export declare class UpdateUserDto {
    email?: string;
    username?: string;
    password?: string;
    extraEmail?: string;
    status?: EnumUserStatus;
}
