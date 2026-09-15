import type { BeautyMaintenanceObject } from './beauty-maintenance-engine';

export const BEAUTY_GROOMING_ROOMS = [
  {id:'beauty.nails', title:'Nails', objectTypes:['nail-routine','nail-look','nail-product','appointment']},
  {id:'beauty.brows', title:'Brows', objectTypes:['brow-routine','brow-product','appointment']},
  {id:'beauty.lashes', title:'Lashes', objectTypes:['lash-routine','lash-product','appointment']},
  {id:'beauty.oral', title:'Oral Beauty', objectTypes:['oral-routine','oral-product','treatment','appointment']},
] as const;

export const GROOMING_TEMPLATE_ASSIGNMENTS = {
  home: 'T02', library: 'T03', detail: 'T04', guided: 'T07', today: 'T08', calendar: 'T09', progress: 'T11', completion: 'T14',
} as const;

export type GroomingDomain = 'nails'|'brows'|'lashes'|'oral';

export type GroomingExperience = {
  id: string;
  domain: GroomingDomain;
  kind: 'page'|'variant'|'state'|'overlay';
  template: keyof typeof GROOMING_TEMPLATE_ASSIGNMENTS;
  maintenance?: BeautyMaintenanceObject;
};

export const GROOMING_EXPERIENCES: GroomingExperience[] = BEAUTY_GROOMING_ROOMS.flatMap(room => {
  const domain = room.id.split('.')[1] as GroomingDomain;
  return [
    {id:`${room.id}.home`,domain,kind:'page' as const,template:'home' as const},
    {id:`${room.id}.routines`,domain,kind:'page' as const,template:'library' as const},
    {id:`${room.id}.today`,domain,kind:'page' as const,template:'today' as const},
    {id:`${room.id}.calendar`,domain,kind:'page' as const,template:'calendar' as const},
    {id:`${room.id}.progress`,domain,kind:'page' as const,template:'progress' as const},
  ];
});

// These rooms inherit Beauty + the shared routine/maintenance engines. They do not create parallel calendars or routine databases.
