import { Body, Controller, Get, Post, Query, BadRequestException } from '@nestjs/common';
import { TransactionsService, PaginatedResponse, SearchResponse } from './transactions.service';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get('find_by_user')
  async findAll(@Query('p') page: string): Promise<PaginatedResponse> {
    const pageNumber = parseInt(page, 10) || 1;
    if (pageNumber < 1) {
      throw new BadRequestException('Page number must be a positive integer');
    }
    console.log('page Number: ' + pageNumber); // Consider replacing with Logger in production
    return this.transactionsService.find_by_user(pageNumber);
  }

  @Post('search')
  async search(@Body() body: { query: string }): Promise<SearchResponse> {
    if (!body.query || body.query.trim().length === 0) {
      throw new BadRequestException('Search query cannot be empty');
    }
    return this.transactionsService.search(body.query);
  }
}