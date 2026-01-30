import { ApiProperty } from "@nestjs/swagger";
import { $Enums, User } from "@prisma/client";

export class UserResponse implements Partial<User> {
    @ApiProperty()
    id: number;

    @ApiProperty()
    email: string;

    @ApiProperty()
    password: string;

    @ApiProperty()
    username: string;

    @ApiProperty()
    address: string;

    @ApiProperty({required: false})
    additionalAddress?: string;

    @ApiProperty()
    zipCode: string;

    @ApiProperty()
    status: $Enums.EnumUserStatus;

    @ApiProperty({required: false})
    extraEmail?: string;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}