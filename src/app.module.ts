import { AlgorithmModule } from './algorithm/algorithm.module';
import { Module } from '@nestjs/common';

import { ConfigModule } from './_core/config/config.module';
import { EventsModule } from './_utils/events/events.module';

import { TelegrafModule } from './telegraf/telegraf.module';
import { BinanceWsModule } from './binance-ws/binance-ws.module';
import { BinanceApiModule } from './binance-api/binance-api.module';

@Module({
  imports: [
    // CONFIG, EVENTS
    ConfigModule,
    EventsModule,
    // MODULES
    TelegrafModule,
    BinanceWsModule,
    AlgorithmModule,
    BinanceApiModule,
  ],
})
export class AppModule {}
