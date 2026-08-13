import type { RoomUpgradeSet } from './types';

export const CLOSET_UPGRADES: RoomUpgradeSet[] = [{ key:'closet', label:'Closet', path:'/closet', upgrades:[
  {id:'wardrobe',label:'Digital Wardrobe',description:'Use the real Closet inventory and item controls.',kind:'route',href:'/closet'},
  {id:'categories',label:'Clothing Categories',description:'Group and browse items by their real category.',kind:'route',href:'/closet'},
  {id:'outfit-builder',label:'Outfit Builder',description:'Create outfits from stored wardrobe items.',kind:'entity',entityType:'outfit',fields:[{key:'items',label:'Wardrobe items',type:'textarea'},{key:'occasion',label:'Occasion'},{key:'notes',label:'Styling notes',type:'textarea'}]},
  {id:'outfit-calendar',label:'Outfit Calendar',description:'Connect outfits to real calendar commitments.',kind:'relations',scope:['outfit','calendar_event']},
  {id:'favorites',label:'Favorite Combinations',description:'Save combinations you want to repeat.',kind:'entity',entityType:'favorite_outfit',fields:[{key:'items',label:'Items',type:'textarea'},{key:'why',label:'Why it works',type:'textarea'}]},
  {id:'laundry',label:'Laundry State',description:'Use the existing Closet laundry and care states.',kind:'route',href:'/closet'},
  {id:'packing',label:'Packing Planner',description:'Build reusable packing lists from wardrobe items.',kind:'entity',entityType:'packing_list',fields:[{key:'trip',label:'Trip / occasion'},{key:'dates',label:'Dates'},{key:'items',label:'Packing list',type:'textarea'}]},
  {id:'wishlist',label:'Wishlist',description:'Track wardrobe items you are considering before buying.',kind:'entity',entityType:'closet_wishlist',fields:[{key:'category',label:'Category'},{key:'price',label:'Expected price'},{key:'notes',label:'Why / where',type:'textarea'}]},
  {id:'cost-per-wear',label:'Cost per Wear',description:'Use real purchase price and wear count to evaluate value.',kind:'insight',scope:['closet']},
  {id:'wear-recommendation',label:'What Should I Wear?',description:'Combine wardrobe, occasion and calendar context without inventing items.',kind:'insight',scope:['closet','calendar']},
]}];
