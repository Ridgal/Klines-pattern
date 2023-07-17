import BigNumber from 'bignumber.js';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { TelegrafService } from '../telegraf/telegraf.service';

import { Kline } from '../binance-ws/types';
import { FormatterDataV2, Side, TakeProfit } from './types';

@Injectable()
export class AlgorithmV2Service {
  constructor(
    private configService: ConfigService,
    private telegrafService: TelegrafService,
  ) {}

  private mainToken = this.configService.get<string>('MAIN_TOKEN');

  private formatterMessage(data: FormatterDataV2): string {
    const message = `<code>Asset: Crypto\nExchange: Binance\nMarket: ${data.quoteSymbol}/${data.baseSymbol}\nTimeframe: ${data.timeframe}\nSide: ${data.side}\nPotential Profit: ${data.potentialProfit}%\n--------------------------\nEntry Point: ${data.entryPoint}\nStop Loss: ${data.stopLoss}\nTake Profit 1: ${data.takeProfit1.absolut} (${data.takeProfit1.percent}%)\nTake Profit 2: ${data.takeProfit2.absolut} (${data.takeProfit2.percent}%)\n</code>`;
    return message;
  }

  private async sendEvent(klines: Kline[], side: Side) {
    const middle = klines[1];
    const quoteSymbol = middle.s.split(this.mainToken)[0];

    const takeProfit1 = this.takeProfit1(middle, side);
    const takeProfit2 = this.takeProfit2(middle, side);

    const entryPoint = side === Side.LONG ? middle.k.h : middle.k.l;
    const stopLoss = side === Side.LONG ? middle.k.l : middle.k.h;

    const data: FormatterDataV2 = {
      quoteSymbol,
      baseSymbol: this.mainToken,
      timeframe: middle.k.i,
      takeProfit1,
      takeProfit2,
      entryPoint,
      stopLoss,
      potentialProfit: takeProfit2.percent,
      side,
    };

    const message = this.formatterMessage(data);
    await this.telegrafService.sendMessage(message);
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
    const condition7 = +middle.k.c - +middle.k.o > +middle.k.h - +middle.k.c;
    const condition8 = +last.k.c - +last.k.o > +last.k.h - +last.k.c;
    const condition9 = +middle.k.h / +middle.k.l >= 1.005;

    return (
      condition1 &&
      condition2 &&
      condition3 &&
      condition4 &&
      condition5 &&
      condition6 &&
      condition7 &&
      condition8 &&
      condition9
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
    const condition7 = +middle.k.o - +middle.k.c > +middle.k.c - +middle.k.l;
    const condition8 = +last.k.o - +last.k.c > +last.k.c - +last.k.l;
    const condition9 = +middle.k.h / +middle.k.l >= 1.005;

    return (
      condition1 &&
      condition2 &&
      condition3 &&
      condition4 &&
      condition5 &&
      condition6 &&
      condition7 &&
      condition8 &&
      condition9
    );
  }

  private takeProfit1(middle: Kline, side: Side): TakeProfit {
    let absolut: BigNumber;
    let percent: string;

    const low = BigNumber(middle.k.l);
    const high = BigNumber(middle.k.h);

    if (side === Side.LONG) {
      absolut = high.plus(high.minus(low).div(2)).abs();
      percent = absolut.div(high).minus(1).multipliedBy(100).toFixed(2);
    } else {
      absolut = low.minus(low.minus(high).div(2)).abs();
      percent = low.div(absolut).minus(1).multipliedBy(100).toFixed(2);
    }

    return {
      absolut: absolut.toNumber(),
      percent: +percent,
    };
  }

  private takeProfit2(middle: Kline, side: Side): TakeProfit {
    let absolut: BigNumber;
    let percent: string;

    const low = BigNumber(middle.k.l);
    const high = BigNumber(middle.k.h);

    if (side === Side.LONG) {
      absolut = high.plus(high.minus(low));
      percent = absolut.div(high).minus(1).multipliedBy(100).toFixed(2);
    } else {
      absolut = low.minus(low.minus(high));
      percent = low.div(absolut).minus(1).multipliedBy(100).toFixed(2);
    }

    return {
      absolut: absolut.toNumber(),
      percent: +percent,
    };
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
      await this.sendEvent(data, side);
    }
  }
}