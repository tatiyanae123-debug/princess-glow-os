'use client';

import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function AiAssistantPanel() {
  function openGlow(prefill?: string) {
    document.dispatchEvent(new CustomEvent('glow:open', { detail: { prefill } }));
  }

  return (
    <Card className="space-y-4">
      <div className="flex items-center gap-3">
        <Sparkles size={18} />
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Glow</p>
          <p className="text-lg font-semibold text-slate-900">One intelligence across Glow OS</p>
        </div>
      </div>
      <p className="text-sm leading-6 text-slate-600">Glow keeps the current room as context, can answer or create, and asks for approval before meaningful changes.</p>
      <div className="flex flex-wrap gap-2">
        {['What should I do next?', 'Plan this with me', 'Turn this into tasks', 'Find the note where I mentioned this'].map((prompt) => (
          <Button key={prompt} type="button" variant="secondary" onClick={() => openGlow(prompt)}>{prompt}</Button>
        ))}
      </div>
      <Button type="button" onClick={() => openGlow()}>Ask Glow</Button>
    </Card>
  );
}
