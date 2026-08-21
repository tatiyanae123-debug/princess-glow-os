import { and, asc, desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { noteMediaSources, noteTranscriptAnalyses, noteTranscriptChunks, noteTranscriptQuestions } from '@/db/schema/note-transcripts';

export async function createMediaSource(userId:string,input:{title:string;sourceType:'upload'|'url';sourceUrl?:string;platform?:string;mimeType?:string;durationSeconds?:number|null}){
 const [row]=await db.insert(noteMediaSources).values({userId,title:input.title,sourceType:input.sourceType,sourceUrl:input.sourceUrl,platform:input.platform,mimeType:input.mimeType,durationSeconds:input.durationSeconds??null,status:'transcribing'}).returning();return row;
}
export async function getMediaSource(userId:string,id:string){return (await db.select().from(noteMediaSources).where(and(eq(noteMediaSources.id,id),eq(noteMediaSources.userId,userId))).limit(1))[0]??null}
export async function setMediaStatus(userId:string,id:string,status:string,error?:string|null,noteId?:string|null){const [row]=await db.update(noteMediaSources).set({status,error:error??null,noteId:noteId??undefined,updatedAt:new Date()}).where(and(eq(noteMediaSources.id,id),eq(noteMediaSources.userId,userId))).returning();return row??null}
export async function saveTranscriptChunk(userId:string,sourceId:string,input:{chunkIndex:number;text:string;startSeconds?:number|null;endSeconds?:number|null;analysis?:string|null}){
 if(!Number.isInteger(input.chunkIndex)||input.chunkIndex<0)throw new Error('Transcript chunk index must be a non-negative integer.');
 const source=await getMediaSource(userId,sourceId);if(!source)throw new Error('Transcript source was not found for this account.');
 const existing=(await db.select().from(noteTranscriptChunks).where(and(eq(noteTranscriptChunks.userId,userId),eq(noteTranscriptChunks.sourceId,sourceId),eq(noteTranscriptChunks.chunkIndex,input.chunkIndex))).limit(1))[0];
 if(existing){const [row]=await db.update(noteTranscriptChunks).set({text:input.text,startSeconds:input.startSeconds??existing.startSeconds,endSeconds:input.endSeconds??existing.endSeconds,analysis:input.analysis??existing.analysis}).where(and(eq(noteTranscriptChunks.id,existing.id),eq(noteTranscriptChunks.userId,userId))).returning();return row}
 const [row]=await db.insert(noteTranscriptChunks).values({userId,sourceId,chunkIndex:input.chunkIndex,text:input.text,startSeconds:input.startSeconds??null,endSeconds:input.endSeconds??null,analysis:input.analysis??null}).returning();return row;
}
export async function getTranscript(userId:string,sourceId:string){return db.select().from(noteTranscriptChunks).where(and(eq(noteTranscriptChunks.userId,userId),eq(noteTranscriptChunks.sourceId,sourceId))).orderBy(asc(noteTranscriptChunks.chunkIndex))}
export async function getTranscriptSources(userId:string){return db.select().from(noteMediaSources).where(eq(noteMediaSources.userId,userId)).orderBy(desc(noteMediaSources.createdAt)).limit(80)}
export async function saveAnalysis(userId:string,sourceId:string,input:{summary:string;keyPoints:string[];decisions:string[];actionItems:string[];questions:string[];themes:string[];model?:string}){
 if(!await getMediaSource(userId,sourceId))throw new Error('Transcript source was not found for this account.');
 const existing=(await db.select().from(noteTranscriptAnalyses).where(and(eq(noteTranscriptAnalyses.userId,userId),eq(noteTranscriptAnalyses.sourceId,sourceId))).limit(1))[0];
 if(existing){const [row]=await db.update(noteTranscriptAnalyses).set({...input,status:'complete',updatedAt:new Date()}).where(and(eq(noteTranscriptAnalyses.id,existing.id),eq(noteTranscriptAnalyses.userId,userId))).returning();return row}
 const [row]=await db.insert(noteTranscriptAnalyses).values({userId,sourceId,...input,status:'complete'}).returning();return row;
}
export async function getAnalysis(userId:string,sourceId:string){return (await db.select().from(noteTranscriptAnalyses).where(and(eq(noteTranscriptAnalyses.userId,userId),eq(noteTranscriptAnalyses.sourceId,sourceId))).limit(1))[0]??null}
export async function saveQuestion(userId:string,sourceId:string,input:{question:string;answer:string;evidence:Array<{chunkIndex:number;quote:string}>;model?:string}){if(!await getMediaSource(userId,sourceId))throw new Error('Transcript source was not found for this account.');const [row]=await db.insert(noteTranscriptQuestions).values({userId,sourceId,...input}).returning();return row}
export async function getQuestions(userId:string,sourceId:string){return db.select().from(noteTranscriptQuestions).where(and(eq(noteTranscriptQuestions.userId,userId),eq(noteTranscriptQuestions.sourceId,sourceId))).orderBy(desc(noteTranscriptQuestions.createdAt)).limit(30)}

export function rankChunks<T extends {chunkIndex:number;text:string}>(chunks:T[],query:string,limit=8){const terms=[...new Set((query.toLowerCase().match(/[a-z0-9][a-z0-9'-]{2,}/g)??[]).filter(x=>!['the','and','that','this','with','from','what','when','where','were','have','about','does','did','for','you','your','they','their'].includes(x)))];const scored=chunks.map(chunk=>({chunk,score:terms.reduce((n,t)=>n+(chunk.text.toLowerCase().includes(t)?1:0),0)})).sort((a,b)=>b.score-a.score||a.chunk.chunkIndex-b.chunk.chunkIndex);if(!terms.length||scored[0]?.score===0)return chunks.slice(0,Math.max(1,limit));return scored.slice(0,Math.max(1,limit)).map(x=>x.chunk)}
