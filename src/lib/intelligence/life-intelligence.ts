import 'server-only';
import type { PersonalContext } from '@/lib/intelligence/context';

export type PulseStatus='good'|'watch'|'pressure'|'unknown';
export type LifePulseItem={label:string;status:PulseStatus;detail:string};
export type ExecutiveItem={label:string;detail:string;href:string};
export type LifeSurface={
  kind:'life-state'|'next-move'|'future-you'|'attention'|'correction';
  eyebrow:string;title:string;summary?:string;
  metrics?:Array<{label:string;value:string;status?:PulseStatus}>;
  sections?:Array<{label:string;items:ExecutiveItem[]}>;
  timeline?:Array<{time:string;title:string;detail?:string;href?:string}>;
  confidence?:'high'|'medium'|'low';
};
export type LifeIntelligenceState={
  availableMinutes:number|null;
  pulse:LifePulseItem[];
  executive:{now:ExecutiveItem[];later:ExecutiveItem[];risk:ExecutiveItem[];ignore:ExecutiveItem[]};
  predictions:string[];
  read:string;
};

function minutesUntil(date:Date,now:Date){return Math.max(0,Math.floor((date.getTime()-now.getTime())/60000));}
function clock(date:Date){return date.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});}
function statusForCount(count:number,watch:number,pressure:number):PulseStatus{return count>=pressure?'pressure':count>=watch?'watch':'good';}

export function buildLifeIntelligence(context:PersonalContext):LifeIntelligenceState{
  const now=context.generatedAt;
  const availableMinutes=context.nextEvent&&!context.nextEvent.allDay?minutesUntil(context.nextEvent.startAt,now):null;
  const openHabits=context.habits.filter(item=>!item.completedToday).length;
  const openReminders=context.appleReminders.filter(item=>!item.completed).length;
  const highAttention=context.attentionSignals.filter(item=>item.level==='high').length;
  const pulse:LifePulseItem[]=[
    {label:'Time',status:availableMinutes===null?'unknown':availableMinutes<30?'pressure':availableMinutes<90?'watch':'good',detail:availableMinutes===null?'No fixed upcoming time boundary detected.':`${availableMinutes} min until ${context.nextEvent?.title??'next event'}`},
    {label:'Schedule',status:statusForCount(context.todaysEvents.length,4,7),detail:`${context.todaysEvents.length} calendar event${context.todaysEvents.length===1?'':'s'} today`},
    {label:'Tasks',status:context.overdueTasks.length?'pressure':statusForCount(context.unfinishedTasks.length,8,15),detail:`${context.unfinishedTasks.length} unfinished · ${context.overdueTasks.length} overdue`},
    {label:'Habits',status:openHabits===0?'good':context.dayPart==='evening'||context.dayPart==='night'?'watch':'good',detail:`${context.habits.length-openHabits} of ${context.habits.length} logged`},
    {label:'Attention',status:highAttention?'pressure':context.attentionSignals.some(item=>item.level==='medium')?'watch':'good',detail:context.attentionSignals[0]?.label??'No major pressure signal'},
  ];

  const nowItems:ExecutiveItem[]=context.recommendations.slice(0,1).map(item=>({label:item.title,detail:item.reason,href:item.href}));
  const later:ExecutiveItem[]=context.recommendations.slice(1,4).map(item=>({label:item.title,detail:item.reason,href:item.href}));
  const risk:ExecutiveItem[]=context.attentionSignals.filter(item=>item.level==='high').slice(0,3).map(item=>({label:item.label,detail:item.detail,href:item.href}));
  const ignore:ExecutiveItem[]=context.recommendations.filter(item=>item.priority==='low'&&!item.title.toLowerCase().includes(context.nextEvent?.title.toLowerCase()??'__none__')).slice(-2).map(item=>({label:item.title,detail:'Low urgency in the current window. Keep optional unless circumstances change.',href:item.href}));
  const predictions:string[]=[];
  if(context.todaysEvents.length>=4&&context.unfinishedTasks.length>=5)predictions.push('Estimate: the rest of today is likely to feel compressed unless at least one flexible item moves.');
  if(context.overdueTasks.length>0)predictions.push('Estimate: unfinished overdue work is likely to create tomorrow carryover unless one overdue item is closed or deliberately rescheduled.');
  if(openHabits>0&&(context.dayPart==='evening'||context.dayPart==='night'))predictions.push(`Estimate: ${openHabits} open habit${openHabits===1?'':'s'} are at risk of becoming accidental carryover tonight.`);
  if(openReminders>=8)predictions.push('Estimate: reminder load is high enough that some prompts may be functioning as tasks rather than true reminders.');
  if(!predictions.length)predictions.push('No strong negative forecast is visible from the current live data.');

  let read='Your system looks balanced enough to focus on one useful next action.';
  if(availableMinutes!==null&&availableMinutes<30)read='Protect the next fixed commitment. Only choose something very small before it.';
  else if(highAttention)read='There is real pressure in the system. Reduce choices and handle one risk before adding anything new.';
  else if(context.recommendations[0])read=`The cleanest next move is ${context.recommendations[0].title}.`;
  return{availableMinutes,pulse,executive:{now:nowItems,later,risk,ignore},predictions,read};
}

