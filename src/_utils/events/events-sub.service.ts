import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { EVENT_ROUTERS } from './events.routers';
import { KlineCreateDto } from './dto/kline-create.dto';

import { KlineService } from '../../kline/kline.service';

@Injectable()
export class EventsSubService {
  constructor(private klineService: KlineService) {}

  @OnEvent(EVENT_ROUTERS.KLINE.CREATE, { async: true })
  async sendEmailAuth(payload: KlineCreateDto) {
    await this.klineService.save(payload);
  }
}
