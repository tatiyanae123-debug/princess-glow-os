import Link from 'next/link';
import { ArrowRight, BriefcaseBusiness, CalendarDays, Check, Circle, Clock3, FileText, FolderKanban, Plus, Sparkles, Target } from 'lucide-react';
import { EditableRoomImage } from '@/components/media/editable-room-image';
import type { CalendarEvent, Goal, Note, Task } from '@/lib/types';

export type Batch6Project = {
  id: string;
  title: string;
  area: string;
  status: string;
  priority: string;
  progress: number;
  nextAction: string | null;
  deadline: Date | null;
  notes: string | null;
  milestones: unknown;
  relatedTaskIds: unknown;
  updatedAt: Date;
};

type Common = { projects: Batch6Project[]; tasks: Task[]; notes: Note[] };
type WorkCommon = Common & { events: CalendarEvent[]; goals: Goal[] };

const pct = (value: number) => Math.max(0, Math.min(100, Math.round(value)));
const date = (value: Date | null) => value ? value.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No date';
const time = (value: Date) => value.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
const lower = (value?: string | null) => (value || '').toLowerCase();
const containsAny = (value: string, words: string[]) => words.some((word) => value.includes(word));

function PageHead({ eyebrow, title, subtitle, action, href }: { eyebrow: string; title: string; subtitle: string; action?: string; href?: string }) {
  return <header className="b6-head"><div><p className="b6-eyebrow">{eyebrow}</p><h1 className="glow-display">{title}</h1><p>{subtitle}</p></div>{action && href ? <Link href={href} className="b6-primary"><Plus size={11}/>{action}</Link> : null}</header>;
}

function ProjectThumb({ project, index }: { project: Batch6Project; index: number }) {
  return <EditableRoomImage slot={`project:${project.id}:batch6-list-${index}`} label={`${project.title} editorial cover`} className="b6-project-thumb" />;
}

function MiniProgress({ value }: { value: number }) {
  return <div className="b6-progress"><i style={{ width: `${pct(value)}%` }} /></div>;
}

export function Batch6ProjectsView({ projects }: { projects: Batch6Project[] }) {
  const active = projects.filter((p) => p.status === 'active');
  const paused = projects.filter((p) => p.status === 'paused');
  const completed = projects.filter((p) => p.status === 'completed');
  const planned = projects.filter((p) => !['active','paused','completed','archived'].includes(p.status));
  const visible = (active.length ? active : projects).slice(0, 5);
  const deadlines = projects.filter((p) => p.deadline).sort((a,b)=>(a.deadline?.getTime()||0)-(b.deadline?.getTime()||0)).slice(0,4);
  const counts = [['Active Projects', active.length], ['On Hold', paused.length], ['Completed', completed.length], ['Planned', planned.length]] as const;
  const slices = [active.length, paused.length, completed.length, Math.max(0, projects.length-active.length-paused.length-completed.length)];
  const total = Math.max(1, slices.reduce((a,b)=>a+b,0));
  let at = 0;
  const colors = ['#87606a','#b99f93','#72806b','#dfd5ca'];
  const donut = slices.map((value,index)=>{const start=at/total*100;at+=value;const end=at/total*100;return `${colors[index]} ${start}% ${end}%`;}).join(',');
  return <div className="b6-root"><PageHead eyebrow="1. Projects" title="Projects" subtitle="All your projects, in one beautiful hub." action="New Project" href="#new-project" />
    <div className="b6-metrics">{counts.map(([label,value])=><div className="b6-card b6-metric" key={label}><strong>{value}</strong><span>{label}</span></div>)}</div>
    <div className="b6-project-layout">
      <section><div className="b6-section-head"><h2>Active Projects</h2><span>{visible.length} visible</span></div><div className="b6-project-list">{visible.length ? visible.map((project,index)=><Link key={project.id} href={`/projects/deep-dive?projectId=${encodeURIComponent(project.id)}`} className="b6-project-row"><ProjectThumb project={project} index={index}/><div className="b6-project-copy"><strong>{project.title}</strong><small>{project.nextAction || project.area || 'Open project details'}</small><div className="b6-project-tags"><span>{project.area || 'Project'}</span><span>{project.priority}</span></div></div><div className="b6-project-pct"><b>{pct(project.progress)}%</b><MiniProgress value={project.progress}/></div><ArrowRight size={11}/></Link>) : <div className="b6-empty">No projects yet. Create your first project below.</div>}</div></section>
      <aside className="b6-project-aside"><section className="b6-card"><div className="b6-section-head"><h2>Upcoming Deadlines</h2><Link href="/calendar">View Calendar</Link></div><div className="b6-deadlines">{deadlines.length ? deadlines.map((project)=><Link key={project.id} href={`/projects/deep-dive?projectId=${project.id}`}><span><CalendarDays size={10}/></span><div><strong>{project.title}</strong><small>{project.area}</small></div><time>{date(project.deadline)}</time></Link>) : <div className="b6-empty">No project deadlines yet.</div>}</div></section>
      <section className="b6-card b6-overview"><div className="b6-section-head"><h2>Project Overview</h2></div><div className="b6-donut" style={{background:`conic-gradient(${donut})`}}><span>{projects.length}</span></div><div className="b6-legend">{[['Planning',planned.length],['In Progress',active.length],['Review',0],['On Hold',paused.length],['Completed',completed.length]].map(([label,value],index)=><div key={String(label)}><i style={{background:colors[index%colors.length]}}/><span>{label}</span><b>{value}</b></div>)}</div></section></aside>
    </div>
    <div className="b6-quote"><div><strong>Discipline turns ideas into assets.</strong><span>— You</span></div><EditableRoomImage slot="batch6:projects:quote" label="soft botanical project still life" className="b6-quote-image"/></div>
  </div>;
}

