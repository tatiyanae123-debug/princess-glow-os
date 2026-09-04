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
  square: 'aspect-square',
  portrait: 'aspect-[3/4]',
  landscape: 'aspect-[4/3]',
  wide: 'aspect-[16/9]',
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

  useEffect(() => {
    setImgSrc(src);
    setBroken(false);
    setLoading(!!src);
  }, [src]);

  useEffect(() => { setPos(position); }, [position]);
  useEffect(() => { setImgMode(mode); }, [mode]);

  const emit = useCallback(
    (updates: Partial<{ imageUrl?: string; position?: ImagePosition; mode: VisualMode }>) => {
      onChange?.({ imageUrl: imgSrc, position: pos, mode: imgMode, ...updates });
    },
    [onChange, imgSrc, pos, imgMode]
  );

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file || !file.type.startsWith('image/')) return;
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

  const hasImage = Boolean(imgSrc && !broken && imgMode !== 'none');

  return (
    <div
      className={cn(
        'glow-image-surface group relative min-w-0 max-w-full',
        ASPECT_MAP[aspectRatio],
        editable && 'ring-2 ring-[var(--glow-accent)] ring-offset-2 ring-offset-[var(--glow-bg)]',
        className
      )}
      style={{ borderRadius: 'var(--glow-radius)' }}
      onMouseEnter={() => editable && setShowControls(true)}
      onMouseLeave={() => editable && setShowControls(false)}
      onFocus={() => editable && setShowControls(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setShowControls(false);
      }}
      role={editable ? 'group' : undefined}
      aria-label={editable ? `Editable visual: ${alt}` : undefined}
    >
      {hasImage ? (
        <>
          {loading ? <div className="absolute inset-0 z-[1] animate-pulse bg-[var(--glow-surface-muted)]" /> : null}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgSrc}
            alt={alt}
            onLoad={() => setLoading(false)}
            onError={() => { setBroken(true); setLoading(false); }}
            className={cn(
              'glow-image-media absolute inset-0',
              !prefersReducedMotion.current && 'transition-[object-position,transform] duration-500'
            )}
            style={{
              objectPosition: `${pos.x}% ${pos.y}%`,
              transform: `scale(${pos.zoom}) translateZ(0)`,
              transformOrigin: `${pos.x}% ${pos.y}%`,
            }}
            loading="lazy"
            decoding="async"
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
            <div className="text-[var(--glow-text-muted)] opacity-30">{fallbackIcon ?? <ImageIcon size={32} />}</div>
          )}
        </div>
      )}

      {editable ? (
        <div
          className={cn(
            'pointer-events-none absolute inset-0 z-[5] flex flex-col items-end justify-between p-2 transition-opacity',
            showControls ? 'opacity-100' : 'opacity-0 focus-within:opacity-100',
            !prefersReducedMotion.current && 'duration-200'
          )}
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,.18) 0%, transparent 35%, rgba(0,0,0,.12) 100%)' }}
        >
          <div className="pointer-events-auto flex flex-wrap justify-end gap-1">
            <ControlButton aria-label={`Upload image for ${alt}`} onClick={() => fileInputRef.current?.click()} title="Replace image"><Upload size={12}/></ControlButton>
            {hasImage ? <>
              <ControlButton aria-label={`Remove image for ${alt}`} onClick={handleRemove} title="Remove"><Trash2 size={12}/></ControlButton>
              <ControlButton aria-label={`Restore default for ${alt}`} onClick={handleRestore} title="Restore default"><RotateCcw size={12}/></ControlButton>
            </> : null}
          </div>

          {hasImage ? (
            <div className="pointer-events-auto flex max-w-full flex-wrap items-center justify-end gap-1">
              <span className="mr-1 flex select-none items-center gap-0.5 text-[10px] font-medium text-white/85"><Move size={10}/></span>
              <ControlButton aria-label="Move left" onClick={() => adjustX(-10)} title="Left">←</ControlButton>
              <ControlButton aria-label="Move right" onClick={() => adjustX(10)} title="Right">→</ControlButton>
              <ControlButton aria-label="Move up" onClick={() => adjustY(-10)} title="Up">↑</ControlButton>
              <ControlButton aria-label="Move down" onClick={() => adjustY(10)} title="Down">↓</ControlButton>
              <ControlButton aria-label="Zoom in" onClick={() => adjustZoom(.25)} title="Zoom in"><ZoomIn size={10}/></ControlButton>
              <ControlButton aria-label="Zoom out" onClick={() => adjustZoom(-.25)} title="Zoom out"><ZoomOut size={10}/></ControlButton>
            </div>
          ) : null}
        </div>
      ) : null}

      {editable ? (
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
      ) : null}
    </div>
  );
}

function ControlButton({ children, onClick, title, 'aria-label': ariaLabel }: { children: React.ReactNode; onClick: () => void; title?: string; 'aria-label': string }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={ariaLabel}
      onClick={onClick}
      className="flex h-7 w-7 items-center justify-center rounded-full border border-white/65 bg-black/42 text-white shadow-[0_3px_10px_rgba(0,0,0,.16)] backdrop-blur-md transition hover:bg-black/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
    >
      {children}
    </button>
  );
}
