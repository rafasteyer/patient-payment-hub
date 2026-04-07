import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Edit, Trash2, Copy, Check, ArrowUpDown, UserX, UserCheck } from 'lucide-react';
import clsx from 'clsx';
import { patientService } from '../services/patientService';
import type { Patient } from '../types';
import { PatientForm } from '../components/PatientForm';
import { CsvTools } from '../components/CsvTools';

function calculateAge(birthDate?: string | null): number | null {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

const getGuideColor = (dateStr?: string | null) => {
  if (!dateStr) return '';
  const date = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T12:00:00Z`);
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  date.setHours(12, 0, 0, 0);

  if (date < today) {
    return 'text-red-600 font-bold dark:text-red-400';
  }
  if (date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()) {
    return 'text-blue-600 font-bold dark:text-blue-400';
  }
  return '';
};

const CopyIcon = ({ value }: { value?: string | null }) => {
  const [copied, setCopied] = useState(false);
  if (!value) return null;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="ml-1 inline-flex text-industrial-text-muted hover:text-industrial-accent transition-all align-middle"
      title="Copiar"
    >
      {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
    </button>
  );
};

type SortField = 'amount' | 'name' | 'birthDate' | 'healthPlan' | 'guideExpiration';

export function Patients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'active' | 'inactive'>('active');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isLoading, setIsLoading] = useState(true);
  const [importError, setImportError] = useState<string | null>(null);

  const loadPatients = async () => {
    try {
      setIsLoading(true);
      const data = await patientService.getAll();
      setPatients(data);
    } catch (err) {
      console.error('Erro ao carregar pacientes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const handleSave = async (data: Omit<Patient, 'id' | 'createdAt'>) => {
    try {
      if (editingPatient) {
        await patientService.update(editingPatient.id, data);
      } else {
        await patientService.add(data);
      }
      await loadPatients();
    } catch (err) {
      console.error('Erro ao salvar paciente:', err);
      alert('Erro ao salvar paciente. Tente novamente.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este paciente?')) return;
    try {
      await patientService.delete(id);
      await loadPatients();
    } catch (err) {
      console.error('Erro ao excluir paciente:', err);
    }
  };

  const handleImport = async (parsedData: unknown[]) => {
    setImportError(null);
    const rows = parsedData as Record<string, string>[];

    const parseDateInput = (val: unknown): string | null => {
      const str = String(val ?? '').trim();
      if (!str) return null;
      if (str.includes('/')) {
        const parts = str.split(' ')[0].split('/');
        if (parts.length === 3) {
          return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
      }
      return str;
    };

    // Cleans Excel/CSV formula wrappers like ="00410010009636583" → 00410010009636583
    // Also handles numeric values that lost leading zeros
    const cleanCardNumber = (val: unknown): string => {
      if (val === undefined || val === null) return '';
      const str = String(val).trim();
      // Remove Excel ="..." wrapper
      const match = str.match(/^=?"?([0-9]+)"?$/);
      if (match) return match[1];
      // Remove generic quotes and equal signs
      return str.replace(/^[="]+|["]+$/g, '').trim();
    };

    const cleanString = (val: unknown) => String(val ?? '').replace(/^[="]+|["]+$/g, '').trim();
    const parseAmountInput = (val: string) => {
      if (!val) return '';
      return val.replace('R$', '').trim();
    };

    const patientsToImport: Omit<Patient, 'id' | 'createdAt'>[] = [];
    rows.forEach((row) => {
      // Find keys using case-insensitive and normalized lookups
      const findValue = (possibleKeys: string[]) => {
        const actualKey = Object.keys(row).find(k => 
          possibleKeys.some(pk => k.toLowerCase().trim() === pk.toLowerCase().trim())
        );
        return actualKey ? row[actualKey] : undefined;
      };

      const name = findValue(['name', 'nome', 'NOME']);
      if (!name) return; // Skip rows without name

      const patient: Omit<Patient, 'id' | 'createdAt'> = {
        name: String(name),
        cpf: cleanString(findValue(['cpf', 'CPF', 'Cpf'])),
        birthDate: parseDateInput(findValue(['birthDate', 'Data_Nascimento', 'Data de Nascimento', 'Nascimento', 'Nasc'])),
        status: (String(findValue(['status', 'Status_Atendimento']) || 'active').toLowerCase()) as 'active' | 'inactive',
        amount: parseAmountInput(String(findValue(['amount', 'Valor', 'VALOR', 'PRECO']) || '')),
        // Card number: critical to preserve leading zeros
        cardNumber: cleanCardNumber(
          findValue([
            'cardNumber', 'Carteirinha', 'CARTEIRINHA', 
            'N DA CARTEIRINHA', 'N da Carteirinha', 
            'Nº Carteirinha', 'Nº da carteirinha', 
            'Nº Carteira', 'N da Carteira', 'Nº da Carteira'
          ])
        ),
        motherName: String(findValue(['motherName', 'Nome_Mae', 'Nome da Mãe', 'Mãe']) || ''),
        holder: String(findValue(['holder', 'Titular', 'TITULAR']) || ''),
        healthPlan: String(findValue(['healthPlan', 'Plano', 'PLANO', 'Convênio']) || ''),
        guideExpiration: parseDateInput(
          findValue(['guideExpiration', 'Vencimento_Guia', 'Data de vencimento da guia', 'Vencimento', 'Vencimento Guia'])
        ),
        lastSessionDate: null,
      };
      
      patientsToImport.push(patient);
    });

    if (patientsToImport.length === 0) {
      setImportError('Nenhum paciente válido encontrado no arquivo. Verifique as colunas.');
      return;
    }

    try {
      const count = await patientService.addMany(patientsToImport);
      await loadPatients();
      alert(`${count} pacientes importados com sucesso!`);
    } catch (err: any) {
      console.error('Erro ao importar pacientes:', err);
      // More specific error message
      const errorMsg = err.message || (err.error?.message) || 'Erro desconhecido';
      setImportError(`Erro ao importar: ${errorMsg}. Verifique os formatos de data e colunas.`);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedPatients = useMemo(() => {
    const result = patients.filter(p => {
      const isActive = p.status !== 'inactive';
      if (activeTab === 'active' && !isActive) return false;
      if (activeTab === 'inactive' && isActive) return false;
      return (p.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (p.cpf || '').includes(searchTerm) ||
        (p.cardNumber || '').includes(searchTerm);
    });

    result.sort((a, b) => {
      let valA: string | number = '';
      let valB: string | number = '';

      switch (sortField) {
        case 'name': valA = a.name || ''; valB = b.name || ''; break;
        case 'healthPlan': valA = a.healthPlan || ''; valB = b.healthPlan || ''; break;
        case 'birthDate': valA = a.birthDate || ''; valB = b.birthDate || ''; break;
        case 'guideExpiration': valA = a.guideExpiration || ''; valB = b.guideExpiration || ''; break;
        case 'amount':
          valA = parseFloat((a.amount || '0').replace(',', '.')) || 0;
          valB = parseFloat((b.amount || '0').replace(',', '.')) || 0;
          break;
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [patients, searchTerm, sortField, sortDirection, activeTab]);

  const formattedExportData = useMemo(() => {
    return patients.map(p => ({
      'VALOR': p.amount ? `R$ ${p.amount}` : '',
      'NOME': p.name || '',
      // Export card number as text preserving leading zeros
      'Carteirinha': p.cardNumber || '',
      'CPF': p.cpf ? `="${p.cpf}"` : '',
      'Data de Nascimento': p.birthDate ? new Date(p.birthDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '',
      'Idade': calculateAge(p.birthDate) ?? '',
      'Nome da Mãe': p.motherName || '',
      'TITULAR': p.holder || '',
      'PLANO': p.healthPlan || '',
      'Data de vencimento da guia': p.guideExpiration ? new Date(p.guideExpiration).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : ''
    }));
  }, [patients]);

  const SortHeader = ({ field, label }: { field: SortField; label: string }) => (
    <div
      className="flex items-center gap-1 cursor-pointer hover:text-gray-700"
      onClick={() => handleSort(field)}
    >
      {label}
      <ArrowUpDown size={12} className={sortField === field ? 'text-industrial-accent' : 'text-gray-300'} />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-industrial-text">Pacientes</h2>
          <p className="text-industrial-text text-sm mt-1">Gestão de cadastros e carteirinhas</p>
        </div>
        <div className="flex gap-2">
          <CsvTools dataToExport={formattedExportData} exportFilename="pacientes.csv" onImport={handleImport} />
          <button
            onClick={() => { setEditingPatient(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 bg-industrial-accent text-white px-5 py-2.5 rounded-lg hover:bg-industrial-accent-hover transition-all shadow-lg active:scale-95 text-sm font-medium"
          >
            <Plus size={18} />
            Novo Paciente
          </button>
        </div>
      </div>

      {importError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          {importError}
        </div>
      )}

      <div className="flex gap-4 border-b border-industrial-border pb-[-1px]">
        <button
          className={clsx("pb-2 px-2 font-medium transition-colors border-b-2 outline-none", activeTab === 'active' ? "border-industrial-accent text-industrial-accent" : "border-transparent text-industrial-text-muted hover:text-industrial-text")}
          onClick={() => setActiveTab('active')}
        >
          Ativos
        </button>
        <button
          className={clsx("pb-2 px-2 font-medium transition-colors border-b-2 outline-none", activeTab === 'inactive' ? "border-industrial-accent text-industrial-accent" : "border-transparent text-industrial-text-muted hover:text-industrial-text")}
          onClick={() => setActiveTab('inactive')}
        >
          Inativos (Não vem mais)
        </button>
      </div>

      <div className="bg-industrial-surface rounded-xl shadow-sm border border-industrial-border overflow-hidden mt-4">
        {/* Toolbar */}
        <div className="p-4 border-b border-industrial-border flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-industrial-text-muted w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nome, CPF ou carteirinha..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-industrial-border focus:border-industrial-accent focus:ring-1 focus:ring-industrial-accent outline-none"
            />
          </div>
        </div>

        <div className="w-full">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-industrial-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <table className="w-full text-left text-[14px] leading-tight">
              <thead>
                <tr className="border-b border-industrial-border text-industrial-text-muted bg-industrial-bg">
                  <th className="px-2 py-3 font-semibold w-[8%]"><SortHeader field="amount" label="Valor" /></th>
                  <th className="px-2 py-3 font-semibold w-[15%]"><SortHeader field="name" label="Nome" /></th>
                  <th className="px-2 py-3 font-semibold w-[12%]">Nº Carteira</th>
                  <th className="px-2 py-3 font-semibold w-[10%]">CPF</th>
                  <th className="px-2 py-3 font-semibold w-[10%]"><SortHeader field="birthDate" label="Nasc." /></th>
                  <th className="px-2 py-3 font-semibold w-[5%]">Idade</th>
                  <th className="px-2 py-3 font-semibold w-[12%]">Nome da Mãe</th>
                  <th className="px-2 py-3 font-semibold w-[10%]">Titular</th>
                  <th className="px-2 py-3 font-semibold w-[10%]"><SortHeader field="healthPlan" label="Plano" /></th>
                  <th className="px-2 py-3 font-semibold w-[8%]"><SortHeader field="guideExpiration" label="Venc." /></th>
                  <th className="px-2 py-3 font-semibold text-center w-[5%]">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-industrial-border text-industrial-text font-medium">
                {filteredAndSortedPatients.map((patient) => {
                  const age = calculateAge(patient.birthDate);
                  return (
                    <tr key={patient.id} className="even:bg-industrial-accent/[0.04] dark:even:bg-industrial-accent/15 odd:bg-industrial-surface hover:bg-industrial-accent/10 dark:hover:bg-industrial-accent/20 transition-colors group">
                      <td className="px-2 py-2 align-middle">
                        {patient.amount ? (
                          <span className="whitespace-nowrap font-semibold">R$ {patient.amount} <CopyIcon value={`R$ ${patient.amount}`} /></span>
                        ) : '---'}
                      </td>
                      <td className="px-2 py-2 align-middle">
                        <div className="uppercase font-bold break-words">{patient.name || '---'} {patient.name && <CopyIcon value={patient.name} />}</div>
                      </td>
                      <td className="px-2 py-2 align-middle font-mono text-industrial-text">
                        {/* Always render as string to preserve leading zeros */}
                        <span className="break-all">{patient.cardNumber || '---'}</span>
                        {patient.cardNumber && <CopyIcon value={patient.cardNumber} />}
                      </td>
                      <td className="px-2 py-2 align-middle font-mono text-industrial-text">
                        <span className="whitespace-nowrap">{patient.cpf || '---'}</span>
                        {patient.cpf && <CopyIcon value={patient.cpf} />}
                      </td>
                      <td className="px-2 py-2 align-middle text-industrial-text whitespace-nowrap">
                        {patient.birthDate ? new Date(patient.birthDate).toLocaleDateString('pt-BR') : '---'}
                        {patient.birthDate && <CopyIcon value={new Date(patient.birthDate).toLocaleDateString('pt-BR')} />}
                      </td>
                      <td className="px-2 py-2 align-middle text-industrial-text whitespace-nowrap">
                        {age !== null ? `${age}a` : '---'}
                        {age !== null && <CopyIcon value={String(age)} />}
                      </td>
                      <td className="px-2 py-2 align-middle">
                        <div className="break-words text-industrial-text leading-tight">{patient.motherName || '---'} {patient.motherName && <CopyIcon value={patient.motherName} />}</div>
                      </td>
                      <td className="px-2 py-2 align-middle">
                        <div className="uppercase break-words text-industrial-text leading-tight">{patient.holder || '---'} {patient.holder && <CopyIcon value={patient.holder} />}</div>
                      </td>
                      <td className="px-2 py-2 align-middle">
                        <div className="uppercase break-words text-industrial-text leading-tight">{patient.healthPlan || '---'} {patient.healthPlan && <CopyIcon value={patient.healthPlan} />}</div>
                      </td>
                      <td className={clsx("px-2 py-2 align-middle whitespace-nowrap", getGuideColor(patient.guideExpiration))}>
                        {patient.guideExpiration ? new Date(patient.guideExpiration).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '---'}
                        {patient.guideExpiration && <CopyIcon value={new Date(patient.guideExpiration).toLocaleDateString('pt-BR', { timeZone: 'UTC' })} />}
                      </td>
                      <td className="px-2 py-2 align-middle text-center">
                        <div className="flex justify-center items-center gap-2">
                          <button
                            onClick={async () => {
                              const newStatus = patient.status === 'inactive' ? 'active' : 'inactive';
                              await patientService.update(patient.id, { status: newStatus });
                              loadPatients();
                            }}
                            className={clsx("transition-colors", patient.status === 'inactive' ? "text-industrial-accent hover:text-industrial-accent-hover" : "text-industrial-text-muted hover:text-amber-600")}
                            title={patient.status === 'inactive' ? 'Reativar Paciente' : 'Inativar (Não vem mais)'}
                          >
                            {patient.status === 'inactive' ? <UserCheck size={16} /> : <UserX size={16} />}
                          </button>
                          <button
                            onClick={() => { setEditingPatient(patient); setIsModalOpen(true); }}
                            className="text-industrial-text-muted hover:text-industrial-accent transition-colors"
                            title="Editar"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(patient.id)}
                            className="text-industrial-text-muted hover:text-red-600 transition-colors"
                            title="Excluir"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredAndSortedPatients.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={11} className="px-4 py-8 text-center text-industrial-text-muted">
                      {searchTerm ? 'Nenhum resultado encontrado.' : 'Nenhum paciente cadastrado.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <PatientForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingPatient}
      />
    </div>
  );
}
