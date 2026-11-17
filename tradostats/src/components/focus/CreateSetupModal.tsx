'use client';

import React, { useState } from 'react';
import type { Setup } from '@/lib/types';
import { X, Plus } from 'lucide-react';

interface CreateSetupModalProps {
  onClose: () => void;
  onSave: (setup: Omit<Setup, 'id' | 'createdAt'>) => void;
}

export default function CreateSetupModal({
  onClose,
  onSave,
}: CreateSetupModalProps) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('📊');
  const [color, setColor] = useState('#10B981');
  const [description, setDescription] = useState('');

  const icons = ['📊', '📈', '📉', '🔄', '🚀', '💡', '🎯', '⚡', '🔥', '💰', '🏹', '🎲'];
  const colors = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4', '#84CC16'];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      icon,
      color,
      description: description.trim(),
    });
    onClose();
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(5, 6, 9, 0.82)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 14,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 400,
          background: '#13151f',
          border: '1.5px solid #282c3c',
          borderRadius: 12,
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 24px rgba(221, 167, 67, 0.15)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderBottom: '1px solid #232733',
            background: 'linear-gradient(180deg, #181b26 0%, #13151f 100%)',
          }}
        >
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#fff' }}>
            Add Playbook Setup
          </h3>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#888f9e', cursor: 'pointer', padding: 4 }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#9aa0a6', marginBottom: 4, textTransform: 'uppercase' }}>
              Setup Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Volume Ledge / S/R Flip"
              autoFocus
              style={{
                width: '100%',
                padding: '7px 10px',
                borderRadius: 6,
                border: '1px solid #282c3c',
                background: '#181b26',
                color: '#fff',
                fontSize: 13,
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#9aa0a6', marginBottom: 4, textTransform: 'uppercase' }}>
              Icon
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {icons.map(ic => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 6,
                    border: icon === ic ? `2px solid ${color}` : '1px solid #282c3c',
                    background: icon === ic ? `${color}22` : '#181b26',
                    fontSize: 16,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#9aa0a6', marginBottom: 4, textTransform: 'uppercase' }}>
              Accent Color
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {colors.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: c,
                    border: color === c ? '2.5px solid #fff' : '2px solid transparent',
                    cursor: 'pointer',
                    boxShadow: color === c ? `0 0 8px ${c}` : 'none',
                  }}
                />
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#9aa0a6', marginBottom: 4, textTransform: 'uppercase' }}>
              Entry Criteria & Description
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe execution rules, trigger level, and risk..."
              rows={2}
              style={{
                width: '100%',
                padding: '7px 10px',
                borderRadius: 6,
                border: '1px solid #282c3c',
                background: '#181b26',
                color: '#fff',
                fontSize: 12,
                outline: 'none',
                resize: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: '6px 12px', borderRadius: 6, background: '#1a1d28', border: '1px solid #2a2e3d', color: '#9aa0a6', fontSize: 12, cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '6px 14px',
                borderRadius: 4,
                background: 'var(--vellum)',
                border: 'none',
                color: '#0c0e12',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Create Setup
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
