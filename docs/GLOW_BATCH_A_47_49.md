# Glow OS Batch A — Steps 47–49

## Step 47 — Current preview smoke gate
The pre-Batch-A PR head `708ccfa` is Vercel READY. Vercel reports no runtime error clusters in the checked 24-hour window and no error/fatal runtime logs for that preview. This is a build/runtime-log baseline, not authenticated visual approval. Historical red deployments remain historical.

## Step 48 — Real Skincare pilot
The pilot is now explicitly bound to five existing skincare experiences and their current route projection: Atelier Home (T02), Product Library (T03), Product Detail (T04), Guided Routine (T07), and Progress (T11). The current implementation remains preservation-first in `src/app/beauty/skincare/page.tsx`; no live data or legacy route is deleted before parity and QA.

## Step 49 — Factory gap repair
The pilot exposed four real gaps. Canonical skin observation/progress identity has been repaired by adding `observation` to the canonical object contract and T11 compatibility. The remaining deliberate gates are: remove local ReferenceRail ownership into the Global Shell, preserve the registered T02 Atelier exception, and split query-param projections through thin experience resolution only after parity.

## Batch A rule
A pilot finding must repair the shared ancestor whenever possible. No page-by-page patching and no legacy retirement before build, route, data/history, responsive, accessibility and Golden gates pass.
