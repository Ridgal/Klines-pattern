import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { EVENT_ROUTERS } from './events.routers';
import { KlineCreateDto } from './dto/kline-create.dto';

@Injectable()
export class EventsPubService {
  constructor(private eventEmitter: EventEmitter2) {}

  async klineCreate(payload: KlineCreateDto) {
    this.eventEmitter.emit(EVENT_ROUTERS.KLINE.CREATE, payload);
  }
}
