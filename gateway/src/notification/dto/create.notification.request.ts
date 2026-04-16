import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { TypeNotification } from '../enums/EnumTypeNotification';
import { TypeRecipient } from '../enums/EnumTypeRecipient';
import { TypeChannel } from '../enums/EnumTypeChannel';

export class CreateNotificationRequest {
  @IsNumber()
  @IsNotEmpty()
  recipientId: number;

  @IsEnum(TypeRecipient)
  @IsNotEmpty()
  recipientType: TypeRecipient;

  @IsEnum(TypeNotification)
  @IsNotEmpty()
  type: TypeNotification;

  @IsEnum(TypeChannel)
  typeChannel: TypeChannel;

  @IsNotEmpty()
  metadata: Record<string, unknown>;
}
