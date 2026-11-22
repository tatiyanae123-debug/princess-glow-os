'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { MorningBriefReference } from '@/components/today/morning-brief-reference';
import { TodayReferenceV2 } from '@/components/today/today-reference-v2';
import { usePersonalContext } from '@/lib/personal-context/use-personal-context';
import {
  buildTodayLivingModel,
  createTodayActionReceipt,
  type TodayActionReceipt,
  type TodayExperienceRoom,
  type TodayLivingModel,
} from '@/lib/glow-world/today-experience-model';

const TODAY_ROOMS: TodayExperienceRoom[] = [
  'morning',
  'what-now',
  'focus',
  'meeting',
  'next-up',
  'later',
  'tonight',
  'tomorrow',
  'replan',
  'day-view',
];

const RECEIPT_KEY = 'glow:today:action-receipts:v1';

type TodayExperienceContextValue = {
  room: TodayExperienceRoom;
  model: TodayLivingModel | null;
  receipts: TodayActionReceipt[];
  recordAction: (receipt: Omit<TodayActionReceipt, 'id' | 'at' | 'room'> & { room?: TodayExperienceRoom }) => TodayActionReceipt;
  undoLastLocalAction: () => TodayActionReceipt | null;
};

const TodayExperienceContext = createContext<TodayExperienceContextValue | null>(null);

function readReceipts(): TodayActionReceipt[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.sessionStorage.getItem(RECEIPT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as TodayActionReceipt[];
    return Array.isArray(parsed) ? parsed.slice(-40) : [];
  } catch {
    return [];
  }
}

function persistReceipts(receipts: TodayActionReceipt[]) {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(RECEIPT_KEY, JSON.stringify(receipts.slice(-40)));
  } catch {
    // Receipts are supportive history. A blocked session store must not block Today.
  }
}

function normalizeRoom(value: string | null): TodayExperienceRoom {
  return TODAY_ROOMS.includes(value as TodayExperienceRoom) ? (value as TodayExperienceRoom) : 'what-now';
}

export function TodayExperienceFamily() {
  const params = useSearchParams();
  const personal = usePersonalContext();
  const room = normalizeRoom(params.get('room'));
  const [receipts, setReceipts] = useState<TodayActionReceipt[]>([]);

  useEffect(() => {
    setReceipts(readReceipts());
  }, []);

  const model = useMemo(() => {
    if (personal.status !== 'ready') return null;
    return buildTodayLivingModel(personal.data);
  }, [personal]);

  const value = useMemo<TodayExperienceContextValue>(() => ({
    room,
    model,
    receipts,
    recordAction(input) {
      const receipt = createTodayActionReceipt({ ...input, room: input.room ?? room });
      setReceipts((current) => {
        const next = [...current, receipt].slice(-40);
        persistReceipts(next);
        return next;
      });
      document.dispatchEvent(new CustomEvent('glow:today-receipt', { detail: receipt }));
      return receipt;
    },
    undoLastLocalAction() {
      let undone: TodayActionReceipt | null = null;
      setReceipts((current) => {
        const index = [...current].reverse().findIndex((item) => item.undoable && !item.externalWrite);
        if (index < 0) return current;
        const actualIndex = current.length - 1 - index;
        undone = current[actualIndex] ?? null;
        const next = current.filter((_, itemIndex) => itemIndex !== actualIndex);
        persistReceipts(next);
        return next;
      });
      return undone;
    },
  }), [model, receipts, room]);

  return (
    <TodayExperienceContext.Provider value={value}>
      <div
        data-today-experience-family="living-day-v1"
        data-today-room={room}
        data-day-object={model?.dayId ?? 'day:loading'}
      >
        {room === 'morning' ? <MorningBriefReference /> : <TodayReferenceV2 />}
      </div>
    </TodayExperienceContext.Provider>
  );
}

export function useTodayExperience() {
  const value = useContext(TodayExperienceContext);
  if (!value) throw new Error('useTodayExperience must be used inside TodayExperienceFamily');
  return value;
}