export function Batch6CreativeStudioView({ projects }: { projects: Batch6Project[] }) {
  const active=(projects.filter(p=>p.status==='active').length?projects.filter(p=>p.status==='active'):projects).slice(0,4);
  return <div className="b6-root"><PageHead eyebrow="2. Creative Studio" title="Creative Studio" subtitle="Your ideas. Your brand. Your creative world." action="New Project" href="/projects#new-project"/>
    <nav className="b6-pills">{['Branding','Design','Content','Photography','Video','Moodboards'].map((label,index)=><span className={index===0?'active':''} key={label}>{label}</span>)}</nav>
    <section className="b6-studio-hero"><div><h2 className="glow-display">Creative Branding Studio</h2><p>Design with intention. Built with soul.</p><Link href="/projects" className="b6-primary">Open Studio</Link></div><EditableRoomImage slot="batch6:creative-studio:hero" label="warm minimal creative desk with laptop candle ceramics" className="b6-studio-hero-image"/></section>
    <section><div className="b6-section-head"><h2>Current Work</h2><Link href="/projects">View All</Link></div><div className="b6-current-work">{active.length ? active.map((project)=><Link key={project.id} href={`/projects/deep-dive?projectId=${project.id}`} className="b6-card"><strong>{project.title}</strong><small>{project.nextAction || project.area}</small><MiniProgress value={project.progress}/><b>{pct(project.progress)}%</b></Link>) : <div className="b6-empty">Create a project to populate Current Work.</div>}</div></section>
    <section><div className="b6-section-head"><h2>Inspiration Board</h2></div><div className="b6-inspiration">{['rose','shell','portrait','architecture','stone','arches','botanical'].map((slot)=><EditableRoomImage key={slot} slot={`batch6:studio:${slot}`} label={`${slot} inspiration image`} className="b6-inspiration-image"/>)}<Link href="/notes" className="b6-inspiration-add">+</Link></div></section>
  </div>;
}

function applicationTasks(tasks: Task[]) {
  return tasks.filter((task)=>containsAny(`${lower(task.title)} ${lower(task.description)}`,['application','apply','applied','resume','cover letter','job','career']));
}
function interviewEvents(events: CalendarEvent[], tasks: Task[]) {
  const eventRows=events.filter((event)=>containsAny(`${lower(event.title)} ${lower(event.description)}`,['interview','phone screen','recruiter','hiring']));
  const taskRows=tasks.filter((task)=>containsAny(`${lower(task.title)} ${lower(task.description)}`,['interview','phone screen','recruiter','hiring']));
  return { eventRows, taskRows };
}
function offerCount(tasks: Task[]) {return tasks.filter((task)=>containsAny(`${lower(task.title)} ${lower(task.description)}`,['offer','job offer','accepted offer'])).length;}

