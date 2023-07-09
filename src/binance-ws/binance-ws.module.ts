import { Module } from '@nestjs/common';
import { BinanceApiModule } from '../binance-api/binance-api.module';

import { BinanceWsService } from './binance-ws.service';
import { EventsModule } from 'src/_utils/events/events.module';

@Module({
  imports: [EventsModule, BinanceApiModule],
  providers: [BinanceWsService],
})
export class BinanceWsModule {}
