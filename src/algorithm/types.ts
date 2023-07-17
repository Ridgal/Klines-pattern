export enum Side {
  LONG = 'LONG',
  SHORT = 'SHORT',
}

export type FormatterDataV1 = {
  quoteSymbol: string;
  baseSymbol: string;
  timeframe: string;
  side: Side;
};

export type FormatterDataV2 = {
  quoteSymbol: string;
  baseSymbol: string;
  timeframe: string;
  side: Side;
  potentialProfit: number;
  entryPoint: string;
  stopLoss: string;
  takeProfit1: TakeProfit;
  takeProfit2: TakeProfit;
};

export type TakeProfit = {
  absolut: number;
  percent: number;
};