export function Batch6WorkView({ tasks, events, goals, notes }: WorkCommon) {
  const apps=applicationTasks(tasks);
  const interviews=interviewEvents(events,tasks);
  const careerGoals=goals.filter((goal)=>goal.category==='career').slice(0,5);
  const network=notes.filter((note)=>containsAny(`${lower(note.title)} ${lower(note.content)}`,['contact','network','recruiter','career','interview']));
  const upcoming=interviews.eventRows.filter((event)=>event.startAt.getTime()>=Date.now()).sort((a,b)=>a.startAt.getTime()-b.startAt.getTime()).slice(0,3);
  return <div className="b6-root"><PageHead eyebrow="3. Career / Work" title="Career & Work" subtitle="Your professional journey, organized." action="Add Item" href="/work/applications"/>
    <div className="b6-metrics">{[['Applications',apps.length,'Active'],['Interviews',interviews.eventRows.length+interviews.taskRows.length,'Upcoming'],['Offers',offerCount(tasks),'Received'],['Network',network.length,'Connections']].map(([label,value,sub])=><div className="b6-card b6-metric" key={String(label)}><span>{label}</span><strong>{value}</strong><small>{sub}</small></div>)}</div>
    <div className="b6-work-top"><section className="b6-card"><div className="b6-section-head"><h2>Upcoming</h2></div><div className="b6-upcoming">{upcoming.length?upcoming.map(event=><Link key={event.id} href={`/calendar?eventId=${event.id}&view=day`}><span><BriefcaseBusiness size={11}/></span><div><strong>{event.title}</strong><small>{date(event.startAt)} · {time(event.startAt)}</small></div><b>Prep Notes</b></Link>):<div className="b6-empty">No interview events on your calendar yet.</div>}</div></section><section className="b6-card"><div className="b6-section-head"><h2>Career Goals</h2></div><div className="b6-career-goals">{careerGoals.length?careerGoals.map(goal=><Link href="/goals" key={goal.id}><span>{goal.status==='achieved'?<Check size={9}/>:<Circle size={9}/>}</span><strong>{goal.title}</strong><b>{pct(goal.progress)}%</b></Link>):<div className="b6-empty">Add career goals in Goals and they will appear here.</div>}</div></section></div>
    <div className="b6-work-bottom"><section className="b6-card"><div className="b6-section-head"><h2>Job Search Tracker</h2><Link href="/work/applications">Open applications</Link></div><div className="b6-table"><div className="b6-table-head"><span>Item</span><span>Stage</span><span>Date</span><span>Next Step</span></div>{apps.slice(0,5).map(task=><Link key={task.id} href={`/tasks?taskId=${task.id}&view=all`}><strong>{task.title}</strong><span>{task.status.replace('_',' ')}</span><span>{date(task.dueDate)}</span><span>{task.description || 'Open task'}</span></Link>)}{!apps.length?<div className="b6-empty">Job-search tasks will appear here automatically.</div>:null}</div></section><section className="b6-daily-focus"><div><p>Daily Focus</p><strong className="glow-display">Focus on becoming valuable.<br/>The results follow.</strong><small>“You are visible.”</small></div><EditableRoomImage slot="batch6:work:focus" label="warm desk journal flowers career focus" className="b6-focus-image"/></section></div>
  </div>;
}

export function Batch6ApplicationsView({ tasks, notes }: { tasks: Task[]; notes: Note[] }) {
  const apps=applicationTasks(tasks);
  const tabs=['Active','Applied','Interviewing','Offers','Rejected'];
  return <div className="b6-root"><PageHead eyebrow="4. Applications" title="Applications" subtitle="Track every application. Stay on top." action="New Application" href="/tasks"/><nav className="b6-pills">{tabs.map((tab,index)=><span className={index===0?'active':''} key={tab}>{tab}</span>)}</nav>
    <section className="b6-card b6-application-table"><div className="b6-table b6-table-app"><div className="b6-table-head"><span>Position / item</span><span>Status</span><span>Applied / due</span><span>Next Step</span></div>{apps.length?apps.map(task=><Link key={task.id} href={`/tasks?taskId=${task.id}&view=all`}><strong>{task.title}</strong><span>{task.status.replace('_',' ')}</span><span>{date(task.dueDate)}</span><span>{task.description || 'Open in Tasks'}</span></Link>):<div className="b6-empty">No application-related tasks yet. Add one in Tasks and it will appear here.</div>}</div></section>
    <div className="b6-app-lower"><section className="b6-card b6-tip"><h2>Application Tips</h2><p>Tailor your resume for each role.</p><p>Use keywords from the job description.</p><p>Follow up 7–10 days after applying.</p><EditableRoomImage slot="batch6:applications:tip" label="resume desk neutral still life" className="b6-tip-image"/></section><section className="b6-card"><div className="b6-section-head"><h2>Documents</h2><Link href="/notes">Open Notes</Link></div><div className="b6-docs">{notes.slice(0,5).map(note=><Link href="/notes" key={note.id}><FileText size={11}/><span>{note.title || 'Untitled note'}</span><ArrowRight size={10}/></Link>)}{!notes.length?<div className="b6-empty">Keep resume, references, and portfolio notes in Notes.</div>:null}</div></section></div>
  </div>;
}

