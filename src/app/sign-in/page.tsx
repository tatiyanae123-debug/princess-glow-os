import { signIn } from '@/auth';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(253,230,138,0.25),_transparent_40%),linear-gradient(135deg,_#fffaf7_0%,_#fdf2f8_100%)] flex items-center justify-center p-4 dark:bg-[radial-gradient(circle_at_top_left,_rgba(244,114,182,0.18),_transparent_40%),linear-gradient(135deg,_#020617_0%,_#111827_100%)]">
      <div className="w-full max-w-sm rounded-[30px] border border-slate-200/70 bg-white/80 p-8 shadow-[0_25px_80px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-400/20 text-rose-400">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3c-4.2 0-8 3.22-8 8.207 0 4.994 6 11.793 8 11.793s8-6.799 8-11.793C20 6.22 16.2 3 12 3z" />
            </svg>
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-rose-500">Princess Glow</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">Life OS</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Sign in to your personal dashboard</p>
        </div>

        <div className="space-y-3">
          <form
            action={async () => {
              'use server';
              await signIn('github', { redirectTo: '/dashboard' });
            }}
          >
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 dark:border-slate-700"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              Continue with GitHub
            </button>
          </form>

          <form
            action={async () => {
              'use server';
              await signIn('google', { redirectTo: '/dashboard' });
            }}
          >
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500">
          Your personal data stays private and scoped to your account.
        </p>
      </div>
    </div>
  );
}
