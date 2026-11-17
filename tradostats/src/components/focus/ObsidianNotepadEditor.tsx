'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import {
  CheckSquare, List, Quote, Code, Image as ImageIcon,
  Clock, RotateCcw, Sparkles
} from 'lucide-react';
import { format } from 'date-fns';
import ImageLightboxModal from './ImageLightboxModal';

interface ObsidianNotepadEditorProps {
  content: string;
  onChange: (html: string) => void;
  onSetSaveStatus: (status: 'saved' | 'saving' | 'idle', time?: string) => void;
  externalTimestampTrigger?: number;
  onReapplyTemplate?: () => void;
}

function ToolbarButton({
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
        height: 24,
        minWidth: 24,
        padding: '0 5px',
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
        if (!active) e.currentTarget.style.color = '#888f9e';
      }}
    >
      {children}
    </button>
  );
}

export default function ObsidianNotepadEditor({
  content,
  onChange,
  onSetSaveStatus,
  externalTimestampTrigger,
  onReapplyTemplate,
}: ObsidianNotepadEditorProps) {
  const [lightboxImageSrc, setLightboxImageSrc] = useState<string | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        placeholder: 'Write your pre-market thesis, live observations, or paste chart screenshots (Ctrl+V)...',
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'obsidian-editor-surface',
      },
      handlePaste: (view, event) => {
        const items = Array.from(event.clipboardData?.items || []);
        for (const item of items) {
          if (item.type.indexOf('image') === 0) {
            event.preventDefault();
            const file = item.getAsFile();
            if (file) {
              const reader = new FileReader();
              reader.onload = e => {
                const base64 = e.target?.result as string;
                if (base64) {
                  const { schema } = view.state;
                  const node = schema.nodes.image.create({
                    src: base64,
                    alt: 'Chart screenshot',
                  });
                  const transaction = view.state.tr.replaceSelectionWith(node);
                  view.dispatch(transaction);
                }
              };
              reader.readAsDataURL(file);
            }
            return true;
          }
        }
        return false;
      },
      handleDrop: (view, event) => {
        const files = event.dataTransfer?.files;
        if (files && files.length > 0) {
          const file = files[0];
          if (file.type.startsWith('image/')) {
            event.preventDefault();
            const reader = new FileReader();
            reader.onload = e => {
              const base64 = e.target?.result as string;
              if (base64) {
                const { schema } = view.state;
                const node = schema.nodes.image.create({
                  src: base64,
                  alt: 'Dropped chart screenshot',
                });
                const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
                if (coordinates) {
                  const transaction = view.state.tr.insert(coordinates.pos, node);
                  view.dispatch(transaction);
                }
              }
            };
            reader.readAsDataURL(file);
            return true;
          }
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      onSetSaveStatus('saving');
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        const html = editor.getHTML();
        onChange(html);
        onSetSaveStatus('saved', format(new Date(), 'HH:mm:ss'));
      }, 900);
    },
  });

  // Keep content in sync when switching dates
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '', { emitUpdate: false });
      onSetSaveStatus('saved', format(new Date(), 'HH:mm:ss'));
    }
  }, [content, editor]);

  // Insert timestamp triggered from parent header
  useEffect(() => {
    if (editor && externalTimestampTrigger) {
      const timeNow = format(new Date(), 'hh:mm a');
      const stamp = `<p><strong style="color: #d4c5a0; font-family: monospace;">[${timeNow}]</strong>&nbsp;</p>`;
      editor.chain().focus().insertContent(stamp).run();
    }
  }, [externalTimestampTrigger, editor]);

  // Attach click listener for zoom/enlarge on inline images
  useEffect(() => {
    function handleDocumentClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (target && target.tagName === 'IMG' && target.closest('.obsidian-editor-surface')) {
        const src = (target as HTMLImageElement).src;
        if (src) setLightboxImageSrc(src);
      }
    }
    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, []);

  // Handle file input image selection
  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!editor || !e.target.files?.length) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = ev => {
      const base64 = ev.target?.result as string;
      if (base64) {
        editor.chain().focus().setImage({ src: base64, alt: 'Chart image' }).run();
      }
    };
    reader.readAsDataURL(file);
  }

  if (!editor) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#717680', fontSize: 13 }}>
        Loading Obsidian Notepad...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      {/* Discreet Sticky Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          padding: '6px 14px',
          background: '#0d0e14',
          borderBottom: '1px solid #1a1d29',
          flexWrap: 'wrap',
          userSelect: 'none',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        {/* Headings */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Heading 1">H1</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2">H2</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3">H3</ToolbarButton>

        <div style={{ width: 1, height: 14, background: '#252938', margin: '0 3px' }} />

        {/* Text styling */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold (Ctrl+B)">B</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic (Ctrl+I)">I</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline (Ctrl+U)">U</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough">S</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Inline Code">
          <Code size={12} />
        </ToolbarButton>

        <div style={{ width: 1, height: 14, background: '#252938', margin: '0 3px' }} />

        {/* Lists & Checklist */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleTaskList().run()} active={editor.isActive('taskList')} title="Interactive Checklist">
          <CheckSquare size={13} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet List">
          <List size={13} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Quote">
          <Quote size={12} />
        </ToolbarButton>

        <div style={{ width: 1, height: 14, background: '#252938', margin: '0 3px' }} />

        {/* Insert Image */}
        <ToolbarButton
          onClick={() => fileInputRef.current?.click()}
          title="Upload or Paste Chart Image (Ctrl+V also works directly)"
        >
          <ImageIcon size={13} />
        </ToolbarButton>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
        />

        {/* Re-apply structured daily template */}
        {onReapplyTemplate && (
          <button
            onClick={onReapplyTemplate}
            title="Reset to clean Pre-Market + Execution + DRC Template"
            aria-label="Reset to clean daily template"
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              color: '#9e9eb0',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '2px 6px',
              borderRadius: 4,
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--vellum)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <RotateCcw size={11} /> Reset Template
          </button>
        )}
      </div>

      {/* Obsidian Writing Canvas */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          background: '#0d0e12',
          padding: '20px 22px 60px',
        }}
      >
        <EditorContent editor={editor} />
      </div>

      {/* Image Lightbox Modal */}
      {lightboxImageSrc && (
        <ImageLightboxModal
          imageSrc={lightboxImageSrc}
          onClose={() => setLightboxImageSrc(null)}
        />
      )}
    </div>
  );
}
