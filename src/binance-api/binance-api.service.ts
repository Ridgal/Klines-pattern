import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

import { GetExchangeInfo } from './types';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BinanceApiService {
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  private token = this.configService.get<string>('MAIN_TOKEN');

  async getSymbols() {
    try {
      const res = await this.httpService.axiosRef.get<GetExchangeInfo>(
        '/api/v3/exchangeInfo',
      );
      const data = res.data;
      const regex = new RegExp(`${this.token}$`);

      const symbolsData = data.symbols.filter(
        (i) => regex.test(i.symbol) && i.status === 'TRADING',
      );
      const symbols = symbolsData.map((i) => i.symbol.toLowerCase());

      return symbols;
    } catch (error) {
      throw error;
    }
  }
}
