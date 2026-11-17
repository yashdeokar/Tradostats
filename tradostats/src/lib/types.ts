// ============================================================
// CORE TYPES
// ============================================================

export type Direction = 'Long' | 'Short';
export type Sentiment = 'positive' | 'negative';

// ============================================================
// PLAYBOOK TYPES
// ============================================================

export interface Setup {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  createdAt: string;
}

export interface Tag {
  id: string;
  name: string;
  sentiment: Sentiment;
  description?: string;
  createdAt: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  daysUsed: number;
  successDays: number;
  currentStreak: number;
  bestStreak: number;
}

// ============================================================
// TRADE TYPES
// ============================================================

export interface Trade {
  id: string;
  dateTime: string;
  instrument: string;
  direction: Direction;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  pnl: number;
  setupId?: string;
  tagIds: string[];
  notes: string;
  screenshots: string[];
  goalIds: string[];
  holdTime?: number; // in minutes
}

// ============================================================
// NOTES TYPES
// ============================================================

export interface DailyNote {
  id: string;
  date: string; // ISO date string
  content: string; // HTML content from Tiptap
  createdAt: string;
  updatedAt: string;
}

export interface StickyNote {
  id: string;
  content: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notebook {
  id: string;
  name: string;
  icon: string;
  createdAt: string;
  notes: NotebookNote[];
}

export interface NotebookNote {
  id: string;
  notebookId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// ANALYTICS / REPORT TYPES
// ============================================================

export interface TradeStats {
  totalTrades: number;
  winRate: number;
  profitFactor: number;
  totalPnl: number;
  grossProfit: number;
  grossLoss: number;
  avgWin: number;
  avgLoss: number;
  wins: number;
  losses: number;
  maxConsecutiveWins: number;
  maxConsecutiveLosses: number;
  maxDrawdown: number;
  expectancy: number;
  sharpeRatio: number;
  sortinoRatio: number;
  recoveryFactor: number;
  consistencyScore: number;
}

export interface SetupStats extends Setup {
  trades: number;
  wins: number;
  winRate: number;
  avgPnl: number;
  totalPnl: number;
  profitFactor: number;
  recentTrades: ('win' | 'loss')[];
}

export interface TagStats extends Tag {
  trades: number;
  wins: number;
  winRate: number;
  avgPnl: number;
}

export interface GoalStats extends Goal {
  successRate: number;
}

export interface DailyPerformance {
  date: string;
  pnl: number;
  trades: number;
  wins: number;
}

export interface EquityPoint {
  date: string;
  pnl: number;
  cumulative: number;
}

// ============================================================
// UI STATE TYPES
// ============================================================

export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  key: string;
  direction: SortDirection;
}

export interface FilterConfig {
  dateFrom?: string;
  dateTo?: string;
  instrument?: string;
  direction?: Direction;
  setupId?: string;
  tagIds?: string[];
}

// ============================================================
// AUTH & USER TYPES
// ============================================================

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  isDemo?: boolean;
}

