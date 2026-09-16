import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT=process.cwd();
const read=(p:string)=>fs.readFileSync(path.join(ROOT,p),'utf8');

describe('Wave 9 device and state contract',()=>{
  it('uses a device-width viewport with safe-area coverage',()=>{
    const layout=read('src/app/layout.tsx');
    expect(layout).toContain("width: 'device-width'");
    expect(layout).toContain("viewportFit: 'cover'");
    expect(layout).toContain("'./device-state-qa.css'");
  });

  it('ships global loading and recoverable error states',()=>{
    expect(fs.existsSync(path.join(ROOT,'src/app/loading.tsx'))).toBe(true);
    expect(fs.existsSync(path.join(ROOT,'src/app/error.tsx'))).toBe(true);
    expect(read('src/app/error.tsx')).toContain('reset');
    expect(read('src/app/error.tsx')).toContain('Return to Today');
  });

  it('exposes online and offline state to the global shell',()=>{
    const bridge=read('src/components/glow/network-state-bridge.tsx');
    expect(bridge).toContain("window.addEventListener('online'");
    expect(bridge).toContain("window.addEventListener('offline'");
    expect(read('src/app/layout.tsx')).toContain('<NetworkStateBridge />');
  });

  it('protects mobile touch, focus, reduced motion and iPad layouts',()=>{
    const css=read('src/app/device-state-qa.css');
    expect(css).toContain('safe-area-inset-top');
    expect(css).toContain('min-height: 44px');
    expect(css).toContain(':focus-visible');
    expect(css).toContain('prefers-reduced-motion: reduce');
    expect(css).toContain('(min-width: 768px) and (max-width: 1180px)');
    expect(css).toContain("data-glow-network='offline'");
  });
});
