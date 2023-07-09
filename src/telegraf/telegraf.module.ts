import { Module } from '@nestjs/common';
import { Telegraf } from 'telegraf';

import { TelegrafService } from './telegraf.service';

@Module({
  imports: [Telegraf],
  providers: [TelegrafService],
  exports: [TelegrafService],
})
export class TelegrafModule {}
