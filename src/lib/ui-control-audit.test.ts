import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

// Exhaustive source-level audit: no visible control may ship without an action or destination.
const ROOT=process.cwd();
const SRC=path.join(ROOT,'src');

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

function audit(){
  const inertButtons:Array<{file:string;line:number;text:string}>=[];
  const badLinks:Array<{file:string;line:number;text:string}>=[];
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
          }
        }
      }
      ts.forEachChild(node,visit);
    };
    visit(source);
  }
  return {inertButtons,badLinks};
}

describe('interactive control audit',()=>{
  it('ships no inert buttons anywhere in the app',()=>{expect(audit().inertButtons).toEqual([]);});
  it('ships no missing or placeholder link targets',()=>{expect(audit().badLinks).toEqual([]);});
});
