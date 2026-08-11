'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Bell, Check, ChevronRight, CircleHelp, CloudDownload, Crown, Database, FilePlus2, Fingerprint, Heart, Info, Link2, LockKeyhole, Moon, Palette, Settings2, ShieldCheck, Sparkles, Sun, UserRound } from 'lucide-react';
import { useGlow } from '@/lib/context/glow-provider';
import { THEMES, type ThemeId } from '@/lib/themes';
import type { ConnectionsOverview } from '@/lib/data/connections';

type Section = 'account' | 'preferences' | 'notifications' | 'integrations' | 'security' | 'data' | 'about';
type Profile = { name: string | null; email: string | null; image: string | null };
const tabs: { id: Section; label: string }[] = [
  { id:'account', label:'My Account' }, { id:'preferences', label:'Preferences' }, { id:'notifications', label:'Notifications' },
  { id:'integrations', label:'Integrations' }, { id:'security', label:'Security & Privacy' }, { id:'data', label:'Data Management' }, { id:'about', label:'About Glow OS' },
];
const rows = [
  { id:'preferences' as const, icon:Settings2, title:'Preferences', lead:'Customize your experience', copy:'Themes, visual preferences, and more' },
  { id:'notifications' as const, icon:Bell, title:'Notifications', lead:'Stay updated your way', copy:'Review the notification features currently available' },
  { id:'integrations' as const, icon:Link2, title:'Integrations', lead:'Connect your world', copy:'Google Calendar and Gmail' },
  { id:'security' as const, icon:ShieldCheck, title:'Security & Privacy', lead:'Your data, your rules', copy:'Google authentication and connected permissions' },
  { id:'data' as const, icon:Database, title:'Data Management', lead:'Control your data', copy:'Safe import and data availability' },
  { id:'about' as const, icon:Crown, title:'About Glow OS', lead:'Product information', copy:'Version, privacy, and support status' },
];

function Panel({ title, action, children, className='' }: { title:string; action?:React.ReactNode; children:React.ReactNode; className?:string }) {
  return <section className={`settings-panel ${className}`}><header><h2>{title}</h2>{action}</header>{children}</section>;
}

export function SettingsControlCenter({ profile, connections, version }: { profile:Profile; connections:ConnectionsOverview; version:string }) {
  const [active, setActive] = useState<Section>('account');
  const { themeId, setTheme } = useGlow();
  return <div className="settings-room">
    <div className="room-heading"><div><h1>Settings <Sparkles/></h1><p>Customize your Glow. Control your world.</p></div></div>
    <nav className="room-tabs settings-tabs" aria-label="Settings sections">{tabs.map(tab=><button type="button" key={tab.id} onClick={()=>setActive(tab.id)} className={active===tab.id?'active':''}>{tab.label}</button>)}</nav>
    <div className="settings-layout">
      <div className="settings-left">
        <Panel title="My account" action={<span className="settings-status">Authenticated profile</span>} className="account-card">
          <div className="profile-intro">{profile.image?<Image src={profile.image} alt="" width={72} height={72}/>:<span className="profile-placeholder"><UserRound/></span>}<div><h3>{profile.name || 'Name not added'}</h3><p>{profile.email || 'Email unavailable'}</p><small>Profile information is managed by your Google account.</small></div></div>
          <dl><div><dt>Display name</dt><dd>{profile.name || <em>Not provided</em>}</dd></div><div><dt>Email</dt><dd>{profile.email || <em>Not provided</em>}</dd></div><div><dt>Birthday</dt><dd><em>Not added</em></dd></div><div><dt>Location</dt><dd><em>Not added</em></dd></div><div><dt>Time zone</dt><dd>{Intl.DateTimeFormat().resolvedOptions().timeZone || 'System time zone'}</dd></div></dl>
          <p className="account-note"><LockKeyhole/> Glow OS does not currently store editable profile details. Update your name or image through your Google account.</p>
        </Panel>
        <Panel title="Account progress" action={<span className="settings-status">Not connected</span>} className="account-progress"><div className="xp-empty"><span><Crown/></span><div><h3>Level and XP are unavailable</h3><p>Glow OS does not currently have a persistent XP or rewards system, so no progress values are shown.</p></div></div></Panel>
      </div>
      <div className="settings-center">
        <Panel title={active==='account'?'Glow OS controls':tabs.find(t=>t.id===active)?.label || 'Controls'} className="control-list">
          {rows.map(row=><button key={row.id} type="button" onClick={()=>setActive(row.id)} className={active===row.id?'selected':''}><span className="control-icon"><row.icon/></span><span><b>{row.title}</b><strong>{row.lead}</strong><small>{row.copy}</small></span><ChevronRight/></button>)}
        </Panel>
        {active!=='account'&&<SectionDetail active={active} connections={connections} version={version} themeId={themeId} setTheme={setTheme}/>} 
      </div>
      <aside className="settings-rail">
        <Panel title="Quick actions" className="quick-settings"><button onClick={()=>setActive('security')}><Fingerprint/><span><b>Account security</b><small>Review your sign-in provider</small></span></button><Link href="/connections"><Link2/><span><b>Manage integrations</b><small>Google connection controls</small></span></Link><Link href="/import"><CloudDownload/><span><b>Import my data</b><small>Preview before importing</small></span></Link><div className="flex items-center gap-3 opacity-60"><CircleHelp/><span><b>Help & Support</b><small>Support center unavailable</small></span></div></Panel>
        <Panel title="Daily affirmation" className="affirmation-card"><Heart/><blockquote>“You can build a life that feels calm, intentional, and entirely your own.”</blockquote><small>Editorial affirmation · not stored</small></Panel>
        <Appearance themeId={themeId} setTheme={setTheme}/>
      </aside>
    </div>
    <div className="settings-bottom"><div><Sparkles/><span><b>Glow OS tips</b><small>Use the actions that are already connected:</small></span></div><Link href="/notes"><FilePlus2/> New Note</Link><Link href="/tasks"><Check/> New Task</Link><Link href="/dashboard"><Crown/> Command Center</Link></div>
  </div>;
}