export function Batch6InterviewsView({ tasks, events, notes }: { tasks: Task[]; events: CalendarEvent[]; notes: Note[] }) {
  const rows=interviewEvents(events,tasks);
  const upcoming=rows.eventRows.filter((event)=>event.startAt.getTime()>=Date.now()).sort((a,b)=>a.startAt.getTime()-b.startAt.getTime());
  const featured=upcoming[0] || rows.eventRows[0];
  const prep=tasks.filter(task=>containsAny(`${lower(task.title)} ${lower(task.description)}`,['prep','research','interview','question'])).slice(0,5);
  const interviewNotes=notes.filter(note=>containsAny(`${lower(note.title)} ${lower(note.content)}`,['interview','career','job','question'])).slice(0,5);
  return <div className="b6-root"><PageHead eyebrow="5. Interviews" title="Interviews" subtitle="Prepare. Practice. Perform."/><nav className="b6-pills"><span className="active">Upcoming</span><span>Past</span></nav>
    <section className="b6-interview-hero"><div><p>{featured?'Next Interview':'Interview Prep'}</p><h2 className="glow-display">{featured?.title || 'No interview scheduled'}</h2><strong>{featured?`${date(featured.startAt)} · ${time(featured.startAt)}`:'Add an interview to Calendar'}</strong><small>{featured?.location || 'Glow will keep the details organized here.'}</small>{featured?<Link href={`/calendar?eventId=${featured.id}&view=day`} className="b6-primary">View Details</Link>:<Link href="/calendar" className="b6-primary">Open Calendar</Link>}</div><EditableRoomImage slot="batch6:interviews:hero" label="bright luxury retail interview interior" className="b6-interview-image"/></section>
    <div className="b6-interview-grid"><section className="b6-card"><h2>Preparation Checklist</h2><div className="b6-checklist">{(prep.length?prep:[null,null,null,null]).map((task,index)=><Link href={task?`/tasks?taskId=${task.id}&view=all`:'/tasks'} key={task?.id||index}><span>{task?.status==='done'?<Check size={9}/>:<Circle size={9}/>}</span><strong>{task?.title || ['Research the company','Review job description','Prepare STAR stories','Questions to ask'][index]}</strong></Link>)}</div></section><section className="b6-card"><h2>Interview Notes</h2><div className="b6-bullets">{interviewNotes.length?interviewNotes.map(note=><Link href="/notes" key={note.id}>• {note.title || 'Untitled note'}</Link>):<><span>• Customer service</span><span>• Product knowledge</span><span>• Sales & goals</span><span>• Team fit</span></>}</div></section></div>
    <section className="b6-card b6-questions"><h2>Questions to Ask</h2><div><span>• What does success look like in this role?</span><span>• What are the next steps?</span><span>• How would you describe the team?</span></div><EditableRoomImage slot="batch6:interviews:questions" label="small warm vase interview notes" className="b6-questions-image"/></section>
  </div>;
}

function chooseProject(projects: Batch6Project[], projectId?: string) {
  return projects.find((project)=>project.id===projectId) || projects.find((project)=>lower(project.title).includes('terrain')) || projects.find((project)=>project.status==='active') || projects[0] || null;
}

