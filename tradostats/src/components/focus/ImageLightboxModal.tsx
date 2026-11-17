'use client';

import React, { useState, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, Download } from 'lucide-react';

interface ImageLightboxModalProps {
  imageSrc: string | null;
  onClose: () => void;
}

export default function ImageLightboxModal({
  imageSrc,
  onClose,
}: ImageLightboxModalProps) {
  const [zoomScale, setZoomScale] = useState(1);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!imageSrc) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(5, 6, 9, 0.94)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      {/* Top Floating Controls */}
      <div
        style={{
          position: 'absolute',
          top: 16,
          right: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: '#161924',
          border: '1px solid #282c3c',
          borderRadius: 8,
          padding: '4px 8px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={() => setZoomScale(s => Math.min(3, s + 0.25))}
          title="Zoom In"
          style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 4 }}
        >
          <ZoomIn size={16} />
        </button>
        <button
          onClick={() => setZoomScale(s => Math.max(0.5, s - 0.25))}
          title="Zoom Out"
          style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 4 }}
        >
          <ZoomOut size={16} />
        </button>
        <button
          onClick={() => setZoomScale(1)}
          title="Reset Zoom"
          style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 4 }}
        >
          <RotateCcw size={15} />
        </button>
        <div style={{ width: 1, height: 16, background: '#282c3c' }} />
        <button
          onClick={onClose}
          title="Close (Esc)"
          style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: 4 }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Center Image Container */}
      <div
        style={{
          maxWidth: '92vw',
          maxHeight: '86vh',
          overflow: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onClick={e => e.stopPropagation()}
      >
        <img
          src={imageSrc}
          alt="Chart preview"
          style={{
            maxWidth: '100%',
            maxHeight: '85vh',
            objectFit: 'contain',
            transform: `scale(${zoomScale})`,
            transformOrigin: 'center center',
            transition: 'transform 0.15s ease',
            borderRadius: 6,
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.9)',
          }}
        />
      </div>
    </div>
  );
}
