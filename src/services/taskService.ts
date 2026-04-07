import { supabase } from '../lib/supabase';

export interface TaskItem {
  id: string;
  date: string;
  description: string;
  status: 'pending' | 'completed';
}

export const taskService = {
  getAll: async (): Promise<TaskItem[]> => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []).map(row => ({
      id: row.id,
      date: row.created_at,
      description: row.title,
      status: row.completed ? 'completed' as const : 'pending' as const,
    }));
  },

  add: async (description: string): Promise<TaskItem> => {
    const { data, error } = await supabase
      .from('tasks')
      .insert({ title: description, completed: false })
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
    const { error } = await supabase
      .from('tasks')
      .update({ completed })
      .eq('id', id);

    if (error) throw error;
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  addMany: async (items: Omit<TaskItem, 'id'>[]): Promise<number> => {
    const rows = items.map(t => ({
      title: t.description,
      completed: t.status === 'completed',
    }));
    const { error, count } = await supabase.from('tasks').insert(rows).select('id');
    if (error) throw error;
    return count ?? items.length;
  }
};
