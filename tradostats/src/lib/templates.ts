// Predefined templates for Daily Notes

export const DEFAULT_TEMPLATE_MARKDOWN = `## Pre-Market Analysis
ES overnight range: ___. Key levels: ___ (major resistance), ___ (VWAP), ___ (support).
## Trade Plan
- Look for ___
- ___ play at ___ if clean
- No trades if range narrows below ___ points
## Post-Market Review
___ day. ___ trades, ___ winners. Followed the plan ___. Need to work on ___.
---
## Pre-Market Checklist
- [ ] Market profile / Macro filter / regime
- [ ] Daily weekly monthly POC / vah / val / anchored vwap / shape of profile
- [ ] Option flow GEX / DEX / volatility / correlation what market are in play
- [ ] Risk on / Risk off
## Post-Market Checklist
- [ ] Journal key trades
- [ ] Screenshot best/worst trade
- [ ] Review mistakes
- [ ] Did Post-Market Review
## Daily Report Card
**Grade**: ___
**Followed Plan**: Yes / No / Partially
**Emotional State**: ___
**Key Lesson**: ___`;

export const DEFAULT_TEMPLATE_HTML = `<h2>Pre-Market Analysis</h2>
<p>ES overnight range: ___. Key levels: ___ (major resistance), ___ (VWAP), ___ (support).</p>
<h2>Trade Plan</h2>
<ul>
  <li><p>Look for ___</p></li>
  <li><p>___ play at ___ if clean</p></li>
  <li><p>No trades if range narrows below ___ points</p></li>
</ul>
<h2>Post-Market Review</h2>
<p>___ day. ___ trades, ___ winners. Followed the plan ___. Need to work on ___.</p>
<hr>
<h2>Pre-Market Checklist</h2>
<ul data-type="taskList">
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Market profile / Macro filter / regime</p></div></li>
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Daily weekly monthly POC / vah / val / anchored vwap / shape of profile</p></div></li>
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Option flow GEX / DEX / volatility / correlation what market are in play</p></div></li>
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Risk on / Risk off</p></div></li>
</ul>
<h2>Post-Market Checklist</h2>
<ul data-type="taskList">
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Journal key trades</p></div></li>
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Screenshot best/worst trade</p></div></li>
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Review mistakes</p></div></li>
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Did Post-Market Review</p></div></li>
</ul>
<h2>Daily Report Card</h2>
<p><strong>Grade</strong>: ___</p>
<p><strong>Followed Plan</strong>: Yes / No / Partially</p>
<p><strong>Emotional State</strong>: ___</p>
<p><strong>Key Lesson</strong>: ___</p>`;

