import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
@Injectable()
export class TransactionsService {

  private readonly yayaApiBaseUrl = 'https://yayawallet.com/api/en/transaction';
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly useMockApi: boolean;

   private transactions = [
    {
      ID: 'TX-1',
      Sender: 'Biruk Kebede',
      Receiver: 'User Account',
      Amount: 500,
      Currency: 'ETB',
      Cause: 'Salary',
      CreatedAt: '2025-08-20T10:00:00Z',
    },
    {
      ID: 'TX-2',
      Sender: 'User Account',
      Receiver: 'Cafe Lucy',
      Amount: 150,
      Currency: 'ETB',
      Cause: 'Coffee',
      CreatedAt: '2025-08-20T11:30:00Z',
    },
    {
      ID: 'TX-3',
      Sender: 'User Account',
      Receiver: 'User Account',
      Amount: 200,
      Currency: 'ETB',
      Cause: 'Top-up',
      CreatedAt: '2025-08-21T09:00:00Z',
    },
    {
      ID: 'TX-4',
      Sender: 'Alice Johnson',
      Receiver: 'User Account',
      Amount: 300,
      Currency: 'ETB',
      Cause: 'Freelance Payment',
      CreatedAt: '2025-08-21T14:15:00Z',
    },
    {
      ID: 'TX-5',
      Sender: 'User Account',
      Receiver: 'Tech Store',
      Amount: 1200,
      Currency: 'ETB',
      Cause: 'Laptop Purchase',
      CreatedAt: '2025-08-22T16:45:00Z',
    },
    {
      ID: 'TX-6',
      Sender: 'User Account',
      Receiver: 'Grocery Mart',
      Amount: 250,
      Currency: 'ETB',
      Cause: 'Groceries',
      CreatedAt: '2025-08-23T12:30:00Z',
    },
    {
      ID: 'TX-7',
      Sender: 'Bob Smith',
      Receiver: 'User Account',
      Amount: 400,
      Currency: 'ETB',
      Cause: 'Project Payment',
      CreatedAt: '2025-08-24T10:20:00Z',
    },
    {
      ID: 'TX-8',
      Sender: 'User Account',
      Receiver: 'Bookstore',
      Amount: 80,
      Currency: 'ETB',
      Cause: 'Books Purchase',
      CreatedAt: '2025-08-24T15:00:00Z',
    },
    {
      ID: 'TX-9',
      Sender: 'User Account',
      Receiver: 'Gym Membership',
      Amount: 300,
      Currency: 'ETB',
      Cause: 'Monthly Fee',
      CreatedAt: '2025-08-25T09:30:00Z',
    },
    {
      ID: 'TX-10',
      Sender: 'Charlie Brown',
      Receiver: 'User Account',
      Amount: 600,
      Currency: 'ETB',
      Cause: 'Consulting Fee',
      CreatedAt: '2025-08-25T14:50:00Z',
    },
  ];
 constructor(private configService: ConfigService, private httpService: HttpService) {
     
     this.useMockApi = this.configService.get<string>('USE_MOCK_API') === 'true';
     this.apiKey = this.configService.get<string>('API_KEY')!; 
     this.apiSecret = this.configService.get<string>('API_SECRET')!; 
  }
  async find_by_user(page: number, pageSize: number = 5) {
    console.log(this.useMockApi);
    if(this.useMockApi){
       const startIndex = (page - 1) * pageSize;
       const endIndex = startIndex + pageSize;
       console.log(page);
       const paginatedTransactions = this.transactions.slice(startIndex, endIndex);

       return {
        transactions: paginatedTransactions,
        total: this.transactions.length,
        page,
        pageSize,
        totalPages: Math.ceil(this.transactions.length / pageSize),
   }
    }else {
        const response = await this.httpService.get(`${this.yayaApiBaseUrl}/find-by-user`, {
        params: { p: page },
        headers: {
          'Authorization': `Bearer ${this.apiSecret}`,
          'Content-Type': 'application/json',
        },
      });
      return response;
    }
    }
    
  
  search(query: string) {
    console.log(query)
     if (this.useMockApi) {
    const searchTerm = query.toLowerCase();
    const filteredTransactions = this.transactions.filter(
      (tx) =>
        tx.Sender.toLowerCase().includes(searchTerm) ||
        tx.Receiver.toLowerCase().includes(searchTerm) ||
        tx.Cause.toLowerCase().includes(searchTerm) ||
        tx.ID.toLowerCase().includes(searchTerm)
    );
    return { data: filteredTransactions, total: filteredTransactions.length };
  }
  }
}
