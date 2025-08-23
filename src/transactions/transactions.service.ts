import { Injectable } from '@nestjs/common';

@Injectable()
export class TransactionsService {
  find_by_user(page: number) {
    return `This action returns all transactions. Page: ${page}`;
  }
  search(query: string) {}
}