export const TEMPLATE_PRESETS = [
  {
    id: 'default',
    name: 'Full Trading Journal & Checklist (Default)',
    description: 'Comprehensive pre-market, trade plan, review, and dual checklists with report card',
    html: DEFAULT_TEMPLATE_HTML,
    markdown: DEFAULT_TEMPLATE_MARKDOWN,
  },
  {
    id: 'premarket',
    name: 'Pre-Market Preparation Only',
    description: 'Focus on levels, trade plans, and macro regime checklist',
    html: `<h2>Pre-Market Analysis</h2>
<p>ES overnight range: ___. Key levels: ___ (major resistance), ___ (VWAP), ___ (support).</p>
<h2>Trade Plan</h2>
<ul>
  <li><p>Look for ___</p></li>
  <li><p>___ play at ___ if clean</p></li>
  <li><p>No trades if range narrows below ___ points</p></li>
</ul>
<h2>Pre-Market Checklist</h2>
<ul data-type="taskList">
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Market profile / Macro filter / regime</p></div></li>
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Daily weekly monthly POC / vah / val / anchored vwap / shape of profile</p></div></li>
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Option flow GEX / DEX / volatility / correlation what market are in play</p></div></li>
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Risk on / Risk off</p></div></li>
</ul>`,
    markdown: `## Pre-Market Analysis
ES overnight range: ___. Key levels: ___ (major resistance), ___ (VWAP), ___ (support).
## Trade Plan
- Look for ___
- ___ play at ___ if clean
- No trades if range narrows below ___ points
## Pre-Market Checklist
- [ ] Market profile / Macro filter / regime
- [ ] Daily weekly monthly POC / vah / val / anchored vwap / shape of profile
- [ ] Option flow GEX / DEX / volatility / correlation what market are in play
- [ ] Risk on / Risk off`,
  },
  {
    id: 'postmarket',
    name: 'Post-Market Review & Report Card',
    description: 'Trade performance debrief, review checklist, and emotional assessment',
    html: `<h2>Post-Market Review</h2>
<p>___ day. ___ trades, ___ winners. Followed the plan ___. Need to work on ___.</p>
<h2>Post-Market Checklist</h2>
<ul data-type="taskList">
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Journal key trades</p></div></li>
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Screenshot best/worst trade</p></div></li>
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Review mistakes</p></div></li>
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Did Post-Market Review</p></div></li>
</ul>
<h2>Daily Report Card</h2>
<p><strong>Grade</strong>: ___</p>
<p><strong>Followed Plan</strong>: Yes / No / Partially</p>
<p><strong>Emotional State</strong>: ___</p>
<p><strong>Key Lesson</strong>: ___</p>`,
    markdown: `## Post-Market Review
___ day. ___ trades, ___ winners. Followed the plan ___. Need to work on ___.
## Post-Market Checklist
- [ ] Journal key trades
- [ ] Screenshot best/worst trade
- [ ] Review mistakes
- [ ] Did Post-Market Review
## Daily Report Card
**Grade**: ___
**Followed Plan**: Yes / No / Partially
**Emotional State**: ___
**Key Lesson**: ___`,
  },
  {
    id: 'checklists',
    name: 'Execution Checklists Only',
    description: 'Pre-market and post-market discipline and execution checklists',
    html: `<h2>Pre-Market Checklist</h2>
<ul data-type="taskList">
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Market profile / Macro filter / regime</p></div></li>
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Daily weekly monthly POC / vah / val / anchored vwap / shape of profile</p></div></li>
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Option flow GEX / DEX / volatility / correlation what market are in play</p></div></li>
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Risk on / Risk off</p></div></li>
</ul>
<h2>Post-Market Checklist</h2>
<ul data-type="taskList">
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Journal key trades</p></div></li>
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Screenshot best/worst trade</p></div></li>
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Review mistakes</p></div></li>
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Did Post-Market Review</p></div></li>
</ul>`,
    markdown: `## Pre-Market Checklist
- [ ] Market profile / Macro filter / regime
- [ ] Daily weekly monthly POC / vah / val / anchored vwap / shape of profile
- [ ] Option flow GEX / DEX / volatility / correlation what market are in play
- [ ] Risk on / Risk off
## Post-Market Checklist
- [ ] Journal key trades
- [ ] Screenshot best/worst trade
- [ ] Review mistakes
- [ ] Did Post-Market Review`,
  },
];

/**
 * Basic markdown to HTML converter for custom user templates from settings
 */
export function markdownToHtml(md: string): string {
  if (!md) return '';
  const lines = md.split('\n');
  let inTaskList = false;
  let inUl = false;
  const out: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Check for task item: - [ ] or - [x]
    const taskMatch = trimmed.match(/^-\s*\[([ xX])\]\s*(.+)$/);
    if (taskMatch) {
      if (inUl) {
        out.push('</ul>');
        inUl = false;
      }
      if (!inTaskList) {
        out.push('<ul data-type="taskList">');
        inTaskList = true;
      }
      const checked = taskMatch[1].toLowerCase() === 'x';
      const text = taskMatch[2];
      out.push(
        `<li data-type="taskItem" data-checked="${checked}"><label><input type="checkbox"${checked ? ' checked' : ''}><span></span></label><div><p>${formatInline(text)}</p></div></li>`
      );
      continue;
    }

    // Check for standard bullet: - text
    const bulletMatch = trimmed.match(/^-\s+(.+)$/);
    if (bulletMatch) {
      if (inTaskList) {
        out.push('</ul>');
        inTaskList = false;
      }
      if (!inUl) {
        out.push('<ul>');
        inUl = true;
      }
      out.push(`<li><p>${formatInline(bulletMatch[1])}</p></li>`);
      continue;
    }

    // Close any open lists
    if (inTaskList) {
      out.push('</ul>');
      inTaskList = false;
    }
    if (inUl) {
      out.push('</ul>');
      inUl = false;
    }

    if (trimmed.startsWith('### ')) {
      out.push(`<h3>${formatInline(trimmed.slice(4))}</h3>`);
    } else if (trimmed.startsWith('## ')) {
      out.push(`<h2>${formatInline(trimmed.slice(3))}</h2>`);
    } else if (trimmed.startsWith('# ')) {
      out.push(`<h1>${formatInline(trimmed.slice(2))}</h1>`);
    } else if (trimmed === '---') {
      out.push('<hr>');
    } else if (trimmed === '') {
      // Empty line
    } else {
      out.push(`<p>${formatInline(trimmed)}</p>`);
    }
  }

  if (inTaskList) out.push('</ul>');
  if (inUl) out.push('</ul>');

  return out.join('\n');
}

function formatInline(str: string): string {
  return str
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}
