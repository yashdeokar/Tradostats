'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Placeholder from '@tiptap/extension-placeholder';
import {
  FileText, Clock, Sparkles, Check, CheckSquare, List,
  RotateCcw, Save, Trash2, ArrowDown
} from 'lucide-react';
import { format } from 'date-fns';

interface LiveScratchpadProps {
  initialContent: string;
  onSaveContent: (html: string) => void;
  date: string;
  externalAppendText?: string | null;
  onClearExternalAppend?: () => void;
}

function ToolbarBtn({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      type="button"
      style={{
        width: 24,
        height: 24,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 4,
        border: 'none',
        background: active ? 'rgba(212, 197, 160, 0.15)' : 'transparent',
        color: active ? 'var(--vellum)' : 'var(--text-muted)',
        fontSize: 11,
        fontWeight: 700,
        cursor: 'pointer',
        transition: 'all 0.12s',
      }}
      onMouseEnter={e => {
        if (!active) e.currentTarget.style.color = '#fff';
      }}
      onMouseLeave={e => {
        if (!active) e.currentTarget.style.color = '#9aa0a6';
      }}
    >
      {children}
    </button>
  );
}

export default function LiveScratchpad({
  initialContent,
  onSaveContent,
  date,
  externalAppendText,
  onClearExternalAppend,
}: LiveScratchpadProps) {
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('saved');
  const [lastSavedTime, setLastSavedTime] = useState<string>('');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Highlight.configure({ multicolor: true }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({
        placeholder: 'Type live market observations, execution thoughts, levels...',
      }),
    ],
    content: initialContent || '',
    onUpdate: ({ editor }) => {
      setSaveStatus('saving');
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        const html = editor.getHTML();
        onSaveContent(html);
        setSaveStatus('saved');
        setLastSavedTime(format(new Date(), 'HH:mm:ss'));
      }, 1200);
    },
  });

  // Sync content when initialContent changes from date switch
  useEffect(() => {
    if (editor && initialContent !== editor.getHTML()) {
      editor.commands.setContent(initialContent || '', { emitUpdate: false });
      setSaveStatus('saved');
      setLastSavedTime(format(new Date(), 'HH:mm:ss'));
    }
  }, [date, initialContent, editor]);

  // Handle external tag stamping into the scratchpad
  useEffect(() => {
    if (editor && externalAppendText) {
      editor.chain().focus('end').insertContent(externalAppendText).run();
      if (onClearExternalAppend) onClearExternalAppend();
    }
  }, [externalAppendText, editor, onClearExternalAppend]);

  // Quick insert current timestamp
  const handleInsertTimestamp = useCallback(() => {
    if (!editor) return;
    const timeNow = format(new Date(), 'hh:mm a');
    const stamp = `<p><strong style="color: #d4c5a0; font-family: monospace;">[${timeNow}]</strong>&nbsp;</p>`;
    editor.chain().focus().insertContent(stamp).run();
  }, [editor]);

  // Insert template snippets
  const handleInsertTemplate = useCallback((templateType: 'pre' | 'checklist' | 'post') => {
    if (!editor) return;
    let snippet = '';
    if (templateType === 'pre') {
      snippet = `
        <h3>Pre-Market Plan & Levels</h3>
        <p><strong>Key Levels:</strong> Pivot: ___ | Support: ___ | Resistance: ___</p>
        <p><strong>Thesis:</strong> Bias is neutral/bullish. Wait for 9:45 AM candle close.</p>
        <hr/>
      `;
    } else if (templateType === 'checklist') {
      snippet = `
        <h3>Execution Checklist</h3>
        <ul data-type="taskList">
          <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Check Higher Timeframe Trend & VWAP slope</p></div></li>
          <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Identify clear invalidation stop level</p></div></li>
          <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Verify risk:reward is at least 1:2</p></div></li>
        </ul>
        <hr/>
      `;
    } else {
      snippet = `
        <h3>Post-Session Review</h3>
        <p><strong>Discipline Score:</strong> 8/10</p>
        <p><strong>Key Takeaway:</strong> Avoid chasing after missing the initial 1-tick entry.</p>
      `;
    }
    editor.chain().focus('end').insertContent(snippet).run();
  }, [editor]);

  if (!editor) {
    return (
      <div style={{ padding: 20, textAlign: 'center', color: '#717680', fontSize: 12 }}>
        Initializing Live Journal Scratchpad...
      </div>
    );
  }

  return (
    <div
      style={{
        background: '#141620',
        border: '1px solid #232733',
        borderRadius: 10,
        margin: '6px 14px 16px',
        overflow: 'hidden',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Scratchpad Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '9px 12px',
          borderBottom: '1px solid #232733',
          background: '#11131b',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: 4,
              background: 'rgba(212, 197, 160, 0.1)',
              border: '1px solid rgba(212, 197, 160, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--vellum)',
            }}
          >
            <FileText size={13} />
          </div>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: 'var(--vellum)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            DAILY LIVE SCRATCHPAD
          </span>
        </div>

        {/* Save Status Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 10,
              fontFamily: "'JetBrains Mono', monospace",
              color: saveStatus === 'saving' ? '#F59E0B' : '#10B981',
            }}
          >
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: saveStatus === 'saving' ? '#F59E0B' : '#10B981',
                boxShadow: saveStatus === 'saving' ? '0 0 6px #F59E0B' : '0 0 6px #10B981',
              }}
            />
            <span>
              {saveStatus === 'saving'
                ? 'Saving...'
                : lastSavedTime
                ? `Saved ${lastSavedTime}`
                : 'Saved'}
            </span>
          </div>
        </div>
      </div>

      {/* Minimalist Formatting Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          padding: '5px 8px',
          background: '#0d0e14',
          borderBottom: '1px solid #1f2330',
          flexWrap: 'wrap',
        }}
      >
        {/* Headings */}
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Heading 1">H1</ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2">H2</ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3">H3</ToolbarBtn>

        <div style={{ width: 1, height: 14, background: '#252938', margin: '0 3px' }} />

        {/* Formatting */}
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">B</ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic">I</ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline">U</ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough">S</ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Code">{`</>`}</ToolbarBtn>

        <div style={{ width: 1, height: 14, background: '#252938', margin: '0 3px' }} />

        {/* Lists & Checklist */}
        <ToolbarBtn onClick={() => editor.chain().focus().toggleTaskList().run()} active={editor.isActive('taskList')} title="Checklist">
          <CheckSquare size={12} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet List">
          <List size={12} />
        </ToolbarBtn>

        <div style={{ width: 1, height: 14, background: '#252938', margin: '0 3px' }} />

        {/* Quick Timestamp Button */}
        <button
          onClick={handleInsertTimestamp}
          title="Insert current timestamp"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 3,
            padding: '2px 6px',
            borderRadius: 4,
            border: '1px solid rgba(212, 197, 160, 0.3)',
            background: 'rgba(212, 197, 160, 0.08)',
            color: 'var(--vellum)',
            fontSize: 10,
            fontWeight: 700,
            cursor: 'pointer',
            marginLeft: 'auto',
          }}
        >
          <Clock size={11} /> + Time
        </button>

        {/* Snippet / Template Quick Button */}
        <button
          onClick={() => handleInsertTemplate('checklist')}
          title="Insert quick execution checklist"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 2,
            padding: '2px 6px',
            borderRadius: 4,
            border: '1px solid #2a2e3d',
            background: '#181b26',
            color: '#9aa0a6',
            fontSize: 10,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          + Checklist
        </button>
      </div>

      {/* Editor Content Area */}
      <div
        style={{
          minHeight: 180,
          maxHeight: 380,
          overflowY: 'auto',
          background: '#13151f',
          padding: '10px 14px',
          color: '#E5E7EB',
          fontSize: 13,
          lineHeight: 1.6,
        }}
        className="focus-editor-content"
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
