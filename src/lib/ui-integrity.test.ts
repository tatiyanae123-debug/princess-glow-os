import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { navItems } from '@/lib/navigation';
import { ROOM_ACTIONS } from '@/lib/intelligence/room-actions';
import { DEEP_WORKSPACES } from '@/lib/workspaces/deep-workspace-blueprints';

const ROOT=process.cwd();
const SRC=path.join(ROOT,'src');
const APP=path.join(SRC,'app');

function walk(dir:string):string[]{
  if(!fs.existsSync(dir))return[];
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
    const full=path.join(dir,entry.name);
    if(entry.isDirectory())return walk(full);
    return /\.(tsx|ts)$/.test(entry.name)?[full]:[];
  });
}

function appPageExists(href:string){
  const route=(href.split('#')[0].split('?')[0].replace(/\/$/,'')||'/');
  if(route==='/')return fs.existsSync(path.join(APP,'page.tsx'));
  const segments=route.slice(1).split('/').filter(Boolean);
  if(fs.existsSync(path.join(APP,...segments,'page.tsx'))||fs.existsSync(path.join(APP,...segments,'page.ts')))return true;
  for(let depth=segments.length-1;depth>=1;depth--){
    const parent=path.join(APP,...segments.slice(0,depth));
    if(fs.existsSync(path.join(parent,'[...path]','page.tsx'))||fs.existsSync(path.join(parent,'[[...path]]','page.tsx')))return true;
  }
  const root=path.join(APP,segments[0]||'');
  return fs.existsSync(path.join(root,'[[...path]]','page.tsx'));
}

function sourceFiles(){return walk(SRC);}

function literalInternalLinks(){
  const links:Array<{file:string;href:string}>=[];
  const pattern=/href\s*=\s*["'](\/[^"'#?]*)[^"']*["']/g;
  for(const file of sourceFiles()){
    const text=fs.readFileSync(file,'utf8');
    let match:RegExpExecArray|null;
    while((match=pattern.exec(text))){links.push({file:path.relative(ROOT,file),href:match[1]||'/'});}
  }
  return links;
}

function configuredLinks(){
  const links:Array<{source:string;href:string}>=navItems.map(item=>({source:`navigation:${item.label}`,href:item.href}));
  for(const [room,actions] of Object.entries(ROOM_ACTIONS))for(const action of actions)links.push({source:`room-action:${room}:${action.label}`,href:action.href});
  for(const [room,spec] of Object.entries(DEEP_WORKSPACES))for(const workspaceModule of spec.modules)if(workspaceModule.href)links.push({source:`deep-workspace:${room}:${workspaceModule.title}`,href:workspaceModule.href});
  return links;
}

describe('Glow OS UI integrity',()=>{
  it('every literal internal link points at a real application page',()=>{
    const missing=literalInternalLinks().filter(({href})=>!href.startsWith('/api/')&&!appPageExists(href));
    expect(missing).toEqual([]);
  });

  it('every configured navigation, action-dock, and deep-workspace link points at a real page',()=>{
    const missing=configuredLinks().filter(({href})=>!href.startsWith('/api/')&&!appPageExists(href));
    expect(missing).toEqual([]);
  });

  it('does not ship placeholder or javascript links',()=>{
    const offenders:Array<{file:string;value:string}>=[];
    for(const file of sourceFiles()){
      const text=fs.readFileSync(file,'utf8');
      for(const pattern of [/href\s*=\s*["']#["']/g,/href\s*=\s*["']javascript:[^"']*["']/gi,/href\s*=\s*["']["']/g]){
        for(const match of text.matchAll(pattern))offenders.push({file:path.relative(ROOT,file),value:match[0]});
      }
    }
    expect(offenders).toEqual([]);
  });

  it('does not ship obviously empty click handlers',()=>{
    const offenders:Array<{file:string;value:string}>=[];
    for(const file of sourceFiles()){
      const text=fs.readFileSync(file,'utf8');
      for(const pattern of [/onClick\s*=\s*\{\s*\(\s*\)\s*=>\s*\{\s*\}\s*\}/g,/onClick\s*=\s*\{\s*\(\s*\)\s*=>\s*undefined\s*\}/g]){
        for(const match of text.matchAll(pattern))offenders.push({file:path.relative(ROOT,file),value:match[0]});
      }
    }
    expect(offenders).toEqual([]);
  });
});
