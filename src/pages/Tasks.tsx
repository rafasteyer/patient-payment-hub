import { useState, useEffect } from 'react';
import { Plus, CheckCircle2, Circle, X, Trash2 } from 'lucide-react';
import { CsvTools } from '../components/CsvTools';
import { taskService, type TaskItem } from '../services/taskService';

export function Tasks() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [filter, setFilter] = useState<'pending' | 'completed'>('pending');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      const data = await taskService.getAll();
      setTasks(data);
    } catch (err) {
      console.error('Erro ao carregar tarefas:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const toggleStatus = async (id: string, currentStatus: 'pending' | 'completed') => {
    const newCompleted = currentStatus === 'pending';
    try {
      await taskService.toggle(id, newCompleted);
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newCompleted ? 'completed' : 'pending' } : t));
    } catch (err) {
      console.error('Erro ao atualizar tarefa:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await taskService.delete(id);
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error('Erro ao excluir tarefa:', err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskDesc.trim()) return;
    try {
      const newTask = await taskService.add(newTaskDesc.trim());
      setTasks(prev => [newTask, ...prev]);
      setIsModalOpen(false);
      setNewTaskDesc('');
    } catch (err) {
      console.error('Erro ao criar tarefa:', err);
      alert('Erro ao criar tarefa. Tente novamente.');
    }
  };

  const handleImport = async (parsedData: unknown[]) => {
    const rows = parsedData as Record<string, string>[];
    const parseDateInput = (val: string) => {
      if (!val) return new Date().toISOString();
      if (val.includes('/')) {
        const parts = val.split(' ')[0].split('/');
        if (parts.length === 3) {
          return new Date(`${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`).toISOString();
        }
      }
      return val || new Date().toISOString();
    };

    const items: Omit<TaskItem, 'id'>[] = rows
      .map(row => ({
        date: parseDateInput(row.date || row.Data || row.DATA || ''),
        description: row.description || row['Descrição'] || row.DESCRICAO || '',
        status: (row.status === 'completed' || (typeof row.Status === 'string' && row.Status.toUpperCase() === 'CONCLUIDO'))
          ? 'completed' as const
          : 'pending' as const,
      }))
      .filter(t => t.description);

    if (items.length === 0) { alert('Nenhuma tarefa válida encontrada no arquivo.'); return; }

    try {
      const count = await taskService.addMany(items);
      await loadTasks();
      alert(`${count} tarefas importadas com sucesso!`);
    } catch (err) {
      console.error('Erro ao importar tarefas:', err);
      alert('Erro ao importar. Tente novamente.');
    }
  };

  const formattedExportData = tasks.map(t => ({
    'Data': new Date(t.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }),
    'Descrição': t.description,
    'Status': t.status === 'completed' ? 'CONCLUIDO' : 'PENDENTE'
  }));

  const activeTasks = tasks.filter(t => t.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-industrial-text">Pendências</h2>
          <p className="text-industrial-text text-sm mt-1">Gerenciamento de tarefas diárias</p>
        </div>
        <div className="flex gap-2">
          <CsvTools dataToExport={formattedExportData} exportFilename="pendencias.csv" onImport={handleImport} />
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-industrial-accent text-white px-5 py-2.5 rounded-lg hover:bg-[#243F05] transition-all shadow-lg active:scale-95 text-sm font-medium"
          >
            <Plus size={18} />
            Nova Tarefa
          </button>
        </div>
      </div>

      <div className="flex bg-industrial-bg border border-industrial-border p-1 rounded-lg w-full max-w-xs">
        <button
          className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-all ${filter === 'pending' ? 'bg-industrial-surface shadow-sm text-industrial-accent' : 'text-industrial-text-muted hover:text-industrial-text'}`}
          onClick={() => setFilter('pending')}
        >
          Pendentes
        </button>
        <button
          className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-all ${filter === 'completed' ? 'bg-industrial-surface shadow-sm text-green-600 dark:text-green-400' : 'text-industrial-text-muted hover:text-industrial-text'}`}
          onClick={() => setFilter('completed')}
        >
          Concluídos
        </button>
      </div>

      <div className="bg-industrial-surface rounded-xl shadow-sm border border-industrial-border overflow-hidden w-full">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-industrial-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-industrial-bg text-industrial-text-muted font-medium border-b border-industrial-border text-[14px]">
                <th className="px-4 py-3 w-[10%] text-center">Status</th>
                <th className="px-4 py-3 w-[20%]">Data</th>
                <th className="px-4 py-3 w-[65%]">Descrição</th>
                <th className="px-4 py-3 w-[5%] text-center">Del.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-industrial-border text-[14px]">
              {activeTasks.map((task) => (
                <tr key={task.id} className="even:bg-industrial-accent/[0.04] dark:even:bg-industrial-accent/15 odd:bg-industrial-surface hover:bg-industrial-accent/10 dark:hover:bg-industrial-accent/20 transition-colors group">
                  <td className="px-4 py-3 text-center align-middle">
                    <button onClick={() => toggleStatus(task.id, task.status)} className="text-industrial-text-muted hover:text-industrial-accent transition-colors">
                      {task.status === 'completed' ? <CheckCircle2 className="text-green-500" /> : <Circle className="text-gray-300" />}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-industrial-text-muted align-middle whitespace-nowrap">
                    {new Date(task.date).toLocaleDateString('pt-BR')}
                  </td>
                  <td className={`px-4 py-3 align-middle break-words ${task.status === 'completed' ? 'line-through text-industrial-text-muted' : 'font-medium text-industrial-text'}`}>
                    {task.description}
                  </td>
                  <td className="px-4 py-3 text-center align-middle">
                    <button onClick={() => handleDelete(task.id)} className="text-industrial-text-muted hover:text-red-600 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}

              {activeTasks.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-industrial-text-muted">
                    Nenhuma tarefa {filter === 'pending' ? 'pendente' : 'concluída'}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal de Nova Tarefa */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-industrial-surface rounded-xl shadow-xl w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-industrial-border">
              <h2 className="text-xl font-bold text-industrial-accent">Nova Tarefa</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-industrial-text-muted hover:text-gray-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-industrial-text mb-1">Descrição</label>
                <input
                  type="text"
                  value={newTaskDesc}
                  onChange={e => setNewTaskDesc(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-industrial-border focus:ring-2 focus:ring-industrial-accent outline-none"
                  required
                  autoFocus
                  placeholder="Ex: Ligar para paciente..."
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-industrial-text hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-industrial-accent text-white rounded-lg hover:bg-[#243F05] transition-colors font-medium">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
