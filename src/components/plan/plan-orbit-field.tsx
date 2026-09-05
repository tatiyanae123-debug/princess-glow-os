import type { CSSProperties } from 'react';
import styles from './plan-instruments.module.css';

const NODE_POSITIONS = [
  [7,19,8,0],[12,37,5,1],[16,69,9,2],[22,14,6,3],[27,48,8,4],[31,82,6,0],[37,25,5,2],[42,63,10,1],[48,9,7,4],[53,37,5,3],[58,76,8,0],[64,19,6,1],[69,53,9,2],[74,87,5,4],[80,31,7,3],[86,63,9,1],[92,22,6,0],[95,49,5,2],
  [9,84,5,3],[14,56,7,4],[20,29,5,0],[25,75,8,2],[33,7,5,1],[39,91,7,3],[45,47,5,4],[51,20,8,1],[56,58,5,0],[61,94,6,2],[67,38,7,4],[72,11,5,3],[77,70,8,0],[83,46,5,2],[88,81,7,4],[93,36,5,1],[18,91,6,0],[35,67,5,3],[46,84,7,2],[60,30,6,4],[71,79,5,1],[81,11,8,3],[89,56,5,0],[29,34,6,2],[55,88,7,1],[75,40,6,3],
] as const;

export function PlanOrbitField({ dense = false }: { dense?: boolean }) {
  const nodes = dense ? NODE_POSITIONS : NODE_POSITIONS.slice(0, 34);
  return (
    <div className={styles.orbitField} aria-hidden="true">
      <div className={styles.orbitGlow} />
      {Array.from({ length: 12 }, (_, index) => (
        <i key={`orbit-${index}`} className={`${styles.orbitLine} ${styles[`orbit${index + 1}`]}`} />
      ))}
      {nodes.map(([left, top, size, tone], index) => (
        <span
          key={`node-${index}`}
          className={`${styles.orbitNode} ${styles[`nodeTone${tone}`]}`}
          style={{ '--left': `${left}%`, '--top': `${top}%`, '--size': `${size}px`, '--delay': `${(index % 9) * -0.37}s` } as CSSProperties}
        />
      ))}
    </div>
  );
}
