import { $Enums, User } from "@prisma/client";
export declare class UserResponse implements Partial<User> {
    id: number;
    email: string;
    password: string;
    username: string;
    address: string;
    additionalAddress?: string;
    zipCode: string;
    status: $Enums.EnumUserStatus;
    extraEmail?: string;
    createdAt: Date;
    updatedAt: Date;
}
