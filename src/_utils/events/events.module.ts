import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { EventsSubService } from './events-sub.service';
import { EventsPubService } from './events-pub.service';

import { KlineModule } from '../../kline/kline.module';

@Module({
  imports: [
    KlineModule,
    EventEmitterModule.forRoot({
      global: true,
      verboseMemoryLeak: true,
    }),
  ],
  providers: [EventsSubService, EventsPubService],
  exports: [EventsPubService],
})
export class EventsModule {}
