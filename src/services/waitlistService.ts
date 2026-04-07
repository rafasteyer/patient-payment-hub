import { supabase } from '../lib/supabase';

export interface WaitlistItem {
  id: string;
  registrationDate: string;
  phoneEnd: string;
  age: number;
  availableTimes: string;
  plan: string;
  serviceStarted: boolean;
  notes?: string;
}

export const waitlistService = {
  getAll: async (): Promise<WaitlistItem[]> => {
    const { data, error } = await supabase
      .from('waitlist')
      .select('*')
      .order('registration_date', { ascending: true });

    if (error) throw error;
    return (data ?? []).map(row => ({
      id: row.id,
      registrationDate: row.registration_date,
      phoneEnd: row.phone_final,
      age: row.age ?? 0,
      availableTimes: row.schedules ?? '',
      plan: row.plan_type ?? '',
      serviceStarted: row.started_treatment ?? false,
      notes: row.notes ?? '',
    }));
  },

  add: async (item: Omit<WaitlistItem, 'id'>): Promise<WaitlistItem> => {
    const { data, error } = await supabase
      .from('waitlist')
      .insert({
        registration_date: item.registrationDate,
        phone_final: item.phoneEnd,
        age: item.age || null,
        schedules: item.availableTimes || null,
        plan_type: item.plan || null,
        started_treatment: item.serviceStarted,
        notes: item.notes || null,
      })
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      registrationDate: data.registration_date,
      phoneEnd: data.phone_final,
      age: data.age ?? 0,
      availableTimes: data.schedules ?? '',
      plan: data.plan_type ?? '',
      serviceStarted: data.started_treatment ?? false,
      notes: data.notes ?? '',
    };
  },

  update: async (id: string, item: Partial<WaitlistItem>): Promise<void> => {
    const row: Record<string, unknown> = {};
    if (item.phoneEnd !== undefined) row.phone_final = item.phoneEnd;
    if (item.plan !== undefined) row.plan_type = item.plan;
    if (item.serviceStarted !== undefined) row.started_treatment = item.serviceStarted;
    if (item.age !== undefined) row.age = item.age;
    if (item.availableTimes !== undefined) row.schedules = item.availableTimes;
    if (item.notes !== undefined) row.notes = item.notes;
    if (item.registrationDate !== undefined) row.registration_date = item.registrationDate;

    const { error } = await supabase
      .from('waitlist')
      .update(row)
      .eq('id', id);

    if (error) throw error;
  },

  toggleServiceStarted: async (id: string, started: boolean): Promise<void> => {
    const { error } = await supabase
      .from('waitlist')
      .update({ started_treatment: started })
      .eq('id', id);

    if (error) throw error;
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('waitlist')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
