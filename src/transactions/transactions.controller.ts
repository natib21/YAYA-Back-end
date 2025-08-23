import { Body, Controller, Get, Post } from '@nestjs/common';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {
    this.transactionsService.find_by_user(1);
  }

  @Get('find_by_user')
  findAll() {
    return this.transactionsService.find_by_user(1);
  }

  @Post('search')
  search(@Body() body) {
    return this.transactionsService.search(body.query);
  }

}
