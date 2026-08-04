'use client';

import { useCallback, useEffect, useState } from 'react';

export function useCustomizeMode() {
  const [isActive, setIsActive] = useState(false);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);

  const activate = useCallback(() => {
    setIsActive(true);
    setHasPendingChanges(false);
  }, []);

  const markChanged = useCallback(() => {
    if (isActive) setHasPendingChanges(true);
  }, [isActive]);

  const save = useCallback(() => {
    setHasPendingChanges(false);
    setIsActive(false);
  }, []);

  const discard = useCallback(() => {
    setHasPendingChanges(false);
    setIsActive(false);
  }, []);

  // beforeunload guard
  useEffect(() => {
    if (!hasPendingChanges) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasPendingChanges]);

  return { isActive, hasPendingChanges, activate, save, discard, markChanged };
}
