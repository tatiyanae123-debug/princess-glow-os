import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT=process.cwd();
function read(relative:string){return fs.readFileSync(path.join(ROOT,relative),'utf8')}

describe('Glow OS V3 system contract',()=>{
  it('uses the V3 reference shell for every non-focus route and never restores the old architectural wrapper',()=>{
    const shell=read('src/components/app-shell-optimized.tsx');
    expect(shell).toContain('data-glow-shell="v3"');
    expect(shell).toContain('md:w-[238px]');
    expect(shell).toContain('<Sidebar variant="dashboard-reference" />');
    expect(shell).toContain('<GlobalHeader />');
    expect(shell).toContain('<GlobalCommandSurface />');
    expect(shell).not.toContain('ArchitecturalWorldFrame');
  });

  it('loads the locked V3 design-system CSS last so legacy room CSS cannot replace the shell contract',()=>{
    const layout=read('src/app/layout.tsx');
    const v3=layout.indexOf("import './glow-v3-system.css'");
    const architectural=layout.indexOf("import './architectural-world.css'");
    const pink=layout.indexOf("import './pink-system.css'");
    expect(v3).toBeGreaterThan(architectural);
    expect(v3).toBeGreaterThan(pink);
    const css=read('src/app/glow-v3-system.css');
    expect(css).toContain('--v3-sidebar-width: 238px');
    expect(css).toContain('--v3-blush: #F7D1D8');
    expect(css).toContain('--v3-blush-soft: #FAE6E7');
    expect(css).toContain('--v3-ivory-rose: #F7EEED');
  });

  it('opens Search as the in-place V3 command surface with keyboard and escape support',()=>{
    const header=read('src/components/global-header.tsx');
    const command=read('src/components/global-command-surface.tsx');
    expect(header).toContain("new CustomEvent('glow:search-open')");
    expect(header).not.toContain("router.push('/search')");
    expect(command).toContain("event.metaKey || event.ctrlKey");
    expect(command).toContain("event.key === 'Escape'");
    expect(command).toContain('glow-os:recent-searches:v1');
    expect(command).toContain('What am I forgetting this week?');
    expect(command).toContain('Show everything related to Terrain Design');
  });

  it('keeps the user-facing adaptive planning system to the four requested day modes',()=>{
    const panel=read('src/components/adaptive-today-panel.tsx');
    expect(panel).toContain('Most Highly Productive Day');
    expect(panel).toContain('Productive Day');
    expect(panel).toContain('Bare Minimum Day');
    expect(panel).toContain('Clear Everything Day');
    expect(panel).toContain('It never silently moves protected commitments.');
  });

  it('keeps unsupported alert channels disabled instead of pretending they work',()=>{
    const alerts=read('src/components/alerts/alert-center-client.tsx');
    expect(alerts).toContain("id:'email'");
    expect(alerts).toContain("ready:false");
    expect(alerts).toContain('Multiple alert stages');
    expect(alerts).toContain('Quiet hours + recovery');
    expect(alerts).toContain('Notification history');
  });
});
