import type { RoomUpgradeSet } from './types';

export const FITNESS_WELLNESS_UPGRADES: RoomUpgradeSet[] = [
  { key:'fitness', label:'Fitness', path:'/fitness', upgrades:[
    {id:'today-workout',label:'Today’s Workout Hero',description:'Keep the current workout and training focus prominent.',kind:'route',href:'/fitness'},
    {id:'exercise-library',label:'Exercise Library',description:'Build a personal exercise reference library with instructions and cues.',kind:'entity',entityType:'exercise',fields:[{key:'muscles',label:'Muscles / focus'},{key:'equipment',label:'Equipment'},{key:'instructions',label:'Instructions',type:'textarea'}]},
    {id:'workout-builder',label:'Workout Builder',description:'Build reusable workouts from exercises, sets and notes.',kind:'entity',entityType:'workout_plan',fields:[{key:'focus',label:'Workout focus'},{key:'exercises',label:'Exercises / sets / reps',type:'textarea'},{key:'duration',label:'Estimated minutes',type:'number'}]},
    {id:'sets-tracking',label:'Sets / Reps / Weight',description:'Log structured training details alongside completed sessions.',kind:'entity',entityType:'training_log',fields:[{key:'exercise',label:'Exercise'},{key:'sets',label:'Sets',type:'number'},{key:'reps',label:'Reps'},{key:'weight',label:'Weight / resistance'},{key:'notes',label:'Notes',type:'textarea'}]},
    {id:'rest-timer',label:'Rest Timers',description:'Use focused workout mode for distraction-free training.',kind:'route',href:'/fitness?focus=1'},
    {id:'progress',label:'Progress Charts',description:'Review real training frequency, duration and energy over time.',kind:'history',scope:['fitness']},
    {id:'recovery',label:'Recovery / Readiness',description:'Compare soreness, energy and Wellness before the next session.',kind:'insight',scope:['fitness','wellness']},
    {id:'body-regions',label:'Body-Region Focus',description:'Save body regions and movement focus for programs and sessions.',kind:'entity',entityType:'body_region_focus',fields:[{key:'regions',label:'Body regions'},{key:'goal',label:'Training goal'},{key:'notes',label:'Notes',type:'textarea'}]},
    {id:'photos',label:'Progress Photo Timeline',description:'Create dated progress-photo records and relate them to training phases.',kind:'entity',entityType:'fitness_progress_photo',fields:[{key:'date',label:'Date',type:'date'},{key:'imageUrl',label:'Image URL'},{key:'notes',label:'Notes',type:'textarea'}]},
    {id:'planner',label:'Adaptive Workout Planner',description:'Use sessions, recovery and schedule context to plan the next workout.',kind:'planning',scope:['fitness','wellness','calendar']},
  ]},
  { key:'wellness', label:'Wellness', path:'/wellness', upgrades:[
    {id:'check-in',label:'Daily Emotional Check-In',description:'Use the real Wellness check-in for mood, energy, stress and hydration.',kind:'route',href:'/wellness'},
    {id:'sleep',label:'Sleep Overview',description:'Review sleep-related wellness entries and patterns.',kind:'insight',scope:['wellness','sleep']},
    {id:'energy',label:'Energy Tracker',description:'Review logged energy over time and its surrounding context.',kind:'history',scope:['wellness','energy']},
    {id:'stress',label:'Stress Tracker',description:'Review stress entries and evidence instead of isolated numbers.',kind:'history',scope:['wellness','stress']},
    {id:'hydration',label:'Hydration',description:'Keep hydration logging and trends inside Wellness.',kind:'route',href:'/wellness'},
    {id:'journal',label:'Mind / Body Journal',description:'Capture body sensations, emotions, context and reflections.',kind:'entity',entityType:'wellness_journal',fields:[{key:'mood',label:'Mood'},{key:'body',label:'Body / physical notes',type:'textarea'},{key:'mind',label:'Mind / emotional notes',type:'textarea'}]},
    {id:'recovery',label:'Recovery Recommendations',description:'Use sleep, energy, soreness and schedule context to surface recovery needs.',kind:'insight',scope:['wellness','fitness','calendar']},
    {id:'correlations',label:'Wellness Correlations',description:'Compare wellness with habits, fitness and calendar density.',kind:'insight',scope:['wellness','habits','fitness','calendar']},
    {id:'reset-library',label:'Personal Reset Activities',description:'Build a personal library of calming and restorative actions.',kind:'entity',entityType:'wellness_reset',fields:[{key:'category',label:'Category'},{key:'duration',label:'Minutes',type:'number'},{key:'steps',label:'What to do',type:'textarea'}]},
    {id:'exhibit',label:'Wellness Exhibit Mode',description:'Open Wellness in a quieter focus state for one metric at a time.',kind:'route',href:'/wellness?focus=1'},
  ]},
];
