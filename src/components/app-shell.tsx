'use client';

import { AppShell as OptimizedAppShell } from '@/components/app-shell-optimized';

export function AppShell({children}:{children:React.ReactNode}){
 return <OptimizedAppShell>{children}</OptimizedAppShell>;
}
