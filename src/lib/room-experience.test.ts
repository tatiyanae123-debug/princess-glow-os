import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { SYSTEM_ROOMS } from '@/lib/intelligence/system-registry';
import { navItems } from '@/lib/navigation';

const root=process.cwd();
function exists(route:string){
  const relative=route==='/'?'':route.replace(/^\//,'');
  return fs.existsSync(path.join(root,'src','app',relative,'page.tsx'))||fs.existsSync(path.join(root,'src','app',relative,'page.ts'));
}

describe('deep room experience',()=>{
  it('all first-class room routes exist',()=>{
    const missing=SYSTEM_ROOMS.filter(room=>!exists(room.path)&&!['/dashboard','/today'].includes(room.path)).map(room=>room.path);
    expect(missing).toEqual([]);
  });
  it('Routines and Food are first-class navigation destinations',()=>{
    expect(navItems.some(item=>item.href==='/routines')).toBe(true);
    expect(navItems.some(item=>item.href==='/food')).toBe(true);
  });
  it('global intake dock is mounted in the application shell',()=>{
    const shell=fs.readFileSync(path.join(root,'src','components','app-shell.tsx'),'utf8');
    expect(shell).toContain('<GlobalIntakeDock />');
  });
});
