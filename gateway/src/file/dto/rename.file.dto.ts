import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class RenameFileDto {
    @ApiProperty({required: true, uniqueItems: true})
    @IsNotEmpty()
    @IsString()
    name: string;
}