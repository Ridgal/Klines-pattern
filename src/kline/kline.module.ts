import { Module } from '@nestjs/common';

import { AlgorithmModule } from '../algorithm/algorithm.module';

import { KlineService } from './kline.service';

@Module({
  imports: [AlgorithmModule],
  providers: [KlineService],
  exports: [KlineService],
})
export class KlineModule {}
