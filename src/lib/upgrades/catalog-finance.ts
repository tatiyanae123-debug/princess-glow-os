import type { RoomUpgradeSet } from './types';

export const FINANCE_UPGRADES: RoomUpgradeSet[] = [{ key:'finance', label:'Finance', path:'/finance', upgrades:[
  {id:'month-hero',label:'This Month',description:'Keep income, spent, saved and available context immediately readable.',kind:'route',href:'/finance'},
  {id:'transactions',label:'Transaction Timeline',description:'Use the real finance-entry history.',kind:'route',href:'/finance'},
  {id:'categories',label:'Category Breakdown',description:'Review real spending categories and changes.',kind:'insight',scope:['finance']},
  {id:'budget',label:'Budget System',description:'Save personal category limits and planning notes.',kind:'entity',entityType:'budget_plan',fields:[{key:'period',label:'Period'},{key:'category',label:'Category'},{key:'limit',label:'Limit'},{key:'notes',label:'Notes',type:'textarea'}]},
  {id:'bills',label:'Bills / Subscriptions Calendar',description:'Track recurring bills and expected due dates.',kind:'entity',entityType:'bill_subscription',fields:[{key:'amount',label:'Amount'},{key:'dueDate',label:'Next due date',type:'date'},{key:'cadence',label:'Cadence'},{key:'notes',label:'Notes',type:'textarea'}]},
  {id:'savings',label:'Savings Tracker',description:'Use the real Financial Brain goal records.',kind:'route',href:'/finance/brain'},
  {id:'goals',label:'Financial Goals',description:'Connect money to the goals you are building toward.',kind:'relations',scope:['finance','goal']},
  {id:'search',label:'Spending Search',description:'Search finance entries and connected context.',kind:'search',scope:['finance']},
  {id:'comparison',label:'Month Comparison',description:'Compare current and previous finance activity from real entries.',kind:'history',scope:['finance']},
  {id:'attention',label:'Financial Attention System',description:'Surface unusual spending, upcoming bills and budget pressure.',kind:'insight',scope:['finance','bill_subscription','budget_plan']},
]}];
