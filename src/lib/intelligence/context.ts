import 'server-only';

import { getTasksByUser } from '@/lib/data/tasks';
import { getHabitsByUser, getHabitLogsForUserByDate } from '@/lib/data/habits';
import { getRoutinesByUser } from '@/lib/data/routines';
import { getGoalsByUser } from '@/lib/data/goals';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';
import { getAppleRemindersByUser } from '@/lib/apple-reminders/service';
import { rankRecommendations } from '@/lib/intelligence/recommendations';

export type ContextRecommendation = { id:string; title:string; reason:string; href:string; priority:'high'|'medium'|'low' };
export type AttentionSignal = { id:string; label:string; detail:string; href:string; level:'high'|'medium'|'low' };
export type ContextPattern = { id:string; title:string; detail:string; href:string };
export type PersonalContext = {
  generatedAt:Date;dayPart:'morning'|'afternoon'|'evening'|'night';todayLabel:string;
  nextEvent:{id:string;title:string;startAt:Date;allDay:boolean}|null;
  todaysEvents:{id:string;title:string;startAt:Date;allDay:boolean;source:string|null}[];
  unfinishedTasks:{id:string;title:string;priority:string;dueDate:Date|null}[];overdueTasks:{id:string;title:string;dueDate:Date}[];
  appleReminders:{id:string;title:string;dueAt:Date|null;completed:boolean;listName:string}[];
  habits:{id:string;name:string;completedToday:boolean}[];routinesForToday:{id:string;name:string;timeOfDay:string}[];activeGoals:{id:string;title:string}[];
  recommendations:ContextRecommendation[];attentionSignals:AttentionSignal[];patterns:ContextPattern[];dailyBrief:string;focusScore:number;
};
function getDayPart(hour:number):PersonalContext['dayPart']{if(hour<10)return'morning';if(hour<16)return'afternoon';if(hour<21)return'evening';return'night';}

