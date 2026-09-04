# Today Stable Production Checkpoint

This file marks the production recovery point after the partial reference-image upgrade caused the Living Center room to render as a broken gray/blurred plate.

## Stable source

The Today implementation is based on commit `7a8d71c4be6b482a9d7d0978c4eb1684632c00ec` plus this checkpoint commit.

## Production safety rules

1. Never replace only some base64/image chunks of a compressed Today room asset on `main`.
2. A replacement room image must be assembled and validated completely on a preview branch before any production switch.
3. The production room asset must change atomically: one complete valid asset in one release.
4. Do not run numbered partial migrations such as `1/16`, `2/16`, etc. directly on production.
5. Preserve the live semantic Today layer while changing artwork unless a separately verified renderer migration is intended.
6. Before promoting a room-art update, verify the full page at iPad landscape, iPad Split View/Stage Manager, iPad portrait, and iPhone portrait.
7. If a visual migration fails, revert the single atomic art switch rather than layering fixes over the failure.

The abandoned partial quality-upgrade state is preserved on branch `backup/partial-reference-upgrade-5-of-16` for recovery only and must not be promoted directly to production.
