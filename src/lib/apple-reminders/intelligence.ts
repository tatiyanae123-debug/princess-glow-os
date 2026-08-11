export type ReminderIntelligence={
  domain:string;
  destinations:string[];
  intent:string;
  urgency:'overdue'|'today'|'upcoming'|'unscheduled'|'complete';
  nextAction:string;
};

export function understandAppleReminder(input:{title:string;notes?:string|null;dueAt?:Date|null;completed:boolean}):ReminderIntelligence{
  const text=`${input.title} ${input.notes??''}`.toLowerCase();
  const now=Date.now();
  const due=input.dueAt?.getTime();
  const sameDay=due?new Date(due).toDateString()===new Date(now).toDateString():false;
  const urgency:ReminderIntelligence['urgency']=input.completed?'complete':due&&due<now&&!sameDay?'overdue':sameDay?'today':due?'upcoming':'unscheduled';

  const rules:Array<{match:RegExp;domain:string;destinations:string[];intent:string;nextAction:string}>=[
    {match:/grocery|groceries|food|meal|recipe|fridge|pantry|cook|dinner|lunch|breakfast/,domain:'food',destinations:['reminders','food','planning','finance'],intent:'nourishment',nextAction:'Use this in Food planning or the grocery workflow.'},
    {match:/hair|wash day|scalp|shampoo|conditioner|salon|trim|braid/,domain:'hair',destinations:['reminders','hair','calendar','beauty'],intent:'care',nextAction:'Place this inside the Hair lifecycle and protect time for it if needed.'},
    {match:/skin|beauty|serum|moisturizer|retinol|tretinoin|makeup|nails|brows|facial/,domain:'beauty',destinations:['reminders','beauty','beauty-lab','calendar'],intent:'beauty-care',nextAction:'Connect this reminder to the relevant Beauty routine, product, or appointment.'},
    {match:/workout|gym|run|walk|pilates|cardio|strength|mobility|stretch/,domain:'fitness',destinations:['reminders','fitness','today','habits'],intent:'movement',nextAction:'Use schedule and recovery context to decide the best workout window.'},
    {match:/medication|medicine|meds|prescription|vitamin|supplement|refill|pharmacy|water|sleep|therapy/,domain:'wellness',destinations:['reminders','wellness','today','calendar'],intent:'wellness',nextAction:'Keep this visible in Wellness and Today when it becomes relevant.'},
    {match:/bill|pay|subscription|rent|budget|bank|card|save|savings|invoice|insurance/,domain:'finance',destinations:['reminders','finance','financial-brain','calendar'],intent:'money',nextAction:'Surface this before the due date and include it in money forecasting.'},
    {match:/laundry|clean|cleaning|trash|home|bedroom|bathroom|kitchen|restock|saint|dog/,domain:'home',destinations:['reminders','home','planning','tasks'],intent:'home-care',nextAction:'Group this into the next Home Reset or appropriate household block.'},
    {match:/project|glow os|terrain|portfolio|website|prototype|research|client|content/,domain:'projects',destinations:['reminders','projects','tasks','calendar','goals'],intent:'project',nextAction:'Attach this to the relevant project and make sure it has a next action.'},
    {match:/appointment|doctor|dentist|interview|reservation|meeting|call at|class|shift/,domain:'calendar',destinations:['reminders','calendar','today','briefings'],intent:'commitment',nextAction:'Treat this as time-sensitive context and compare it with the calendar.'},
    {match:/buy|order|pick up|return|exchange|shopping|store/,domain:'errands',destinations:['reminders','tasks','planning','finance'],intent:'errand',nextAction:'Batch this with nearby errands or shopping when possible.'},
  ];
  const match=rules.find(rule=>rule.match.test(text));
  if(match)return {...match,urgency};
  return {domain:'general',destinations:['reminders','tasks','today','briefings'],intent:'action',urgency,nextAction:'Keep this in the attention queue and schedule it if it needs protected time.'};
}
