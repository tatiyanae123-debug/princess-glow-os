import type { RoomUpgradeSet } from './types';

export const CORE_A_UPGRADES: RoomUpgradeSet[] = [
  {
    key: 'dashboard', label: 'Today / Dashboard', path: '/dashboard', upgrades: [
      { id:'dynamic-hero', label:'Dynamic Daily Hero', description:'Use the current time, day theme and live priorities to shape the hero.', kind:'route', href:'/dashboard' },
      { id:'top-three', label:'Top 3 Intelligence', description:'Surface the three items that deserve the most attention now.', kind:'insight', scope:['tasks','calendar','goals'] },
      { id:'free-time', label:'Free-Time Finder', description:'Find usable open windows between today’s fixed commitments.', kind:'planning', scope:['calendar','tasks'] },
      { id:'day-timeline', label:'Live Day Timeline', description:'Review completed, current and upcoming activity in one timeline.', kind:'history', scope:['calendar','tasks','routines','habits'] },
      { id:'quick-life', label:'Quick Life Controls', description:'Capture a task, note, meal, expense, mood or other life update fast.', kind:'capture' },
      { id:'attention-strip', label:'Risk & Attention', description:'Review overdue work, conflicts, notices and things needing action.', kind:'route', href:'/notices' },
      { id:'energy-plan', label:'Energy-Aware Planning', description:'Compare energy and wellness with the work that is planned.', kind:'insight', scope:['wellness','calendar','tasks'] },
      { id:'build-day', label:'Build My Day', description:'Use Glow’s adaptive day planner and approve the plan before acting.', kind:'route', href:'/today' },
      { id:'progress-story', label:'Daily Progress Story', description:'Turn today’s activity into one concise progress narrative.', kind:'review', scope:['tasks','habits','routines','wellness'] },
      { id:'tomorrow-preview', label:'Tomorrow Preview', description:'See what should be prepared before today closes.', kind:'route', href:'/tomorrow' },
    ]
  },
  {
    key: 'calendar', label: 'Calendar', path: '/calendar', upgrades: [
      { id:'event-editor', label:'Intelligent Event Editor', description:'Create and edit events with preparation, notes and connected context.', kind:'route', href:'/calendar' },
      { id:'time-zoom', label:'Day → Year → Timeline', description:'Move between calendar scales without losing context.', kind:'route', href:'/calendar' },
      { id:'conflicts', label:'Conflict Detector', description:'Identify overlapping commitments and unrealistic transitions.', kind:'insight', scope:['calendar'] },
      { id:'preparation', label:'Preparation Layer', description:'Save leave-by, ready-by and preparation notes for important events.', kind:'entity', entityType:'event_preparation', fields:[{key:'event',label:'Event'},{key:'leaveBy',label:'Leave by',type:'time'},{key:'readyBy',label:'Get ready by',type:'time'},{key:'checklist',label:'Preparation checklist',type:'textarea'}] },
      { id:'energy-overlay', label:'Energy Overlay', description:'Compare calendar density with logged energy and wellness.', kind:'insight', scope:['calendar','wellness'] },
      { id:'replan', label:'Replan a Commitment', description:'Build a reviewable rescheduling proposal instead of moving things silently.', kind:'planning', scope:['calendar','tasks','routines'] },
      { id:'calendar-intelligence', label:'Calendar Intelligence', description:'Find overloaded periods, focus windows and scheduling patterns.', kind:'insight', scope:['calendar','tasks'] },
      { id:'connected-event', label:'Connected Event Objects', description:'Connect events with tasks, goals, projects, notes and other Glow objects.', kind:'relations', scope:['calendar_event'] },
      { id:'event-templates', label:'Event Templates', description:'Save reusable structures for work, appointments, interviews and more.', kind:'entity', entityType:'calendar_template', fields:[{key:'category',label:'Template type'},{key:'duration',label:'Default duration (minutes)',type:'number'},{key:'prep',label:'Default preparation',type:'textarea'}] },
      { id:'ask-calendar', label:'Ask Calendar', description:'Search calendar context and connected records in one place.', kind:'search', scope:['calendar'] },
    ]
  },
  {
    key: 'tasks', label: 'Tasks', path: '/tasks', upgrades: [
      { id:'task-editor', label:'True Task Editor', description:'Use the existing task system for dates, priority, notes and task details.', kind:'route', href:'/tasks' },
      { id:'smart-priority', label:'Smart Priority Engine', description:'Review urgency, deadlines and context before deciding what comes first.', kind:'insight', scope:['tasks','calendar','goals'] },
      { id:'focus-mode', label:'Focus Mode', description:'Reduce the interface to the work that matters now.', kind:'route', href:'/tasks?focus=1' },
      { id:'decompose', label:'Task Decomposition', description:'Save a structured breakdown for work that feels too large.', kind:'entity', entityType:'task_breakdown', fields:[{key:'task',label:'Task'},{key:'steps',label:'Smaller steps',type:'textarea'},{key:'estimate',label:'Estimated minutes',type:'number'}] },
      { id:'estimate-learning', label:'Time Estimate Learning', description:'Review focus and completion history to improve future estimates.', kind:'history', scope:['task','focus_session'] },
      { id:'priority-lanes', label:'Priority Lanes', description:'Use Do First, Today, Can Wait, Waiting and Someday as real task views.', kind:'route', href:'/tasks' },
      { id:'blocked-work', label:'Blocked Task Detection', description:'Inspect task dependencies and work that cannot move yet.', kind:'insight', scope:['task','task_dependency'] },
      { id:'context-actions', label:'Contextual Actions', description:'Capture calls, research, purchase, schedule and follow-up steps around a task.', kind:'entity', entityType:'task_context_action', fields:[{key:'task',label:'Task'},{key:'actionType',label:'Action type',type:'select',options:['call','email','research','purchase','schedule','upload','other']},{key:'details',label:'Details',type:'textarea'}] },
      { id:'task-relations', label:'Task Relationships', description:'Connect a task to goals, projects, events, routines and other objects.', kind:'relations', scope:['task'] },
      { id:'day-review', label:'End-of-Day Task Review', description:'Review what finished, what moved and what should stay open.', kind:'review', scope:['tasks'] },
    ]
  },
  {
    key: 'planning', label: 'Planning', path: '/planning', upgrades: [
      { id:'life-zoom', label:'Life Zoom', description:'Move between year, quarter, month, week and day planning levels.', kind:'route', href:'/planning' },
      { id:'top-three', label:'Top Three Planner', description:'Store the most important outcomes for the planning period.', kind:'planning', scope:['planning','goals'] },
      { id:'capacity', label:'Capacity Meter', description:'Compare planned work with time and energy before overcommitting.', kind:'insight', scope:['planning','calendar','tasks','wellness'] },
      { id:'planning-board', label:'Planning Board', description:'Use the existing planning workspace for moving priorities into realistic periods.', kind:'route', href:'/planning' },
      { id:'brain-dump', label:'Brain Dump → Plan', description:'Capture unstructured thoughts, classify them and route them into Glow.', kind:'capture' },
      { id:'sunday-reset', label:'Sunday Reset Workspace', description:'Open reset routines and planning together.', kind:'route', href:'/routines' },
      { id:'back-plan', label:'Deadline Back-Planner', description:'Create a milestone plan backwards from a deadline.', kind:'entity', entityType:'back_plan', fields:[{key:'target',label:'Target or deadline'},{key:'deadline',label:'Deadline',type:'date'},{key:'milestones',label:'Milestones',type:'textarea'}] },
      { id:'scenarios', label:'Planning Scenarios', description:'Save Calm, Productive, Recovery or custom planning scenarios.', kind:'entity', entityType:'planning_scenario', fields:[{key:'mode',label:'Scenario',type:'select',options:['Calm Week','Productive Week','Recovery Week','Busy Work Week','Custom']},{key:'rules',label:'Scenario rules',type:'textarea'}] },
      { id:'reality', label:'Plan vs. Reality', description:'Compare planning history with what was actually completed.', kind:'history', scope:['planning','tasks','calendar'] },
      { id:'assistant', label:'Glow Planning Assistant', description:'Create a reviewable planning proposal that requires approval.', kind:'planning', scope:['planning','calendar','tasks','goals'] },
    ]
  },
  {
    key: 'reminders', label: 'Reminders', path: '/reminders', upgrades: [
      { id:'unified-inbox', label:'Unified Reminder Inbox', description:'Review Apple and Glow reminder context together.', kind:'route', href:'/reminders' },
      { id:'categories', label:'Smart Categories', description:'Group reminders by real list, due state and context.', kind:'route', href:'/reminders' },
      { id:'context', label:'Context-Aware Reminders', description:'Store useful context such as place, person or situation around a reminder.', kind:'entity', entityType:'reminder_context', fields:[{key:'reminder',label:'Reminder'},{key:'context',label:'Context'},{key:'details',label:'Details',type:'textarea'}] },
      { id:'relevant', label:'Remind Me When Relevant', description:'Create a rule that explains when a reminder should surface.', kind:'rules' },
      { id:'recurring', label:'Recurring Reminder Builder', description:'Save recurring reminder patterns and hand them to the reminder system.', kind:'entity', entityType:'reminder_template', fields:[{key:'cadence',label:'Cadence'},{key:'time',label:'Preferred time',type:'time'},{key:'details',label:'Reminder text',type:'textarea'}] },
      { id:'convert', label:'Reminder → Action', description:'Turn reminder context into tasks, events or routines through Universal Intake.', kind:'capture' },
      { id:'snooze', label:'Smart Snooze', description:'Review schedule context before deciding when to surface something again.', kind:'planning', scope:['reminders','calendar'] },
      { id:'history', label:'Reminder History', description:'Review imported and completed reminder activity.', kind:'history', scope:['reminders'] },
      { id:'recovery', label:'Missed Reminder Recovery', description:'Surface missed due items and decide what to do next.', kind:'insight', scope:['reminders','tasks'] },
      { id:'natural-language', label:'Natural-Language Reminder', description:'Capture a reminder sentence and let Glow classify it safely.', kind:'capture' },
    ]
  },
];
