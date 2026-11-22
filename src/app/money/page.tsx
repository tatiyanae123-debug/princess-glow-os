import Link from 'next/link';
import { CalendarDays, ChartNoAxesColumn, ChevronRight, ReceiptText } from 'lucide-react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { getFinanceEntriesByUser } from '@/lib/data/finance-entries';

export const dynamic = 'force-dynamic';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export default async function MoneyPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const entries = await getFinanceEntriesByUser(session.user.id);
  const total = (type: string) => entries.filter(entry => entry.type === type).reduce((sum, entry) => sum + Number(entry.amount), 0);
  const income = total('income');
  const spending = total('expense');
  const summaries = [
    { label: 'Income', amount: income },
    { label: 'Spending', amount: spending },
    { label: 'Net recorded', amount: income - spending },
  ];

  return (
    <AppShell>
      <section className="daybook-money" aria-labelledby="money-overview">
        <header>
          <p className="daybook-masthead">THE DAYBOOK</p>
          <p className="daybook-imprint">BY GLOW OS</p>
          <span className="shakti-pearl" aria-hidden="true" />
          <h1 id="money-overview">Money Overview</h1>
        </header>
        <dl aria-label="Totals from saved finance entries">
          {summaries.map(({ label, amount }) => (
            <div key={label}><dt>{label}</dt><dd>{entries.length ? currency.format(amount) : '—'}</dd></div>
          ))}
        </dl>
        {entries.length > 0 && <p className="mt-3 text-sm text-neutral-600">Recorded savings · {currency.format(total('saving'))}</p>}
        {!entries.length && <p className="mt-3 text-sm text-neutral-600">Add an entry in Finance to see your totals.</p>}
        <nav aria-label="Money tools">
          <Link href="/finance"><ReceiptText size={20} aria-hidden="true" />Finance entries<ChevronRight size={18} aria-hidden="true" /></Link>
          <Link href="/finance/brain"><ChartNoAxesColumn size={20} aria-hidden="true" />Review spending<ChevronRight size={18} aria-hidden="true" /></Link>
          <Link href="/calendar"><CalendarDays size={20} aria-hidden="true" />Open calendar<ChevronRight size={18} aria-hidden="true" /></Link>
        </nav>
      </section>
    </AppShell>
  );
}
