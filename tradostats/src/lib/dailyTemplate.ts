export const RAW_DAILY_MARKDOWN_TEMPLATE = `# 🌅 PRE-MARKET PLAN & CHECKLIST

## 🔍 Pre-Market Analysis Checklist:
- [ ] **Macro Data & News:** (CPI, FOMC, Fed speakers, Yields, DXY, earnings catalysts)
- [ ] **Market Profile:** (Prior VAH / POC / VAL, Overnight High/Low, Balance vs Imbalance, Poor Highs/Lows)
- [ ] **Options Flow:** (Key Gamma levels, Call/Put Walls, 0DTE flow, Net GEX regime)
- [ ] **Orderflow:** (Key volume profile ledges, delta absorption levels, liquidity pools to target)

## 🎯 Today's Scenarios & Game Plan:
*Bias:* Bullish / Bearish / Neutral Range  
*Key Levels to Watch:*  
- Level 1: 
- Level 2: 
*Trade Ideas:*

*(Paste your Pre-Market Chart screenshots below with Ctrl+V)*
---

# ⚡ DURING SESSION (LIVE EXECUTION)

*(Log your live trades, mental checkpoints, and paste execution screenshots as they happen)*

- **[09:30 AM]** Market Open observations:
- **Trade 1 Entry & Rationale:** 
- **Emotions / Mid-Trade Notes:** 

---

# 🏆 DAILY REPORT CARD (DRC)

## 📊 Discipline & Execution Checklist:
- [ ] Waited patiently for confirmed setup (No FOMO / early chasing)
- [ ] Respected hard stop loss & maximum daily loss limit
- [ ] Sized positions correctly according to risk plan
- [ ] Took recommended breaks (Walked away after tough trade)
- [ ] Zero revenge trades or impulsive adds

## 📝 End of Day Reflection:
- **What went well today?** 
- **What mistakes or rules were bent?** 
- **One key lesson to carry into tomorrow:**
`;

export function getDailyMarkdownTemplate(dateStr?: string): string {
  return `
<h1>🌅 PRE-MARKET PLAN &amp; CHECKLIST</h1>

<h2>🔍 Pre-Market Analysis Checklist:</h2>
<ul data-type="taskList">
  <li data-type="taskItem" data-checked="false">
    <label><input type="checkbox"><span></span></label>
    <div><p><strong>Macro Data &amp; News:</strong> (CPI, FOMC, Fed speakers, Yields, DXY, earnings catalysts)</p></div>
  </li>
  <li data-type="taskItem" data-checked="false">
    <label><input type="checkbox"><span></span></label>
    <div><p><strong>Market Profile:</strong> (Prior VAH / POC / VAL, Overnight High/Low, Balance vs Imbalance, Poor Highs/Lows)</p></div>
  </li>
  <li data-type="taskItem" data-checked="false">
    <label><input type="checkbox"><span></span></label>
    <div><p><strong>Options Flow:</strong> (Key Gamma levels, Call/Put Walls, 0DTE flow, Net GEX regime)</p></div>
  </li>
  <li data-type="taskItem" data-checked="false">
    <label><input type="checkbox"><span></span></label>
    <div><p><strong>Orderflow:</strong> (Key volume profile ledges, delta absorption levels, liquidity pools to target)</p></div>
  </li>
</ul>

<h2>🎯 Today's Scenarios &amp; Game Plan:</h2>
<p><em>Bias:</em> Bullish / Bearish / Neutral Range</p>
<p><em>Key Levels to Watch:</em></p>
<ul>
  <li><p>Level 1: </p></li>
  <li><p>Level 2: </p></li>
</ul>
<p><em>Trade Ideas:</em></p>
<p><em>(Paste your Pre-Market Chart screenshots below with Ctrl+V)</em></p>

<hr/>

<h1>⚡ DURING SESSION (LIVE EXECUTION)</h1>
<p><em>(Log your live trades, mental checkpoints, and paste execution screenshots as they happen)</em></p>
<ul>
  <li><p><strong>[09:30 AM]</strong> Market Open observations: </p></li>
  <li><p><strong>Trade 1 Entry &amp; Rationale:</strong> </p></li>
  <li><p><strong>Emotions / Mid-Trade Notes:</strong> </p></li>
</ul>

<hr/>

<h1>🏆 DAILY REPORT CARD (DRC)</h1>

<h2>📊 Discipline &amp; Execution Checklist:</h2>
<ul data-type="taskList">
  <li data-type="taskItem" data-checked="false">
    <label><input type="checkbox"><span></span></label>
    <div><p>Waited patiently for confirmed setup (No FOMO / early chasing)</p></div>
  </li>
  <li data-type="taskItem" data-checked="false">
    <label><input type="checkbox"><span></span></label>
    <div><p>Respected hard stop loss &amp; maximum daily loss limit</p></div>
  </li>
  <li data-type="taskItem" data-checked="false">
    <label><input type="checkbox"><span></span></label>
    <div><p>Sized positions correctly according to risk plan</p></div>
  </li>
  <li data-type="taskItem" data-checked="false">
    <label><input type="checkbox"><span></span></label>
    <div><p>Took recommended breaks (Walked away after tough trade)</p></div>
  </li>
  <li data-type="taskItem" data-checked="false">
    <label><input type="checkbox"><span></span></label>
    <div><p>Zero revenge trades or impulsive adds</p></div>
  </li>
</ul>

<h2>📝 End of Day Reflection:</h2>
<ul>
  <li><p><strong>What went well today?</strong> </p></li>
  <li><p><strong>What mistakes or rules were bent?</strong> </p></li>
  <li><p><strong>One key lesson to carry into tomorrow:</strong> </p></li>
</ul>
`.trim();
}
