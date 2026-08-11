export type RoomContextRule={room:string;when:string;foreground:string[]};

export const ROOM_CONTEXT_RULES:RoomContextRule[]=[
  {room:'dashboard',when:'morning',foreground:['routine','breakfast','weather','outfit','calendar']},
  {room:'dashboard',when:'before-work',foreground:['commute','work-event','meal','top-three']},
  {room:'dashboard',when:'evening',foreground:['workout','dinner','beauty','tomorrow']},
  {room:'dashboard',when:'sunday',foreground:['reset','groceries','meal-prep','hair','planning']},
  {room:'calendar',when:'morning',foreground:['today','load','next-transition']},
  {room:'calendar',when:'sunday',foreground:['week','overload','rebalance']},
  {room:'fitness',when:'active-workout',foreground:['current-exercise','sets','rest-timer']},
  {room:'hair',when:'wash-day',foreground:['wash-flow','products','time-needed']},
  {room:'food',when:'sunday',foreground:['meal-prep','fridge','groceries']},
  {room:'finance',when:'month-end',foreground:['monthly-close','bills','savings']},
  {room:'planning',when:'sunday',foreground:['weekly-reset','carry-forward','top-three']},
  {room:'closet',when:'before-event',foreground:['outfit-builder','weather','dress-code']},
  {room:'projects',when:'deadline-near',foreground:['active-project','blocker','next-action']},
];
