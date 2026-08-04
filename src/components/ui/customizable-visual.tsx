'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ImageIcon, Trash2, RotateCcw, Upload, ZoomIn, ZoomOut, Move } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { VisualMode, ImagePosition } from '@/lib/visual-preferences/types';
import { DEFAULT_IMAGE_POSITION } from '@/lib/visual-preferences/types';

export type CustomizableVisualProps = {
  id: string;
  src?: string;
  alt: string;
  mode?: VisualMode;
  fallbackIcon?: React.ReactNode;
  position?: ImagePosition;
  editable?: boolean;
  aspectRatio?: 'square' | 'portrait' | 'landscape' | 'wide';
  className?: string;
  onChange?: (value: { imageUrl?: string; position?: ImagePosition; mode: VisualMode }) => void;
  onFileUpload?: (file: File) => string;
};

const ASPECT_MAP = {
  square:    'aspect-square',
  portrait:  'aspect-[3/4]',
  landscape: 'aspect-[4/3]',
  wide:      'aspect-[16/9]',
};

export function CustomizableVisual({
  id,
  src,
  alt,
  mode = 'photo',
  fallbackIcon,
  position = DEFAULT_IMAGE_POSITION,
  editable = false,
  aspectRatio = 'landscape',
  className,
  onChange,
  onFileUpload,
}: CustomizableVisualProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [imgMode, setImgMode] = useState<VisualMode>(mode);
  const [pos, setPos] = useState<ImagePosition>(position);
  const [broken, setBroken] = useState(false);
  const [loading, setLoading] = useState(!!src);
  const [showControls, setShowControls] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const prefersReducedMotion = useRef(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  // Sync src prop → internal state
  useEffect(() => {
    setImgSrc(src);
    setBroken(false);
    setLoading(!!src);
  }, [src]);

  useEffect(() => {
    setPos(position);
  }, [position]);

  useEffect(() => {
    setImgMode(mode);
  }, [mode]);

  const emit = useCallback(
    (updates: Partial<{ imageUrl?: string; position?: ImagePosition; mode: VisualMode }>) => {
      onChange?.({ imageUrl: imgSrc, position: pos, mode: imgMode, ...updates });
    },
    [onChange, imgSrc, pos, imgMode]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const url = onFileUpload ? onFileUpload(file) : URL.createObjectURL(file);
      setImgSrc(url);
      setImgMode('photo');
      setBroken(false);
      setLoading(true);
      emit({ imageUrl: url, mode: 'photo' });
    },
    [onFileUpload, emit]
  );

  const handleRemove = useCallback(() => {
    setImgSrc(undefined);
    setImgMode('none');
    setBroken(false);
    emit({ imageUrl: undefined, mode: 'none' });
  }, [emit]);

  const handleRestore = useCallback(() => {
    setImgSrc(src);
    setImgMode('photo');
    setBroken(false);
    setLoading(!!src);
    setPos(DEFAULT_IMAGE_POSITION);
    emit({ imageUrl: src, mode: 'photo', position: DEFAULT_IMAGE_POSITION });
  }, [src, emit]);

  const adjustZoom = useCallback(
    (delta: number) => {
      const next = { ...pos, zoom: Math.max(1, Math.min(3, pos.zoom + delta)) };
      setPos(next);
      emit({ position: next });
    },
    [pos, emit]
  );

  const adjustX = useCallback(
    (delta: number) => {
      const next = { ...pos, x: Math.max(0, Math.min(100, pos.x + delta)) };
      setPos(next);
      emit({ position: next });
    },
    [pos, emit]
  );

  const adjustY = useCallback(
    (delta: number) => {
      const next = { ...pos, y: Math.max(0, Math.min(100, pos.y + delta)) };
      setPos(next);
      emit({ position: next });
    },
    [pos, emit]
  );

  const hasImage = imgSrc && !broken && imgMode !== 'none';

  return (
    <div
      className={cn(
        'group relative overflow-hidden',
        ASPECT_MAP[aspectRatio],
        editable && 'ring-2 ring-[var(--glow-accent)] ring-offset-2 ring-offset-[var(--glow-bg)]',
        className
      )}
      style={{ borderRadius: 'var(--glow-radius)' }}
      onMouseEnter={() => editable && setShowControls(true)}
      onMouseLeave={() => editable && setShowControls(false)}
      onFocus={() => editable && setShowControls(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setShowControls(false);
      }}
      role={editable ? 'group' : undefined}
      aria-label={editable ? `Editable visual: ${alt}` : undefined}
    >
      {/* Image or placeholder */}
      {hasImage ? (
        <>
          {loading && (
            <div className="absolute inset-0 animate-pulse bg-[var(--glow-surface-muted)]" />
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgSrc}
            alt={alt}
            onLoad={() => setLoading(false)}
            onError={() => { setBroken(true); setLoading(false); }}
            className={cn(
              'h-full w-full object-cover',
              !prefersReducedMotion.current && 'transition-[object-position,transform] duration-500'
            )}
            style={{
              objectPosition: `${pos.x}% ${pos.y}%`,
              transform: `scale(${pos.zoom})`,
              transformOrigin: `${pos.x}% ${pos.y}%`,
            }}
            draggable={false}
          />
        </>
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-[var(--glow-surface-muted)]">
          {broken ? (
            <div className="flex flex-col items-center gap-1 text-[var(--glow-text-muted)]">
              <ImageIcon size={24} className="opacity-40" />
              <span className="text-xs">Image unavailable</span>
            </div>
          ) : (
            <div className="text-[var(--glow-text-muted)] opacity-30">
              {fallbackIcon ?? <ImageIcon size={32} />}
            </div>
          )}
        </div>
      )}

      {/* Edit overlay */}
      {editable && (
        <div
          className={cn(
            'absolute inset-0 flex flex-col items-end justify-between p-2 transition-opacity',
            showControls ? 'opacity-100' : 'opacity-0 focus-within:opacity-100',
            !prefersReducedMotion.current && 'duration-200'
          )}
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, transparent 40%, rgba(0,0,0,0.15) 100%)' }}
        >
          {/* Top-right action buttons */}
          <div className="flex gap-1">
            <ControlButton
              aria-label={`Upload image for ${alt}`}
              onClick={() => fileInputRef.current?.click()}
              title="Replace image"
            >
              <Upload size={12} />
            </ControlButton>
            {hasImage && (
              <>
                <ControlButton aria-label={`Remove image for ${alt}`} onClick={handleRemove} title="Remove">
                  <Trash2 size={12} />
                </ControlButton>
                <ControlButton aria-label={`Restore default for ${alt}`} onClick={handleRestore} title="Restore default">
                  <RotateCcw size={12} />
                </ControlButton>
              </>
            )}
          </div>

          {/* Bottom position/zoom controls */}
          {hasImage && (
            <div className="flex items-center gap-1">
              <span className="mr-1 text-[10px] font-medium text-white/80 select-none flex items-center gap-0.5">
                <Move size={10} />
              </span>
              <ControlButton aria-label="Move left" onClick={() => adjustX(-10)} title="Left">←</ControlButton>
              <ControlButton aria-label="Move right" onClick={() => adjustX(10)} title="Right">→</ControlButton>
              <ControlButton aria-label="Move up" onClick={() => adjustY(-10)} title="Up">↑</ControlButton>
              <ControlButton aria-label="Move down" onClick={() => adjustY(10)} title="Down">↓</ControlButton>
              <ControlButton aria-label="Zoom in" onClick={() => adjustZoom(0.25)} title="Zoom in">
                <ZoomIn size={10} />
              </ControlButton>
              <ControlButton aria-label="Zoom out" onClick={() => adjustZoom(-0.25)} title="Zoom out">
                <ZoomOut size={10} />
              </ControlButton>
            </div>
          )}
        </div>
      )}

      {/* Hidden file input */}
      {editable && (
        <input
          ref={fileInputRef}
          id={`visual-upload-${id}`}
          type="file"
          accept="image/*"
          className="sr-only"
          tabIndex={-1}
          aria-label={`Upload image for ${alt}`}
          onChange={handleFileChange}
        />
      )}
    </div>
  );
}

function ControlButton({
  children,
  onClick,
  title,
  'aria-label': ariaLabel,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title?: string;
  'aria-label': string;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={ariaLabel}
      onClick={onClick}
      className="flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
    >
      {children}
    </button>
  );
}
