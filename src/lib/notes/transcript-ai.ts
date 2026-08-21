const OPENAI_BASE='https://api.openai.com/v1';
export function resolveAiKey(request:Request){return request.headers.get('x-glow-ai-key')?.trim()||process.env.OPENAI_API_KEY?.trim()||''}

function wait(ms:number){return new Promise(resolve=>setTimeout(resolve,ms))}
async function fetchWithRetry(url:string,init:RequestInit,timeoutMs:number){
 let lastError:unknown;
 for(let attempt=0;attempt<2;attempt++){
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),timeoutMs);
  try{
   const res=await fetch(url,{...init,signal:controller.signal});
   if((res.status===429||res.status>=500)&&attempt===0){await res.text().catch(()=>undefined);await wait(900);continue}
   return res;
  }catch(error){lastError=error;if(attempt===0){await wait(700);continue}throw error}
  finally{clearTimeout(timer)}
 }
 throw lastError instanceof Error?lastError:new Error('AI request failed.');
}

export async function transcribeBlob(apiKey:string,blob:Blob,filename:string){
 if(!apiKey)throw new Error('No transcription provider is connected. Add an OpenAI API key in Notes Transcription Settings or configure OPENAI_API_KEY on Vercel.');
 const form=new FormData();form.append('file',blob,filename);form.append('model','gpt-4o-mini-transcribe');form.append('response_format','json');
 let res:Response;try{res=await fetchWithRetry(`${OPENAI_BASE}/audio/transcriptions`,{method:'POST',headers:{Authorization:`Bearer ${apiKey}`},body:form},240000)}catch(error){if(error instanceof Error&&error.name==='AbortError')throw new Error('The transcription provider took too long to respond. Glow stopped the stalled request so it can be retried.');throw error}
 if(!res.ok)throw new Error(`Transcription provider returned ${res.status}: ${(await res.text()).slice(0,300)}`);
 const json=await res.json() as {text?:string};if(!json.text?.trim())throw new Error('Transcription provider returned no transcript text.');return json.text.trim();
}
export async function askModel(apiKey:string,prompt:string,model='gpt-5.6-luna'){
 if(!apiKey)throw new Error('No AI provider is connected. Add an OpenAI API key in Notes Transcription Settings or configure OPENAI_API_KEY on Vercel.');
 let res:Response;try{res=await fetchWithRetry(`${OPENAI_BASE}/responses`,{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify({model,input:prompt})},120000)}catch(error){if(error instanceof Error&&error.name==='AbortError')throw new Error('Transcript intelligence took too long to answer. Glow stopped the stalled request so you can retry.');throw error}
 if(!res.ok)throw new Error(`AI provider returned ${res.status}: ${(await res.text()).slice(0,300)}`);
 const json=await res.json() as {output_text?:string;output?:Array<{content?:Array<{type?:string;text?:string}>}>};
 const text=json.output_text??json.output?.flatMap(x=>x.content??[]).map(x=>x.text??'').join('\n');if(!text?.trim())throw new Error('AI provider returned no answer.');return text.trim();
}
export function parseJsonObject(text:string){const cleaned=text.replace(/^```json\s*/i,'').replace(/^```/,'').replace(/```$/,'').trim();try{return JSON.parse(cleaned) as Record<string,unknown>}catch{const a=cleaned.indexOf('{'),b=cleaned.lastIndexOf('}');if(a>=0&&b>a)return JSON.parse(cleaned.slice(a,b+1)) as Record<string,unknown>;throw new Error('AI analysis was not valid JSON.')}}
