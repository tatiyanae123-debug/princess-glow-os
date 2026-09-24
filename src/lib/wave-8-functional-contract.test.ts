import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { GLOW_PAGE_MANIFESTS, REQUIRED_SYNC_DIMENSIONS, pageContractViolations, pageManifestFor } from '@/lib/glow-world/page-manifest';
import { CANONICAL_EXPERIENCE_SPECS } from '@/lib/glow-world/canonical-experiences';

const ROOT=process.cwd();
const APP=path.join(ROOT,'src','app');
const pageFor=(route:string)=>route==='/'?path.join(APP,'page.tsx'):path.join(APP,...route.slice(1).split('/'),'page.tsx');
const routeExists=(route:string)=>{
  if(fs.existsSync(pageFor(route)))return true;
  const segments=route.replace(/^\//,'').split('/').filter(Boolean);
  for(let depth=segments.length-1;depth>=1;depth--){
    const parent=path.join(APP,...segments.slice(0,depth));
    if(fs.existsSync(path.join(parent,'[...path]','page.tsx'))||fs.existsSync(path.join(parent,'[[...path]]','page.tsx')))return true;
  }
  if(segments[0]&&fs.existsSync(path.join(APP,segments[0],'[[...path]]','page.tsx')))return true;
  return false;
};

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


  it('backs every canonical deep experience with a real App Router family and page contract',()=>{
    const failures=CANONICAL_EXPERIENCE_SPECS.flatMap(spec=>{
      const routeFailure=routeExists(spec.path)?[]:[`missing-route:${spec.path}`];
      const contract=pageContractViolations(spec.path).map(item=>`${spec.path}:${item}`);
      return [...routeFailure,...contract];
    });
    expect(failures).toEqual([]);
  });

  it('keeps Beauty canonical experiences inside Life rather than restoring a sixth World',()=>{
    const failures=CANONICAL_EXPERIENCE_SPECS
      .filter(spec=>spec.path.startsWith('/beauty/'))
      .filter(spec=>pageManifestFor(spec.path)?.world!=='life')
      .map(spec=>spec.path);
    expect(failures).toEqual([]);
  });

  it('keeps centralized Glow command, multimodal, voice and intake endpoints present',()=>{
    const required=['src/app/api/glow/command/route.ts','src/app/api/glow/multimodal/route.ts','src/app/api/glow/speak/route.ts','src/app/api/glow/transcribe/route.ts','src/app/api/intake/route.ts'];
    expect(required.filter(file=>!fs.existsSync(path.join(ROOT,file)))).toEqual([]);
  });
});
