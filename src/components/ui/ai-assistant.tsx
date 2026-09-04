'use client';

import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function AiAssistantPanel() {
  function openShakti(prefill?: string) {
    document.dispatchEvent(new CustomEvent('shakti:open', { detail: { prefill } }));
  }

  return (
    <Card className="space-y-4">
      <div className="flex items-center gap-3">
        <Sparkles size={18} />
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Shakti</p>
          <p className="text-lg font-semibold text-slate-900">One assistant across Glow OS</p>
        </div>
      </div>
      <p className="text-sm leading-6 text-slate-600">Shakti keeps the current room as context, can answer or create, and asks for approval before meaningful changes.</p>
      <div className="flex flex-wrap gap-2">
        {['What should I do next?', 'Plan this with me', 'Turn this into tasks', 'Find the note where I mentioned this'].map((prompt) => (
          <Button key={prompt} type="button" variant="secondary" onClick={() => openShakti(prompt)}>{prompt}</Button>
        ))}
      </div>
      <Button type="button" onClick={() => openShakti()}>Ask Shakti</Button>
    </Card>
  );
}
