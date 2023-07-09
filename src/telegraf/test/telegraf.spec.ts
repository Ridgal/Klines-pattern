import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';

import { TelegrafModule } from '../telegraf.module';

import { TelegrafService } from '../telegraf.service';

describe('Telegraf', () => {
  let app: INestApplication;

  const requestsData = {
    text: 'Test send message',
  };

  let telegrafService: TelegrafService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [TelegrafModule],
    }).compile();

    telegrafService = moduleRef.get<TelegrafService>(TelegrafService);

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it('Send message', async () => {
    await telegrafService.sendMessage(requestsData.text);
  });

  afterAll(async () => {
    await app.close();
  });
});
