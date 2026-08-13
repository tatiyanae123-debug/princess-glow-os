import type { RoomUpgradeSet } from './types';

export const ROUTINE_HABIT_UPGRADES: RoomUpgradeSet[] = [
  { key:'routines', label:'Routines & Rituals', path:'/routines', upgrades:[
    {id:'builder',label:'Visual Routine Builder',description:'Create and edit routines with the existing routine manager.',kind:'route',href:'/routines'},
    {id:'dayparts',label:'Daypart Libraries',description:'Organize morning, midday, evening, night, weekly, beauty, hair and reset routines.',kind:'route',href:'/routines'},
    {id:'step-mode',label:'Step-by-Step Mode',description:'Run a routine one step at a time with the guided player.',kind:'route',href:'/routines'},
    {id:'adaptive-length',label:'Adaptive Routine Lengths',description:'Save full, normal, quick and emergency versions.',kind:'entity',entityType:'routine_variant',fields:[{key:'routine',label:'Routine'},{key:'mode',label:'Mode',type:'select',options:['Full','Normal','Quick','Emergency']},{key:'steps',label:'Steps',type:'textarea'}]},
    {id:'timers',label:'Timers Inside Steps',description:'Use the guided routine player for timed steps.',kind:'route',href:'/routines'},
    {id:'conditional',label:'Conditional Steps',description:'Save wash-day, appointment-day or low-energy conditions.',kind:'entity',entityType:'routine_condition',fields:[{key:'routine',label:'Routine'},{key:'condition',label:'When this applies'},{key:'steps',label:'Conditional steps',type:'textarea'}]},
    {id:'stacking',label:'Routine Stacking',description:'Connect routines that should flow into one another.',kind:'relations',scope:['routine']},
    {id:'analytics',label:'Completion Analytics',description:'Review routine activity and completion patterns over time.',kind:'history',scope:['routine']},
    {id:'optimization',label:'Routine Optimization',description:'Find friction and simplify consistently skipped steps.',kind:'insight',scope:['routines','habits']},
    {id:'templates',label:'Routine Templates',description:'Save reusable routine structures.',kind:'entity',entityType:'routine_template',fields:[{key:'category',label:'Category'},{key:'steps',label:'Template steps',type:'textarea'},{key:'duration',label:'Estimated minutes',type:'number'}]},
  ]},
  { key:'habits', label:'Habits', path:'/habits', upgrades:[
    {id:'garden',label:'Interactive Habit Garden',description:'Use real habit records in the Habit Garden.',kind:'route',href:'/habits'},
    {id:'heatmap',label:'Calendar Heat Maps',description:'Review habit completion over time.',kind:'history',scope:['habits']},
    {id:'streaks',label:'Supportive Streaks',description:'Review consistency without punitive messaging.',kind:'route',href:'/habits'},
    {id:'difficulty',label:'Habit Difficulty Tracking',description:'Log perceived difficulty and friction.',kind:'entity',entityType:'habit_difficulty',fields:[{key:'habit',label:'Habit'},{key:'difficulty',label:'Difficulty 1–10',type:'number'},{key:'reason',label:'What changed?',type:'textarea'}]},
    {id:'goal-links',label:'Habit → Goal Connections',description:'Connect habits to the outcomes they support.',kind:'relations',scope:['habit','goal']},
    {id:'daypart',label:'Morning / Evening Groups',description:'Save daypart groupings for repeat behaviors.',kind:'entity',entityType:'habit_group',fields:[{key:'name',label:'Group name'},{key:'daypart',label:'Daypart',type:'select',options:['Morning','Midday','Evening','Night']},{key:'habits',label:'Habits',type:'textarea'}]},
    {id:'triggers',label:'Trigger-Based Habits',description:'Define an after-this → do-that trigger.',kind:'entity',entityType:'habit_trigger',fields:[{key:'trigger',label:'After this...'},{key:'habit',label:'Do this...'},{key:'notes',label:'Notes',type:'textarea'}]},
    {id:'patterns',label:'Monthly Consistency Patterns',description:'Find the strongest and weakest consistency periods.',kind:'insight',scope:['habits']},
    {id:'experiments',label:'Habit Experiments',description:'Run a 14- or 30-day behavior experiment.',kind:'entity',entityType:'habit_experiment',fields:[{key:'habit',label:'Experiment'},{key:'duration',label:'Duration',type:'select',options:['14 days','30 days','Custom']},{key:'hypothesis',label:'What are you testing?',type:'textarea'}]},
    {id:'simplify',label:'Simplify with Glow',description:'Use evidence to build a simpler plan.',kind:'insight',scope:['habits','wellness','planning']},
  ]},
];
