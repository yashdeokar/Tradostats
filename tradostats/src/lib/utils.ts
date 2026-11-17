import { type ClassValue, clsx } from 'clsx';
import { format, parseISO, differenceInMinutes } from 'date-fns';
import type { Trade } from './types';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(value: number): string {
  const abs = Math.abs(value);
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(abs);
  return value < 0 ? `-${formatted}` : formatted;
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatDate(dateStr: string, fmt = 'MMM d, yyyy'): string {
  try {
    return format(parseISO(dateStr), fmt);
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'MMM d, yyyy HH:mm');
  } catch {
    return dateStr;
  }
}

export function calcPnl(trade: Omit<Trade, 'pnl'>): number {
  const diff = trade.direction === 'Long'
    ? trade.exitPrice - trade.entryPrice
    : trade.entryPrice - trade.exitPrice;
  return diff * trade.quantity;
}

export function calcWinRate(wins: number, total: number): number {
  if (total === 0) return 0;
  return (wins / total) * 100;
}

export function calcProfitFactor(grossProfit: number, grossLoss: number): number {
  if (grossLoss === 0) return grossProfit > 0 ? Infinity : 0;
  return grossProfit / Math.abs(grossLoss);
}

export function calcExpectancy(avgWin: number, winRate: number, avgLoss: number): number {
  const wr = winRate / 100;
  return wr * avgWin + (1 - wr) * avgLoss;
}

export function calcMaxDrawdown(trades: Trade[]): number {
  let peak = 0;
  let cumulative = 0;
  let maxDD = 0;
  for (const trade of trades) {
    cumulative += trade.pnl;
    if (cumulative > peak) peak = cumulative;
    const dd = cumulative - peak;
    if (dd < maxDD) maxDD = dd;
  }
  return maxDD;
}

export function calcSharpeRatio(trades: Trade[]): number {
  if (trades.length < 2) return 0;
  const pnls = trades.map(t => t.pnl);
  const mean = pnls.reduce((a, b) => a + b, 0) / pnls.length;
  const variance = pnls.reduce((acc, p) => acc + (p - mean) ** 2, 0) / pnls.length;
  const stdDev = Math.sqrt(variance);
  if (stdDev === 0) return 0;
  return (mean / stdDev) * Math.sqrt(252);
}

export function calcSortinoRatio(trades: Trade[]): number {
  if (trades.length < 2) return 0;
  const pnls = trades.map(t => t.pnl);
  const mean = pnls.reduce((a, b) => a + b, 0) / pnls.length;
  const downside = pnls.filter(p => p < 0);
  if (downside.length === 0) return Infinity;
  const downsideVariance = downside.reduce((acc, p) => acc + p ** 2, 0) / downside.length;
  const downsideStdDev = Math.sqrt(downsideVariance);
  if (downsideStdDev === 0) return 0;
  return (mean / downsideStdDev) * Math.sqrt(252);
}

export function calcConsistencyScore(trades: Trade[]): number {
  if (trades.length < 5) return 0;
  const pnls = trades.map(t => t.pnl);
  const mean = pnls.reduce((a, b) => a + b, 0) / pnls.length;
  if (mean <= 0) return 0;
  const stdDev = Math.sqrt(pnls.reduce((acc, p) => acc + (p - mean) ** 2, 0) / pnls.length);
  const cv = stdDev / Math.abs(mean);
  // Lower coefficient of variation = higher consistency
  const score = Math.max(0, Math.min(100, 100 - cv * 20));
  return Math.round(score);
}

export function getRecentResults(trades: Trade[], count = 10): ('win' | 'loss')[] {
  const sorted = [...trades].sort((a, b) =>
    new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
  );
  return sorted.slice(0, count).reverse().map(t => t.pnl >= 0 ? 'win' : 'loss');
}

export function calcStreaks(results: ('win' | 'loss')[]): { current: number; max: number } {
  if (results.length === 0) return { current: 0, max: 0 };
  let current = 1;
  let max = 1;
  const last = results[results.length - 1];
  for (let i = results.length - 2; i >= 0; i--) {
    if (results[i] === last) {
      current++;
      if (current > max) max = current;
    } else break;
  }
  return { current, max };
}

export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function clampPct(val: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, val));
}

export function holdTimeLabel(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}