export function buildAdaptiveSurface(text:string,context:PersonalContext,state:LifeIntelligenceState):LifeSurface|null{
  const q=text.toLowerCase();
  const correction=/that(?:'s| is) wrong|not right|you(?:'re| are) wrong|actually|i meant|no,? that/.test(q);
  if(correction)return{kind:'correction',eyebrow:'CORRECTION MODE',title:'I’m re-checking the live system, not defending my last answer.',summary:'I’ll separate what Glow can verify from what you just corrected, then use the newest confirmed information going forward.',confidence:'high'};

  const future=/what if|if i (?:don'?t|do not|skip|move)|what happens if/.test(q);
  if(future){
    const next=context.recommendations[0];const event=context.nextEvent;const available=state.availableMinutes;
    return{kind:'future-you',eyebrow:'FUTURE YOU',title:next?`Compare doing ${next.title} now vs. moving it`:'Compare the two paths',summary:'This is a simulation from your current Glow data, not a guarantee.',sections:[
      {label:'OPTION A · KEEP THE NEXT MOVE',items:next?[{label:next.title,detail:`Keeps the current priority intact${available!==null?` with ${available} minutes before the next fixed event`:''}.`,href:next.href}]:[]},
      {label:'OPTION B · MOVE / SKIP IT',items:[{label:'More space now',detail:`You gain immediate flexibility${event?`, but the work still competes with time after ${event.title}`:' and create future carryover unless it is deliberately rescheduled'}.`,href:'/planning'}]},
    ],confidence:'medium'};
  }

  if(/life state|life pulse|how is my day|status of my day|how am i doing/.test(q))return{kind:'life-state',eyebrow:'YOUR LIFE · RIGHT NOW',title:state.read,metrics:state.pulse.map(item=>({label:item.label,value:item.detail,status:item.status})),summary:state.predictions[0],confidence:'high'};

  if(/what should i do|what do i do|right now|next thing|next hour|what now/.test(q)){
    const next=context.recommendations[0];
    const timeline:LifeSurface['timeline']=[];
    if(next)timeline.push({time:'NOW',title:next.title,detail:next.reason,href:next.href});
    if(context.nextEvent)timeline.push({time:context.nextEvent.allDay?'TODAY':clock(context.nextEvent.startAt),title:context.nextEvent.title,detail:'Fixed calendar boundary',href:'/calendar'});
    return{kind:'next-move',eyebrow:'NEXT BEST MOVE',title:next?.title??'Protect the next useful block',summary:next?.reason??state.read,timeline,sections:[
      {label:'DO LATER',items:state.executive.later.slice(0,2)},
      {label:'AT RISK',items:state.executive.risk.slice(0,2)},
    ],confidence:next?'high':'medium'};
  }

  if(/ignore|what can wait|simplify|too much|overwhelm/.test(q))return{kind:'attention',eyebrow:'EXECUTIVE FUNCTION',title:'Here is what deserves your attention, and what does not.',sections:[
    {label:'DO NOW',items:state.executive.now},{label:'DO LATER',items:state.executive.later},{label:'AT RISK',items:state.executive.risk},{label:'CAN WAIT',items:state.executive.ignore},
  ],summary:state.read,confidence:'high'};
  return null;
}
