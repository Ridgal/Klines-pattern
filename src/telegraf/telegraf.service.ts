import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { Telegraf } from 'telegraf';

@Injectable()
export class TelegrafService {
  private bt: Telegraf;

  constructor(private readonly configService: ConfigService) {
    this.bt = new Telegraf(
      this.configService.get<string>('TELEGRAM_BOT_TOKEN'),
    );
  }

  public sendMessage(text: string) {
    return this.bt.telegram.sendMessage(
      this.configService.get<string>('TELEGRAM_CHAT_ID'),
      text,
      {
        parse_mode: 'HTML',
      },
    );
  }
}
