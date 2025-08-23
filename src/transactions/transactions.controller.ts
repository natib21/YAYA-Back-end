import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  @Get('find_by_user')
  findAll(@Query('p') page: string) {
    const pageNumber = parseInt(page, 10) || 1; 
    console.log("page Number: "+pageNumber)
    return this.transactionsService.find_by_user(pageNumber);
  }

  @Post('search')
  search(@Body() body) {
    return this.transactionsService.search(body.query);
  }

}
