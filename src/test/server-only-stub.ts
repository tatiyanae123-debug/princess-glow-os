// Test-only stand-in for the `server-only` package. Next.js enforces the
// real server-only guard at build time via its "react-server" export
// condition; Vitest doesn't set that condition, so the real package would
// throw unconditionally here. This file is aliased in vitest.config.ts
// so tests can import server-only modules without changing any production
// behavior — the actual app still gets the real enforcement from Next.
export {};
