'use client';

import { useCallback, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

type SelectedContext = { label?: string; type?: string; id?: string; route?: string } | null;
type KernelPayload = { ok?: boolean; context?: unknown };

function readSelectedContext(): SelectedContext {
  try {
    const raw = window.sessionStorage.getItem('glow.presence.context');
    return raw ? JSON.parse(raw) as SelectedContext : null;
  } catch {
    return null;
  }
}

export function GlowKernelBridge() {
  const pathname = usePathname();
  const requestRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  const refreshKernel = useCallback(async (forceSync = false) => {
    if (!mountedRef.current || pathname === '/sign-in' || pathname.startsWith('/api/')) return;
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    try {
      const response = await fetch('/api/glow/kernel/context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        signal: controller.signal,
        body: JSON.stringify({ route: pathname, selectedContext: readSelectedContext(), forceSync }),
      });
      if (!response.ok) return;
      const payload = await response.json() as KernelPayload;
      if (!payload.ok || !payload.context || !mountedRef.current) return;
      try { window.sessionStorage.setItem('glow.kernel.context', JSON.stringify(payload.context)); } catch {}
      document.dispatchEvent(new CustomEvent('glow:kernel-context', { detail: payload.context }));
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) console.error('[Glow Kernel Bridge]', error);
    }
  }, [pathname]);

  useEffect(() => {
    mountedRef.current = true;
    void refreshKernel(false);
    const contextChanged = () => { void refreshKernel(false); };
    const dataChanged = () => { void refreshKernel(true); };
    document.addEventListener('glow:context', contextChanged);
    document.addEventListener('glow:clear-context', contextChanged);
    document.addEventListener('glow:data-changed', dataChanged);
    return () => {
      document.removeEventListener('glow:context', contextChanged);
      document.removeEventListener('glow:clear-context', contextChanged);
      document.removeEventListener('glow:data-changed', dataChanged);
      requestRef.current?.abort();
    };
  }, [refreshKernel]);

  useEffect(() => () => { mountedRef.current = false; }, []);

  return null;
}
