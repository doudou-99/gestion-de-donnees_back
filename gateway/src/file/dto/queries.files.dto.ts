import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';
import type { Sort, Order } from '../file.service';

export class QueriesFilesDto {
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
