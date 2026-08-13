import type { RoomUpgradeSet } from './types';

export const FINANCIAL_BRAIN_UPGRADES: RoomUpgradeSet[] = [{ key:'financial-brain', label:'Financial Brain', path:'/finance/brain', upgrades:[
  {id:'patterns',label:'Spending-Pattern Intelligence',description:'Explain changes in real transactions and categories.',kind:'insight',scope:['finance']},
  {id:'cash-flow',label:'Cash-Flow Forecast',description:'Build a transparent planning view from recorded income, expenses and known bills.',kind:'planning',scope:['finance','bill_subscription']},
  {id:'pressure',label:'Budget Pressure Detection',description:'Compare recorded spending with saved budget plans.',kind:'insight',scope:['finance','budget_plan']},
  {id:'subscriptions',label:'Subscription Intelligence',description:'Track recurring services and their cumulative cost.',kind:'insight',scope:['bill_subscription','finance']},
  {id:'trajectory',label:'Savings Trajectory',description:'Use real finance goals to show target progress.',kind:'route',href:'/finance/brain'},
  {id:'goal-forecast',label:'Goal Forecasting',description:'Connect savings goals with target dates and recorded progress.',kind:'planning',scope:['finance_goal','goal']},
  {id:'affordability',label:'Can I Afford This?',description:'Create a reviewable purchase scenario before spending.',kind:'entity',entityType:'purchase_scenario',fields:[{key:'price',label:'Price'},{key:'category',label:'Category'},{key:'timing',label:'When?'},{key:'notes',label:'Context',type:'textarea'}]},
  {id:'scenarios',label:'Scenario Simulator',description:'Save and compare financial what-if scenarios with explicit assumptions.',kind:'entity',entityType:'finance_scenario',fields:[{key:'assumptions',label:'Assumptions',type:'textarea'},{key:'changes',label:'Changes to test',type:'textarea'},{key:'notes',label:'Notes',type:'textarea'}]},
  {id:'narrative',label:'Monthly Financial Narrative',description:'Turn the month’s actual entries into a concise review.',kind:'review',scope:['finance']},
  {id:'recommendation',label:'One Priority Recommendation',description:'Surface one evidence-backed next financial action at a time.',kind:'insight',scope:['finance','finance_goal','budget_plan']},
]}];