function Appearance({themeId,setTheme}:{themeId:ThemeId;setTheme:(id:ThemeId)=>void}) {
 const choices=[{id:'modern-princess' as const,label:'Light',icon:Sun},{id:'dark' as const,label:'Dark',icon:Moon}];
 return <Panel title="App appearance" className="appearance"><div className="mode-options">{choices.map(c=><button key={c.id} className={themeId===c.id?'chosen':''} onClick={()=>setTheme(c.id)}><c.icon/><span>{c.label}</span></button>)}<div className="opacity-60" title="System theme is not supported yet"><Palette/><span>Auto</span><small>Unavailable</small></div></div><p>Theme palette</p><div className="palette-options">{THEMES.slice(0,6).map(t=><button aria-label={t.name} title={t.name} className={themeId===t.id?'chosen':''} key={t.id} onClick={()=>setTheme(t.id)} style={{background:t.tokens.accent}}>{themeId===t.id&&<Check/>}</button>)}</div><small className="appearance-note">Saved in this browser and applied across Glow OS.</small></Panel>
}

function SectionDetail({active,connections,version,themeId,setTheme}:{active:Section;connections:ConnectionsOverview;version:string;themeId:ThemeId;setTheme:(id:ThemeId)=>void}) {
 if(active==='preferences') return <Appearance themeId={themeId} setTheme={setTheme}/>;
 if(active==='notifications') return <Panel title="Notification availability" className="detail-card"><State icon={Bell} title="In-app notification preferences" state="Unavailable" copy="Glow OS does not currently persist reminder, push, or email notification preferences. No delivery channels are being implied or enabled here."/></Panel>;
 if(active==='integrations') return <Panel title="Connected services" className="detail-card"><State icon={Link2} title="Google Calendar + Gmail" state={connections.connected?'Connected':'Not connected'} copy={connections.connected?`Calendar: ${connections.hasCalendarScope?'granted':'permission needed'} · Gmail: ${connections.hasGmailScope?'granted':'permission needed'}`:'Connect Google through the secure integrations page to request read-only Calendar and Gmail access.'}/><Link className="detail-link" href="/connections">Manage Google connection <ChevronRight/></Link></Panel>;
 if(active==='security') return <Panel title="Security & privacy" className="detail-card"><State icon={Fingerprint} title="Google OAuth sign-in" state="Active provider" copy="Authentication is handled by Google through Auth.js. Glow OS never displays passwords, OAuth tokens, application secrets, or database credentials."/><p className="privacy-copy"><ShieldCheck/> Connected Google permissions are read-only and can be reviewed or revoked from Integrations.</p></Panel>;
 if(active==='data') return <Panel title="Data management" className="detail-card"><State icon={CloudDownload} title="Export / download" state="Unavailable" copy="A safe account export has not been implemented. No download action is presented."/><State icon={Database} title="Master Importer" state="Available" copy="Preview supported records and confirm them before anything is written."/><Link className="detail-link" href="/import">Open Master Importer <ChevronRight/></Link><p className="privacy-copy"><LockKeyhole/> Account or bulk-data deletion is not available here. This prevents accidental destructive operations.</p></Panel>;
 return <Panel title="About Glow OS" className="detail-card"><div className="about-mark"><Crown/><div><h3>Glow OS</h3><p>Princess Command Center · Version {version}</p></div></div><State icon={Info} title="What’s New, Terms, Privacy & Support" state="Not published" copy="These public information pages are not present in this application, so unavailable links are not advertised."/></Panel>;
}
function State({icon:Icon,title,state,copy}:{icon:typeof Bell;title:string;state:string;copy:string}) { return <div className="state-row"><Icon/><div><h3>{title}</h3><p>{copy}</p></div><span>{state}</span></div> }
