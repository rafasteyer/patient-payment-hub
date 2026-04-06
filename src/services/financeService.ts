import { supabase } from '../lib/supabase';
import type { Transaction, Goal } from '../types';

async function getCurrentUserId(): Promise<string> {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error('Usuário não autenticado');
  return user.id;
}

function rowToTransaction(row: Record<string, unknown>): Transaction {
  return {
    id: row.id as string,
    date: row.date as string,
    description: row.description as string,
    category: row.category as 'income' | 'expense',
    amount: Number(row.amount),
    professional: row.professional as string,
    paymentMethod: row.payment_method as string,
    createdAt: row.created_at as string,
  };
}

function rowToGoal(row: Record<string, unknown>): Goal {
  return {
    id: row.id as string,
    month: row.month as string,
    revenueGoal: Number(row.revenue_goal),
    newPatientsGoal: Number(row.new_patients_goal),
  };
}

export const financeService = {
  getTransactions: async (): Promise<Transaction[]> => {
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) throw error;
    return (data ?? []).map(rowToTransaction);
  },

  addTransaction: async (tx: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction> => {
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        date: tx.date,
        description: tx.description,
        category: tx.category,
        amount: tx.amount,
        professional: tx.professional,
        payment_method: tx.paymentMethod,
      })
      .select()
      .single();

    if (error) throw error;
    return rowToTransaction(data);
  },

  deleteTransaction: async (id: string): Promise<void> => {
    const userId = await getCurrentUserId();
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  },

  updateTransaction: async (id: string, updates: Partial<Transaction>): Promise<void> => {
    const userId = await getCurrentUserId();
    const row: Record<string, unknown> = {};
    if (updates.date !== undefined) row.date = updates.date;
    if (updates.description !== undefined) row.description = updates.description;
    if (updates.category !== undefined) row.category = updates.category;
    if (updates.amount !== undefined) row.amount = updates.amount;
    if (updates.professional !== undefined) row.professional = updates.professional;
    if (updates.paymentMethod !== undefined) row.payment_method = updates.paymentMethod;

    const { error } = await supabase
      .from('transactions')
      .update(row)
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  },

  getGoals: async (): Promise<Goal[]> => {
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('month', { ascending: false });

    if (error) throw error;
    return (data ?? []).map(rowToGoal);
  },

  updateGoal: async (goal: Goal): Promise<void> => {
    const userId = await getCurrentUserId();
    const { error } = await supabase
      .from('goals')
      .upsert({
        user_id: userId,
        month: goal.month,
        revenue_goal: goal.revenueGoal,
        new_patients_goal: goal.newPatientsGoal,
      }, { onConflict: 'user_id,month' });

    if (error) throw error;
  },

  getFinancialSummary: async () => {
    const transactions = await financeService.getTransactions();
    const income = transactions
      .filter(t => t.category === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
    const expense = transactions
      .filter(t => t.category === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);

    return {
      revenue: income,
      expenses: expense,
      netProfit: income - expense
    };
  }
};
