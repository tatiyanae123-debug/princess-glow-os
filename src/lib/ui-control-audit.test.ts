import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

// Wave 8 source-level contract: visible controls must have actions and literal internal
// destinations must resolve to an App Router page (or a supported special target).
const ROOT=process.cwd();
const SRC=path.join(ROOT,'src');
const APP=path.join(SRC,'app');

function walk(dir:string):string[]{
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
    const full=path.join(dir,entry.name);
    if(entry.isDirectory())return walk(full);
    return /\.tsx$/.test(entry.name)?[full]:[];
  });
}

function attr(opening:ts.JsxOpeningLikeElement,name:string){
  return opening.attributes.properties.find(p=>ts.isJsxAttribute(p)&&ts.isIdentifier(p.name)&&p.name.text===name) as ts.JsxAttribute|undefined;
}

function attrLiteral(a:ts.JsxAttribute|undefined){
  if(!a?.initializer)return '';
  if(ts.isStringLiteral(a.initializer))return a.initializer.text;
  return null;
}

function insideForm(node:ts.Node){
  let cur:ts.Node|undefined=node.parent;
  while(cur){
    if(ts.isJsxElement(cur)&&cur.openingElement.tagName.getText()==='form')return true;
    cur=cur.parent;
  }
  return false;
}

function hasSpreadProps(opening:ts.JsxOpeningLikeElement){
  return opening.attributes.properties.some(p=>ts.isJsxSpreadAttribute(p));
}

function lineOf(source:ts.SourceFile,node:ts.Node){return source.getLineAndCharacterOfPosition(node.getStart()).line+1;}
function normalizeHref(value:string){return value.split('#')[0].split('?')[0].replace(/\/$/,'')||'/';}
function appPageExists(href:string){
  const route=normalizeHref(href);
  if(route==='/')return fs.existsSync(path.join(APP,'page.tsx'));
  const segments=route.slice(1).split('/').filter(Boolean);
  if(fs.existsSync(path.join(APP,...segments,'page.tsx')))return true;
  for(let depth=segments.length-1;depth>=1;depth--){
    const parent=path.join(APP,...segments.slice(0,depth));
    if(fs.existsSync(path.join(parent,'[...path]','page.tsx'))||fs.existsSync(path.join(parent,'[[...path]]','page.tsx')))return true;
  }
  const root=path.join(APP,segments[0]||'');
  return fs.existsSync(path.join(root,'[[...path]]','page.tsx'));
}
function internalLiteral(value:string|null){return typeof value==='string'&&value.startsWith('/')&&!value.startsWith('//');}

function audit(){
  const inertButtons:Array<{file:string;line:number;text:string}>=[];
  const badLinks:Array<{file:string;line:number;text:string}>=[];
  const missingRoutes:Array<{file:string;line:number;href:string}>=[];
  for(const file of walk(SRC)){
    const text=fs.readFileSync(file,'utf8');
    const source=ts.createSourceFile(file,text,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
    const visit=(node:ts.Node)=>{
      if(ts.isJsxOpeningElement(node)||ts.isJsxSelfClosingElement(node)){
        const tag=node.tagName.getText(source);
        if(tag==='button'){
          const onClick=attr(node,'onClick');
          const formAction=attr(node,'formAction');
          const delegatedRefAction=attr(node,'data-ref-action');
          const delegatedVoiceAction=attr(node,'data-glow-voice-open');
          const type=attrLiteral(attr(node,'type'));
          const hasAction=Boolean(onClick||formAction||delegatedRefAction||delegatedVoiceAction||hasSpreadProps(node)||type==='submit'||type==='reset'||(insideForm(node)&&type!=='button'));
          if(!hasAction)inertButtons.push({file:path.relative(ROOT,file),line:lineOf(source,node),text:node.getText(source).slice(0,180)});
        }
        if(tag==='Link'||tag==='a'){
          const href=attr(node,'href');
          const hrefValue=attrLiteral(href);
          if(!href||hrefValue===''||hrefValue==='#'||(typeof hrefValue==='string'&&hrefValue.toLowerCase().startsWith('javascript:'))){
            badLinks.push({file:path.relative(ROOT,file),line:lineOf(source,node),text:node.getText(source).slice(0,180)});
          }else if(internalLiteral(hrefValue)&&!appPageExists(hrefValue!)){
            missingRoutes.push({file:path.relative(ROOT,file),line:lineOf(source,node),href:hrefValue!});
          }
        }
      }
      ts.forEachChild(node,visit);
    };
    visit(source);
  }
  return {inertButtons,badLinks,missingRoutes};
}

describe('interactive control audit',()=>{
  it('ships no inert buttons anywhere in the app',()=>{expect(audit().inertButtons).toEqual([]);});
  it('ships no missing or placeholder link targets',()=>{expect(audit().badLinks).toEqual([]);});
  it('ships no literal internal links to missing pages',()=>{expect(audit().missingRoutes).toEqual([]);});
});
