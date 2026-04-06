import { supabase } from '../lib/supabase';
import type { Patient } from '../types';

// Helper: maps DB snake_case row → Patient camelCase
function rowToPatient(row: Record<string, unknown>): Patient {
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    name: row.name as string | null,
    cardNumber: row.card_number as string | null,
    cpf: row.cpf as string | null,
    birthDate: row.birth_date as string | null,
    motherName: row.mother_name as string | null,
    holder: row.holder as string | null,
    healthPlan: row.health_plan as string | null,
    guideExpiration: row.guide_expiration as string | null,
    amount: row.amount as string | null,
    status: (row.status as 'active' | 'inactive') ?? 'active',
    lastSessionDate: row.last_session_date as string | null,
    createdAt: row.created_at as string,
  };
}

// Helper: maps Patient camelCase → DB snake_case (for insert/update)
function patientToRow(p: Omit<Patient, 'id' | 'createdAt'>, userId: string) {
  return {
    user_id: userId,
    name: p.name ?? null,
    // Preserve leading zeros — always stored as text
    card_number: p.cardNumber ? String(p.cardNumber) : null,
    cpf: p.cpf ?? null,
    birth_date: p.birthDate ?? null,
    mother_name: p.motherName ?? null,
    holder: p.holder ?? null,
    health_plan: p.healthPlan ?? null,
    guide_expiration: p.guideExpiration ?? null,
    amount: p.amount ?? null,
    status: p.status ?? 'active',
    last_session_date: p.lastSessionDate ?? null,
  };
}

async function getCurrentUserId(): Promise<string> {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error('Usuário não autenticado');
  return user.id;
}

export const patientService = {
  getAll: async (): Promise<Patient[]> => {
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true });

    if (error) throw error;
    return (data ?? []).map(rowToPatient);
  },

  add: async (patient: Omit<Patient, 'id' | 'createdAt'>): Promise<Patient> => {
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from('patients')
      .insert(patientToRow(patient, userId))
      .select()
      .single();

    if (error) throw error;
    return rowToPatient(data);
  },

  update: async (id: string, updates: Partial<Patient>): Promise<Patient> => {
    const userId = await getCurrentUserId();
    const row: Record<string, unknown> = {};
    if (updates.name !== undefined) row.name = updates.name;
    if (updates.cardNumber !== undefined) row.card_number = updates.cardNumber ? String(updates.cardNumber) : null;
    if (updates.cpf !== undefined) row.cpf = updates.cpf;
    if (updates.birthDate !== undefined) row.birth_date = updates.birthDate;
    if (updates.motherName !== undefined) row.mother_name = updates.motherName;
    if (updates.holder !== undefined) row.holder = updates.holder;
    if (updates.healthPlan !== undefined) row.health_plan = updates.healthPlan;
    if (updates.guideExpiration !== undefined) row.guide_expiration = updates.guideExpiration;
    if (updates.amount !== undefined) row.amount = updates.amount;
    if (updates.status !== undefined) row.status = updates.status;
    if (updates.lastSessionDate !== undefined) row.last_session_date = updates.lastSessionDate;

    const { data, error } = await supabase
      .from('patients')
      .update(row)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return rowToPatient(data);
  },

  delete: async (id: string): Promise<void> => {
    const userId = await getCurrentUserId();
    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  },

  // Bulk insert for CSV import
  addMany: async (patients: Omit<Patient, 'id' | 'createdAt'>[]): Promise<number> => {
    const userId = await getCurrentUserId();
    const rows = patients.map(p => patientToRow(p, userId));
    const { error, count } = await supabase
      .from('patients')
      .insert(rows)
      .select('id');

    if (error) throw error;
    return count ?? patients.length;
  }
};
