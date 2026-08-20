'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { db } from '@/db';
import { briefingSnapshots } from '@/db/schema/completion-v1';
import { buildPersonalContext } from '@/lib/intelligence/context';
import { ensurePersonalOsInstalled } from '@/lib/personal-os/install';
import { routinesForDate, workoutForDate } from '@/lib/personal-os/source-of-truth';

export type BriefingKind='morning'|'evening'|'weekly'|'monthly'|'tomorrow'|'quarterly'|'year';
function quarterKey(date:Date){return `${date.getFullYear()}-Q${Math.floor(date.getMonth()/3)+1}`;}
async function requireUser(){const session=await auth();if(!session?.user?.id)redirect('/sign-in');return session.user.id;}
function isoWeekKey(date:Date){const utc=new Date(Date.UTC(date.getFullYear(),date.getMonth(),date.getDate()));const day=utc.getUTCDay()||7;utc.setUTCDate(utc.getUTCDate()+4-day);const yearStart=new Date(Date.UTC(utc.getUTCFullYear(),0,1));const week=Math.ceil((((utc.getTime()-yearStart.getTime())/86400000)+1)/7);return `${utc.getUTCFullYear()}-W${String(week).padStart(2,'0')}`;}
function periodKey(kind:BriefingKind,date:Date){if(kind==='weekly')return isoWeekKey(date);if(kind==='monthly')return date.toISOString().slice(0,7);if(kind==='quarterly')return quarterKey(date);if(kind==='year')return String(date.getFullYear());return date.toISOString().slice(0,10);}

function summaryFor(kind:BriefingKind,context:Awaited<ReturnType<typeof buildPersonalContext>>,date:Date){
  const eventCount=context.todaysEvents.length;const openTasks=context.unfinishedTasks.length;const overdue=context.overdueTasks.length;const completedHabits=context.habits.filter(h=>h.completedToday).length;const habitTotal=context.habits.length;const topRecommendation=context.recommendations[0]?.title;
  const openReminders=context.appleReminders.filter(r=>!r.completed);const dueReminders=openReminders.filter(r=>r.dueAt&&r.dueAt.toDateString()===context.generatedAt.toDateString());const essentialReminders=openReminders.filter(r=>r.essential);const escalations=openReminders.filter(r=>r.escalationCandidate);
  const workout=workoutForDate(date);const dayRoutines=routinesForDate(date).filter(r=>r.daysOfWeek);
  if(kind==='tomorrow')return `${context.todayLabel} is carrying ${eventCount} event${eventCount===1?'':'s'}, ${openTasks} open task${openTasks===1?'':'s'}, and ${essentialReminders.length} essential reminder${essentialReminders.length===1?'':'s'}. Training is ${workout.name}. ${topRecommendation?`Protect space for ${topRecommendation}.`:'Keep the plan intentionally light and realistic.'}`;
  if(kind==='evening')return `Close the day with ${openTasks} unfinished task${openTasks===1?'':'s'}, ${overdue} overdue, ${dueReminders.length} reminder${dueReminders.length===1?'':'s'} that mattered today, and ${completedHabits} of ${habitTotal} habits logged. ${escalations.length?`${escalations.length} repeatedly postponed reminder${escalations.length===1?' may':'s may'} need to become a task or project.`:'Move only what still deserves tomorrow.'}`;
  if(kind==='weekly')return `Weekly pulse: ${openTasks} open task${openTasks===1?'':'s'}, ${overdue} overdue, ${openReminders.length} open reminder${openReminders.length===1?'':'s'}, ${context.activeGoals.length} active goal${context.activeGoals.length===1?'':'s'}, and a current focus score of ${context.focusScore}. Your 2026 fitness split and Sunday reset remain the weekly anchors.`;
  if(kind==='monthly')return `Monthly checkpoint: ${context.activeGoals.length} active goal${context.activeGoals.length===1?'':'s'}, ${openTasks} open task${openTasks===1?'':'s'}, ${openReminders.length} open reminder${openReminders.length===1?'':'s'}, ${overdue} overdue, and ${context.focusScore}/100 current focus.`;
  if(kind==='quarterly')return `Quarterly checkpoint: ${context.activeGoals.length} active goal${context.activeGoals.length===1?'':'s'} carrying forward, ${context.patterns.length} pattern${context.patterns.length===1?'':'s'} detected, and a focus score of ${context.focusScore}/100.`;
  if(kind==='year')return `Year checkpoint: ${context.activeGoals.length} active goal${context.activeGoals.length===1?'':'s'} in motion right now. Use this as a marker to reflect on direction, not a full year in review.`;
  const routineLine=dayRoutines.length?` Today also includes ${dayRoutines.map(r=>r.name).join(' and ')}.`:'';
  return `${context.dailyBrief} Your focus score is ${context.focusScore}/100. Today’s training is ${workout.name}.${routineLine}${topRecommendation?` Best next move: ${topRecommendation}.`:''}`;
}

export async function generateExpandedBriefingAction(kind:BriefingKind){
  const userId=await requireUser();
  try{
    await ensurePersonalOsInstalled(userId);
    const contextDate=new Date();if(kind==='tomorrow')contextDate.setDate(contextDate.getDate()+1);const context=await buildPersonalContext(userId,contextDate);const workout=workoutForDate(contextDate);const scheduledRoutines=routinesForDate(contextDate);
    await db.insert(briefingSnapshots).values({userId,kind,periodKey:periodKey(kind,context.generatedAt),content:{dailyBrief:context.dailyBrief,summary:summaryFor(kind,context,contextDate),focusScore:context.focusScore,unfinishedTasks:context.unfinishedTasks.length,overdueTasks:context.overdueTasks.length,todaysEvents:context.todaysEvents.length,openAppleReminders:context.appleReminders.filter(item=>!item.completed).length,essentialAppleReminders:context.appleReminders.filter(item=>!item.completed&&item.essential).length,reminderEscalations:context.appleReminders.filter(item=>!item.completed&&item.escalationCandidate).length,habitsCompleted:context.habits.filter(habit=>habit.completedToday).length,habitsTotal:context.habits.length,activeGoals:context.activeGoals,recommendations:context.recommendations.slice(0,5),attentionSignals:context.attentionSignals.slice(0,5),patterns:context.patterns.slice(0,5),workout:{day:workout.day,name:workout.name,purpose:workout.purpose,exercises:workout.exercises},scheduledRoutines:scheduledRoutines.map(r=>({key:r.key,name:r.name,timeOfDay:r.timeOfDay,steps:r.steps.length})),visualCards:{morning:'/glow-cards?kind=morning',workout:'/glow-cards?kind=workout',week:'/glow-cards?kind=week'},targetDate:context.generatedAt.toISOString()}});
  }catch(error){console.error('[Glow OS] expanded briefing generation unavailable',error);}
  revalidatePath('/briefings');revalidatePath('/briefings/morning');
}
