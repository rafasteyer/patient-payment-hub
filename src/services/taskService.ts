import { supabase } from '../lib/supabase';

export interface TaskItem {
  id: string;
  date: string;
  description: string;
  status: 'pending' | 'completed';
}

async function getCurrentUserId(): Promise<string> {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error('Usuário não autenticado');
  return user.id;
}

export const taskService = {
  getAll: async (): Promise<TaskItem[]> => {
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []).map(row => ({
      id: row.id as string,
      date: row.created_at as string,
      description: row.title as string,
      status: row.completed ? 'completed' : 'pending',
    }));
  },

  add: async (description: string): Promise<TaskItem> => {
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from('tasks')
      .insert({ user_id: userId, title: description, completed: false })
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      date: data.created_at,
      description: data.title,
      status: 'pending',
    };
  },

  toggle: async (id: string, completed: boolean): Promise<void> => {
    const userId = await getCurrentUserId();
    const { error } = await supabase
      .from('tasks')
      .update({ completed })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  },

  delete: async (id: string): Promise<void> => {
    const userId = await getCurrentUserId();
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  },

  addMany: async (items: Omit<TaskItem, 'id'>[]): Promise<number> => {
    const userId = await getCurrentUserId();
    const rows = items.map(t => ({
      user_id: userId,
      title: t.description,
      completed: t.status === 'completed',
    }));
    const { error, count } = await supabase.from('tasks').insert(rows).select('id');
    if (error) throw error;
    return count ?? items.length;
  }
};
