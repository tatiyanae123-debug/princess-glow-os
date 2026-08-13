import type { RoomUpgradeSet } from './types';
export const MEDICATION_UPGRADES:RoomUpgradeSet[]=[{key:'medications',label:'Medications & Supplements',path:'/wellness/medications',upgrades:[
{id:'library',label:'Medication / Supplement Library',description:'Review the real medication and supplement records stored in Glow.',kind:'route',href:'/wellness/medications'},
{id:'schedule',label:'Morning / Night Schedule',description:'Organize active records by their stored time of day.',kind:'route',href:'/wellness/medications'},
{id:'adherence',label:'Taken / Skipped Log',description:'Record adherence events without changing treatment instructions.',kind:'entity',entityType:'care_adherence',fields:[{key:'item',label:'Medication or supplement'},{key:'status',label:'Status',type:'select',options:['Taken','Skipped','Late']},{key:'date',label:'Date',type:'date'},{key:'notes',label:'Notes',type:'textarea'}]},
{id:'refills',label:'Refill Tracking',description:'Track refill dates and supply notes.',kind:'entity',entityType:'care_refill',fields:[{key:'item',label:'Item'},{key:'refillDate',label:'Refill date',type:'date'},{key:'remaining',label:'Supply remaining'},{key:'notes',label:'Notes',type:'textarea'}]},
{id:'inventory',label:'Supply Inventory',description:'Track how much is on hand and when it was checked.',kind:'entity',entityType:'care_inventory',fields:[{key:'item',label:'Item'},{key:'quantity',label:'Quantity'},{key:'checkedAt',label:'Checked date',type:'date'}]},
{id:'prescription',label:'Prescription Information',description:'Review the medication record fields Glow already stores.',kind:'route',href:'/wellness/medications'},
{id:'appointment-notes',label:'Appointment Notes',description:'Save questions or medication notes to bring to an appointment.',kind:'entity',entityType:'care_appointment_note',fields:[{key:'appointment',label:'Appointment / clinician'},{key:'questions',label:'Questions',type:'textarea'},{key:'notes',label:'Notes',type:'textarea'}]},
{id:'history',label:'Adherence History',description:'Review the adherence entries you explicitly logged.',kind:'history',scope:['care_adherence']},
{id:'questions',label:'Questions for Next Appointment',description:'Maintain a practical question list for your next visit.',kind:'entity',entityType:'care_question',fields:[{key:'topic',label:'Topic'},{key:'question',label:'Question',type:'textarea'}]},
{id:'timeline',label:'Care Timeline',description:'Review medication, supplement and logged care events chronologically.',kind:'history',scope:['medication','supplement','care_adherence','care_refill']},
]}];
