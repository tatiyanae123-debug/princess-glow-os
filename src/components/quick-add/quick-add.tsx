'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  ListChecks,
  Repeat,
  Sparkles,
  Target,
  CalendarPlus,
  NotebookPen,
  Wand2,
  HeartPulse,
  Wallet,
} from 'lucide-react';
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
  { id:'task', label:'New task', icon:ListChecks },
  { id:'event', label:'New event', icon:CalendarPlus },
  { id:'habit', label:'New habit', icon:Repeat },
  { id:'routine', label:'New ritual', icon:Sparkles },
  { id:'goal', label:'New goal', icon:Target },
  { id:'note', label:'Journal note', icon:NotebookPen },
  { id:'beauty', label:'Beauty step', icon:Wand2 },
  { id:'wellness', label:'Wellness check-in', icon:HeartPulse },
  { id:'finance', label:'Finance entry', icon:Wallet },
];

const MODULE_LABEL: Record<QuickAddModule,string> = {
  task:'Add task', habit:'Add habit', routine:'Add ritual', goal:'Add goal', event:'Add event', note:'Add note', beauty:'Add beauty step', wellness:'Log check-in', finance:'Add finance entry',
};

const MODULE_IDS = new Set<QuickAddModule>(MODULES.map(module=>module.id));

export function QuickAdd() {
  const router = useRouter();
  const [open,setOpen] = useState(false);
  const [activeModule,setActiveModule] = useState<QuickAddModule|null>(null);
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
    return()=>document.removeEventListener('glow:quick-add',listener);
  },[]);

  return <>
    <button type="button" onClick={()=>setOpen(true)} aria-label="Quick add" className="fixed bottom-5 right-5 z-40 flex items-center gap-1.5 rounded-[6px] border border-[#c88f96]/30 bg-[#d8a2a8] px-3.5 py-2 text-[9px] font-medium text-white shadow-[0_8px_20px_rgba(85,55,51,.12)] transition hover:-translate-y-0.5 hover:bg-[#ca8d95]"><Plus size={12}/>New Entry</button>

    <Dialog open={open&&activeModule===null} onClose={close} title="Add to your world" description="Capture it once and place it where it belongs.">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {MODULES.map(({id,label,icon:Icon})=><button key={id} type="button" onClick={()=>setActiveModule(id)} className="flex flex-col items-center gap-2 rounded-[8px] border border-[#e4d7cf] bg-[#fbf5f0] p-4 text-center text-[9px] font-medium text-[#5f504b] transition hover:bg-[#f5e7e5]"><Icon size={16} className="text-[#ae727a]"/>{label}</button>)}
      </div>
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
