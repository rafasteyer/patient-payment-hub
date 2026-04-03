import { useState } from 'react';
import { Plus, CheckCircle2, Circle, X } from 'lucide-react';
import { CsvTools } from '../components/CsvTools';
import { storage } from '../services/storage';

interface Task {
 id: string;
 date: string;
 description: string;
 status: 'pending' | 'completed';
}

const TASKS_KEY = 'tasks';

export function Tasks() {
 const [tasks, setTasks] = useState<Task[]>(() => storage.get(TASKS_KEY) || []);
 const [filter, setFilter] = useState<'pending' | 'completed'>('pending');
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [newTaskDesc, setNewTaskDesc] = useState('');

 const toggleStatus = (id: string) => {
 const newTasks = tasks.map(t => {
 if (t.id === id) {
 return { ...t, status: t.status === 'pending' ? 'completed' : 'pending' } as Task;
 }
 return t;
 });
 setTasks(newTasks);
 storage.set(TASKS_KEY, newTasks);
 };

 const handleSave = (e: React.FormEvent) => {
 e.preventDefault();
 if (!newTaskDesc.trim()) return;
 const newTask: Task = {
 id: crypto.randomUUID(),
 date: new Date().toISOString(),
 description: newTaskDesc,
 status: 'pending'
 };
 const newTasks = [newTask, ...tasks];
 setTasks(newTasks);
 storage.set(TASKS_KEY, newTasks);
 setIsModalOpen(false);
 setNewTaskDesc('');
 };

 const handleImport = (parsedData: /* eslint-disable-next-line @typescript-eslint/no-explicit-any */ any[]) => {
 const parseDateInput = (val: string) => {
 if (!val) return '';
 if (val.includes('/')) {
 const parts = val.split(' ')[0].split('/');
 if (parts.length === 3) {
 return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
 }
 }
 return val;
 };

 const validData = parsedData.map(row => ({
 id: crypto.randomUUID(),
 date: parseDateInput(row.date || row.Data || row.DATA || '') || new Date().toISOString(),
 description: row.description || row['Descrição'] || row.DESCRICAO || '',
 status: (row.status === 'completed' || (typeof row.Status === 'string' && row.Status.toUpperCase() === 'CONCLUIDO')) ? 'completed' : 'pending'
 } as Task)).filter(t => t.description);
 
 const newTasks = [...validData, ...tasks];
 setTasks(newTasks);
 storage.set(TASKS_KEY, newTasks);
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
 <CsvTools dataToExport={formattedExportData} exportFilename="pendencias.csv"onImport={handleImport} />
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
            className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-all ${filter === 'pending' ? 'bg-industrial-surface shadow-sm text-industrial-accent' : 'text-industrial-text-muted hover:text-industrial-text '}`}
            onClick={() => setFilter('pending')}
        >
            Pendentes
        </button>
        <button
            className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-all ${filter === 'completed' ? 'bg-industrial-surface shadow-sm text-green-600 dark:text-green-400' : 'text-industrial-text-muted hover:text-industrial-text '}`}
            onClick={() => setFilter('completed')}
        >
            Concluídos
        </button>
    </div>

 <div className="bg-industrial-surface rounded-xl shadow-sm border border-industrial-border overflow-hidden w-full">
 <table className="w-full text-left text-sm">
 <thead>
 <tr className="bg-industrial-bg text-industrial-text-muted font-medium border-b border-industrial-border text-[13px]">
 <th className="px-4 py-3 w-[10%] text-center">Status</th>
 <th className="px-4 py-3 w-[20%]">Data</th>
 <th className="px-4 py-3 w-[70%]">Descrição</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-industrial-border text-[13px]">
 {activeTasks.map((task) => (
 <tr key={task.id} className="even:bg-[#365D08]/[0.08] dark:even:bg-[#365D08]/20 odd:bg-industrial-surface hover:bg-[#365D08]/15 dark:hover:bg-[#365D08]/30 transition-colors group">
 <td className="px-4 py-3 text-center align-middle">
 <button onClick={() => toggleStatus(task.id)} className="text-industrial-text-muted hover:text-industrial-accent transition-colors">
 {task.status === 'completed' ? <CheckCircle2 className="text-green-500"/> : <Circle className="text-gray-300"/>}
 </button>
 </td>
 <td className="px-4 py-3 text-industrial-text-muted align-middle whitespace-nowrap">
 {new Date(task.date).toLocaleDateString('pt-BR')}
 </td>
 <td className={`px-4 py-3 align-middle break-words ${task.status === 'completed' ? 'line-through text-industrial-text-muted ' : 'font-medium text-industrial-text '}`}>
 {task.description}
 </td>
 </tr>
 ))}

 {activeTasks.length === 0 && (
 <tr>
 <td colSpan={3} className="px-4 py-12 text-center text-industrial-text-muted">
 Nenhuma tarefa {filter === 'pending' ? 'pendente' : 'concluída'}.
 </td>
 </tr>
 )}
 </tbody>
 </table>
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
 <input type="text"value={newTaskDesc} onChange={e => setNewTaskDesc(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-industrial-border focus:ring-2 focus:ring-industrial-accent outline-none"required placeholder="Ex: Ligar para paciente..."/>
 </div>
 <div className="pt-4 flex justify-end gap-3">
 <button type="button"onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-industrial-text hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
 <button type="submit"className="px-6 py-2 bg-industrial-accent text-white rounded-lg hover:bg-[#243F05] transition-colors font-medium">Salvar</button>
 </div>
 </form>
 </div>
 </div>
 )}
 </div>
 );
}
