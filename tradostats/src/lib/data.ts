import type { Setup, Tag, Goal, Trade, DailyNote, Notebook } from './types';
import { generateId } from './utils';

// ============================================================
// SETUPS SEED DATA
// ============================================================
export const seedSetups: Setup[] = [
  { id: 's1', name: '1 Tick', icon: '📊', color: '#10b981', description: 'Scalping 1 tick moves at key levels', createdAt: '2025-01-10T09:00:00Z' },
  { id: 's2', name: 'False Breakout', icon: '📈', color: '#3b82f6', description: 'Fading failed breakouts at key resistance/support', createdAt: '2025-01-11T09:00:00Z' },
  { id: 's3', name: 'Range Play', icon: '📊', color: '#8b5cf6', description: 'Trading mean reversion within established ranges', createdAt: '2025-01-12T09:00:00Z' },
  { id: 's4', name: 'Volume Ledge', icon: '🔄', color: '#f59e0b', description: 'Entries at volume profile ledges with strong imbalance', createdAt: '2025-01-13T09:00:00Z' },
  { id: 's5', name: 'Breakout', icon: '🚀', color: '#ef4444', description: 'Momentum breakout above key resistance with volume', createdAt: '2025-01-14T09:00:00Z' },
  { id: 's6', name: 'Moving Train', icon: '🔄', color: '#ec4899', description: 'Trending continuation entries on pullbacks', createdAt: '2025-01-15T09:00:00Z' },
];

// ============================================================
// TAGS SEED DATA
// ============================================================
export const seedTags: Tag[] = [
  { id: 't1', name: 'A+', sentiment: 'positive', description: 'High-confidence A+ setup', createdAt: '2025-01-10T09:00:00Z' },
  { id: 't2', name: 'Anxiety/Emotional', sentiment: 'negative', description: 'Traded while emotionally compromised', createdAt: '2025-01-10T09:00:00Z' },
  { id: 't3', name: 'B', sentiment: 'positive', description: 'Above average quality setup', createdAt: '2025-01-10T09:00:00Z' },
  { id: 't4', name: 'Bad Read', sentiment: 'negative', description: 'Misread market direction or context', createdAt: '2025-01-10T09:00:00Z' },
  { id: 't5', name: 'C', sentiment: 'positive', description: 'Average quality, tradeable setup', createdAt: '2025-01-10T09:00:00Z' },
  { id: 't6', name: 'Confused', sentiment: 'negative', description: 'Unclear thesis going into trade', createdAt: '2025-01-10T09:00:00Z' },
  { id: 't7', name: 'FOMO', sentiment: 'negative', description: 'Chased a move out of fear of missing out', createdAt: '2025-01-10T09:00:00Z' },
  { id: 't8', name: 'Patient Entry', sentiment: 'positive', description: 'Waited for ideal entry confirmation', createdAt: '2025-01-10T09:00:00Z' },
  { id: 't9', name: 'Revenge Trade', sentiment: 'negative', description: 'Traded to recover losses impulsively', createdAt: '2025-01-10T09:00:00Z' },
  { id: 't10', name: 'Disciplined', sentiment: 'positive', description: 'Followed trading plan strictly', createdAt: '2025-01-10T09:00:00Z' },
];

// ============================================================
// GOALS SEED DATA
// ============================================================
export const seedGoals: Goal[] = [
  { id: 'g1', title: 'Break every 15 min and reflect', description: 'Reflect on setups and emotional state regularly', createdAt: '2025-01-10T09:00:00Z', daysUsed: 5, successDays: 1, currentStreak: 0, bestStreak: 1 },
  { id: 'g2', title: 'Follow risk rules', description: 'Never risk more than 1% per trade', createdAt: '2025-01-10T09:00:00Z', daysUsed: 20, successDays: 7, currentStreak: 0, bestStreak: 3 },
  { id: 'g3', title: 'No revenge trading', description: 'Stop trading after 2 consecutive losses', createdAt: '2025-01-10T09:00:00Z', daysUsed: 5, successDays: 4, currentStreak: 2, bestStreak: 4 },
];

