import { Order, Sort } from '../file.service';

export class FilesDto {
  userId: number;
  page?: number;
  sort?: Sort;
  limit: number = 10;
  order: Order = 'ASC';
}
