'use client';

import { useRouter } from 'next/navigation';
import { FinanceEntryForm } from '@/components/finance/finance-entry-form';
import type { FinanceEntry } from '@/lib/types';

export function FinanceExactEntryEditor({ entry }: { entry: FinanceEntry }) {
  const router = useRouter();
  return (
    <section className="rounded-[18px] border border-[#C9727E] bg-white p-5 shadow-[0_14px_40px_rgba(201,114,126,.10)]">
      <p className="glow-eyebrow">Selected finance record</p>
      <h2 className="glow-display mt-1 text-[24px] text-[#2B2420]">{entry.title}</h2>
      <p className="mt-1 text-[11px] text-[#8A8078]">Edit the exact transaction you opened. Changes save to the same Finance record.</p>
      <div className="mt-4">
        <FinanceEntryForm entry={entry} onSaved={() => { router.replace('/finance'); router.refresh(); }} onCancel={() => router.replace('/finance')} />
      </div>
    </section>
  );
}