// ============================================================
// TRADES SEED DATA  
// ============================================================
function makeTrade(
  id: string, date: string, instrument: string,
  direction: 'Long' | 'Short', entry: number, exit: number,
  qty: number, setupId: string, tagIds: string[], goalIds: string[], notes = ''
): Trade {
  const pnl = direction === 'Long'
    ? (exit - entry) * qty
    : (entry - exit) * qty;
  return { id, dateTime: date, instrument, direction, entryPrice: entry, exitPrice: exit, quantity: qty, pnl, setupId, tagIds, notes, screenshots: [], goalIds, holdTime: Math.floor(Math.random() * 60) + 5 };
}

export const seedTrades: Trade[] = [
  makeTrade('tr1', '2025-05-27T09:35:00Z', 'ES', 'Long', 5302.25, 5308.50, 2, 's2', ['t1', 't10'], ['g2', 'g3'], 'Clean false breakout below VWAP, snapped back quickly'),
  makeTrade('tr2', '2025-05-27T10:15:00Z', 'NQ', 'Short', 18450.00, 18430.25, 1, 's5', ['t2'], ['g2'], 'Chased breakout, emotionally charged after first win'),
  makeTrade('tr3', '2025-05-28T09:45:00Z', 'ZB', 'Long', 115.25, 115.09, 3, 's3', ['t4', 't6'], [], 'Bad read on bond direction, cut loss quickly'),
  makeTrade('tr4', '2025-05-28T10:30:00Z', 'ES', 'Short', 5315.00, 5308.75, 2, 's1', ['t8', 't10'], ['g1', 'g2', 'g3'], 'Perfect 1-tick entry, patient for confirmation'),
  makeTrade('tr5', '2025-05-29T09:31:00Z', 'NQ', 'Long', 18510.75, 18530.00, 1, 's6', ['t1', 't8'], ['g2', 'g3'], 'Moving train pullback, held for full move'),
  makeTrade('tr6', '2025-05-29T11:00:00Z', 'ES', 'Long', 5320.50, 5315.25, 2, 's4', ['t7'], ['g2'], 'FOMO entry on volume ledge, stopped out'),
  makeTrade('tr7', '2025-05-30T09:40:00Z', 'ZN', 'Short', 109.125, 109.0625, 4, 's2', ['t1', 't10'], ['g1', 'g2', 'g3'], 'False breakout above overnight high, clean entry'),
  makeTrade('tr8', '2025-05-30T10:50:00Z', 'ES', 'Long', 5325.75, 5332.00, 2, 's5', ['t3', 't8'], ['g2'], 'B-grade breakout setup, decent follow-through'),
  makeTrade('tr9', '2025-06-02T09:35:00Z', 'NQ', 'Short', 18620.00, 18598.25, 1, 's3', ['t4'], ['g3'], 'Range fade near resistance, small profit'),
  makeTrade('tr10', '2025-06-02T10:20:00Z', 'ES', 'Long', 5340.25, 5348.50, 2, 's1', ['t1', 't10'], ['g1', 'g2', 'g3'], 'A+ 1-tick setup, best trade of the week'),
  makeTrade('tr11', '2025-06-03T09:45:00Z', 'ZB', 'Short', 115.00, 115.20, 3, 's6', ['t9'], ['g2'], 'Revenge trade after losing morning session'),
  makeTrade('tr12', '2025-06-03T11:15:00Z', 'ES', 'Short', 5352.00, 5345.75, 2, 's2', ['t1', 't10'], ['g1', 'g2', 'g3'], 'False breakout above HOD, excellent risk/reward'),
  makeTrade('tr13', '2025-06-04T09:30:00Z', 'NQ', 'Long', 18780.00, 18810.25, 1, 's5', ['t3'], ['g2'], 'Breakout of morning range, solid momentum'),
  makeTrade('tr14', '2025-06-04T10:45:00Z', 'ES', 'Long', 5360.50, 5355.25, 2, 's4', ['t6', 't7'], [], 'Confused about market direction, FOMO entry'),
  makeTrade('tr15', '2025-06-05T09:35:00Z', 'ZN', 'Short', 109.3125, 109.25, 4, 's1', ['t1', 't8', 't10'], ['g1', 'g2', 'g3'], 'A+ 1-tick at major level, perfect execution'),
  makeTrade('tr16', '2025-06-09T09:40:00Z', 'ES', 'Long', 5375.00, 5383.25, 2, 's6', ['t1', 't10'], ['g1', 'g2'], 'Moving train pullback, great momentum day'),
  makeTrade('tr17', '2025-06-10T10:00:00Z', 'NQ', 'Short', 18950.25, 18930.00, 1, 's3', ['t8'], ['g2', 'g3'], 'Range play at top of range, held for full target'),
  makeTrade('tr18', '2025-06-11T09:35:00Z', 'ES', 'Long', 5380.75, 5374.50, 2, 's2', ['t2', 't4'], [], 'Anxious entry, poor read on false breakout direction'),
  makeTrade('tr19', '2025-06-12T09:45:00Z', 'ZB', 'Long', 114.75, 114.875, 3, 's4', ['t1', 't8'], ['g1', 'g2', 'g3'], 'Volume ledge entry, patient and disciplined'),
  makeTrade('tr20', '2025-06-13T10:30:00Z', 'ES', 'Short', 5395.00, 5388.25, 2, 's5', ['t3', 't10'], ['g2'], 'B-grade breakout fade, decent follow-through'),
  // More trades...
  makeTrade('tr21', '2025-06-16T09:35:00Z', 'NQ', 'Long', 19050.00, 19075.25, 1, 's6', ['t1', 't10'], ['g1', 'g2', 'g3'], 'Moving train, ideal pullback entry'),
  makeTrade('tr22', '2025-06-17T10:15:00Z', 'ES', 'Short', 5410.25, 5420.00, 2, 's1', ['t7', 't9'], [], 'FOMO short, missed the actual setup'),
  makeTrade('tr23', '2025-06-18T09:40:00Z', 'ZN', 'Long', 109.5, 109.5625, 4, 's2', ['t1', 't8', 't10'], ['g1', 'g2', 'g3'], 'Excellent false breakout below support'),
  makeTrade('tr24', '2025-06-19T10:00:00Z', 'ES', 'Long', 5425.00, 5432.75, 2, 's5', ['t3'], ['g2'], 'Clean breakout, followed plan precisely'),
  makeTrade('tr25', '2025-06-20T09:35:00Z', 'NQ', 'Short', 19120.25, 19098.50, 1, 's3', ['t1', 't10'], ['g1', 'g2', 'g3'], 'Range sell at top, disciplined exit'),
  makeTrade('tr26', '2025-06-23T09:45:00Z', 'ES', 'Long', 5440.50, 5435.75, 2, 's4', ['t4', 't6'], [], 'Poor read on volume ledge direction'),
  makeTrade('tr27', '2025-06-24T10:30:00Z', 'ZB', 'Short', 115.5, 115.375, 3, 's6', ['t1', 't8'], ['g1', 'g2', 'g3'], 'Moving train continuation short'),
  makeTrade('tr28', '2025-06-25T09:35:00Z', 'ES', 'Long', 5452.25, 5460.00, 2, 's2', ['t1', 't10'], ['g1', 'g2'], 'False breakout below daily low, snapped back'),
  makeTrade('tr29', '2025-06-26T10:00:00Z', 'NQ', 'Long', 19200.00, 19185.25, 1, 's5', ['t2'], ['g3'], 'Anxiety caused premature exit, missed target'),
  // 2026 Recent & Current Month Trades (September 2026)
  makeTrade('tr31', '2026-09-02T10:00:00Z', 'ES', 'Long', 5620.00, 5626.25, 2, 's1', ['t1', 't10'], ['g1', 'g2', 'g3'], 'Clean 1-tick breakout test'),
  makeTrade('tr32', '2026-09-03T09:35:00Z', 'NQ', 'Short', 19850.00, 19875.00, 1, 's5', ['t4'], ['g2'], 'Breakout failed, stopped out on quick squeeze'),
  makeTrade('tr33', '2026-09-04T10:30:00Z', 'ES', 'Long', 5635.50, 5642.00, 2, 's2', ['t1', 't8'], ['g1', 'g2', 'g3'], 'False breakdown below VWAP reversal'),
  makeTrade('tr34', '2026-09-08T09:40:00Z', 'ZB', 'Long', 118.25, 118.40, 3, 's4', ['t3', 't10'], ['g2'], 'Volume ledge bounce at morning support'),
  makeTrade('tr35', '2026-09-10T09:30:00Z', 'NQ', 'Long', 19920.00, 19965.00, 1, 's6', ['t1', 't10'], ['g1', 'g2', 'g3'], 'Moving train continuation, strong trend day'),
  makeTrade('tr36', '2026-09-11T10:15:00Z', 'ES', 'Short', 5650.00, 5654.50, 2, 's3', ['t2'], ['g3'], 'Tried to fade range early, took quick small loss'),
  makeTrade('tr37', '2026-09-15T09:35:00Z', 'ES', 'Long', 5662.25, 5669.25, 2, 's2', ['t1', 't8'], ['g1', 'g2', 'g3'], 'Patient false breakout entry at support'),
  makeTrade('tr38', '2026-09-16T10:00:00Z', 'NQ', 'Short', 20050.00, 20025.00, 1, 's3', ['t1', 't10'], ['g2', 'g3'], 'Clean range play off daily high resistance'),
  makeTrade('tr39', '2026-09-17T09:45:00Z', 'ES', 'Short', 5675.00, 5680.50, 2, 's5', ['t7'], ['g2'], 'FOMO short on morning spike, disciplined cut'),
  makeTrade('tr40', '2026-09-18T10:20:00Z', 'ES', 'Long', 5682.00, 5691.00, 2, 's1', ['t1', 't10'], ['g1', 'g2', 'g3'], 'A+ 1-tick scalp off prior day POC'),
  makeTrade('tr41', '2026-09-22T09:30:00Z', 'NQ', 'Long', 20120.00, 20148.00, 1, 's6', ['t1', 't8'], ['g2', 'g3'], 'Strong momentum pullback to VWAP'),
  makeTrade('tr42', '2026-09-23T11:00:00Z', 'ES', 'Long', 5705.50, 5712.50, 2, 's2', ['t1', 't10'], ['g1', 'g2', 'g3'], 'False breakout sweep of morning lows'),
  makeTrade('tr43', '2026-09-24T09:40:00Z', 'ZB', 'Short', 119.10, 119.25, 3, 's4', ['t4'], ['g2'], 'Volume ledge test failed, cut loss promptly'),
  makeTrade('tr44', '2026-09-25T10:15:00Z', 'ES', 'Short', 5722.00, 5716.00, 2, 's3', ['t1', 't10'], ['g1', 'g2', 'g3'], 'Faded double top at resistance for clean target'),
  makeTrade('tr45', '2026-09-27T09:35:00Z', 'ES', 'Long', 5730.00, 5737.50, 2, 's1', ['t1', 't10'], ['g1', 'g2', 'g3'], 'Execution off daily pivot, excellent confirmation'),
  makeTrade('tr46', '2026-09-27T10:45:00Z', 'NQ', 'Long', 20280.00, 20265.00, 1, 's5', ['t3'], ['g2'], 'Breakout retraced, took calculated small stop'),
  makeTrade('tr47', '2026-09-27T11:30:00Z', 'ES', 'Long', 5732.25, 5739.00, 2, 's2', ['t1', 't8'], ['g1', 'g2', 'g3'], 'False breakout bounce off VWAP into afternoon session'),
];

