export interface SetupPlaybookRule {
  id: string;
  name: string;
  icon: string;
  color: string;
  category: 'Scalp' | 'Reversal' | 'Trend' | 'Breakout' | 'Order Flow';
  timeframe: string;
  regime: string;
  winRateTarget: string;
  riskReward: string;
  description: string;
  entryChecklist: string[];
  invalidation: string;
  targetStrategy: string;
}

export const SETUP_PLAYBOOK_DETAILS: Record<string, SetupPlaybookRule> = {
  '1 Tick': {
    id: 's1',
    name: '1 Tick',
    icon: '📊',
    color: '#10B981',
    category: 'Scalp',
    timeframe: '500-1000 Tick / 1-min',
    regime: 'Rangebound or S/R Re-tests',
    winRateTarget: '75%+',
    riskReward: '1:1.5 to 1:2',
    description: 'Precision entry scalping immediate rejection off high-volume nodes or key structural levels with minimal adverse excursion.',
    entryChecklist: [
      'Price taps key level (Prior Day High/Low, VWAP, or Major Pivot)',
      'Delta divergence or immediate absorption on footprint/DOM',
      'Entry placed 1 tick ahead of barrier with tight 2-3 tick stop',
      'No major macro news scheduled within next 10 minutes',
    ],
    invalidation: 'Break of level by more than 2 ticks or volume absorption fails.',
    targetStrategy: 'Scale 50% at 4 ticks, runner trailed to breakeven + 1 tick.',
  },
  'False Breakout': {
    id: 's2',
    name: 'False Breakout',
    icon: '📈',
    color: '#3B82F6',
    category: 'Reversal',
    timeframe: '5-min / 15-min',
    regime: 'Failed Auctions at Extreme Highs/Lows',
    winRateTarget: '68%+',
    riskReward: '1:2.5',
    description: 'Fading aggressive buyers/sellers who pushed beyond key resistance or support but failed to find continuation, causing trapped liquidity.',
    entryChecklist: [
      'Clean sweep of obvious swing high/low to grab stop liquidity',
      'Sharp rejection bar closing back INSIDE the previous range',
      'Declining volume on the breakout attempt followed by impulsive reversal volume',
      'Clear level of trapped traders who will be forced to cover',
    ],
    invalidation: 'Candle close outside the sweep extreme (high of false breakout wick).',
    targetStrategy: 'Target 1: VWAP / Midpoint; Target 2: Opposite range boundary.',
  },
  'Range Play': {
    id: 's3',
    name: 'Range Play',
    icon: '📊',
    color: '#8B5CF6',
    category: 'Scalp',
    timeframe: '5-min / 30-min',
    regime: 'Balance / Low Volatility Rotations',
    winRateTarget: '70%',
    riskReward: '1:2',
    description: 'Trading mean-reversion within clearly established Value Area High (VAH) and Value Area Low (VAL) boundaries during non-trend sessions.',
    entryChecklist: [
      'Market has established at least two clear touches of both high and low',
      'ADX below 25 indicating non-trending balance conditions',
      'Fade at extreme outer band (VAH/VAL) with reversal candlestick confirmation',
      'Examine volume profile POC as magnet target',
    ],
    invalidation: 'Strong initiative volume bar closing outside the range boundary.',
    targetStrategy: 'Exit 70% at Point of Control (POC), hold remainder to opposite boundary.',
  },
  'Volume Ledge': {
    id: 's4',
    name: 'Volume Ledge',
    icon: '🔄',
    color: '#F59E0B',
    category: 'Order Flow',
    timeframe: '5-min / Volume Profile',
    regime: 'Auction Re-tests',
    winRateTarget: '65%',
    riskReward: '1:2 to 1:3',
    description: 'Entries positioned at the steep drop-off of a High Volume Node (HVN) into a Low Volume Area (LVA), acting as a formidable shelf of support/resistance.',
    entryChecklist: [
      'Identify steep volume profile ledge formed over prior 24-48 hours',
      'Wait for orderly pullback into the ledge boundary',
      'Order flow shows aggressive orders absorbed at the ledge shelf',
      'Risk defined strictly behind the High Volume Node cluster',
    ],
    invalidation: 'Acceptance (2 consecutive 5-min closes) inside the Low Volume Area.',
    targetStrategy: 'Target next High Volume Node distribution peak.',
  },
  'Breakout': {
    id: 's5',
    name: 'Breakout',
    icon: '🚀',
    color: '#EF4444',
    category: 'Breakout',
    timeframe: '5-min / Hourly',
    regime: 'Expansion after Long Compression',
    winRateTarget: '55%',
    riskReward: '1:3+',
    description: 'Trading high-momentum expansion from prolonged multi-hour or multi-day compression with explosive volume and institutional participation.',
    entryChecklist: [
      'Squeeze / compression phase lasting at least 60-90 minutes',
      'Breakout bar has volume at least 2.5x higher than 20-period average',
      'Either enter on high-momentum break or first shallow 1-bar re-test',
      'Macro catalysts / market breadth aligning in breakout direction',
    ],
    invalidation: 'Immediate failure back into the compression consolidation zone.',
    targetStrategy: '100% measured move of consolidation height or trailing 9 EMA.',
  },
  'Moving Train': {
    id: 's6',
    name: 'Moving Train',
    icon: '🔄',
    color: '#EC4899',
    category: 'Trend',
    timeframe: '5-min / 15-min',
    regime: 'Strong Trend Day (Trend from Open)',
    winRateTarget: '65%+',
    riskReward: '1:2.5',
    description: 'Aggressive trend continuation entries on shallow pullbacks to 9/21 EMA or VWAP during persistent one-directional trend sessions.',
    entryChecklist: [
      'Higher highs and higher lows (or vice versa) respecting 20 EMA',
      'Cumulative volume delta (CVD) sloping steeply in trend direction',
      'Pullback contains low counter-trend volume (shallow consolidation)',
      'Trigger on break of pullback trendline in direction of master trend',
    ],
    invalidation: 'Closing candle on opposite side of VWAP or 21 EMA.',
    targetStrategy: 'Trail stops below swing pivots into market close.',
  },
};
