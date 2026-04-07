import { supabase } from '../lib/supabase';
import type { Patient } from '../types';

function rowToPatient(row: Record<string, unknown>): Patient {
  return {
    id: row.id as string,
    name: row.name as string | null,
    cardNumber: row.card_number as string | null,
    birthDate: row.birth_date as string | null,
    motherName: row.mother_name as string | null,
    holder: row.plan_responsible as string | null,
    healthPlan: row.plan_type as string | null,
    guideExpiration: row.guide_expiry as string | null,
    status: (row.category as string) === 'inactive' ? 'inactive' : 'active',
    createdAt: row.created_at as string,
  };
}

function patientToRow(p: Omit<Patient, 'id' | 'createdAt'>) {
  return {
    name: p.name || 'Sem nome',
    card_number: p.cardNumber ? String(p.cardNumber) : null,
    birth_date: p.birthDate || null,
    mother_name: p.motherName || null,
    plan_responsible: p.holder || null,
    plan_type: p.healthPlan || null,
    guide_date: null as string | null,
    category: p.status === 'inactive' ? 'inactive' : 'active',
  };
}

export const patientService = {
  getAll: async (): Promise<Patient[]> => {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return (data ?? []).map(rowToPatient);
  },

  add: async (patient: Omit<Patient, 'id' | 'createdAt'>): Promise<Patient> => {
    const { data, error } = await supabase
      .from('patients')
      .insert(patientToRow(patient))
      .select()
      .single();

    if (error) throw error;
    return rowToPatient(data);
  },

  update: async (id: string, updates: Partial<Patient>): Promise<Patient> => {
    const row: Record<string, unknown> = {};
    if (updates.name !== undefined) row.name = updates.name || 'Sem nome';
    if (updates.cardNumber !== undefined) row.card_number = updates.cardNumber ? String(updates.cardNumber) : null;
    if (updates.birthDate !== undefined) row.birth_date = updates.birthDate;
    if (updates.motherName !== undefined) row.mother_name = updates.motherName;
    if (updates.holder !== undefined) row.plan_responsible = updates.holder;
    if (updates.healthPlan !== undefined) row.plan_type = updates.healthPlan;
    if (updates.guideExpiration !== undefined) row.guide_expiry = updates.guideExpiration;
    if (updates.status !== undefined) row.category = updates.status === 'inactive' ? 'inactive' : 'active';

    const { data, error } = await supabase
      .from('patients')
      .update(row)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return rowToPatient(data);
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  addMany: async (patients: Omit<Patient, 'id' | 'createdAt'>[]): Promise<number> => {
    const rows = patients.map(p => patientToRow(p));
    const { error, count } = await supabase
      .from('patients')
      .insert(rows)
      .select('id');

    if (error) throw error;
    return count ?? patients.length;
  }
};
