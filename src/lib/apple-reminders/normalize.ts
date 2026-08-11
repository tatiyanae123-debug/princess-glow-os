import 'server-only';

import { createHash } from 'crypto';
import type { AppleReminderImport } from '@/lib/validations/apple-reminders';

function hash(value:string){return createHash('sha256').update(value).digest('hex').slice(0,32);}
function cleanString(value:unknown){return typeof value==='string'?value.trim():value==null?'':String(value).trim();}
function pick(record:Record<string,unknown>,keys:string[]){
  for(const key of keys){if(key in record&&record[key]!=null)return record[key];}
  const lowered=new Map(Object.entries(record).map(([key,value])=>[key.toLowerCase().replace(/[^a-z0-9]/g,''),value]));
  for(const key of keys){const found=lowered.get(key.toLowerCase().replace(/[^a-z0-9]/g,''));if(found!=null)return found;}
  return undefined;
}
function booleanValue(value:unknown){
  if(typeof value==='boolean')return value;
  const text=cleanString(value).toLowerCase();
  return ['true','yes','1','completed','done'].includes(text);
}
function isoDate(value:unknown){
  if(value==null||value==='')return null;
  const date=value instanceof Date?value:new Date(cleanString(value));
  return Number.isNaN(date.getTime())?null:date.toISOString();
}

function normalizeOne(value:unknown,index:number):AppleReminderImport['reminders'][number]|null{
  if(typeof value==='string'){
    const title=value.trim();
    if(!title)return null;
    return {externalId:`simple-${hash(`${index}:${title}`)}`,listName:'Reminders',title,notes:null,dueAt:null,completed:false};
  }
  if(!value||typeof value!=='object'||Array.isArray(value))return null;
  const record=value as Record<string,unknown>;
  const title=cleanString(pick(record,['title','name','reminder','text']));
  if(!title)return null;
  const notes=cleanString(pick(record,['notes','note','body']));
  const listName=cleanString(pick(record,['listName','list','reminderList']))||'Reminders';
  const external=cleanString(pick(record,['externalId','identifier','id','uuid']));
  const dueAt=isoDate(pick(record,['dueAt','dueDate','date','deadline']));
  const completed=booleanValue(pick(record,['completed','isCompleted','done']));
  const externalId=external||`simple-${hash(JSON.stringify(record))}`;
  return {externalId:externalId.slice(0,300),listName:listName.slice(0,120),title:title.slice(0,500),notes:notes?notes.slice(0,2000):null,dueAt,completed};
}

export function normalizeAppleReminderPayload(input:unknown):AppleReminderImport|null{
  if(!input||typeof input!=='object')return null;
  const record=input as Record<string,unknown>;
  const source=Array.isArray(record.reminders)?record.reminders:Array.isArray(record.Reminders)?record.Reminders:null;
  if(!source)return null;
  const reminders=source.slice(0,500).map(normalizeOne).filter((item):item is AppleReminderImport['reminders'][number]=>Boolean(item));
  return {reminders};
}
