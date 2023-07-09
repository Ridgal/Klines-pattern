export interface GetExchangeInfo {
  timezone: string;
  serverTime: number;
  rateLimits?: RateLimits[] | null;
  exchangeFilters?: null[] | null;
  symbols?: Symbols[] | null;
}
export interface RateLimits {
  rateLimitType: string;
  interval: string;
  intervalNum: number;
  limit: number;
}
export interface Symbols {
  symbol: string;
  status: string;
  baseAsset: string;
  baseAssetPrecision: number;
  quoteAsset: string;
  quotePrecision: number;
  quoteAssetPrecision: number;
  baseCommissionPrecision: number;
  quoteCommissionPrecision: number;
  orderTypes?: string[] | null;
  icebergAllowed: boolean;
  ocoAllowed: boolean;
  quoteOrderQtyMarketAllowed: boolean;
  allowTrailingStop: boolean;
  cancelReplaceAllowed: boolean;
  isSpotTradingAllowed: boolean;
  isMarginTradingAllowed: boolean;
  filters?: Filters[] | null;
  permissions?: string[] | null;
  defaultSelfTradePreventionMode: string;
  allowedSelfTradePreventionModes?: string[] | null;
}
export interface Filters {
  filterType: string;
  minPrice?: string | null;
  maxPrice?: string | null;
  tickSize?: string | null;
  minQty?: string | null;
  maxQty?: string | null;
  stepSize?: string | null;
  limit?: number | null;
  minTrailingAboveDelta?: number | null;
  maxTrailingAboveDelta?: number | null;
  minTrailingBelowDelta?: number | null;
  maxTrailingBelowDelta?: number | null;
  bidMultiplierUp?: string | null;
  bidMultiplierDown?: string | null;
  askMultiplierUp?: string | null;
  askMultiplierDown?: string | null;
  avgPriceMins?: number | null;
  minNotional?: string | null;
  applyMinToMarket?: boolean | null;
  maxNotional?: string | null;
  applyMaxToMarket?: boolean | null;
  maxNumOrders?: number | null;
  maxPosition?: string | null;
  maxNumAlgoOrders?: number | null;
}
