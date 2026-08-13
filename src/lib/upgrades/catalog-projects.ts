import type { RoomUpgradeSet } from './types';

export const PROJECT_UPGRADES: RoomUpgradeSet[] = [
  { key:'projects', label:'Projects / Work', path:'/projects', upgrades:[
    {id:'dashboard',label:'Project Dashboard',description:'Use the real Projects hub for active work and progress.',kind:'route',href:'/projects'},
    {id:'milestones',label:'Milestones',description:'Use real project milestones and completion controls.',kind:'route',href:'/projects'},
    {id:'tasks',label:'Project Tasks',description:'Connect project work to the real Tasks system.',kind:'relations',scope:['project','task']},
    {id:'files',label:'Project Materials',description:'Save project links, references and material records without pretending there is a file table.',kind:'entity',entityType:'project_material',fields:[{key:'project',label:'Project'},{key:'url',label:'Link / reference'},{key:'notes',label:'Notes',type:'textarea'}]},
    {id:'notes',label:'Project Notes',description:'Connect existing Notes to projects.',kind:'relations',scope:['project','note']},
    {id:'decisions',label:'Decision Log',description:'Record important project decisions and their reasoning.',kind:'entity',entityType:'project_decision',fields:[{key:'project',label:'Project'},{key:'decision',label:'Decision',type:'textarea'},{key:'reason',label:'Reason',type:'textarea'}]},
    {id:'deadlines',label:'Deadline View',description:'Review real project deadlines with Calendar context.',kind:'insight',scope:['project','calendar']},
    {id:'people',label:'Project People',description:'Create people records and connect them to projects.',kind:'entity',entityType:'person',fields:[{key:'role',label:'Role / relationship'},{key:'contact',label:'Contact information'},{key:'notes',label:'Notes',type:'textarea'}]},
    {id:'timeline',label:'Project Timeline',description:'Review project activity and milestones chronologically.',kind:'history',scope:['project']},
    {id:'manager',label:'AI Project Manager',description:'Surface blockers, deadlines and the next meaningful action from real project data.',kind:'insight',scope:['project','task','goal','calendar']},
  ]},
  { key:'creative-studio', label:'Creative Studio', path:'/projects', upgrades:[
    {id:'moodboards',label:'Mood Boards',description:'Build named mood boards from references and notes.',kind:'entity',entityType:'moodboard',fields:[{key:'project',label:'Project'},{key:'references',label:'References / image URLs',type:'textarea'},{key:'direction',label:'Creative direction',type:'textarea'}]},
    {id:'inspiration',label:'Inspiration Library',description:'Save visual and conceptual inspiration with tags.',kind:'entity',entityType:'inspiration',fields:[{key:'source',label:'Source / URL'},{key:'tags',label:'Tags'},{key:'notes',label:'Why it matters',type:'textarea'}]},
    {id:'brand-boards',label:'Brand Boards',description:'Save brand direction, voice and visual cues.',kind:'entity',entityType:'brand_board',fields:[{key:'brand',label:'Brand / project'},{key:'direction',label:'Direction',type:'textarea'},{key:'references',label:'References',type:'textarea'}]},
    {id:'palettes',label:'Color Palettes',description:'Create reusable named color palettes.',kind:'entity',entityType:'color_palette',fields:[{key:'colors',label:'Colors / hex values',type:'textarea'},{key:'usage',label:'Usage notes',type:'textarea'}]},
    {id:'typography',label:'Typography Collections',description:'Save type combinations and usage notes.',kind:'entity',entityType:'typography_collection',fields:[{key:'fonts',label:'Typefaces'},{key:'usage',label:'Usage notes',type:'textarea'}]},
    {id:'assets',label:'Image / Reference Organization',description:'Connect references and project materials into one relationship view.',kind:'relations',scope:['project_material','inspiration','moodboard','project']},
    {id:'canvases',label:'Project Canvases',description:'Build a structured creative canvas with problem, idea and next steps.',kind:'entity',entityType:'creative_canvas',fields:[{key:'project',label:'Project'},{key:'idea',label:'Core idea',type:'textarea'},{key:'next',label:'Next steps',type:'textarea'}]},
    {id:'stages',label:'Idea Development Stages',description:'Track ideas from spark through refinement and delivery.',kind:'entity',entityType:'creative_stage',fields:[{key:'idea',label:'Idea'},{key:'stage',label:'Stage',type:'select',options:['Spark','Explore','Refine','Build','Ready','Archived']},{key:'notes',label:'Notes',type:'textarea'}]},
    {id:'archive',label:'Creative Archive',description:'Review saved creative objects and project history.',kind:'history',scope:['moodboard','inspiration','brand_board','creative_canvas','creative_stage']},
    {id:'presentation',label:'Presentation Mode',description:'Open Projects in focus mode so creative work can be presented without app chrome.',kind:'route',href:'/projects?focus=1'},
  ]},
];
