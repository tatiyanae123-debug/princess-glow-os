# Glow OS staging workflow

The `staging` branch is the permanent pre-production integration branch for Glow OS.

## Workflow

1. Build each new phase on its own feature branch.
2. Open a draft pull request into `staging` for integration testing.
3. Use the stable Vercel branch URL for `staging` for OAuth and end-to-end testing.
4. After the feature passes testing, merge it into `staging`.
5. Periodically merge `staging` into `main` after the combined release is verified.

This keeps Google OAuth callback configuration stable and avoids using commit-specific Vercel preview URLs for sign-in testing.
