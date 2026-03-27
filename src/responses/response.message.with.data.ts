import { ApiProperty } from '@nestjs/swagger';
import { ResponseMessage } from './response.message';

export class ResponseMessageWithData<T extends Record<string, any>> extends ResponseMessage {
  @ApiProperty({ required: false })
  data: T;
}
