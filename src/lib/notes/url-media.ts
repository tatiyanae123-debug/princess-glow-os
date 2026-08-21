function htmlDecode(value:string){return value.replace(/\\u0026/g,'&').replace(/&amp;/g,'&').replace(/\\\//g,'/').replace(/&#39;/g,"'").replace(/&quot;/g,'"')}
function stripCaptions(text:string){return text.replace(/^WEBVTT[^\n]*\n/i,'').replace(/^\d+\s*$/gm,'').replace(/^\d{2}:\d{2}(?::\d{2})?[.,]\d{3}\s+-->.*$/gm,'').replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"').split('\n').map(x=>x.trim()).filter(Boolean).filter((x,i,a)=>i===0||x!==a[i-1]).join(' ')}
export function platformForUrl(url:string){const host=new URL(url).hostname.toLowerCase();if(host.includes('youtube.com')||host==='youtu.be')return'youtube';if(host.includes('tiktok.com'))return'tiktok';if(host.includes('instagram.com'))return'instagram';return'web'}
export async function resolvePublicVideo(url:string){
 const platform=platformForUrl(url);const page=await fetch(url,{redirect:'follow',headers:{'User-Agent':'Mozilla/5.0 GlowOS/1.0'}});if(!page.ok)throw new Error(`The ${platform} page could not be fetched publicly (${page.status}).`);const html=await page.text();
 const title=htmlDecode(html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)/i)?.[1]??html.match(/<title>([^<]+)/i)?.[1]??`${platform} video`);
 if(platform==='youtube'){
  const matches=[...html.matchAll(/"baseUrl":"(https:\/\/www\.youtube\.com\/api\/timedtext[^"\\]*(?:\\.[^"\\]*)*)"/g)];
  const captionUrl=matches[0]?.[1]?htmlDecode(matches[0][1]):null;
  if(captionUrl){const cap=await fetch(`${captionUrl}${captionUrl.includes('?')?'&':'?'}fmt=vtt`);if(cap.ok){const text=stripCaptions(await cap.text());if(text)return{platform,title,kind:'transcript' as const,text}}}
  throw new Error('This YouTube video does not expose public captions to Glow. Upload the video/audio file to transcribe its spoken audio instead.');
 }
 const direct=htmlDecode(html.match(/<meta[^>]+property=["']og:video(?::secure_url)?["'][^>]+content=["']([^"']+)/i)?.[1]??html.match(/"contentUrl"\s*:\s*"([^"]+)"/i)?.[1]??'');
 if(!direct)throw new Error(`This ${platform} page does not expose a public media stream. Glow will not bypass login, private, or protected media.`);
 return{platform,title,kind:'media' as const,mediaUrl:direct};
}
