export type ObjectFlow={object:string;path:string[];description:string};

export const OBJECT_FLOWS:ObjectFlow[]=[
  {object:'Beauty Product',path:['gmail','finance','beauty-lab','beauty','observations','concierge'],description:'Order → purchase → inventory → routine → running-low signal → repurchase proposal'},
  {object:'Food Item',path:['intake','food','planning','home','finance','memory'],description:'Recipe/list → kitchen → meal plan → inventory → spend → favorite/history'},
  {object:'Project Idea',path:['notes','projects','tasks','calendar','goals','timeline','memory'],description:'Idea → project → next action → protected time → outcome → milestone → context'},
  {object:'Clothing Item',path:['gmail','finance','closet','calendar','home'],description:'Order → spend → wardrobe → outfit/event → laundry cycle'},
  {object:'Reminder',path:['intake','inbox','tasks','today','briefings'],description:'Capture → review → action → today → daily briefing'},
];
