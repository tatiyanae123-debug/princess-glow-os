import styles from './shakti-presence.module.css';

export type ShaktiState='resting'|'waking'|'listening'|'understanding'|'speaking'|'acting'|'complete';

export function ShaktiPresence({state='resting',small=false,className=''}:{state?:ShaktiState;small?:boolean;className?:string}){
  return <div className={`${styles.presence} ${styles[state]} ${small?styles.small:''} ${className}`} aria-hidden="true">
    <span className={styles.haze}/>
    <span className={styles.beam}/>
    <span className={`${styles.wing} ${styles.left}`}/>
    <span className={`${styles.wing} ${styles.right}`}/>
    <span className={styles.rays}/>
    <span className={styles.spectral}/>
    <span className={styles.coreShell}/>
    <span className={styles.core}/>
    <span className={styles.white}/>
    <span className={styles.caustic}/>
    <span className={styles.ground}/>
  </div>;
}
