'use client';

import { useEffect } from 'react';

const TEXT_REPLACEMENTS: Array<[RegExp,string]> = [
  [/Good morning, (?:Princess|Editor)(?: ♡)?/g,'Good morning, Tatiyana ♡'],
  [/Good afternoon, (?:Princess|Editor)(?: ♡)?/g,'Good afternoon, Tatiyana ♡'],
  [/Good evening, (?:Princess|Editor)(?: ♡)?/g,'Good evening, Tatiyana ♡'],
  [/Good night, (?:Princess|Editor)(?: ♡)?/g,'Good night, Tatiyana ♡'],
  [/\bASK GLOW\b/g,'ASK SHAKTI'],
  [/\bAsk Glow\b/g,'Ask Shakti'],
  [/\bGlow ·/g,'Shakti ·'],
  [/\bGlow action\b/g,'Shakti action'],
  [/\bGlow prepared\b/g,'Shakti prepared'],
  [/\bGlow understood\b/g,'Shakti understood'],
  [/\bGlow could not\b/g,'Shakti could not'],
  [/\bLiving Glow Aura\b/g,'Shakti'],
  [/\bThe Living Glow Aura\b/g,'Shakti'],
];

const ATTRIBUTE_REPLACEMENTS: Array<[RegExp,string]> = [
  [/\bAsk Glow\b/g,'Ask Shakti'],
  [/\bClose Glow\b/g,'Close Shakti'],
  [/\bGlow voice\b/g,'Shakti voice'],
  [/\bLiving Glow Aura\b/g,'Shakti'],
];

function replaceValue(value:string,replacements:Array<[RegExp,string]>) {
  return replacements.reduce((current,[pattern,replacement])=>current.replace(pattern,replacement),value);
}

function applyShaktiLanguage(root:ParentNode) {
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  let node=walker.nextNode();
  while(node){
    const text=node.nodeValue;
    if(text){
      const next=replaceValue(text,TEXT_REPLACEMENTS);
      if(next!==text) node.nodeValue=next;
    }
    node=walker.nextNode();
  }

  root.querySelectorAll<HTMLElement>('[aria-label],[title],[placeholder]').forEach((element)=>{
    for(const attribute of ['aria-label','title','placeholder'] as const){
      const value=element.getAttribute(attribute);
      if(!value) continue;
      const next=replaceValue(value,ATTRIBUTE_REPLACEMENTS);
      if(next!==value) element.setAttribute(attribute,next);
    }
  });
}

export function ShaktiProductLanguage(){
  useEffect(()=>{
    applyShaktiLanguage(document.body);
    const observer=new MutationObserver((records)=>{
      for(const record of records){
        if(record.type==='characterData'){
          const parent=record.target.parentNode;
          if(parent) applyShaktiLanguage(parent);
          continue;
        }
        record.addedNodes.forEach((node)=>{
          if(node.nodeType===Node.TEXT_NODE){
            const parent=node.parentNode;
            if(parent) applyShaktiLanguage(parent);
          }else if(node instanceof HTMLElement){
            applyShaktiLanguage(node);
          }
        });
      }
    });
    observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['aria-label','title','placeholder']});
    return()=>observer.disconnect();
  },[]);
  return null;
}
