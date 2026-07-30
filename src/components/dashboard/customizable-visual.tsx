'use client';

import { useCallback, useRef, useState } from 'react';
import { Minus, Move, Plus, RefreshCw, Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ImagePreference } from '@/lib/visual/types';
import { Button } from '@/components/ui/button';

// ── Types ─────────────────────────────────────────────────────────────────────

type CustomizableVisualProps = {
  /** Current image preference state */
  preference: ImagePreference;
  /** Called when the preference changes */
  onUpdate: (patch: Partial<ImagePreference>) => void;
  /** Whether edit controls are visible */
  isEditing: boolean;
  /** Alt text — pass empty string for decorative images */
  alt: string;
  /** Content shown when no image is set */
  fallback?: React.ReactNode;
  /** Additional container class */
  className?: string;
  /** Visual label for the upload button (e.g. "profile photo", "banner") */
  uploadLabel?: string;
};

// ── File reading ──────────────────────────────────────────────────────────────

const MAX_DATA_URL_BYTES = 500_000; // ~500 KB limit to avoid localStorage overflow

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.size > MAX_DATA_URL_BYTES) {
      reject(new Error(`Image is too large (max ~500 KB). Please choose a smaller file.`));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Could not read the selected file.'));
    reader.readAsDataURL(file);
  });
}

// ── Component ─────────────────────────────────────────────────────────────────

export function CustomizableVisual({
  preference,
  onUpdate,
  isEditing,
  alt,
  fallback,
  className,
  uploadLabel = 'image',
}: CustomizableVisualProps) {
  const [imageError, setImageError] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setIsUploading(true);
      setUploadError(null);
      try {
        const src = await readFileAsDataURL(file);
        onUpdate({ src, zoom: 1, offsetX: 0, offsetY: 0 });
        setImageError(false);
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : 'Upload failed.');
      } finally {
        setIsUploading(false);
        // reset so same file can be re-selected
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    },
    [onUpdate],
  );

  const handleRemove = useCallback(() => {
    onUpdate({ src: null, zoom: 1, offsetX: 0, offsetY: 0 });
    setImageError(false);
    setUploadError(null);
  }, [onUpdate]);

  const handleRestore = useCallback(() => {
    onUpdate({ src: null, zoom: 1, offsetX: 0, offsetY: 0 });
    setImageError(false);
  }, [onUpdate]);

  const adjustZoom = useCallback(
    (delta: number) => {
      const next = Math.min(3, Math.max(1, (preference.zoom ?? 1) + delta));
      onUpdate({ zoom: next });
    },
    [preference.zoom, onUpdate],
  );

  const adjustOffset = useCallback(
    (axis: 'X' | 'Y', delta: number) => {
      const key = axis === 'X' ? 'offsetX' : 'offsetY';
      const current = preference[key] ?? 0;
      const next = Math.min(50, Math.max(-50, current + delta));
      onUpdate({ [key]: next });
    },
    [preference, onUpdate],
  );

  const hasSrc = Boolean(preference.src);
  const showImage = hasSrc && !imageError;

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Image layer */}
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preference.src!}
          alt={alt}
          onError={() => setImageError(true)}
          style={{
            objectFit: 'cover',
            objectPosition: `calc(50% + ${preference.offsetX ?? 0}%) calc(50% + ${preference.offsetY ?? 0}%)`,
            transform: `scale(${preference.zoom ?? 1})`,
            transformOrigin: 'center',
            transition: 'transform 0.2s ease',
            width: '100%',
            height: '100%',
          }}
          aria-hidden={alt === ''}
        />
      ) : imageError ? (
        // Broken image state
        <div
          role="img"
          aria-label="Image could not be loaded"
          className="flex h-full w-full flex-col items-center justify-center gap-2 bg-slate-100 text-slate-400 dark:bg-slate-800"
        >
          <X size={24} aria-hidden="true" />
          <p className="text-xs">Image unavailable</p>
        </div>
      ) : (
        // Empty / fallback state
        <div className="flex h-full w-full items-center justify-center">{fallback}</div>
      )}

      {/* Upload loading overlay */}
      {isUploading && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-slate-900/70"
          aria-live="polite"
          aria-label="Uploading image"
        >
          <RefreshCw size={20} className="animate-spin text-rose-500" aria-hidden="true" />
        </div>
      )}

      {/* Edit controls */}
      {isEditing && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-end gap-2 bg-black/30 p-3"
          role="group"
          aria-label={`Edit ${uploadLabel}`}
        >
          {/* Upload error */}
          {uploadError && (
            <p
              role="alert"
              className="w-full rounded-lg bg-red-600 px-2 py-1 text-center text-xs font-medium text-white"
            >
              {uploadError}
            </p>
          )}

          {/* Reposition and zoom controls (only when image loaded) */}
          {showImage && (
            <div className="flex gap-1" role="group" aria-label="Reposition and zoom">
              <Button
                type="button"
                variant="secondary"
                className="h-8 w-8 rounded-full p-0 text-xs"
                onClick={() => adjustOffset('X', -5)}
                aria-label="Move image left"
              >
                ←
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="h-8 w-8 rounded-full p-0 text-xs"
                onClick={() => adjustOffset('X', 5)}
                aria-label="Move image right"
              >
                →
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="h-8 w-8 rounded-full p-0 text-xs"
                onClick={() => adjustOffset('Y', -5)}
                aria-label="Move image up"
              >
                ↑
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="h-8 w-8 rounded-full p-0 text-xs"
                onClick={() => adjustOffset('Y', 5)}
                aria-label="Move image down"
              >
                ↓
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="h-8 w-8 rounded-full p-0"
                onClick={() => adjustZoom(-0.25)}
                aria-label="Zoom out"
              >
                <Minus size={12} aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="h-8 w-8 rounded-full p-0"
                onClick={() => adjustZoom(0.25)}
                aria-label="Zoom in"
              >
                <Plus size={12} aria-hidden="true" />
              </Button>
            </div>
          )}

          {/* Action buttons row */}
          <div className="flex gap-2">
            <label className="cursor-pointer">
              <span className="sr-only">Upload {uploadLabel}</span>
              <span
                className="inline-flex items-center gap-1 rounded-full border border-white/70 bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-white focus-within:outline focus-within:outline-2 focus-within:outline-white"
                aria-hidden="true"
              >
                <Upload size={12} aria-hidden="true" />
                Upload
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleFileChange}
                aria-label={`Upload ${uploadLabel}`}
              />
            </label>

            {hasSrc && (
              <Button
                type="button"
                variant="secondary"
                className="h-auto rounded-full border-white/70 bg-white/90 px-3 py-1.5 text-xs text-slate-800 hover:bg-white"
                onClick={handleRemove}
                aria-label={`Remove ${uploadLabel}`}
              >
                <X size={12} aria-hidden="true" />
                Remove
              </Button>
            )}

            {(hasSrc || imageError) && (
              <Button
                type="button"
                variant="secondary"
                className="h-auto rounded-full border-white/70 bg-white/90 px-3 py-1.5 text-xs text-slate-800 hover:bg-white"
                onClick={handleRestore}
                aria-label={`Restore ${uploadLabel} to default`}
              >
                <Move size={12} aria-hidden="true" />
                Restore
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
