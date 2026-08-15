import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const SRC=path.join(process.cwd(),'src');

function walk(dir:string):string[]{
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap((entry)=>{
    const full=path.join(dir,entry.name);
    if(entry.isDirectory())return walk(full);
    return /\.(tsx|ts)$/.test(entry.name)?[full]:[];
  });
}

describe('interactive control audit',()=>{
  it('has no obvious inert buttons or placeholder links in source',()=>{
    for(const file of walk(SRC)){
      const text=fs.readFileSync(file,'utf8');
      expect(text, file).not.toMatch(/href=["']#["']/);
      const buttons=[...text.matchAll(/<button\b([^>]*)>/g)];
      for(const match of buttons){
        const attrs=match[1]??'';
        const clearlyInteractive=/onClick=|formAction=|type=["']submit["']|type=["']reset["']/.test(attrs);
        expect(clearlyInteractive,`${file}: ${match[0]}`).toBe(true);
      }
    }
  });

  it('configured literal internal hrefs resolve to real app routes',()=>{
    const appDir=path.join(SRC,'app');
    const routeDirs=new Set<string>();
    function collectRoutes(dir:string,segments:string[]=[]){
      const entries=fs.readdirSync(dir,{withFileTypes:true});
      if(entries.some((entry)=>entry.isFile()&&entry.name==='page.tsx')) routeDirs.add('/'+segments.filter((segment)=>!segment.startsWith('(')).join('/'));
      for(const entry of entries){
        if(!entry.isDirectory()||entry.name.startsWith('_'))continue;
        collectRoutes(path.join(dir,entry.name),[...segments,entry.name]);
      }
    }
    collectRoutes(appDir);
    for(const file of walk(SRC)){
      const text=fs.readFileSync(file,'utf8');
      for(const match of text.matchAll(/href=["'](\/[A-Za-z0-9_\-/]+)(?:[?#][^"']*)?["']/g)){
        const href=match[1];
        if(href.includes('[')||href.startsWith('/api/'))continue;
        const normalized=href==='/'?'/':href.replace(/\/$/,'');
        expect([...routeDirs].some((route)=>route===normalized||route.includes('[')&&normalized.startsWith(route.split('/[')[0])),`${file}: ${href}`).toBe(true);
      }
    }
  });

  it('Brain Add Connection edits the Mind Map rather than redirecting to Memory',()=>{
    const file=path.join(SRC,'components','brain','brain-mind-map.tsx');
    const text=fs.readFileSync(file,'utf8');
    expect(text).toContain('removeConnection');
    expect(text).toContain('CUSTOM_DESTINATIONS');
    expect(text).not.toContain("window.localStorage");
  });

  it('all non-dashboard routes stay inside the Glow V3 shell instead of the legacy architectural wrapper',()=>{
    const file=path.join(SRC,'components','app-shell-optimized.tsx');
    const text=fs.readFileSync(file,'utf8');
    expect(text).toContain('data-glow-shell="v3"');
    expect(text).toContain("pathname.startsWith('/search')");
    expect(text).not.toContain("import { ArchitecturalWorldFrame }");
    expect(text).not.toContain("import { RoomUpgradeDeck }");
    expect(text).not.toContain('<ArchitecturalWorldFrame>');
    expect(text).toContain('<Sidebar variant="dashboard-reference" />');
    expect(text).toContain('<GlobalHeader />');
  });

  it('universal Search renders inside the shared AppShell and opens exact records',()=>{
    const file=path.join(SRC,'app','search','page.tsx');
    const text=fs.readFileSync(file,'utf8');
    expect(text).toContain('<AppShell>');
    expect(text).toContain('Ask your life anything.');
    expect(text).toContain('Every supported result opens the exact saved record instead of dropping you into a generic room.');
    expect(text).toContain("case 'Finance Goal':return `/finance/brain/goal/${encodeURIComponent(id)}`");
    expect(text).not.toContain('ArchitecturalWorldFrame');
  });
});
