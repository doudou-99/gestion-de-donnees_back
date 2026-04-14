import { Order, Sort } from '../file.service';

export class SearchDto {
  userId: number;
  updatedAt: Date | null;
  name?: string;
  typeFile?: string;
  page?: number;
  sort?: Sort;
  limit: number = 10;
  order: Order = 'ASC';
}
