import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { GLOW_PAGE_MANIFESTS, REQUIRED_SYNC_DIMENSIONS } from '@/lib/glow-world/page-manifest';

const ROOT=process.cwd();
const APP=path.join(ROOT,'src','app');
const pageFor=(route:string)=>route==='/'?path.join(APP,'page.tsx'):path.join(APP,...route.slice(1).split('/'),'page.tsx');

const CORE=['/today','/planning','/calendar','/tasks','/routines','/life','/wellness','/fitness','/closet','/beauty','/brain','/create','/inbox','/search','/settings'];

describe('Wave 8 functional architecture',()=>{
  it('keeps every canonical manifest destination backed by a real route',()=>{
    const missing=GLOW_PAGE_MANIFESTS.filter(page=>!fs.existsSync(pageFor(page.match))).map(page=>page.match);
    expect(missing).toEqual([]);
  });

  it('keeps core cross-world destinations registered and routable',()=>{
    const registered=new Set(GLOW_PAGE_MANIFESTS.map(page=>page.match));
    const failures=CORE.filter(route=>!registered.has(route)||!fs.existsSync(pageFor(route)));
    expect(failures).toEqual([]);
  });

  it('keeps all eight synchronization dimensions and return context enabled',()=>{
    const failures=GLOW_PAGE_MANIFESTS.flatMap(page=>{
      const missing=REQUIRED_SYNC_DIMENSIONS.filter(dimension=>!page.sync.includes(dimension));
      return missing.length||!page.preservesReturnContext?[`${page.id}:${missing.join(',')||'return-context'}`]:[];
    });
    expect(failures).toEqual([]);
  });

  it('keeps centralized Glow command, multimodal, voice and intake endpoints present',()=>{
    const required=['src/app/api/glow/command/route.ts','src/app/api/glow/multimodal/route.ts','src/app/api/glow/speak/route.ts','src/app/api/glow/transcribe/route.ts','src/app/api/intake/route.ts'];
    expect(required.filter(file=>!fs.existsSync(path.join(ROOT,file)))).toEqual([]);
  });
});
