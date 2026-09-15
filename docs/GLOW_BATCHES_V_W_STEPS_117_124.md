# Glow OS — Batches V–W, Steps 117–124

## Batch V — Real Glow Census, Steps 117–120
The completion system now has an evidence-based census model. Every supplied repository/QA surface is classified as Complete, Needs Migration, Needs Function, Needs Data, Needs Visual, Exception, Obsolete or Blocked. Missing evidence never becomes a fabricated pass. The census reports the real denominator, complete count and completion percentage. Repository route/surface evidence can seed the census through the existing migration scanner.

## Batch W — Top-Blocker Elimination, Steps 121–124
Blockers are grouped by shared owner and root cause, ranked first by severity and then by number of affected surfaces. The next repair wave selects the highest-impact blockers rather than an arbitrary next page. Ancestor-repair eligibility is preserved so Global Shell, template, engine, token, canonical-object or history problems can be fixed once and all descendants retested together.

## Permanent loop
Scan real repository → build census → treat missing evidence as unfinished → extract blockers → group by shared owner → rank by severity/impact → repair top shared owner → retest affected descendants → recalculate census → repeat.

## Boundary
The census machinery does not invent QA evidence that has not been collected. A repository surface is not called Complete without build, canonical-data, functional and visual evidence. This batch does not delete legacy code, merge main or ship production.
