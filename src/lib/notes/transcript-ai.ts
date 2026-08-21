const OPENAI_BASE='https://api.openai.com/v1';
export function resolveAiKey(request:Request){return process.env.OPENAI_API_KEY||request.headers.get('x-glow-ai-key')||''}
export async function transcribeBlob(apiKey:string,blob:Blob,filename:string){
 if(!apiKey)throw new Error('No transcription provider is connected. Add an OpenAI API key in Notes Transcription Settings or configure OPENAI_API_KEY on Vercel.');
 const form=new FormData();form.append('file',blob,filename);form.append('model','gpt-4o-mini-transcribe');form.append('response_format','json');
 const res=await fetch(`${OPENAI_BASE}/audio/transcriptions`,{method:'POST',headers:{Authorization:`Bearer ${apiKey}`},body:form});
 if(!res.ok)throw new Error(`Transcription provider returned ${res.status}: ${(await res.text()).slice(0,300)}`);
 const json=await res.json() as {text?:string};if(!json.text?.trim())throw new Error('Transcription provider returned no transcript text.');return json.text.trim();
}
export async function askModel(apiKey:string,prompt:string,model='gpt-5.6-luna'){
 if(!apiKey)throw new Error('No AI provider is connected. Add an OpenAI API key in Notes Transcription Settings or configure OPENAI_API_KEY on Vercel.');
 const res=await fetch(`${OPENAI_BASE}/responses`,{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify({model,input:prompt})});
 if(!res.ok)throw new Error(`AI provider returned ${res.status}: ${(await res.text()).slice(0,300)}`);
 const json=await res.json() as {output_text?:string;output?:Array<{content?:Array<{type?:string;text?:string}>}>};
 const text=json.output_text??json.output?.flatMap(x=>x.content??[]).map(x=>x.text??'').join('\n');if(!text?.trim())throw new Error('AI provider returned no answer.');return text.trim();
}
export function parseJsonObject(text:string){const cleaned=text.replace(/^```json\s*/i,'').replace(/^```/,'').replace(/```$/,'').trim();try{return JSON.parse(cleaned) as Record<string,unknown>}catch{const a=cleaned.indexOf('{'),b=cleaned.lastIndexOf('}');if(a>=0&&b>a)return JSON.parse(cleaned.slice(a,b+1)) as Record<string,unknown>;throw new Error('AI analysis was not valid JSON.')}}
