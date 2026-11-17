'use client';
import { useState } from 'react';
import { useStore } from '@/lib/store';
import { DEFAULT_TEMPLATE_MARKDOWN, DEFAULT_TEMPLATE_HTML, TEMPLATE_PRESETS, markdownToHtml } from '@/lib/templates';
import { Save, RotateCcw, Check, Palette, FileText, Sliders, Settings as SettingsIcon } from 'lucide-react';

export default function SettingsPage() {
  const {
    dailyNoteTemplateMarkdown,
    updateDailyNoteTemplate,
    resetDailyNoteTemplate,
  } = useStore();

  const [templateText, setTemplateText] = useState(dailyNoteTemplateMarkdown || DEFAULT_TEMPLATE_MARKDOWN);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'template' | 'palette' | 'general'>('template');

  function handleSaveTemplate() {
    const html = markdownToHtml(templateText);
    updateDailyNoteTemplate(templateText, html);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  }

  function handleResetTemplate() {
    if (confirm('Reset template to original predefined template?')) {
      resetDailyNoteTemplate();
      setTemplateText(DEFAULT_TEMPLATE_MARKDOWN);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  }

  function handleLoadPreset(markdown: string) {
    setTemplateText(markdown);
  }

  const paletteItems = [
    { element: 'Canvas / Ground', hex: '#0c0e12', desc: 'Ink charcoal deep background' },
    { element: 'Navigation Sidebar', hex: '#0e1116', desc: 'Dignified hairline ledger sidebar' },
    { element: 'Cards / Panels', hex: '#13171f', desc: 'Actuarial ledger cards & telemetry tiles' },
    { element: 'Secondary Surface', hex: '#171c26', desc: 'Raised panel wells & search bars' },
    { element: 'Actuarial Vellum', hex: '#d4c5a0', desc: 'Warm parchment accent & audited indicators' },
    { element: 'Credit / Profit', hex: '#10b981', desc: 'Disciplined ledger green for gains & win rates' },
    { element: 'Debit / Loss', hex: '#ef4444', desc: 'Strict ledger red for losses & drawdowns' },
    { element: 'Warning / Caution', hex: '#f59e0b', desc: 'Goal trackers & risk slips' },
    { element: 'Text Primary', hex: '#f3f1eb', desc: 'High-contrast bone white typography' },
    { element: 'Text Secondary', hex: '#9fa4b2', desc: 'Parchment slate for labels & metadata' },
    { element: 'Text Muted', hex: '#6c7280', desc: 'Ledger notation grey' },
    { element: 'Ruled Hairline Borders', hex: '#222834', desc: 'Micro-ruled balance dividers' },
    { element: 'Calendar Credit Day', hex: '#0a1712', desc: 'Subtle credit green wash' },
    { element: 'Calendar Debit Day', hex: '#180b0e', desc: 'Subtle debit red wash' },
  ];

  return (
    <div className="animate-fade-in" style={{ maxWidth: 960, margin: '0 auto' }}>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: 18 }}>
        <div className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <SettingsIcon size={20} color="var(--vellum)" />
          <h1>Settings &amp; Preferences</h1>
        </div>
        <p className="page-subtitle">Configure daily note templates, review the actuarial design system, and manage trading preferences</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
        {[
          { id: 'template', label: 'Daily Note Template', icon: <FileText size={13} /> },
          { id: 'palette', label: 'Actuarial Ledger System', icon: <Palette size={13} /> },
          { id: 'general', label: 'General Preferences', icon: <Sliders size={13} /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              padding: '8px 16px',
              border: 'none',
              background: 'transparent',
              color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-muted)',
              borderBottom: `2px solid ${activeTab === tab.id ? 'var(--vellum)' : 'transparent'}`,
              fontWeight: 600,
              fontSize: 12.5,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.12s',
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: DAILY NOTE TEMPLATE */}
      {activeTab === 'template' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <h3 style={{ fontSize: 15, marginBottom: 2 }}>Default Daily Note Template</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  This template automatically populates every new note created from the calendar or journal.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {savedSuccess && (
                  <span style={{ fontSize: 11.5, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Check size={13} /> Saved successfully
                  </span>
                )}
                <button className="btn btn-secondary" onClick={handleResetTemplate} title="Reset to original predefined template">
                  <RotateCcw size={12} /> Reset
                </button>
                <button className="btn btn-primary" onClick={handleSaveTemplate}>
                  <Save size={13} /> Save Template
                </button>
              </div>
            </div>

            {/* Quick Presets */}
            <div style={{ marginBottom: 12 }}>
              <span style={{ fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginRight: 8 }}>
                Load Preset:
              </span>
              <div style={{ display: 'inline-flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                {TEMPLATE_PRESETS.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleLoadPreset(p.markdown)}
                    className="btn btn-secondary"
                    style={{ fontSize: 11, padding: '3px 9px' }}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Template Markdown Textarea */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <textarea
                value={templateText}
                onChange={e => setTemplateText(e.target.value)}
                rows={20}
                style={{
                  width: '100%',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 12.5,
                  lineHeight: 1.6,
                  padding: '14px',
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-card)',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
            </div>

            <div style={{ marginTop: 10, fontSize: 11.5, color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
              <span>Markdown: <code>## Heading</code>, <code>- [ ] Checklist</code>, <code>- Bullets</code>, <code>**Bold**</code></span>
              <span>Checkboxes automatically render as clickable interactive items</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COLOR PALETTE */}
      {activeTab === 'palette' && (
        <div className="card">
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, marginBottom: 2 }}>The Double-Entry Actuarial Ledger System</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Strict mathematical accountability. Every trade is an audited balance entry.
            </p>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Element</th>
                <th>Swatch</th>
                <th>Hex Value</th>
                <th>Role / Description</th>
              </tr>
            </thead>
            <tbody>
              {paletteItems.map((item, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600 }}>{item.element}</td>
                  <td>
                    <div
                      style={{
                        width: 24,
                        height: 18,
                        borderRadius: 3,
                        background: item.hex,
                        border: '1px solid var(--border-light)',
                      }}
                    />
                  </td>
                  <td>
                    <code style={{ fontSize: 11.5, color: 'var(--vellum-light)' }}>{item.hex}</code>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{item.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: GENERAL PREFERENCES */}
      {activeTab === 'general' && (
        <div className="card">
          <h3 style={{ fontSize: 15, marginBottom: 6 }}>Workspace Defaults</h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 18 }}>
            Configure default parameters for quick logging and calculation.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, maxWidth: 580 }}>
            <div className="form-group">
              <label className="form-label">Default Landing View</label>
              <input className="input-base" value="Home (Trading Calendar & Session Ledger)" readOnly />
            </div>

            <div className="form-group">
              <label className="form-label">Primary Instrument</label>
              <input className="input-base" defaultValue="ES (E-mini S&P 500)" />
            </div>

            <div className="form-group">
              <label className="form-label">Default Contract Size</label>
              <input className="input-base num-font" type="number" defaultValue={2} min={1} />
            </div>

            <div className="form-group">
              <label className="form-label">Currency Symbol</label>
              <input className="input-base num-font" defaultValue="$ (USD)" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
