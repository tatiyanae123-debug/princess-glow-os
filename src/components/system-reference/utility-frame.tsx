import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowLeft, Circle, Sparkles } from 'lucide-react';
import styles from './system-reference.module.css';

type RailItem={label:string;href:string;active?:boolean;icon?:ReactNode};

type UtilityFrameProps={
  title?:string;
  children:ReactNode;
  rail?:RailItem[];
  backHref?:string;
  backLabel?:string;
  className?:string;
};

export function UtilityFrame({title,children,rail=[],backHref,backLabel='Back',className=''}:UtilityFrameProps){
  return <section className={`${styles.frame} ${className}`}>
    <div className={styles.nodes} aria-hidden="true"><i/><i/><i/><i/><i/></div>
    <div className={styles.inner}>
      <header className={styles.topbar}>
        <div className={styles.brand}>Glow OS <small>{backHref?<Link href={backHref} style={{color:'inherit',textDecoration:'none'}}><ArrowLeft size={10} style={{display:'inline',verticalAlign:'-1px',marginRight:4}}/>{backLabel}</Link>:'Living system'}</small></div>
        <div className={styles.pageTitle}>{title??'Glow OS'}</div>
        <Link href="/ask-glow" className={styles.askGlow}><span className={styles.pearl}/><span>Ask Glow</span></Link>
      </header>
      {rail.length?<div className={styles.gridWithRail}>
        <nav className={styles.localRail} aria-label={`${title??'Utility'} instruments`}>
          {rail.map(item=><Link key={`${item.label}-${item.href}`} href={item.href} data-active={item.active?'true':'false'}>{item.icon??<span className={styles.railDot}><Circle size={12}/></span>}<span>{item.label}</span></Link>)}
          <div style={{marginTop:'auto',padding:'10px 8px',display:'flex',alignItems:'center',gap:8,color:'#7b706c',fontSize:9}}><Sparkles size={13}/><span>Glow</span></div>
        </nav>
        <div>{children}</div>
      </div>:children}
    </div>
  </section>;
}

export {styles};
