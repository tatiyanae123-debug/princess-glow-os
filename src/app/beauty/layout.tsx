import { AppShell } from '@/components/app-shell';

export default function BeautyLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
