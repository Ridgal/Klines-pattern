import BigNumber from 'bignumber.js';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { TelegrafService } from '../telegraf/telegraf.service';

import { Kline } from '../binance-ws/types';
import { FormatterDataV1, Side } from './types';

@Injectable()
export class AlgorithmV1Service {
  constructor(
    private configService: ConfigService,
    private telegrafService: TelegrafService,
  ) {}

  private mainToken = this.configService.get<string>('MAIN_TOKEN');

  private formatterMessage(data: FormatterDataV1): string {
    const message = `<code>Asset: Crypto\nExchange: Binance\nMarket: ${data.quoteSymbol}/${data.baseSymbol}\nTimeframe: ${data.timeframe}\nSide: ${data.side}\n</code>`;
    return message;
  }

  private async sendEvent(klineLast: Kline, side: Side) {
    const quoteSymbol = klineLast.s.split(this.mainToken)[0];

    const data: FormatterDataV1 = {
      quoteSymbol,
      baseSymbol: this.mainToken,
      timeframe: klineLast.k.i,
      side,
    };

    const message = this.formatterMessage(data);
    await this.telegrafService.sendMessageV1Chat(message);
  }

  private checkIsLong(data: Kline[]) {
    const first = data[0];
    const middle = data[1];
    const last = data[2];

    const condition1 = +middle.k.o < +middle.k.c;
    const condition2 = +middle.k.l < +first.k.l && +middle.k.h > +first.k.h;
    const condition3 = +middle.k.c > +first.k.h;
    const condition4 = +last.k.o < +last.k.c;
    const condition5 = +middle.k.l < +last.k.l && +middle.k.h > +last.k.h;
    const condition6 = +last.k.c - +last.k.o < +last.k.o - +last.k.l;

    return (
      condition1 &&
      condition2 &&
      condition3 &&
      condition4 &&
      condition5 &&
      condition6
    );
  }

  private checkIsShort(data: Kline[]) {
    const first = data[0];
    const middle = data[1];
    const last = data[2];

    const condition1 = +middle.k.o > +middle.k.c;
    const condition2 = +middle.k.l < +first.k.l && +middle.k.h > +first.k.h;
    const condition3 = +middle.k.c < +first.k.l;
    const condition4 = +last.k.o > +last.k.c;
    const condition5 = +middle.k.l < +last.k.l && +middle.k.h > +last.k.h;
    const condition6 = +last.k.o - +last.k.c < +last.k.h - +last.k.o;

    return (
      condition1 &&
      condition2 &&
      condition3 &&
      condition4 &&
      condition5 &&
      condition6
    );
  }

  async run(data: Kline[]) {
    const last = data[data.length - 1];

    let side: Side;

    const isLong = this.checkIsLong(data);
    const isShort = this.checkIsShort(data);

    if (isLong && !isShort) {
      side = Side.LONG;
    } else if (!isLong && isShort) {
      side = Side.SHORT;
    } else if (isLong && isShort) {
      await this.telegrafService.sendMessage('Error side = LONG & SHORT');
    }

    if (side === Side.LONG) {
      await this.sendEvent(last, side);
    }
  }
}