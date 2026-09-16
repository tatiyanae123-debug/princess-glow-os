# Glow OS — Batches O–R, Steps 89–104

## Batch O — Whole-Repo Execution, Steps 89–92
The existing Batch H scanner/planner is now composed into a repository-execution entry point that returns the migration analysis, safe execution manifest and Exception Inbox from actual file evidence supplied to it. Remaining work must come from repository evidence rather than estimates.

## Batch P — Automatic Bulk Conversion, Steps 93–96
Safe migration output now feeds the runtime-conversion planner. Eligible routes can be grouped for factory conversion while blocked/review routes remain separated. Existing URLs, canonical data and history remain preservation requirements.

## Batch Q — Global Root-Cause Repair, Steps 97–100
Whole-Glow convergence findings are grouped by their highest shared owner and converted into a priority repair queue. Blockers come first, then high and medium findings. Each repair records every affected surface so the shared ancestor is repaired once and descendants are regression-tested together.

## Batch R — Automated Reference + Golden QA, Steps 101–104
Golden evidence is represented per registered experience, locked reference, device and state. Architecture, visual, responsive and accessibility evidence must pass. Reference-critical failures become a Visual Exception Inbox instead of being silently accepted or converted into independent page architecture.

## Execution pipeline
Scan real repository → map real surfaces → safe manifest → bulk-convert eligible surfaces → preserve legacy compatibility → convergence → ancestor repair → Golden matrix → manual review only for exceptions.

## Boundary
This code enables the execution phase but does not claim every repository file has already been physically rewritten, every reference screenshot is available to automation, or every live experience has passed Golden QA. Destructive retirement and production shipping remain gated.
