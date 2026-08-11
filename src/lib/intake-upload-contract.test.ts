import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();

describe('Add Anything upload contract',()=>{
  it('ships an authenticated API intake endpoint',()=>{
    const file=path.join(root,'src','app','api','intake','route.ts');
    expect(fs.existsSync(file)).toBe(true);
    const text=fs.readFileSync(file,'utf8');
    expect(text).toContain('export async function POST');
    expect(text).toContain('await auth()');
    expect(text).toContain('request.formData()');
    expect(text).toContain('ingestFile');
    expect(text).toContain('ingestText');
  });

  it('global Add Anything uses the API endpoint instead of Server Action multipart transport',()=>{
    const text=fs.readFileSync(path.join(root,'src','components','universal-capture-dock.tsx'),'utf8');
    expect(text).toContain("fetch('/api/intake'");
    expect(text).not.toContain('useActionState');
    expect(text).toContain('router.refresh()');
  });

  it('full Universal Intake uses the same upload endpoint',()=>{
    const text=fs.readFileSync(path.join(root,'src','components','intake','universal-intake-form.tsx'),'utf8');
    expect(text).toContain("fetch('/api/intake'");
    expect(text).not.toContain('useActionState');
  });
});
