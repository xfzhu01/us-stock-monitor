export interface MarketDataVO {
  id: number;
  tradeDate: string;
  spxOpen: number;
  spxClose: number;
  spxChangePct: number;
  ndxOpen: number;
  ndxClose: number;
  ndxChangePct: number;
  vixClose: number;
  us10yYield: number;
  dxy: number;
  fedFundsRate: number;
}
