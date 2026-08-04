'use client';

import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export function ConfirmDialog({
  open,
  title = 'Delete this?',
  description = 'This action cannot be undone.',
  pending,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title?: string;
  description?: string;
  pending?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onClose={onCancel} title={title} description={description} className="sm:max-w-sm">
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
        <Button
          type="button"
          onClick={onConfirm}
          disabled={pending}
          style={{ background: '#e11d48', color: '#fff', border: 'none' }}
        >
          {pending ? 'Deleting…' : 'Delete'}
        </Button>
      </div>
    </Dialog>
  );
}
