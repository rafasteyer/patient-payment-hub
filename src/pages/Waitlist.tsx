import { useState } from 'react';
import { Plus, X, Edit, Trash2 } from 'lucide-react';
import { CsvTools } from '../components/CsvTools';
import { storage } from '../services/storage';
import clsx from 'clsx';

interface WaitlistItem {
 id: string;
 registrationDate: string;
 phoneEnd: string;
 age: number;
 availableTimes: string;
 plan: string;
 serviceStarted: boolean;
}

const WAITLIST_KEY = 'waitlist';

export function Waitlist() {
 const [list, setList] = useState<WaitlistItem[]>(() => storage.get(WAITLIST_KEY) || []);
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [formData, setFormData] = useState<Partial<WaitlistItem>>({});
 const [editingId, setEditingId] = useState<string | null>(null);
 const [activeTab, setActiveTab] = useState<'aguardando' | 'iniciados'>('aguardando');

 const handleDelete = (id: string) => {
 if (confirm('Tem certeza que deseja excluir esta entrada?')) {
 const newList = list.filter(item => item.id !== id);
 setList(newList);
 storage.set(WAITLIST_KEY, newList);
 }
 };

 const toggleServiceStarted = (id: string) => {
 const newList = list.map(item => {
 if (item.id === id) {
 return { ...item, serviceStarted: !item.serviceStarted };
 }
 return item;
 });
 setList(newList);
 storage.set(WAITLIST_KEY, newList);
 };

 const handleSave = (e: React.FormEvent) => {
 e.preventDefault();
 let newList;
 if (editingId) {
 newList = list.map(item => {
 if (item.id === editingId) {
 return {
 ...item,
 phoneEnd: formData.phoneEnd || '',
 age: Number(formData.age) || 0,
 availableTimes: formData.availableTimes || '',
 plan: formData.plan || ''
 };
 }
 return item;
 });
 } else {
 const newItem: WaitlistItem = {
 id: crypto.randomUUID(),
 registrationDate: new Date().toISOString(),
 phoneEnd: formData.phoneEnd || '',
 age: Number(formData.age) || 0,
 availableTimes: formData.availableTimes || '',
 plan: formData.plan || '',
 serviceStarted: false
 };
 newList = [...list, newItem];
 }
 setList(newList);
 storage.set(WAITLIST_KEY, newList);
 setIsModalOpen(false);
 setFormData({});
 setEditingId(null);
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
 registrationDate: parseDateInput(row.registrationDate || row['Data Cadastro'] || '') || new Date().toISOString(),
 phoneEnd: row.phoneEnd || row['Final Telefone'] || '',
 age: Number(row.age || row['Idade']) || 0,
 availableTimes: row.availableTimes || row['Horários'] || row['Horarios'] || '',
 plan: row.plan || row.PLANO || row.Plano || '',
 serviceStarted: row.serviceStarted === 'true' || row.serviceStarted === true || (typeof row['Já comecou os atendimentos'] === 'string' && row['Já comecou os atendimentos'].toLowerCase() === 'sim')
 }));
 const newList = [...list, ...validData];
 setList(newList);
 storage.set(WAITLIST_KEY, newList);
 };

 const formattedExportData = list.map(item => ({
 'Data Cadastro': new Date(item.registrationDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' }),
 'Final Telefone': item.phoneEnd || '',
 'Idade': item.age ? String(item.age) : '',
 'Horários': item.availableTimes || '',
 'PLANO': item.plan || '',
 'Já comecou os atendimentos': item.serviceStarted ? 'SIM' : 'NAO'
 }));

 return (
 <div className="space-y-6">
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
 <div>
 <h2 className="text-2xl font-bold text-industrial-text">Lista de Espera</h2>
 <p className="text-industrial-text text-sm mt-1">Gestão de triagem de pacientes urgentes</p>
 </div>
 <div className="flex gap-2">
 <CsvTools dataToExport={formattedExportData} exportFilename="lista-de-espera.csv"onImport={handleImport} />
 <button
 onClick={() => { setEditingId(null); setFormData({}); setIsModalOpen(true); }}
 className="flex items-center gap-2 bg-industrial-accent text-white px-5 py-2.5 rounded-lg hover:bg-[#243F05] transition-all shadow-lg active:scale-95 text-sm font-medium"
 >
 <Plus size={18} />
 Nova Entrada
 </button>
 </div>
 </div>

 <div className="flex border-b border-industrial-border">
 <button
 className={clsx("px-4 py-2 font-medium text-sm transition-colors border-b-2", activeTab === 'aguardando' ? 'border-industrial-accent text-industrial-accent' : 'border-transparent text-industrial-text-muted hover:text-gray-700 ')}
 onClick={() => setActiveTab('aguardando')}
 >
 Aguardando Atendimento
 </button>
 <button
 className={clsx("px-4 py-2 font-medium text-sm transition-colors border-b-2", activeTab === 'iniciados' ? 'border-industrial-accent text-industrial-accent' : 'border-transparent text-industrial-text-muted hover:text-gray-700 ')}
 onClick={() => setActiveTab('iniciados')}
 >
 Atendimentos Iniciados
 </button>
 </div>

 <div className="bg-industrial-surface rounded-xl shadow-sm border border-industrial-border overflow-hidden">
 <div className="w-full overflow-hidden">
 <table className="w-full text-left text-sm">
 <thead>
 <tr className="bg-industrial-bg text-industrial-text-muted font-medium text-[13px]">
 <th className="px-4 py-3">Data Cadastro</th>
 <th className="px-4 py-3">Final Tel.</th>
 <th className="px-4 py-3">Idade</th>
 <th className="px-4 py-3">Horários</th>
 <th className="px-4 py-3">Plano</th>
 <th className="px-4 py-3 text-center">Status</th>
 <th className="px-4 py-3 text-center">Ações</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-industrial-border text-[13px]">
 {list.filter(item => activeTab === 'iniciados' ? item.serviceStarted : !item.serviceStarted).map((item) => (
 <tr key={item.id} className="even:bg-[#365D08]/[0.08] dark:even:bg-[#365D08]/20 odd:bg-industrial-surface hover:bg-[#365D08]/15 dark:hover:bg-[#365D08]/30 transition-colors group">
 <td className="px-4 py-3 text-industrial-text-muted whitespace-nowrap">
 {new Date(item.registrationDate).toLocaleDateString('pt-BR')}
 </td>
 <td className="px-4 py-3 font-mono font-medium text-industrial-text">
 ...{item.phoneEnd}
 </td>
 <td className="px-4 py-3 text-industrial-text-muted">
 {item.age} anos
 </td>
 <td className="px-4 py-3 text-industrial-text-muted break-words">
 {item.availableTimes}
 </td>
 <td className="px-4 py-3 text-industrial-text-muted break-words uppercase">
 {item.plan || '---'}
 </td>
 <td className="px-4 py-3 text-center">
 <button 
 onClick={() => toggleServiceStarted(item.id)}
 className={clsx(
"px-2 py-1 text-[11px] font-semibold rounded-md border transition-all",
 item.serviceStarted 
 ?"bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
 :"bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
 )}
 >
 {item.serviceStarted ? 'Iniciado' : 'Espera'}
 </button>
 </td>
 <td className="px-4 py-3 text-center">
 <div className="flex items-center justify-center gap-3">
 <button onClick={() => { setEditingId(item.id); setFormData(item); setIsModalOpen(true); }} className="text-industrial-text-muted hover:text-industrial-accent transition-colors"title="Editar">
 <Edit size={16} />
 </button>
 <button onClick={() => handleDelete(item.id)} className="text-industrial-text-muted hover:text-red-600 transition-colors"title="Excluir">
 <Trash2 size={16} />
 </button>
 </div>
 </td>
 </tr>
 ))}

 {list.filter(item => activeTab === 'iniciados' ? item.serviceStarted : !item.serviceStarted).length === 0 && (
 <tr>
 <td colSpan={7} className="px-6 py-12 text-center text-industrial-text-muted">
 Nenhuma entrada encontrada para este filtro.
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </div>

 {/* Modal de Adição */}
 {isModalOpen && (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
 <div className="bg-industrial-surface rounded-xl shadow-xl w-full max-w-md animate-in zoom-in-95 duration-200">
 <div className="flex items-center justify-between p-6 border-b border-industrial-border">
 <h2 className="text-xl font-bold text-industrial-accent">{editingId ? 'Editar Lista de Espera' : 'Adicionar à Lista de Espera'}</h2>
 <button onClick={() => { setIsModalOpen(false); setEditingId(null); setFormData({}); }} className="text-industrial-text-muted hover:text-gray-600"><X size={24} /></button>
 </div>
 <form onSubmit={handleSave} className="p-6 space-y-4">
 <div>
 <label className="block text-sm font-medium text-industrial-text mb-1">Final Telefone</label>
 <input type="text"value={formData.phoneEnd || ''} onChange={e => setFormData({...formData, phoneEnd: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-industrial-border focus:ring-2 focus:ring-industrial-accent outline-none"required placeholder="Ex: 1234"/>
 </div>
 <div>
 <label className="block text-sm font-medium text-industrial-text mb-1">Idade</label>
 <input type="number"value={formData.age || ''} onChange={e => setFormData({...formData, age: Number(e.target.value)})} className="w-full px-4 py-2 rounded-lg border border-industrial-border focus:ring-2 focus:ring-industrial-accent outline-none"required />
 </div>
 <div>
 <label className="block text-sm font-medium text-industrial-text mb-1">Horários Disponíveis</label>
 <input type="text"value={formData.availableTimes || ''} onChange={e => setFormData({...formData, availableTimes: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-industrial-border focus:ring-2 focus:ring-industrial-accent outline-none"required placeholder="Ex: Manhã/Tarde"/>
 </div>
 <div>
 <label className="block text-sm font-medium text-industrial-text mb-1">Plano (Pode Escrever)</label>
 <input type="text"value={formData.plan || ''} onChange={e => setFormData({...formData, plan: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-industrial-border focus:ring-2 focus:ring-industrial-accent outline-none"placeholder="Ex: Unimed"/>
 </div>
 <div className="pt-4 flex justify-end gap-3">
 <button type="button"onClick={() => { setIsModalOpen(false); setEditingId(null); setFormData({}); }} className="px-4 py-2 text-industrial-text hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
 <button type="submit"className="px-6 py-2 bg-industrial-accent text-white rounded-lg hover:bg-[#243F05] transition-colors font-medium">Salvar</button>
 </div>
 </form>
 </div>
 </div>
 )}
 </div>
 );
}