// ============================================================
// DAILY NOTES SEED DATA
// ============================================================
export const seedNotes: DailyNote[] = [
  {
    id: 'n0',
    date: '2026-09-27',
    content: `<h2>Pre-Market Analysis</h2>
<p>ES overnight range: 5720-5745. Key levels: 5740 (major resistance), 5732 (VWAP), 5722 (support).</p>
<h2>Trade Plan</h2>
<ul>
  <li><p>Look for false breakout above 5740</p></li>
  <li><p>1-tick bounce play at 5730 if clean</p></li>
  <li><p>No trades if range narrows below 10 points</p></li>
</ul>
<h2>Post-Market Review</h2>
<p>Strong green day. 3 trades, 2 winners. Followed the plan well. Need to work on trailing runner position longer.</p>
<hr>
<h2>Pre-Market Checklist</h2>
<ul data-type="taskList">
  <li data-type="taskItem" data-checked="true"><label><input type="checkbox" checked><span></span></label><div><p>Market profile / Macro filter / regime</p></div></li>
  <li data-type="taskItem" data-checked="true"><label><input type="checkbox" checked><span></span></label><div><p>Daily weekly monthly POC / vah / val / anchored vwap / shape of profile</p></div></li>
  <li data-type="taskItem" data-checked="true"><label><input type="checkbox" checked><span></span></label><div><p>Option flow GEX / DEX / volatility / correlation what market are in play</p></div></li>
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Risk on / Risk off</p></div></li>
</ul>
<h2>Post-Market Checklist</h2>
<ul data-type="taskList">
  <li data-type="taskItem" data-checked="true"><label><input type="checkbox" checked><span></span></label><div><p>Journal key trades</p></div></li>
  <li data-type="taskItem" data-checked="true"><label><input type="checkbox" checked><span></span></label><div><p>Screenshot best/worst trade</p></div></li>
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Review mistakes</p></div></li>
  <li data-type="taskItem" data-checked="true"><label><input type="checkbox" checked><span></span></label><div><p>Did Post-Market Review</p></div></li>
</ul>
<h2>Daily Report Card</h2>
<p><strong>Grade</strong>: A-</p>
<p><strong>Followed Plan</strong>: Yes</p>
<p><strong>Emotional State</strong>: Calm and disciplined</p>
<p><strong>Key Lesson</strong>: Trust the level and wait for the pullback confirmation.</p>`,
    createdAt: '2026-09-27T08:00:00Z',
    updatedAt: '2026-09-27T16:30:00Z',
  },
  {
    id: 'n1',
    date: '2025-07-14',
    content: '<h2>Pre-Market Analysis</h2><p>ES overnight range: 5480-5510. Key levels: 5500 (major resistance), 5485 (VWAP), 5475 (support).</p><h2>Trade Plan</h2><ul><li>Look for false breakout above 5500</li><li>Volume ledge play at 5485 if clean</li><li>No trades if range narrows below 15 points</li></ul><h2>Post-Market Review</h2><p>Solid day. 3 trades, 2 winners. Followed the plan well. Need to work on being more patient at resistance.</p>',
    createdAt: '2025-07-14T08:00:00Z',
    updatedAt: '2025-07-14T16:30:00Z',
  },
  {
    id: 'n2',
    date: '2025-07-11',
    content: '<h2>Pre-Market</h2><p>FOMC day - expect high volatility. Reduced position size to 1 contract for all setups. Will wait 30 min after announcement before trading.</p><h2>Post-Market</h2><p>Good discipline today. Sat on hands during announcement, took clean false breakout after dust settled. Best trade of the week.</p>',
    createdAt: '2025-07-11T08:00:00Z',
    updatedAt: '2025-07-11T17:00:00Z',
  },
  {
    id: 'n3',
    date: '2025-07-10',
    content: '<h2>Market Context</h2><p>Trending day from the open. Moving train setups dominant. No range play opportunities.</p><p>Emotional note: Felt anxious about missing the open move. Took a 5-min break and reset before entering.</p>',
    createdAt: '2025-07-10T08:00:00Z',
    updatedAt: '2025-07-10T16:00:00Z',
  },
  {
    id: 'n4',
    date: '2025-07-09',
    content: '<h2>Post-Market Reflection</h2><p>Tough day. Made 3 mistakes: (1) chased the opening move, (2) took a C-grade setup as my first trade, (3) held a loser too long hoping it would come back. Total P&L: -$850.</p><h2>Lessons</h2><ul><li>Wait for A+ or B setups only at the open</li><li>Honor stop losses immediately</li><li>Take a 15-min break after a loss > $300</li></ul>',
    createdAt: '2025-07-09T08:00:00Z',
    updatedAt: '2025-07-09T17:30:00Z',
  },
  {
    id: 'n5',
    date: '2025-07-08',
    content: '<h2>Weekly Review - Week of July 7</h2><p>Net P&L: +$1,240. Win rate: 65%. Best trade: ES false breakout on Tuesday (+$620). Worst trade: NQ FOMO long on Wednesday (-$380).</p><h2>Focus for Next Week</h2><ul><li>Eliminate FOMO trades completely</li><li>Review 1-tick setup criteria before market open daily</li></ul>',
    createdAt: '2025-07-08T08:00:00Z',
    updatedAt: '2025-07-08T18:00:00Z',
  },
  {
    id: 'n6',
    date: '2025-06-26',
    content: '<h2>Pre-Market</h2><p>End of quarter positioning. Expect unusual order flow. Reduce size by 50%, focus on quality over quantity.</p>',
    createdAt: '2025-06-26T08:00:00Z',
    updatedAt: '2025-06-26T15:00:00Z',
  },
];

