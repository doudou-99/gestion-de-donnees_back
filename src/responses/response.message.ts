import { ApiProperty } from "@nestjs/swagger";

export class ResponseMessage {
    @ApiProperty({required: true})
    message: string;
}