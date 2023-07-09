import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AlgorithmService } from '../algorithm/algorithm.service';

import { Kline } from '../binance-ws/types';
import { KlineStorage } from './types';

@Injectable()
export class KlineService {
  constructor(
    private configService: ConfigService,
    private algorithmService: AlgorithmService,
  ) {}

  private storage: KlineStorage = {};
  private length = +this.configService.get<number>('HISTORY_LENGTH_SAVE');

  private getKey(symbol: string, interval: string) {
    return symbol + interval;
  }

  async save(params: Kline) {
    const key = this.getKey(params.s, params.k.i);
    let klines = this.storage[key];
    const length = klines?.length;

    if (!klines) {
      klines = [params];
    } else if (length !== this.length) {
      klines.push(params);
    } else {
      klines.push(params);
      klines = klines.slice(klines.length - this.length);
    }
    const res = klines.sort((a, b) => a.k.t - b.k.t);
    this.storage[key] = res;

    if (res.length === this.length) {
      await this.algorithmService.run(res);
    }
  }

  get(symbol: string, interval: string) {
    const key = this.getKey(symbol, interval);

    const klines = this.storage[key];
    return klines || null;
  }
}
