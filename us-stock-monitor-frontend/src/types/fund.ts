export interface FundPositionVO {
  id: number;
  fundName: string;
  managerName: string;
  ticker: string;
  companyName: string;
  action: 'ADD' | 'REDUCE' | 'NEW' | 'CLOSE';
  sharesChange: number;
  sharesTotal: number;
  valueUsd: number;
  portfolioPct: number;
  quarter: string;
  filingDate: string;
  sourceUrl: string;
}
