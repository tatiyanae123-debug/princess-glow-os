import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { OperatingAreaPage } from '@/components/operating-area-page';

export const dynamic = 'force-dynamic';

export default async function CreatePage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  return (
    <AppShell>
      <OperatingAreaPage
        eyebrow="CREATE · CAPTURE + MAKE"
        title="Everything can enter Glow from one calm doorway."
        description="Capture, notes, Gmail, imports and Creative Studio now live together. Add Anything remains universal, while the deeper tools stay available only when you need to organize or create."
        question="Am I capturing something, organizing it, or making something from it?"
        groups={[
          { title: 'Focus views', description: 'Start with the kind of action, not the database destination.', items: [
            { label: 'Capture', href: '/intake', description: 'Add a task, reminder, event, note, meal, expense, workout, medication, product, goal, project, memory, image, document or link.', priority: 'essential' },
            { label: 'Notes', href: '/notes', description: 'Write, collect and develop information without deciding its final destination first.' },
            { label: 'Studio', href: '/creative-studio', description: 'Turn ideas, references and inspiration into creative work.', priority: 'bonus' },
            { label: 'Imports', href: '/import', description: 'Bring outside information into the Glow system.' },
          ]},
          { title: 'Sources and inboxes', description: 'Information can enter from several places while Glow handles routing behind the scenes.', items: [
            { label: 'Inbox', href: '/inbox', description: 'Review uncategorized or routed material and decide what deserves attention.' },
            { label: 'Gmail', href: '/gmail', description: 'Bring relevant email context into the same operating system.' },
            { label: 'Add Anything', href: '/intake', description: 'The universal command surface for fast capture from anywhere.', priority: 'essential' },
          ]},
        ]}
      />
    </AppShell>
  );
}