export async function buildPersonalContext(userId:string,now=new Date()):Promise<PersonalContext>{
  const dateKey=now.toISOString().slice(0,10);
  const[tasks,habits,habitLogs,routines,goals,events,appleReminders]=await Promise.all([getTasksByUser(userId),getHabitsByUser(userId),getHabitLogsForUserByDate(userId,dateKey),getRoutinesByUser(userId),getGoalsByUser(userId),getCalendarEventsByUser(userId),getAppleRemindersByUser(userId)]);
  const dayPart=getDayPart(now.getHours());const startOfToday=new Date(now);startOfToday.setHours(0,0,0,0);const endOfToday=new Date(now);endOfToday.setHours(23,59,59,999);
  const unfinishedTasks=tasks.filter(task=>task.status!=='done'&&task.status!=='cancelled');const overdueTasks=unfinishedTasks.filter(task=>task.dueDate&&task.dueDate<startOfToday).map(task=>({id:task.id,title:task.title,dueDate:task.dueDate!}));
  const todaysEvents=events.filter(event=>event.startAt>=startOfToday&&event.startAt<=endOfToday).sort((a,b)=>a.startAt.getTime()-b.startAt.getTime());const nextEvent=events.filter(event=>event.startAt>=now).sort((a,b)=>a.startAt.getTime()-b.startAt.getTime())[0]??null;
  const completedHabitIds=new Set(habitLogs.map(log=>log.habitId));const weekday=now.toLocaleDateString('en-US',{weekday:'long'}).toLowerCase();const routinesForToday=routines.filter(routine=>!routine.daysOfWeek?.length||routine.daysOfWeek.some(day=>day.toLowerCase()===weekday));
  const ranked=rankRecommendations({tasks:unfinishedTasks.map(task=>({id:task.id,title:task.title,priority:task.priority,dueDate:task.dueDate})),reminders:appleReminders.map(reminder=>({id:reminder.id,title:reminder.title,dueAt:reminder.dueAt,completed:reminder.completed})),routines:routinesForToday.map(routine=>({id:routine.id,name:routine.name,incomplete:true})),habits:habits.map(habit=>({id:habit.id,name:habit.name,completedToday:completedHabitIds.has(habit.id)})),nextEventAt:nextEvent?.startAt??null,now});
  const recommendations:ContextRecommendation[]=ranked.slice(0,5).map(item=>({id:item.id,title:item.title,reason:item.reason,href:item.sourceType==='apple_reminder'?'/reminders':item.sourceType==='task'?'/tasks':item.sourceType==='habit'?'/habits':'/planning',priority:item.score>=60?'high':item.score>=30?'medium':'low'}));
  if(nextEvent&&recommendations.length<5)recommendations.push({id:`event-${nextEvent.id}`,title:nextEvent.title,reason:`Your next event begins ${nextEvent.allDay?'today':nextEvent.startAt.toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})}.`,href:'/calendar',priority:'low'});
  const completedCount=habits.filter(habit=>completedHabitIds.has(habit.id)).length;const openReminderCount=appleReminders.filter(item=>!item.completed).length;const unloggedHabitCount=Math.max(0,habits.length-completedCount);const dueTodayTasks=unfinishedTasks.filter(task=>task.dueDate&&task.dueDate>=startOfToday&&task.dueDate<=endOfToday);const highPriorityTasks=unfinishedTasks.filter(task=>task.priority==='high'||task.priority==='urgent');const eventLoad=todaysEvents.length;
  const attentionSignals:AttentionSignal[]=[];
  if(overdueTasks.length>0)attentionSignals.push({id:'overdue-tasks',label:`${overdueTasks.length} overdue task${overdueTasks.length===1?'':'s'}`,detail:'These are the clearest execution risk in your current system state.',href:'/tasks',level:'high'});
  if(highPriorityTasks.length>0)attentionSignals.push({id:'priority-load',label:`${highPriorityTasks.length} high-priority item${highPriorityTasks.length===1?'':'s'}`,detail:'Protect attention for these before adding lower-value work.',href:'/tasks',level:highPriorityTasks.length>=3?'high':'medium'});
  if(eventLoad>=4)attentionSignals.push({id:'calendar-density',label:'Calendar is dense today',detail:`${eventLoad} events reduce the amount of flexible execution time available.`,href:'/calendar',level:eventLoad>=6?'high':'medium'});
  if(openReminderCount>=5)attentionSignals.push({id:'reminder-load',label:'Reminder load is building',detail:`${openReminderCount} open Apple Reminders are competing with Glow OS tasks.`,href:'/reminders',level:'medium'});
  if(unloggedHabitCount>0&&dayPart==='evening')attentionSignals.push({id:'habit-carryover',label:`${unloggedHabitCount} habit${unloggedHabitCount===1?'':'s'} still open`,detail:'Evening is a useful point to finish, intentionally skip, or reset expectations.',href:'/habits',level:'low'});
  if(attentionSignals.length===0)attentionSignals.push({id:'clear-state',label:'No major pressure signal',detail:'Your current task, calendar, reminder, and habit load does not show an obvious conflict.',href:'/today',level:'low'});
  const patterns:ContextPattern[]=[];
  if(eventLoad>=4&&dueTodayTasks.length>=2)patterns.push({id:'calendar-task-compression',title:'Execution time is compressed',detail:`${eventLoad} events and ${dueTodayTasks.length} tasks due today are competing for the same day. Consider moving one non-urgent item before it becomes overdue.`,href:'/planning'});
  if(overdueTasks.length>0&&openReminderCount>0)patterns.push({id:'split-capture',title:'Your open work is split across systems',detail:`${overdueTasks.length} overdue Glow OS task${overdueTasks.length===1?'':'s'} and ${openReminderCount} open Apple Reminder${openReminderCount===1?'':'s'} suggest attention is distributed between two capture systems.`,href:'/reminders'});
  if(habits.length>=3&&completedCount===habits.length)patterns.push({id:'habit-momentum',title:'Habit momentum is strong today',detail:`All ${habits.length} scheduled habits are already logged. Protect the rest of the day instead of overfilling it.`,href:'/habits'});
  if(routinesForToday.length>=3&&eventLoad>=3)patterns.push({id:'routine-calendar-overlap',title:'Routines need calendar space',detail:`${routinesForToday.length} routines are scheduled alongside ${eventLoad} events. The plan is more reliable when routine time is treated as real capacity.`,href:'/planning'});
  if(goals.length>0&&unfinishedTasks.length===0)patterns.push({id:'goal-action-gap',title:'Goals exist without an active task queue',detail:`${goals.length} active goal${goals.length===1?'':'s'} are present, but there are no unfinished tasks. A next action may need to be created from a goal.`,href:'/goals'});
  if(patterns.length===0)patterns.push({id:'balanced-load',title:'No strong cross-system pattern yet',detail:'Glow Brain will keep comparing tasks, calendar, reminders, routines, habits, and goals as more activity accumulates.',href:'/dashboard'});
  const focusScore=Math.max(0,Math.min(100,70-overdueTasks.length*10-Math.min(openReminderCount,5)*2+completedCount*5));const dailyBrief=`Good ${dayPart}. You have ${todaysEvents.length} event${todaysEvents.length===1?'':'s'} today, ${unfinishedTasks.length} unfinished Glow OS task${unfinishedTasks.length===1?'':'s'}, ${openReminderCount} open Apple Reminder${openReminderCount===1?'':'s'}, and ${completedCount} of ${habits.length} habits logged.`;
  return{generatedAt:now,dayPart,todayLabel:now.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'}),nextEvent:nextEvent?{id:nextEvent.id,title:nextEvent.title,startAt:nextEvent.startAt,allDay:nextEvent.allDay}:null,todaysEvents:todaysEvents.map(event=>({id:event.id,title:event.title,startAt:event.startAt,allDay:event.allDay,source:event.source})),unfinishedTasks:unfinishedTasks.slice(0,12).map(task=>({id:task.id,title:task.title,priority:task.priority,dueDate:task.dueDate})),overdueTasks,appleReminders:appleReminders.slice(0,20).map(item=>({id:item.id,title:item.title,dueAt:item.dueAt,completed:item.completed,listName:item.listName})),habits:habits.map(habit=>({id:habit.id,name:habit.name,completedToday:completedHabitIds.has(habit.id)})),routinesForToday:routinesForToday.map(routine=>({id:routine.id,name:routine.name,timeOfDay:routine.timeOfDay})),activeGoals:goals.slice(0,8).map(goal=>({id:goal.id,title:goal.title})),recommendations,attentionSignals:attentionSignals.slice(0,4),patterns:patterns.slice(0,4),dailyBrief,focusScore};
}
