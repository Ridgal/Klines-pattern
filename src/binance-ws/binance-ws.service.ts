import WebSocket from 'ws';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { BinanceApiService } from '../binance-api/binance-api.service';
import { EventsPubService } from '../_utils/events/events-pub.service';

import { Kline } from './types';

@Injectable()
export class BinanceWsService implements OnModuleInit {
  constructor(
    private configService: ConfigService,
    private binanceApiService: BinanceApiService,
    private readonly eventsPubService: EventsPubService,
  ) {}

  private LENGTH_STEP = 400;
  private WS_HOST = this.configService.get<string>('WS_HOST');
  private INTERVALS = this.configService.get<string>('INTERVALS').split(',');

  async onModuleInit() {
    this.run();
  }

  async run() {
    const symbols = await this.binanceApiService.getSymbols();

    const data = symbols
      .map((s) => this.INTERVALS.map((i) => `${s}@kline_${i}`))
      .flat();

    const lengthStep = this.LENGTH_STEP;
    const length = data.length;
    const connectData: string[][] = [];

    for (let i = 0; i < length / lengthStep; i++) {
      const skip = lengthStep * i;
      const take = skip ? skip + lengthStep : lengthStep;

      const res = data.slice(skip, take);
      connectData.push(res);
    }

    connectData.forEach((i, idx) => this.connect(i, idx));
  }

  send(socket: WebSocket, params: string[]) {
    const subscribeMessage = JSON.stringify({
      id: 1,
      params,
      method: 'SUBSCRIBE',
    });

    socket.send(subscribeMessage);
  }

  async connect(params: string[], step: number) {
    let pongTask: NodeJS.Timer;
    const socket = new WebSocket(this.WS_HOST);

    socket.on('open', async () => {
      console.log(`WS CONNECTED, STEP: `, step);
      this.send(socket, params);
      pongTask = setInterval(() => socket.pong(), 3000);
    });

    socket.on('message', async (raw) => {
      const message = raw.toString();
      const data: Kline = JSON.parse(message);

      if (data?.k?.x) {
        await this.eventsPubService.klineCreate(data);
      }
    });

    socket.on('error', (err) => {
      console.log('WS ERROR, STEP: ', step);
      console.log(err);
    });

    socket.on('close', () => {
      console.log('Ws DISCONNECTED, STEP: ', step);
      clearInterval(pongTask);
      this.connect(params, step); // Reconnect if stream closed
    });
  }
}
