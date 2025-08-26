import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

interface Transaction {
  ID: string;
  Sender: string;
  Receiver: string;
  Amount: number;
  Currency: string;
  Cause: string;
  CreatedAt: string;
}

export interface PaginatedResponse {
  transactions: Transaction[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SearchResponse {
  data: Transaction[];
  total: number;
}

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);
  private readonly yayaApiBaseUrl = 'https://yayawallet.com/api/en/transaction';
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly useMockApi: boolean;

  private readonly transactions: Transaction[] = [
    { ID: 'TX-1', Sender: 'Biruk Kebede', Receiver: 'User Account', Amount: 500, Currency: 'ETB', Cause: 'Salary', CreatedAt: '2025-08-20T10:00:00Z' },
    { ID: 'TX-2', Sender: 'Nathnael Zelalem', Receiver: 'Cafe Lucy', Amount: 150, Currency: 'ETB', Cause: 'Coffee', CreatedAt: '2025-08-20T11:30:00Z' },
    { ID: 'TX-3', Sender: 'Abel, Receiver',Receiver: 'User Account', Amount: 200, Currency: 'ETB', Cause: 'Top-up', CreatedAt: '2025-08-21T09:00:00Z' },
    { ID: 'TX-4', Sender: 'helen Berhe', Receiver: 'User Account', Amount: 300, Currency: 'ETB', Cause: 'Freelance Payment', CreatedAt: '2025-08-21T14:15:00Z' },
    { ID: 'TX-5', Sender: 'Edom Girma', Receiver: 'Tech Store', Amount: 1200, Currency: 'ETB', Cause: 'Laptop Purchase', CreatedAt: '2025-08-22T16:45:00Z' },
    { ID: 'TX-6', Sender: 'Abebe Lema', Receiver: 'Grocery Mart', Amount: 250, Currency: 'ETB', Cause: 'Groceries', CreatedAt: '2025-08-23T12:30:00Z' },
    { ID: 'TX-7', Sender: 'Bob Marly', Receiver: 'User Account', Amount: 400, Currency: 'ETB', Cause: 'Project Payment', CreatedAt: '2025-08-24T10:20:00Z' },
    { ID: 'TX-8', Sender: 'Abey Ahmed', Receiver: 'Bookstore', Amount: 80, Currency: 'ETB', Cause: 'Books Purchase', CreatedAt: '2025-08-24T15:00:00Z' },
    { ID: 'TX-9', Sender: 'Menilik Doctor', Receiver: 'Gym Membership', Amount: 300, Currency: 'ETB', Cause: 'Monthly Fee', CreatedAt: '2025-08-25T09:30:00Z' },
    { ID: 'TX-10', Sender: 'Charlie Brown', Receiver: 'User Account', Amount: 600, Currency: 'ETB', Cause: 'Consulting Fee', CreatedAt: '2025-08-25T14:50:00Z' },
  ];

  constructor(private configService: ConfigService, private httpService: HttpService) {

    this.useMockApi = this.configService.get<string>('USE_MOCK_API') === 'true';
    this.apiKey = this.configService.get<string>('API_KEY') ?? '';
    this.apiSecret = this.configService.get<string>('API_SECRET') ?? '';
    
    if (!this.apiKey || !this.apiSecret) {
      this.logger.warn('API_KEY or API_SECRET is missing; real API calls may fail.');
    }
  }

  async find_by_user(page: number, pageSize: number = 5): Promise<PaginatedResponse> {
    if (page < 1 || pageSize < 1) {
      throw new BadRequestException('Page and pageSize must be positive integers');
    }

    if (this.useMockApi) {
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedTransactions = this.transactions.slice(startIndex, endIndex);

      return {
        transactions: paginatedTransactions,
        total: this.transactions.length,
        page,
        pageSize,
        totalPages: Math.ceil(this.transactions.length / pageSize),
      };
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.yayaApiBaseUrl}/find-by-user`, {
          params: { p: page, pageSize },
          headers: {
            Authorization: `Bearer ${this.apiSecret}`,
            'Content-Type': 'application/json',
            'X-Api-Key': this.apiKey, 
          },
        }),
      );
      return this.mapApiResponseToPaginatedResponse(response.data, page, pageSize);
    } catch (error) {
      this.logger.error(`Failed to fetch transactions: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch transactions from YayaWallet API');
    }
  }

  async search(query: string): Promise<SearchResponse> {
    if (!query || query.trim().length === 0) {
      throw new BadRequestException('Search query cannot be empty');
    }

    if (this.useMockApi) {
      const searchTerm = query.toLowerCase();
      const filteredTransactions = this.transactions.filter(
        (tx) =>
          tx.Sender.toLowerCase().includes(searchTerm) ||
          tx.Receiver.toLowerCase().includes(searchTerm) ||
          tx.Cause.toLowerCase().includes(searchTerm) ||
          tx.ID.toLowerCase().includes(searchTerm),
      );
      return { data: filteredTransactions, total: filteredTransactions.length };
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.yayaApiBaseUrl}/search`,
          { query },
          {
            headers: {
              Authorization: `Bearer ${this.apiSecret}`,
              'Content-Type': 'application/json',
              'X-Api-Key': this.apiKey, 
            },
          },
        ),
      );
      return this.mapApiResponseToSearchResponse(response.data);
    } catch (error) {
      this.logger.error(`Failed to search transactions: ${error.message}`);
      throw new InternalServerErrorException('Failed to search transactions via YayaWallet API');
    }
  }

  private mapApiResponseToPaginatedResponse(data: any, page: number, pageSize: number): PaginatedResponse {
    return {
      transactions: data.transactions || [],
      total: data.total || 0,
      page,
      pageSize,
      totalPages: Math.ceil((data.total || 0) / pageSize),
    };
  }

  
  private mapApiResponseToSearchResponse(data: any): SearchResponse {
    return {
      data: data.transactions || [],
      total: data.total || 0,
    };
  }
}