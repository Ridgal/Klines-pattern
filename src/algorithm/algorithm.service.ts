import { Injectable } from '@nestjs/common';

import { AlgorithmV1Service } from './algorithm-v1.service';
import { AlgorithmV2Service } from './algorithm-v2.service';

import { Kline } from '../binance-ws/types';

@Injectable()
export class AlgorithmService {
  constructor(
    private v1Service: AlgorithmV1Service,
    private v2Service: AlgorithmV2Service,
  ) {}

  async run(data: Kline[]) {
    await this.v1Service.run(data);
    await this.v2Service.run(data);
  }
}
