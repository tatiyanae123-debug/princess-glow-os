import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT=process.cwd();
const exists=(p:string)=>fs.existsSync(path.join(ROOT,p));
const read=(p:string)=>fs.readFileSync(path.join(ROOT,p),'utf8');

describe('Wave 10 production release gates',()=>{
  it('keeps cumulative Wave 7-9 runtime layers in the release candidate',()=>{
    const layout=read('src/app/layout.tsx');
    expect(layout).toContain("'./visual-convergence.css'");
    expect(layout).toContain("'./device-state-qa.css'");
    expect(layout).toContain('<NetworkStateBridge />');
  });

  it('retains global recovery states',()=>{
    expect(exists('src/app/loading.tsx')).toBe(true);
    expect(exists('src/app/error.tsx')).toBe(true);
    expect(read('src/app/error.tsx')).toContain('Try again');
    expect(read('src/app/error.tsx')).toContain('/today');
  });

  it('retains release-critical world routes',()=>{
    for(const route of ['today','planning','life','brain','create','beauty','closet','fitness','wellness']) {
      expect(exists(`src/app/${route}/page.tsx`), `missing /${route}`).toBe(true);
    }
  });

  it('retains release-critical auth and intelligence endpoints',()=>{
    const critical=['src/app/api/glow/command/route.ts','src/app/api/glow/multimodal/route.ts'];
    for(const file of critical) expect(exists(file), `missing ${file}`).toBe(true);
  });
});
