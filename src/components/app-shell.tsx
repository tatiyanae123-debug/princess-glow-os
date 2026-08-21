'use client';

import { AppShell as OptimizedAppShell } from '@/components/app-shell-optimized';
import { GlowLifeIntelligence } from '@/components/life-intelligence/glow-life-intelligence';

export function AppShell({children}:{children:React.ReactNode}){
 return <OptimizedAppShell>{children}<GlowLifeIntelligence/></OptimizedAppShell>;
}
