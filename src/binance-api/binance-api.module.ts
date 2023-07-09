import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { BinanceApiService } from './binance-api.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        baseURL: configService.get<string>('API_HOST'),
        timeout: 10000,
        maxRedirects: 5,
      }),
    }),
  ],
  providers: [BinanceApiService],
  exports: [BinanceApiService],
})
export class BinanceApiModule {}
