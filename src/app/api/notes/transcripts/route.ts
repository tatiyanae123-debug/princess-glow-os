import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getAnalysis, getQuestions, getTranscript, getTranscriptSources } from '@/lib/data/note-transcripts';

export async function GET(request:Request){
 const session=await auth();if(!session?.user?.id)return NextResponse.json({error:'Unauthorized'},{status:401});
 const url=new URL(request.url);const sourceId=url.searchParams.get('sourceId');
 if(!sourceId){const sources=await getTranscriptSources(session.user.id);return NextResponse.json({data:{sources}})}
 const [chunks,analysis,questions]=await Promise.all([getTranscript(session.user.id,sourceId),getAnalysis(session.user.id,sourceId),getQuestions(session.user.id,sourceId)]);
 return NextResponse.json({data:{chunks,analysis,questions}});
}
