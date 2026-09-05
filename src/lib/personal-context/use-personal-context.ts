'use client';

import { useEffect, useState } from 'react';
import type { PersonalContextData, PersonalContextResponse } from './types';

export type PersonalContextState =
  | { status: 'loading'; data: null }
  | { status: 'ready'; data: PersonalContextData }
  | { status: 'signed-out'; data: null }
  | { status: 'error'; data: null };

export function usePersonalContext(): PersonalContextState {
  const [state, setState] = useState<PersonalContextState>({ status: 'loading', data: null });

  useEffect(() => {
    let live = true;

    fetch('/api/personal-context', { cache: 'no-store' })
      .then(async (response) => {
        const payload = (await response.json()) as PersonalContextResponse;
        if (!live) return;

        if (response.ok && payload.ok) {
          setState({ status: 'ready', data: payload });
          return;
        }

        if (!payload.ok && payload.reason === 'not_signed_in') {
          setState({ status: 'signed-out', data: null });
          return;
        }

        setState({ status: 'error', data: null });
      })
      .catch(() => {
        if (live) setState({ status: 'error', data: null });
      });

    return () => {
      live = false;
    };
  }, []);

  return state;
}
