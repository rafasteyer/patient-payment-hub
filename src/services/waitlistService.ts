import { supabase } from '../lib/supabase';

export interface WaitlistItem {
  id: string;
  registrationDate: string;
  phoneEnd: string;
  age: number;
  availableTimes: string;
  plan: string;
  serviceStarted: boolean;
}

async function getCurrentUserId(): Promise<string> {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error('Usuário não autenticado');
  return user.id;
}

function rowToItem(row: Record<string, unknown>): WaitlistItem {
  return {
    id: row.id as string,
    registrationDate: row.created_at as string,
    phoneEnd: row.phone as string ?? '',
    age: Number(row.notes?.toString()?.match(/^AGE:(\d+)/)?.[1] ?? 0),
    availableTimes: (() => {
      const notes = String(row.notes ?? '');
      const m = notes.match(/TIMES:(.+)/);
      return m ? m[1] : '';
    })(),
    plan: row.health_plan as string ?? '',
    serviceStarted: row.status === 'scheduled',
  };
}

export const waitlistService = {
  getAll: async (): Promise<WaitlistItem[]> => {
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from('waitlist')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data ?? []).map(rowToItem);
  },

  add: async (item: Omit<WaitlistItem, 'id' | 'registrationDate'>): Promise<WaitlistItem> => {
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from('waitlist')
      .insert({
        user_id: userId,
        name: `Paciente - Final ${item.phoneEnd}`,
        phone: item.phoneEnd,
        health_plan: item.plan,
        notes: `AGE:${item.age}|TIMES:${item.availableTimes}`,
        status: item.serviceStarted ? 'scheduled' : 'waiting',
      })
      .select()
      .single();

    if (error) throw error;
    return rowToItem(data);
  },

  update: async (id: string, item: Partial<WaitlistItem>): Promise<void> => {
    const userId = await getCurrentUserId();
    const row: Record<string, unknown> = {};
    if (item.phoneEnd !== undefined) { row.phone = item.phoneEnd; row.name = `Paciente - Final ${item.phoneEnd}`; }
    if (item.plan !== undefined) row.health_plan = item.plan;
    if (item.serviceStarted !== undefined) row.status = item.serviceStarted ? 'scheduled' : 'waiting';
    if (item.age !== undefined || item.availableTimes !== undefined) {
      // Need current to build notes
    }
    if (item.age !== undefined && item.availableTimes !== undefined) {
      row.notes = `AGE:${item.age}|TIMES:${item.availableTimes}`;
    }

    const { error } = await supabase
      .from('waitlist')
      .update(row)
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  },

  toggleServiceStarted: async (id: string, started: boolean): Promise<void> => {
    const userId = await getCurrentUserId();
    const { error } = await supabase
      .from('waitlist')
      .update({ status: started ? 'scheduled' : 'waiting' })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  },

  delete: async (id: string): Promise<void> => {
    const userId = await getCurrentUserId();
    const { error } = await supabase
      .from('waitlist')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  },
};
