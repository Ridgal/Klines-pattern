import { Module } from '@nestjs/common';

import { AlgorithmService } from './algorithm.service';

import { TelegrafModule } from '../telegraf/telegraf.module';

@Module({
  imports: [TelegrafModule],
  providers: [AlgorithmService],
  exports: [AlgorithmService],
})
export class AlgorithmModule {}
