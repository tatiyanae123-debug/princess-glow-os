import type { RoomUpgradeSet } from './types';
export const INTAKE_UPGRADES:RoomUpgradeSet[]=[{key:'intake',label:'Universal Intake',path:'/intake',upgrades:[
{id:'type',label:'Type Anything',description:'Use the real text intake.',kind:'route',href:'/intake'},
{id:'speak',label:'Speak Anything',description:'Use Glow Voice and capture.',kind:'capture'},
{id:'image',label:'Upload Image',description:'Use the real image intake.',kind:'route',href:'/intake'},
{id:'document',label:'Upload Document',description:'Use Import for documents.',kind:'route',href:'/import'},
{id:'link',label:'Paste Link',description:'Capture a link with source context.',kind:'capture'},
{id:'scan',label:'Scan / Import',description:'Use Import for structured review.',kind:'route',href:'/import'},
{id:'classify',label:'Glow Classification',description:'Review classification before routing.',kind:'route',href:'/inbox'},
{id:'destination',label:'Destination Recommendation',description:'Review the suggested destination.',kind:'route',href:'/inbox'},
{id:'preview',label:'Preview Before Saving',description:'Review mapping before committing data.',kind:'route',href:'/inbox'},
{id:'route',label:'Route It',description:'Send reviewed information to a real Glow destination.',kind:'route',href:'/inbox'},
]}];
