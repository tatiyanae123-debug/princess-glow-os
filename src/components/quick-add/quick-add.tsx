'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, ListChecks, Repeat, Sparkles, Target, CalendarPlus, NotebookPen, Wand2, HeartPulse, Wallet } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { TaskForm } from '@/components/tasks/task-form';
import { HabitForm } from '@/components/habits/habit-form';
import { RoutineForm } from '@/components/routines/routine-form';
import { GoalForm } from '@/components/goals/goal-form';
import { EventForm } from '@/components/calendar/event-form';
import { NoteForm } from '@/components/notes/note-form';
import { BeautyRoutineForm } from '@/components/beauty/beauty-routine-form';
import { WellnessEntryForm } from '@/components/wellness/wellness-entry-form';
import { FinanceEntryForm } from '@/components/finance/finance-entry-form';

export type QuickAddModule = 'task'|'habit'|'routine'|'goal'|'event'|'note'|'beauty'|'wellness'|'finance';
type QuickAddEvent = CustomEvent<{ module?: QuickAddModule }>;

const MODULES: { id: QuickAddModule; label: string; icon: typeof Plus }[] = [
  { id:'task', label:'New task', icon:ListChecks },{ id:'event', label:'New event', icon:CalendarPlus },{ id:'habit', label:'New habit', icon:Repeat },{ id:'routine', label:'New ritual', icon:Sparkles },{ id:'goal', label:'New goal', icon:Target },{ id:'note', label:'Journal note', icon:NotebookPen },{ id:'beauty', label:'Beauty step', icon:Wand2 },{ id:'wellness', label:'Wellness check-in', icon:HeartPulse },{ id:'finance', label:'Finance entry', icon:Wallet },
];
const MODULE_LABEL: Record<QuickAddModule,string> = { task:'Add task',habit:'Add habit',routine:'Add ritual',goal:'Add goal',event:'Add event',note:'Add note',beauty:'Add beauty step',wellness:'Log check-in',finance:'Add finance entry' };
const MODULE_IDS=new Set<QuickAddModule>(MODULES.map(module=>module.id));

export function QuickAdd(){
  const router=useRouter();
  const [open,setOpen]=useState(false);
  const [activeModule,setActiveModule]=useState<QuickAddModule|null>(null);
  const close=()=>{setOpen(false);setActiveModule(null);};
  const handleSaved=()=>{close();router.refresh();};

  useEffect(()=>{
    const listener=(rawEvent:Event)=>{
      const event=rawEvent as QuickAddEvent;
      const requested=event.detail?.module;
      setOpen(true);
      setActiveModule(requested&&MODULE_IDS.has(requested)?requested:null);
    };
    document.addEventListener('glow:quick-add',listener);
    const staticListeners=MODULES.map(({id})=>{const name=`glow:quick-add-${id}`;const handler=()=>{setOpen(true);setActiveModule(id);};document.addEventListener(name,handler);return{name,handler};});
    return()=>{document.removeEventListener('glow:quick-add',listener);staticListeners.forEach(({name,handler})=>document.removeEventListener(name,handler));};
  },[]);

  return <>
    <Dialog open={open&&activeModule===null} onClose={close} title="Create" description="Choose what you want to add. Glow routes it to the right place.">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{MODULES.map(({id,label,icon:Icon})=><button key={id} type="button" onClick={()=>setActiveModule(id)} className="flex min-h-[92px] flex-col items-center justify-center gap-2 rounded-[12px] border border-[#E9E9E9] bg-white p-4 text-center text-[13px] font-medium text-[#343438] transition hover:border-[#DADADA] hover:bg-[#FAFAFA]"><Icon size={18} className="text-[#B86F7D]"/>{label}</button>)}</div>
    </Dialog>
    <Dialog open={activeModule!==null} onClose={close} title={activeModule?MODULE_LABEL[activeModule]:''}>
      {activeModule==='task'&&<TaskForm onSaved={handleSaved} onCancel={close}/>}
      {activeModule==='habit'&&<HabitForm onSaved={handleSaved} onCancel={close}/>}
      {activeModule==='routine'&&<RoutineForm onSaved={handleSaved} onCancel={close}/>}
      {activeModule==='goal'&&<GoalForm onSaved={handleSaved} onCancel={close}/>}
      {activeModule==='event'&&<EventForm onSaved={handleSaved} onCancel={close}/>}
      {activeModule==='note'&&<NoteForm onSaved={handleSaved} onCancel={close}/>}
      {activeModule==='beauty'&&<BeautyRoutineForm onSaved={handleSaved} onCancel={close}/>}
      {activeModule==='wellness'&&<WellnessEntryForm onSaved={handleSaved} onCancel={close}/>}
      {activeModule==='finance'&&<FinanceEntryForm onSaved={handleSaved} onCancel={close}/>}
    </Dialog>
  </>;
}
