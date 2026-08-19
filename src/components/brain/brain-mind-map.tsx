'use client';

import { useEffect, useState } from 'react';
import type { BrainMapDomain } from '@/lib/intelligence/brain-connections';
import { useServerAction } from '@/lib/hooks/use-server-action';
import { getBrainMindMapNotesAction } from '@/app/actions/brain-mind-map';
import { RotatingIdeaSphere } from '@/components/brain/rotating-idea-sphere';

type IdeaNote = {
  id: string;
  title: string;
  content?: string | null;
};

export function BrainMindMap({ domains }: { domains: BrainMapDomain[] }) {
  const [notes, setNotes] = useState<IdeaNote[]>([]);
  const loadNotes = useServerAction(getBrainMindMapNotesAction);

  useEffect(() => {
    loadNotes.run(undefined, (rows) => setNotes(rows));
    // Load the signed-in user's most recent ideas once when the Brain map mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <RotatingIdeaSphere
        notes={notes}
        domains={domains}
        allowConnections
        title="Your 3D Mind Sphere"
        subtitle="Your notes, ideas, life rooms and saved connections now orbit together. Let it rotate on its own, or drag it with your finger to explore your mind from any angle."
      />
      {loadNotes.isPending ? <p className="mt-2 text-center text-[10px] text-[#a79d96]">Bringing your ideas into orbit…</p> : null}
      {loadNotes.error ? <p className="mt-2 text-center text-[10px] text-rose-500">{loadNotes.error}</p> : null}
    </div>
  );
}
