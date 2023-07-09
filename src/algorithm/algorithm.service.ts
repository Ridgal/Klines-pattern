import { Injectable } from '@nestjs/common';

import { TelegrafService } from '../telegraf/telegraf.service';

import { Kline } from '../binance-ws/types';
import { Side } from './types';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AlgorithmService {
  constructor(
    private configService: ConfigService,
    private telegrafService: TelegrafService,
  ) {}

  private mainToken = this.configService.get<string>('MAIN_TOKEN');

  private takeProfit1(data: Kline) {
    const middle = data[1]; // candle 2

    const l = +middle.k.h + (+middle.k.h - +middle.k.l) / 2;
    const s = +middle.k.l - (+middle.k.l - +middle.k.h) /2;
    const longResult = ((Math.abs(l) / +middle.k.h -1) * 100).toFixed(2);
    const shortResult = ((Math.abs(s) / +middle.k.h -1) * 100).toFixed(2);
    return [longResult, shortResult];
  }

  private takeProfit2(data: Kline) {
    const middle = data[1]; // candle 2

    const l = +middle.k.h + (+middle.k.h - +middle.k.l);
    const s = +middle.k.l - (+middle.k.l - +middle.k.h);
    const longResult = ((Math.abs(l) / +middle.k.h -1) * 100).toFixed(2);
    const shortResult = ((Math.abs(s) / +middle.k.h -1) * 100).toFixed(2);
    return [longResult, shortResult];
  }

  private formatterMessage(data: Kline, side: Side): string {
    const token1 = data.s.split(this.mainToken)[0];
    const profit1 = this.takeProfit1;
    const profit2 = this.takeProfit2;

    const message = `
      <code>
        Asset: Crypto
        \nExchange: Binance
        \nMarket: ${token1}/${this.mainToken}
        \nTimeframe: ${data.k.i}
        \nSide: ${side}
        \n
        <br >
        \n
        \nEntry Point: ${data[1].k.h} (for LONG), ${data[1].k.l} (for SHORT)
        \nStop Loss: ${data[1].k.l} (for LONG), ${data[1].k.h} (for SHORT)
        \nTake Profit 1: ${profit1[0]} (+${profit1[1]}%)
        \nTake Profit 2: ${profit2[0]} (+${profit2[1]}%)
        \n
      </code>
    `;
    return message;
  }

  private async sendEvent(data: Kline, side: Side) {
    const message = this.formatterMessage(data, side);
    await this.telegrafService.sendMessage(message);
  }

  private checkIsLong(data: Kline[]) {
    console.log(data)
    const first = data[0]; // candle 1
    const middle = data[1]; // candle 2
    const last = data[2]; // candle 3

    const condition1 = +middle.k.o > +middle.k.c;
    const condition2 = +middle.k.l < +first.k.l && +middle.k.h > +first.k.h;
    const condition3 = +middle.k.c > +first.k.h;
    const condition4 = +last.k.o > +last.k.c;
    const condition5 = +last.k.c - +last.k.o < +last.k.o - +last.k.l;

    const condition6 = +middle.k.c - +middle.k.o > +middle.k.h - +middle.k.c;
    const condition7 = +last.k.c - +last.k.o > +last.k.h - +last.k.c;
    const condition8 = +middle.k.h / +middle.k.l >= 1.005;

    return condition1 && condition2 && condition3 && condition4 && condition5 && condition6 && condition7 && condition8;
  }

  private checkIsShort(data: Kline[]) {
    const first = data[0];
    const middle = data[1];
    const last = data[2];

    const condition1 = +middle.k.o < +middle.k.c;
    const condition2 = +middle.k.l < +first.k.l && +middle.k.h > +first.k.h;
    const condition3 = +middle.k.c < +first.k.l;
    const condition4 = +last.k.o < +last.k.c;
    const condition5 = +last.k.o - +last.k.c < +last.k.h - +last.k.o;

    const condition6 = +middle.k.o - +middle.k.c > +middle.k.c - +middle.k.l;
    const condition7 = +last.k.o - +last.k.c > +last.k.c - +last.k.l;
    const condition8 = +middle.k.h / +middle.k.l >= 1.005;

    return condition1 && condition2 && condition3 && condition4 && condition5 && condition6 && condition7 && condition8;
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

    if (side) {
      await this.sendEvent(last, side);
    }
  }
}
