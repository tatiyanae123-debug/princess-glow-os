export type ReminderIntelligence={
  domain:string;
  destinations:string[];
  intent:string;
  urgency:'overdue'|'today'|'upcoming'|'unscheduled'|'complete';
  nextAction:string;
  triggerType:'time'|'location'|'recurring'|'context'|'unscheduled';
  essential:boolean;
  suggestedList:string;
  modeVisibility:'always'|'normal-up'|'very-productive-only';
  escalationCandidate:boolean;
  workflow:'routine'|'appointment'|'follow-up'|'shopping'|'maintenance'|'goal'|'care'|'general';
};

type Input={
  title:string;
  notes?:string|null;
  dueAt?:Date|null;
  completed:boolean;
  listName?:string|null;
  recurrence?:string|null;
  locationName?:string|null;
  locationTrigger?:'arrive'|'leave'|null;
  priority?:'none'|'low'|'medium'|'high';
  flagged?:boolean;
  snoozeCount?:number;
};

export function understandAppleReminder(input:Input):ReminderIntelligence{
  const text=`${input.title} ${input.notes??''} ${input.listName??''}`.toLowerCase();
  const now=Date.now();
  const due=input.dueAt?.getTime();
  const sameDay=due?new Date(due).toDateString()===new Date(now).toDateString():false;
  const urgency:ReminderIntelligence['urgency']=input.completed?'complete':due&&due<now&&!sameDay?'overdue':sameDay?'today':due?'upcoming':'unscheduled';
  const triggerType:ReminderIntelligence['triggerType']=input.locationName||input.locationTrigger?'location':input.recurrence?'recurring':due?'time':/after my|before my|next time|when i|when i'm|when im|when i’m/.test(text)?'context':'unscheduled';

  const rules:Array<{match:RegExp;domain:string;destinations:string[];intent:string;nextAction:string;suggestedList:string;workflow:ReminderIntelligence['workflow'];essential?:boolean}>=[
    {match:/grocery|groceries|food|meal|recipe|fridge|pantry|cook|dinner|lunch|breakfast/,domain:'food',destinations:['reminders','food','planning','finance'],intent:'nourishment',nextAction:'Use this in Food planning or the grocery workflow.',suggestedList:'Groceries',workflow:'shopping'},
    {match:/hair|wash day|scalp|shampoo|conditioner|salon|trim|braid/,domain:'hair',destinations:['reminders','hair','calendar','beauty'],intent:'care',nextAction:'Place this inside the Hair lifecycle and protect time for it if needed.',suggestedList:'Beauty + Hair',workflow:'routine'},
    {match:/skin|beauty|serum|moisturizer|retinol|tretinoin|makeup|nails|brows|facial/,domain:'beauty',destinations:['reminders','beauty','beauty-lab','calendar'],intent:'beauty-care',nextAction:'Connect this reminder to the relevant Beauty routine, product, or appointment.',suggestedList:'Beauty + Hair',workflow:'routine'},
    {match:/workout|gym|run|walk|pilates|cardio|strength|mobility|stretch/,domain:'fitness',destinations:['reminders','fitness','today','habits'],intent:'movement',nextAction:'Use schedule and recovery context to decide the best workout window.',suggestedList:'Fitness',workflow:'routine'},
    {match:/medication|medicine|meds|prescription|vitamin|supplement|refill|pharmacy|water|sleep|therapy/,domain:'wellness',destinations:['reminders','wellness','today','calendar'],intent:'wellness',nextAction:'Keep this visible in Wellness and Today when it becomes relevant.',suggestedList:'Health + Care',workflow:'care',essential:true},
    {match:/bill|pay|subscription|rent|budget|bank|card|save|savings|invoice|insurance/,domain:'finance',destinations:['reminders','finance','financial-brain','calendar'],intent:'money',nextAction:'Surface this before the due date and include it in money forecasting.',suggestedList:'Bills + Money',workflow:'maintenance',essential:true},
    {match:/laundry|clean|cleaning|trash|home|bedroom|bathroom|kitchen|restock|saint|dog/,domain:'home',destinations:['reminders','home','planning','tasks'],intent:'home-care',nextAction:'Group this into the next Home Reset or appropriate household block.',suggestedList:'Home',workflow:'maintenance'},
    {match:/project|glow os|terrain|portfolio|website|prototype|research|client|content/,domain:'projects',destinations:['reminders','projects','tasks','calendar','goals'],intent:'project',nextAction:'Attach this to the relevant project and make sure it has a next action.',suggestedList:'Projects',workflow:'goal'},
    {match:/appointment|doctor|dentist|interview|reservation|meeting|call at|class|shift/,domain:'calendar',destinations:['reminders','calendar','today','briefings'],intent:'commitment',nextAction:'Treat this as time-sensitive context and compare it with the calendar.',suggestedList:'Appointments + Follow-ups',workflow:'appointment',essential:true},
    {match:/follow up|follow-up|email|text|call|respond|reply|check back|application|order status|renew/,domain:'follow-up',destinations:['reminders','work','tasks','calendar','briefings'],intent:'follow-up',nextAction:'Keep this visible until the follow-up is handled or converted into a task.',suggestedList:'Follow-ups',workflow:'follow-up'},
    {match:/buy|order|pick up|pickup|return|exchange|shopping|store|restock/,domain:'errands',destinations:['reminders','tasks','planning','finance'],intent:'errand',nextAction:'Batch this with nearby errands or shopping when possible.',suggestedList:'Shopping + Errands',workflow:'shopping'},
    {match:/goal|milestone|weekly review|check in|check-in/,domain:'goals',destinations:['reminders','goals','planning','briefings'],intent:'goal-progress',nextAction:'Use this as a strategic goal prompt rather than daily pressure.',suggestedList:'Goals',workflow:'goal'},
  ];
  const match=rules.find(rule=>rule.match.test(text));
  const essential=Boolean(match?.essential||input.flagged||input.priority==='high'||urgency==='overdue'||/urgent|critical|must|cannot miss|can't miss/.test(text));
  const escalationCandidate=!input.completed&&((input.snoozeCount??0)>=4||/keeps moving|keeps getting moved|postponed again/.test(text));
  const modeVisibility:ReminderIntelligence['modeVisibility']=essential?'always':match?.workflow==='goal'||match?.workflow==='routine'?'normal-up':'normal-up';
  if(match)return {...match,urgency,triggerType,essential,modeVisibility,escalationCandidate};
  return {
    domain:'general',
    destinations:['reminders','tasks','today','briefings'],
    intent:'action',
    urgency,
    nextAction:'Keep this in the attention queue and schedule it if it needs protected time.',
    triggerType,
    essential,
    suggestedList:'Reminders',
    modeVisibility,
    escalationCandidate,
    workflow:'general',
  };
}
