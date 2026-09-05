import { signIn } from '@/auth';

const GOOGLE_SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/contacts.readonly',
].join(' ');

type SignInPageProps = {
  searchParams: Promise<{ connect?: string }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const connectingContacts = params.connect === 'contacts';

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.92),_transparent_36%),radial-gradient(circle_at_bottom_right,_rgba(218,210,255,0.28),_transparent_34%),linear-gradient(135deg,_#fbf7f1_0%,_#fffdf9_48%,_#f6f1f7_100%)] flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-[32px] border border-white/90 bg-white/55 p-8 shadow-[0_28px_90px_rgba(82,70,62,0.12),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-2xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 h-16 w-16 rounded-full border border-white/90 bg-[radial-gradient(circle_at_34%_28%,_#fff_0%,_#fff_21%,_#eee7ff_43%,_#f8e7dc_68%,_rgba(255,255,255,0.58)_100%)] shadow-[0_15px_35px_rgba(130,116,151,0.2),inset_0_2px_5px_rgba(255,255,255,0.9)]" />
          <p className="text-[11px] font-medium tracking-[0.18em] text-neutral-500">GLOW OS</p>
          <h1 className="mt-3 text-3xl font-medium tracking-[-0.04em] text-neutral-900">
            {connectingContacts ? 'Connect Contacts' : 'Welcome back'}
          </h1>
          <p className="mt-3 text-sm leading-6 text-neutral-500">
            {connectingContacts
              ? 'Allow read-only Contacts access once. Glow will return you directly to People when it is finished.'
              : 'Continue with Google to enter your Glow OS.'}
          </p>
        </div>

        {connectingContacts ? (
          <form
            action={async () => {
              'use server';
              await signIn(
                'google',
                { redirectTo: '/today?room=people' },
                {
                  prompt: 'consent',
                  access_type: 'offline',
                  include_granted_scopes: 'true',
                  scope: GOOGLE_SCOPES,
                },
              );
            }}
          >
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-3 rounded-[22px] border border-white/90 bg-white/80 px-5 py-4 text-sm font-medium text-neutral-800 shadow-[0_12px_30px_rgba(74,63,58,0.08),inset_0_1px_0_rgba(255,255,255,1)] transition hover:bg-white"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Allow Contacts and return to People
            </button>
          </form>
        ) : (
          <form
            action={async () => {
              'use server';
              await signIn('google', { redirectTo: '/home' });
            }}
          >
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-3 rounded-[22px] border border-white/90 bg-white/80 px-5 py-4 text-sm font-medium text-neutral-800 shadow-[0_12px_30px_rgba(74,63,58,0.08),inset_0_1px_0_rgba(255,255,255,1)] transition hover:bg-white"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-xs leading-5 text-neutral-400">
          {connectingContacts
            ? 'Glow requests read-only contact details. It does not request access to your iMessage history.'
            : 'Your personal data stays private and scoped to your account.'}
        </p>
      </div>
    </div>
  );
}
