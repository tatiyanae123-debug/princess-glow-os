# Glow OS — Batch H, Steps 61–64

## Step 61 — Repository Auto-Scanner
Batch H composes the existing route inventory into a repository-level scanner. It inventories app routes plus components, styles, layouts and APIs from supplied repository file evidence. It never invents surfaces that were not scanned.

## Step 62 — Auto-Migration Planner
Discovered routes are mapped only to registered Glow families. Each route receives its inherited family/world/room, templates, canonical-object dependencies and shared engines. High-confidence mappings can enter the safe migration manifest. Medium/low-confidence mappings stop for review.

## Step 63 — Safe Automatic Migration Executor
The executor produces a non-destructive migration manifest for eligible surfaces. It preserves the existing route, canonical data and history and does not authorize legacy retirement. Dynamic routes are explicitly preserved/adapted during transition. This is the bridge from factory architecture to bulk runtime conversion, not a deletion engine.

## Step 64 — Exception Inbox
Ambiguous and review-required surfaces are collapsed into one exception inbox with reason, severity and shared owner. This is the intended human-work queue. Glow should spend manual design/engineering time on exceptions rather than every page.

## Governing pipeline
Repository scan → route/surface inventory → registered-family mapping → migration plan → safe execution manifest → exception inbox → QA before retirement.

Batch H does not merge main, delete existing routes/data/history or claim visual parity merely because an automatic mapping exists.
