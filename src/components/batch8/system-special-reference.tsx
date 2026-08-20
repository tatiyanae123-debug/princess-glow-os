import Link from 'next/link';
import { CalendarDays, Check, Circle, Dumbbell, MapPin, MessageCircleQuestion, NotebookPen, Play, Sparkles } from 'lucide-react';
import { EditableRoomImage } from '@/components/media/editable-room-image';

type InterviewEvent = { id: string; title: string; startAt: Date; location?: string | null };
type Task = { id: string; title: string; description?: string | null };
type FitnessSession = {
  id: string;
  workoutType: string;
  occurredAt: Date;
  durationMinutes?: number | null;
  energy?: number | null;
  soreness?: number | null;
  equipment?: string | null;
  notes?: string | null;
};

const photo = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=88`;

function Head({ eyebrow, title, sub, action }: { eyebrow: string; title: string; sub: string; action?: React.ReactNode }) {
  return <header className="b8-head"><div><p className="b8-eyebrow">{eyebrow}</p><h1>{title}</h1><p>{sub}</p></div>{action}</header>;
}
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`b8-card ${className}`}>{children}</section>;
}

export function Batch8InterviewModeView({ events = [], tasks = [] }: { events?: InterviewEvent[]; tasks?: Task[] }) {
  const interview = events[0];
  const prep = tasks.slice(0, 5);
  return <div className="b8-page b8-interview">
    <Head eyebrow="6. INTERVIEW MODE" title="Interview Mode" sub="Prepare. Practice. Perfect." action={<Link className="b8-soft-btn" href="/work/interviews">End Session</Link>} />
    <nav className="b8-tabs" aria-label="Interview mode sections"><span className="active">Overview</span><Link href="/work/interviews">Questions</Link><Link href="/work/applications">Company</Link><Link href="/notes">Notes</Link><Link href="/work/interviews">Tips</Link></nav>
    <Card className="b8-interview-hero">
      <div>
        <p className="b8-kicker">Upcoming interview</p>
        <h2>{interview?.title ?? 'No interview scheduled'}</h2>
        {interview ? <><p className="b8-meta"><CalendarDays size={12}/>{interview.startAt.toLocaleString('en-US',{month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit'})}</p><p className="b8-meta"><MapPin size={12}/>{interview.location || 'Location not saved'}</p></> : <p className="b8-muted">Add an interview event to Calendar and it will appear here automatically.</p>}
      </div>
      <EditableRoomImage slot="batch8:interview:hero" label="Interview setting" fallbackUrl={photo('photo-1441986300917-64674bd600d8')} className="b8-interview-image" />
    </Card>
    <div className="b8-two-col">
      <Card><h2>Preparation Checklist</h2><div className="b8-check-list">{prep.length ? prep.map((task)=><Link key={task.id} href={`/tasks?taskId=${encodeURIComponent(task.id)}`}><Check size={11}/><span>{task.title}</span></Link>) : ['Research company','Review role & responsibilities','Practice common questions','Prepare questions to ask','Choose what to bring'].map((label)=><div key={label}><Circle size={10}/><span>{label}</span></div>)}</div>{!prep.length?<p className="b8-footnote">Suggestions only. They are not marked complete until you create or complete real tasks.</p>:null}</Card>
      <Card><h2>Common Questions</h2><div className="b8-question-list">{['Tell me about yourself.','Why this company?','What are your strengths?','How do you handle stress?','Where do you see yourself growing?'].map(q=><Link href="/notes" key={q}><MessageCircleQuestion size={11}/><span>{q}</span></Link>)}</div></Card>
    </div>
    <Card className="b8-affirmation"><div><h2>Affirmation</h2><p>I am prepared. I am confident.<br/>I bring value.</p></div><EditableRoomImage slot="batch8:interview:affirmation" label="Interview notes" fallbackUrl={photo('photo-1517842645767-c639042777db')} className="b8-affirmation-image" /></Card>
  </div>;
}

export function Batch8WorkoutModeView({ sessions = [] }: { sessions?: FitnessSession[] }) {
  const latest = sessions[0];
  return <div className="b8-page b8-workout">
    <Head eyebrow="7. WORKOUT MODE" title="Workout Mode" sub="Move with intention. Track progress." action={<Link className="b8-soft-btn" href="/fitness">End Workout</Link>} />
    <section className="b8-workout-hero">
      <EditableRoomImage slot="batch8:workout:hero" label="Workout" fallbackUrl={photo('photo-1581009146145-b5ef050c2e1e')} className="b8-workout-image" />
      <div className="b8-workout-copy"><p className="b8-kicker">{latest ? 'Latest recorded session' : 'Ready when you are'}</p><h2>{latest?.workoutType ?? 'Start your next workout'}</h2><p>{latest ? `${latest.durationMinutes ?? '—'} min · ${latest.equipment || 'Equipment not saved'}` : 'Use Fitness to log a real workout. This mode will reflect your latest recorded session.'}</p><Link className="b8-primary" href="/fitness"><Play size={12}/>{latest ? 'Open Workout' : 'Start in Fitness'}</Link></div>
    </section>
    <div className="b8-metrics">{[
      ['Sessions', sessions.length],
      ['Duration', latest?.durationMinutes ? `${latest.durationMinutes} min` : '—'],
      ['Energy', latest?.energy != null ? `${latest.energy}/5` : '—'],
      ['Equipment', latest?.equipment || '—'],
    ].map(([label,value])=><Card key={String(label)}><span>{label}</span><strong>{value}</strong></Card>)}</div>
    <div className="b8-two-col b8-workout-lower">
      <Card><h2>Workout Details</h2>{latest ? <div className="b8-session-details"><p><Dumbbell size={12}/><span>{latest.workoutType}</span></p><p><CalendarDays size={12}/><span>{latest.occurredAt.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</span></p><p><Sparkles size={12}/><span>Soreness {latest.soreness != null ? `${latest.soreness}/5` : 'not logged'}</span></p></div> : <p className="b8-muted">No fitness session has been recorded yet.</p>}{latest?.notes?<div className="b8-note"><NotebookPen size={12}/><p>{latest.notes}</p></div>:null}</Card>
      <Card className="b8-body-card"><h2>Body Map</h2><EditableRoomImage slot="batch8:workout:body" label="Body map" fallbackUrl={photo('photo-1571019614242-c5c5dee9f50b')} className="b8-body-image"/><p className="b8-footnote">Glow does not infer trained muscle groups unless they are stored in your workout data.</p></Card>
    </div>
    <Link className="b8-wide-link" href="/fitness">View All Workouts <span>→</span></Link>
  </div>;
}