export function Batch6ProjectDeepDiveView({ projects, tasks, notes, projectId }: Common & { projectId?: string }) {
  const project=chooseProject(projects,projectId);
  if(!project) return <div className="b6-root"><PageHead eyebrow="6. Project Deep Dive" title="Project Deep Dive" subtitle="Focus. Plan. Execute."/><div className="b6-empty b6-card">Create a project first, then return here for the deep-dive workspace.</div></div>;
  const relatedIds=Array.isArray(project.relatedTaskIds)?project.relatedTaskIds as string[]:[];
  const relatedTasks=tasks.filter(task=>relatedIds.includes(task.id)).slice(0,6);
  const milestones=Array.isArray(project.milestones)?project.milestones as {id?:string;title?:string;done?:boolean}[]:[];
  return <div className="b6-root"><PageHead eyebrow="6. Project Deep Dive" title="Project Deep Dive" subtitle="Focus. Plan. Execute." action="Edit Project" href={`/projects?projectId=${project.id}#all-projects`}/>
    <section className="b6-deep-hero"><div><p>{project.title}</p><strong>{project.nextAction || 'Bring the project to life. Change beauty rituals.'}</strong><span>{project.status}</span><MiniProgress value={project.progress}/><b>{pct(project.progress)}%</b></div><EditableRoomImage slot={`project:${project.id}:batch6-deep-hero`} label={`${project.title} hero product image`} className="b6-deep-image"/></section><nav className="b6-pills"><span className="active">Overview</span><span>Tasks</span><span>Timeline</span><span>Files</span><span>Notes</span></nav>
    <div className="b6-deep-grid"><section className="b6-card"><div className="b6-section-head"><h2>Project Overview</h2></div><dl><div><dt>Category</dt><dd>{project.area || 'Project'}</dd></div><div><dt>Status</dt><dd>{project.status}</dd></div><div><dt>Target Date</dt><dd>{date(project.deadline)}</dd></div><div><dt>Priority</dt><dd>{project.priority}</dd></div></dl></section><section className="b6-card"><div className="b6-section-head"><h2>Next Milestones</h2></div><div className="b6-milestones">{milestones.length?milestones.slice(0,5).map((milestone,index)=><div key={milestone.id||index}><i/><strong>{milestone.title || `Milestone ${index+1}`}</strong><small>{milestone.done?'Complete':'Upcoming'}</small></div>):relatedTasks.length?relatedTasks.map(task=><div key={task.id}><i/><strong>{task.title}</strong><small>{date(task.dueDate)}</small></div>):<div className="b6-empty">Add milestones or linked tasks to see the timeline.</div>}</div></section></div>
    <section className="b6-card"><div className="b6-section-head"><h2>Recent Activity</h2><Link href="/notes">View all activity</Link></div><div className="b6-activity"><div><Clock3 size={10}/><span>Project updated</span><time>{project.updatedAt.toLocaleDateString('en-US',{month:'short',day:'numeric'})}</time></div>{notes.slice(0,2).map(note=><div key={note.id}><FileText size={10}/><span>{note.title || 'Project note'}</span><time>{note.updatedAt.toLocaleDateString('en-US',{month:'short',day:'numeric'})}</time></div>)}</div></section>
  </div>;
}

export function Batch6TerrainStudioView({ projects, notes }: { projects: Batch6Project[]; notes: Note[] }) {
  const terrain=projects.find(project=>lower(project.title).includes('terrain')||lower(project.area).includes('terrain')) || projects[0] || null;
  const phases=['Concept','Design','Prototype','Testing','Production','Launch'];
  const phaseProgress=terrain?.progress||0;
  return <div className="b6-root"><PageHead eyebrow="7. Terrain Design Room" title="Terrain Design Studio" subtitle="The vision. The tool. The movement."/>
    <section className="b6-terrain-hero"><div><h2 className="glow-display">Designed for you.<br/>Inspired by nature.<br/>Built to transform.</h2><Link href={terrain?`/projects/deep-dive?projectId=${terrain.id}`:'/projects'} className="b6-primary">Enter the Room</Link></div><EditableRoomImage slot="batch6:terrain:hero" label="champagne gold sculptural stainless beauty tool product render" className="b6-terrain-image"/></section>
    <section><div className="b6-section-head"><h2>Project Phases</h2></div><div className="b6-phases">{phases.map((phase,index)=>{const threshold=(index+1)/phases.length*100;const state=phaseProgress>=threshold?'Complete':phaseProgress>index/phases.length*100?'In Progress':'Pending';return <div key={phase}><span>{String(index+1).padStart(2,'0')}</span><strong>{phase}</strong><small>{state}</small></div>})}</div></section>
    <div className="b6-terrain-lower"><section className="b6-card"><div className="b6-section-head"><h2>Resources</h2><Link href="/notes">Open all</Link></div><div className="b6-docs">{notes.slice(0,5).map(note=><Link href="/notes" key={note.id}><FileText size={11}/><span>{note.title || 'Terrain resource'}</span><ArrowRight size={10}/></Link>)}{!notes.length?<div className="b6-empty">Store the Product Bible, design spec, materials guide, and manufacturing plan in Notes.</div>:null}</div></section><section className="b6-card b6-quick-notes"><h2>Quick Notes</h2><p>Every detail matters.</p><p>Every curve has purpose.</p><p>This is more than a tool.</p><p>This is Terrain Design.</p><EditableRoomImage slot="batch6:terrain:notes" label="delicate botanical branch neutral still life" className="b6-quick-image"/></section></div>
  </div>;
}
