import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { FinanceEntryInsert } from '@/lib/supabase/types';

export async function GET(request: Request) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  let query = supabase
    .from('finance')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false });

  if (type) query = query.eq('type', type as FinanceEntryInsert['type']);
  if (from) query = query.gte('date', from);
  if (to) query = query.lte('date', to);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body: Omit<FinanceEntryInsert, 'user_id'> = await request.json();
  const { data, error } = await supabase
    .from('finance')
    .insert({ ...body, user_id: user.id })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