// ============================================================
// NOTEBOOKS SEED DATA
// ============================================================
export const seedNotebooks: Notebook[] = [
  {
    id: 'nb1',
    name: 'Strategy Ideas',
    icon: '💡',
    createdAt: '2025-01-10T09:00:00Z',
    notes: [
      {
        id: 'nbn1',
        notebookId: 'nb1',
        title: 'Volume Profile Edge',
        content: '<p>Key insight: high-volume nodes act as magnets. Fade moves into low-volume areas for high R:R.</p>',
        createdAt: '2025-02-01T09:00:00Z',
        updatedAt: '2025-02-01T09:00:00Z',
      },
    ],
  },
  {
    id: 'nb2',
    name: 'Psychology Notes',
    icon: '🧠',
    createdAt: '2025-01-15T09:00:00Z',
    notes: [
      {
        id: 'nbn2',
        notebookId: 'nb2',
        title: 'Managing Losing Streaks',
        content: '<p>After 3 consecutive losses: stop for the day. Review each trade. Sleep on it. Return tomorrow fresh.</p>',
        createdAt: '2025-02-10T09:00:00Z',
        updatedAt: '2025-02-10T09:00:00Z',
      },
    ],
  },
];

// ============================================================
// GOAL TEMPLATE DATA
// ============================================================
export const goalTemplates = [
  { title: 'Follow Risk Rules', description: 'Never risk more than 1% per trade' },
  { title: 'No Revenge Trading', description: 'Stop trading after 2 consecutive losses' },
  { title: 'Pre-Market Review', description: 'Review key levels and trade plan before open' },
  { title: 'Post-Market Journal', description: 'Write daily note before closing platform' },
  { title: 'Meditate Before Market', description: 'Center yourself with 5 min meditation' },
  { title: 'Exercise Before Trading', description: 'Complete morning exercise routine' },
  { title: 'Honor Stop Losses', description: 'Exit at pre-defined stop, no exceptions' },
  { title: 'A+ Setups Only', description: 'Only take highest quality setups' },
  { title: 'Take Breaks', description: 'Step away every 90 minutes during session' },
  { title: 'Size Down After Loss', description: 'Reduce position size 50% after first loss' },
];
