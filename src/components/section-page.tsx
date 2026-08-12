import { EditableRoomImage } from '@/components/media/editable-room-image';

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'room';
}

export function SectionPage({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-[20px] border border-[var(--glow-border)]">
        <EditableRoomImage
          slot={`hero:${slug(eyebrow || title)}`}
          label={`${title} hero image`}
          className="min-h-[128px] sm:min-h-[148px]"
        >
          <div className="relative z-10 flex h-full flex-col justify-end gap-1.5 bg-[linear-gradient(0deg,rgba(24,18,17,.62),rgba(24,18,17,.08)_70%,transparent)] p-5 sm:p-6">
            <p className="text-[9px] font-semibold uppercase tracking-[.18em] text-white/85">{eyebrow}</p>
            <h1 className="glow-display text-[26px] leading-none tracking-[-.02em] text-white sm:text-[32px]">{title}</h1>
            <p className="max-w-xl text-[10px] leading-4 text-white/80 sm:text-[10.5px]">{description}</p>
          </div>
        </EditableRoomImage>
      </div>
      {children}
    </div>
  );
}
