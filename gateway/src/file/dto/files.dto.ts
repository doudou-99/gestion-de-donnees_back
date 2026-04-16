import { Type } from 'class-transformer';
import { IsOptional, IsInt, IsString } from 'class-validator';
import type { Order, Sort } from '../file.service';

export class FilesDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number;

  @IsOptional()
  @IsString()
  sort?: Sort;

  @IsOptional()
  @IsString()
  order?: Order;
}
