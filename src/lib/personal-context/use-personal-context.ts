'use client';

import { useEffect, useState } from 'react';
import type { PersonalContextData, PersonalContextResponse } from './types';

export type PersonalContextState =
  | { status: 'loading'; data: null }
  | { status: 'ready'; data: PersonalContextData }
  | { status: 'signed-out'; data: null }
  | { status: 'error'; data: null };

const SESSION_KEY = 'glow:personal-context:v1';
const REQUEST_TIMEOUT_MS = 2200;

const EMPTY_CONTEXT: PersonalContextData = {
  ok: true,
  user: { name: null, email: null },
  tasks: [],
  activeTask: null,
  events: [],
  todayEvents: [],
  tomorrowEvents: [],
  routines: [],
  habits: [],
  notes: [],
  goals: [],
  wellness: null,
  sourceStatus: { googleCalendar: 'error' },
};

let sharedRequest: Promise<PersonalContextState> | null = null;
let memoryData: PersonalContextData | null = null;

function readCachedData(): PersonalContextData | null {
  if (memoryData) return memoryData;
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersonalContextData;
    if (!parsed?.ok) return null;
    memoryData = parsed;
    return parsed;
  } catch {
    return null;
  }
}

function writeCachedData(data: PersonalContextData) {
  memoryData = data;
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
  } catch {
    // A blocked/full session store should never block Today from rendering.
  }
}

async function requestPersonalContext(): Promise<PersonalContextState> {
  if (sharedRequest) return sharedRequest;

  sharedRequest = (async () => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch('/api/personal-context', {
        cache: 'no-store',
        signal: controller.signal,
      });
      const payload = (await response.json()) as PersonalContextResponse;

      if (response.ok && payload.ok) {
        writeCachedData(payload);
        return { status: 'ready', data: payload } as const;
      }

      if (!payload.ok && payload.reason === 'not_signed_in') {
        return { status: 'signed-out', data: null } as const;
      }

      return {
        status: 'ready',
        data: readCachedData() ?? EMPTY_CONTEXT,
      } as const;
    } catch {
      return {
        status: 'ready',
        data: readCachedData() ?? EMPTY_CONTEXT,
      } as const;
    } finally {
      window.clearTimeout(timeout);
      sharedRequest = null;
    }
  })();

  return sharedRequest;
}

function initialState(): PersonalContextState {
  // Never cover the Today world with a blocking loader. Render the architecture
  // immediately from the latest session snapshot, or from a truthful empty state,
  // and hydrate real connected data in the background.
  return {
    status: 'ready',
    data: readCachedData() ?? EMPTY_CONTEXT,
  };
}

export function usePersonalContext(): PersonalContextState {
  const [state, setState] = useState<PersonalContextState>(initialState);

  useEffect(() => {
    let live = true;

    // All Today surfaces share one in-flight request. Cached session data renders
    // immediately, then this refresh quietly replaces it when fresh data arrives.
    requestPersonalContext().then((nextState) => {
      if (live) setState(nextState);
    });

    return () => {
      live = false;
    };
  }, []);

  return state;
}
