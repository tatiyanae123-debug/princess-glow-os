function htmlDecode(value:string){return value.replace(/\\u0026/g,'&').replace(/&amp;/g,'&').replace(/\\\//g,'/').replace(/&#39;/g,"'").replace(/&quot;/g,'"')}
function stripCaptions(text:string){return text.replace(/^WEBVTT[^\n]*\n/i,'').replace(/^\d+\s*$/gm,'').replace(/^\d{2}:\d{2}(?::\d{2})?[.,]\d{3}\s+-->.*$/gm,'').replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"').split('\n').map(x=>x.trim()).filter(Boolean).filter((x,i,a)=>i===0||x!==a[i-1]).join(' ')}
export function platformForUrl(url:string){const host=new URL(url).hostname.toLowerCase().replace(/^www\./,'');if(host==='youtube.com'||host.endsWith('.youtube.com')||host==='youtu.be')return'youtube';if(host==='tiktok.com'||host.endsWith('.tiktok.com'))return'tiktok';if(host==='instagram.com'||host.endsWith('.instagram.com'))return'instagram';return'web'}
function assertPublicHttps(raw:string){const parsed=new URL(raw);if(parsed.protocol!=='https:')throw new Error('The exposed media stream is not HTTPS. Glow will not proxy it.');const host=parsed.hostname.toLowerCase();if(host==='localhost'||host.endsWith('.local')||host==='0.0.0.0'||host==='127.0.0.1'||host==='::1'||/^10\./.test(host)||/^192\.168\./.test(host)||/^169\.254\./.test(host)||/^172\.(1[6-9]|2\d|3[01])\./.test(host))throw new Error('The exposed media stream points to a private network address.');return parsed.toString()}
export async function resolvePublicVideo(url:string){
 const platform=platformForUrl(url);if(platform==='web')throw new Error('Paste a public YouTube, TikTok, or Instagram video link. Other websites are not fetched by Glow’s social-video resolver.');
 const parsed=new URL(url);if(parsed.protocol!=='https:')throw new Error('Use the HTTPS version of this video link.');
 const page=await fetch(parsed.toString(),{redirect:'follow',headers:{'User-Agent':'Mozilla/5.0 GlowOS/1.0'},signal:AbortSignal.timeout(15000)});if(!page.ok)throw new Error(`The ${platform} page could not be fetched publicly (${page.status}).`);const contentType=page.headers.get('content-type')??'';if(!contentType.includes('text/html'))throw new Error(`The ${platform} link did not return a public video page.`);const html=(await page.text()).slice(0,5_000_000);
 const title=htmlDecode(html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)/i)?.[1]??html.match(/<title>([^<]+)/i)?.[1]??`${platform} video`).slice(0,255);
 if(platform==='youtube'){
  const matches=[...html.matchAll(/"baseUrl":"(https:\/\/www\.youtube\.com\/api\/timedtext[^"\\]*(?:\\.[^"\\]*)*)"/g)];
  const captionUrl=matches[0]?.[1]?assertPublicHttps(htmlDecode(matches[0][1])):null;
  if(captionUrl){const cap=await fetch(`${captionUrl}${captionUrl.includes('?')?'&':'?'}fmt=vtt`,{signal:AbortSignal.timeout(15000)});if(cap.ok){const text=stripCaptions((await cap.text()).slice(0,10_000_000));if(text)return{platform,title,kind:'transcript' as const,text}}}
  throw new Error('This YouTube video does not expose public captions to Glow. Upload the video/audio file to transcribe its spoken audio instead.');
 }
 const direct=htmlDecode(html.match(/<meta[^>]+property=["']og:video(?::secure_url)?["'][^>]+content=["']([^"']+)/i)?.[1]??html.match(/"contentUrl"\s*:\s*"([^"]+)"/i)?.[1]??'');
 if(!direct)throw new Error(`This ${platform} page does not expose a public media stream. Glow will not bypass login, private, or protected media.`);
 return{platform,title,kind:'media' as const,mediaUrl:assertPublicHttps(direct)};
}
