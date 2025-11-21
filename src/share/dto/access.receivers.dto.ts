import { EnumAccessType } from "@prisma/client";
import { IsArray, IsNotEmpty } from "class-validator";

export class AccessReceiverUserDto {
    @IsNotEmpty()
    receiver: ReceiverUser;
}

export class AccessReceiverGroupDto {
    @IsNotEmpty()
    receiver: ReceiverGroup;
}

export interface ReceiverUser {
    userId: number;
    accessType: EnumAccessType;
}

export interface ReceiverGroup {
    groupId: number;
    accessType: EnumAccessType;
}