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
    <div className="space-y-6">
      <div className="overflow-hidden rounded-[20px] border border-[#F1E7E3]">
        <EditableRoomImage
          slot={`hero:${slug(eyebrow || title)}`}
          label={`${title} hero image`}
          className="min-h-[160px] sm:min-h-[200px]"
        >
          <div className="relative z-10 flex h-full flex-col justify-end gap-2 bg-[linear-gradient(0deg,rgba(24,18,17,.68),rgba(24,18,17,.1)_70%,transparent)] p-6 sm:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[.18em] text-white/85">{eyebrow}</p>
            <h1 className="glow-display text-[34px] leading-[1.05] tracking-[-.02em] text-white sm:text-[42px]">{title}</h1>
            <p className="max-w-xl text-[13px] leading-5 text-white/80">{description}</p>
          </div>
        </EditableRoomImage>
      </div>
      {children}
    </div>
  );
}
