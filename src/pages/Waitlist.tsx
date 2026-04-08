import { useState, useEffect } from 'react';
import { Plus, X, Edit, Trash2 } from 'lucide-react';
import { CsvTools } from '../components/CsvTools';
import { waitlistService, type WaitlistItem } from '../services/waitlistService';
import clsx from 'clsx';

export function Waitlist() {
  const [list, setList] = useState<WaitlistItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<WaitlistItem>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'aguardando' | 'iniciados'>('aguardando');
  const [isLoading, setIsLoading] = useState(true);

  const loadList = async () => {
    try {
      setIsLoading(true);
      const data = await waitlistService.getAll();
      setList(data);
    } catch (err) {
      console.error('Erro ao carregar lista de espera:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadList();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta entrada?')) return;
    try {
      await waitlistService.delete(id);
      setList(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('Erro ao excluir:', err);
    }
  };

  const toggleServiceStarted = async (id: string, current: boolean) => {
    try {
      await waitlistService.toggleServiceStarted(id, !current);
      setList(prev => prev.map(item => item.id === id ? { ...item, serviceStarted: !current } : item));
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await waitlistService.update(editingId, {
          phoneEnd: formData.phoneEnd || '',
          age: Number(formData.age) || 0,
          availableTimes: formData.availableTimes || '',
          plan: formData.plan || '',
        });
        await loadList();
      } else {
        const newItem = await waitlistService.add({
          phoneEnd: formData.phoneEnd || '',
          age: Number(formData.age) || 0,
          availableTimes: formData.availableTimes || '',
          plan: formData.plan || '',
          serviceStarted: false,
        });
        setList(prev => [...prev, newItem]);
      }
      setIsModalOpen(false);
      setFormData({});
      setEditingId(null);
    } catch (err) {
      console.error('Erro ao salvar:', err);
      alert('Erro ao salvar. Tente novamente.');
    }
  };

  const handleImport = async (parsedData: unknown[]) => {
    const rows = parsedData as Record<string, string>[];
    const items: Omit<WaitlistItem, 'id'>[] = rows.map(row => ({
      registrationDate: row['Data Cadastro'] ? (() => { const p = row['Data Cadastro'].split('/'); return p.length === 3 ? `${p[2]}-${p[1].padStart(2,'0')}-${p[0].padStart(2,'0')}` : row['Data Cadastro']; })() : new Date().toISOString().split('T')[0],
      phoneEnd: row.phoneEnd || row['Final Telefone'] || '',
      age: Number(row.age || row['Idade']) || 0,
      availableTimes: row.availableTimes || row['Horários'] || row['Horarios'] || '',
      plan: row.plan || row.PLANO || row.Plano || '',
      serviceStarted: row.serviceStarted === 'true' ||
        (typeof row['Já comecou os atendimentos'] === 'string' &&
          row['Já comecou os atendimentos'].toLowerCase() === 'sim'),
    }));

    for (const item of items) {
      try { await waitlistService.add(item); } catch (err) { console.error(err); }
    }
    await loadList();
    alert(`${items.length} entradas importadas!`);
  };

  const formattedExportData = list.map(item => ({
    'Data Cadastro': new Date(item.registrationDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' }),
    'Final Telefone': item.phoneEnd || '',
    'Idade': item.age ? String(item.age) : '',
    'Horários': item.availableTimes || '',
    'PLANO': item.plan || '',
    'Já comecou os atendimentos': item.serviceStarted ? 'SIM' : 'NAO'
  }));

  const filteredList = list.filter(item => activeTab === 'iniciados' ? item.serviceStarted : !item.serviceStarted);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-industrial-text">Lista de Espera</h2>
          <p className="text-industrial-text text-sm mt-1">Gestão de triagem de pacientes urgentes</p>
        </div>
        <div className="flex gap-2">
          <CsvTools dataToExport={formattedExportData} exportFilename="lista-de-espera.csv" onImport={handleImport} />
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
          className={clsx("px-4 py-2 font-medium text-sm transition-colors border-b-2", activeTab === 'aguardando' ? 'border-industrial-accent text-industrial-accent' : 'border-transparent text-industrial-text-muted hover:text-gray-700')}
          onClick={() => setActiveTab('aguardando')}
        >
          Aguardando Atendimento
        </button>
        <button
          className={clsx("px-4 py-2 font-medium text-sm transition-colors border-b-2", activeTab === 'iniciados' ? 'border-industrial-accent text-industrial-accent' : 'border-transparent text-industrial-text-muted hover:text-gray-700')}
          onClick={() => setActiveTab('iniciados')}
        >
          Atendimentos Iniciados
        </button>
      </div>

      <div className="bg-industrial-surface rounded-xl shadow-sm border border-industrial-border overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-industrial-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="w-full overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-industrial-bg text-industrial-text-muted font-medium text-[14px]">
                  <th className="px-4 py-3">Data Cadastro</th>
                  <th className="px-4 py-3">Final Tel.</th>
                  <th className="px-4 py-3">Idade</th>
                  <th className="px-4 py-3">Horários</th>
                  <th className="px-4 py-3">Plano</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-industrial-border text-[14px]">
                {filteredList.map((item) => (
                  <tr key={item.id} className="even:bg-industrial-accent/[0.04] dark:even:bg-industrial-accent/15 odd:bg-industrial-surface hover:bg-industrial-accent/10 dark:hover:bg-industrial-accent/20 transition-colors group">
                    <td className="px-4 py-3 text-industrial-text-muted whitespace-nowrap">
                      {new Date(item.registrationDate).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3 font-mono font-medium text-industrial-text">...{item.phoneEnd}</td>
                    <td className="px-4 py-3 text-industrial-text-muted">{item.age} anos</td>
                    <td className="px-4 py-3 text-industrial-text-muted break-words">{item.availableTimes}</td>
                    <td className="px-4 py-3 text-industrial-text-muted break-words uppercase">{item.plan || '---'}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleServiceStarted(item.id, item.serviceStarted)}
                        className={clsx(
                          "px-2 py-1 text-[12px] font-semibold rounded-md border transition-all",
                          item.serviceStarted
                            ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                            : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                        )}
                      >
                        {item.serviceStarted ? 'Iniciado' : 'Espera'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => { setEditingId(item.id); setFormData(item); setIsModalOpen(true); }}
                          className="text-industrial-text-muted hover:text-industrial-accent transition-colors"
                          title="Editar"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-industrial-text-muted hover:text-red-600 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredList.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-industrial-text-muted">
                      Nenhuma entrada encontrada para este filtro.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Adição/Edição */}
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
                <input type="text" value={formData.phoneEnd || ''} onChange={e => setFormData({ ...formData, phoneEnd: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-industrial-border focus:ring-2 focus:ring-industrial-accent outline-none" required placeholder="Ex: 1234" />
              </div>
              <div>
                <label className="block text-sm font-medium text-industrial-text mb-1">Idade</label>
                <input type="number" value={formData.age || ''} onChange={e => setFormData({ ...formData, age: Number(e.target.value) })} className="w-full px-4 py-2 rounded-lg border border-industrial-border focus:ring-2 focus:ring-industrial-accent outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-industrial-text mb-1">Horários Disponíveis</label>
                <input type="text" value={formData.availableTimes || ''} onChange={e => setFormData({ ...formData, availableTimes: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-industrial-border focus:ring-2 focus:ring-industrial-accent outline-none" required placeholder="Ex: Manhã/Tarde" />
              </div>
              <div>
                <label className="block text-sm font-medium text-industrial-text mb-1">Plano (Pode Escrever)</label>
                <input type="text" value={formData.plan || ''} onChange={e => setFormData({ ...formData, plan: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-industrial-border focus:ring-2 focus:ring-industrial-accent outline-none" placeholder="Ex: Unimed" />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => { setIsModalOpen(false); setEditingId(null); setFormData({}); }} className="px-4 py-2 text-industrial-text hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-industrial-accent text-white rounded-lg hover:bg-[#243F05] transition-colors font-medium">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
