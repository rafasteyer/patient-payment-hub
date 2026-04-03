import { useState, useEffect } from 'react';
import { Plus, ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';
import { financeService } from '../services/financeService';
import type { Transaction } from '../types';
import { TransactionForm } from '../components/TransactionForm';
import { CsvTools } from '../components/CsvTools';
import clsx from 'clsx';

export function Finance() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'fluxo' | 'dre'>('fluxo');
    const [period, setPeriod] = useState<string>('all');
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');

    const loadData = () => {
        setTransactions(financeService.getTransactions());
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSave = (data: Omit<Transaction, 'id' | 'createdAt'>) => {
        financeService.addTransaction(data);
        loadData();
    };

    const handleImport = (parsedData: any[]) => {
        let count = 0;
        
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

        const parseAmountInput = (val: string) => {
            if (!val) return 0;
            return parseFloat(val.replace('R$', '').replace('.', '').replace(',', '.').trim()) || 0;
        };
        
        parsedData.forEach(row => {
            const tx: Omit<Transaction, 'id' | 'createdAt'> = {
                date: parseDateInput(row.date || row.Data || row.DATA || '') || new Date().toISOString().split('T')[0],
                description: row.description || row.Descricao || row['Descrição'] || '',
                category: (row.category === 'income' || row.category === 'expense') ? row.category : (row.Categoria === 'Receita' || row.Categoria === 'ENTRADA' ? 'income' : 'expense'),
                amount: row.amount ? parseFloat(row.amount) : parseAmountInput(row.Valor || row.VALOR || '0'),
                professional: row.professional || row.Profissional_Responsavel || row.Profissional || '',
                paymentMethod: row.paymentMethod || row.MetodoPagamento || row['Método de Pagamento'] || 'Dinheiro'
            };
            if (tx.description && tx.amount) {
                financeService.addTransaction(tx);
                count++;
            }
        });
        loadData();
        if (count > 0) alert(`${count} transações importadas com sucesso.`);
    };

    const isDateInPeriod = (dateStr: string) => {
        if (!dateStr) return true;
        if (period === 'all') return true;
        const date = new Date(dateStr.includes('T') ? dateStr : dateStr + 'T12:00:00Z');
        const today = new Date();
        today.setHours(12,0,0,0);

        if (period === 'daily') {
            return date.toISOString().split('T')[0] === today.toISOString().split('T')[0];
        }
        if (period === 'weekly') {
            const sevenDaysAgo = new Date(today);
            sevenDaysAgo.setDate(today.getDate() - 7);
            sevenDaysAgo.setHours(0,0,0,0);
            return date >= sevenDaysAgo;
        }
        if (period === 'monthly') {
            return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
        }
        if (period === 'custom') {
            const start = customStart ? new Date(customStart + 'T00:00:00Z') : new Date(0);
            const end = customEnd ? new Date(customEnd + 'T23:59:59Z') : new Date('2100-01-01');
            return date >= start && date <= end;
        }
        return true;
    };

    const filteredTransactions = transactions.filter(tx => isDateInPeriod(tx.date));
    
    const filteredSummary = filteredTransactions.reduce((acc, tx) => {
        if(tx.category === 'income') acc.revenue += tx.amount;
        else acc.expenses += tx.amount;
        acc.netProfit = acc.revenue - acc.expenses;
        return acc;
    }, { revenue: 0, expenses: 0, netProfit: 0 });

    const formattedExportData = filteredTransactions.map(t => ({
        'Data': new Date(t.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }),
        'Descrição': t.description,
        'Categoria': t.category === 'income' ? 'ENTRADA' : 'SAÍDA',
        'Valor': `R$ ${t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        'Profissional': t.professional,
        'Método de Pagamento': t.paymentMethod
    }));

 return (
 <div className="space-y-6">
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
 <div>
 <h2 className="text-2xl font-bold text-industrial-text">Gestão Financeira</h2>
 <p className="text-industrial-text text-sm mt-1">Controle Financeiro e DRE</p>
 </div>
 <div className="flex gap-2 flex-wrap justify-start sm:justify-end items-center w-full sm:w-auto">
    <div className="flex items-center gap-2">
        <select 
            value={period} 
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2.5 rounded-lg border border-industrial-border bg-industrial-surface dark:bg-gray-800 text-sm outline-none"
        >
            <option value="all">Todo Período</option>
            <option value="daily">Hoje</option>
            <option value="weekly">Últimos 7 dias</option>
            <option value="monthly">Este Mês</option>
            <option value="custom">Personalizado...</option>
        </select>
        {period === 'custom' && (
            <div className="flex gap-2">
                <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} className="px-2 py-2 w-32 rounded-lg border border-industrial-border bg-industrial-surface dark:bg-gray-800 text-sm" />
                <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} className="px-2 py-2 w-32 rounded-lg border border-industrial-border bg-industrial-surface dark:bg-gray-800 text-sm" />
            </div>
        )}
    </div>
    <CsvTools dataToExport={formattedExportData} exportFilename="financeiro.csv" onImport={handleImport} />
    <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 bg-industrial-accent text-white px-5 py-2.5 rounded-lg hover:bg-industrial-accent-hover transition-all shadow-lg active:scale-95 text-sm font-medium"
    >
        <Plus size={18} />
        Nova Transação
    </button>
 </div>
 </div>

 <div className="flex border-b border-industrial-border">
 <button
 className={clsx("px-4 py-2 font-medium text-sm transition-colors border-b-2", activeTab === 'fluxo' ? 'border-industrial-accent text-industrial-accent' : 'border-transparent text-industrial-text-muted hover:text-gray-700 ')}
 onClick={() => setActiveTab('fluxo')}
 >
 Fluxo de Caixa Diário
 </button>
 <button
 className={clsx("px-4 py-2 font-medium text-sm transition-colors border-b-2", activeTab === 'dre' ? 'border-industrial-accent text-industrial-accent' : 'border-transparent text-industrial-text-muted hover:text-gray-700 ')}
 onClick={() => setActiveTab('dre')}
 >
 DRE (Demonstrativo)
 </button>
 </div>

 {activeTab === 'fluxo' ? (
 <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-industrial-surface p-6 rounded-xl shadow-sm border border-industrial-border flex items-center justify-between group hover:border-green-500/30 transition-colors">
                        <div>
                            <p className="text-sm text-industrial-text-muted font-medium">Receita Total</p>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                                {filteredSummary.revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </p>
                        </div>
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform">
                            <ArrowUpRight size={28} strokeWidth={2.5} />
                        </div>
                    </div>

                    <div className="bg-industrial-surface p-6 rounded-xl shadow-sm border border-industrial-border flex items-center justify-between group hover:border-red-500/30 transition-colors">
                        <div>
                            <p className="text-sm text-industrial-text-muted font-medium">Despesas</p>
                            <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                                {filteredSummary.expenses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </p>
                        </div>
                        <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform">
                            <ArrowDownRight size={28} strokeWidth={2.5} />
                        </div>
                    </div>

                    <div className="bg-industrial-surface p-6 rounded-xl shadow-sm border border-industrial-border flex items-center justify-between group hover:border-industrial-accent transition-colors">
                        <div>
                            <p className="text-sm text-industrial-text-muted font-medium">Fluxo Líquido</p>
                            <p className={clsx("text-2xl font-bold mt-1", filteredSummary.netProfit >= 0 ? "text-industrial-accent" : "text-red-600 dark:text-red-400")}>
                                {filteredSummary.netProfit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </p>
                        </div>
                        <div className="p-3 bg-[#365D08]/10 dark:bg-[#365D08]/20 rounded-xl text-industrial-accent group-hover:scale-110 transition-transform">
                            <Wallet size={28} strokeWidth={2.5} />
                        </div>
                    </div>
                </div>

 {/* Transaction List */}
 <div className="bg-industrial-surface rounded-xl shadow-sm border border-industrial-border overflow-hidden">
 <div className="w-full overflow-hidden">
 <table className="w-full text-left text-sm">
 <thead>
 <tr className="bg-industrial-bg text-industrial-text-muted font-medium border-b border-industrial-border text-[13px]">
 <th className="px-4 py-3">Data</th>
 <th className="px-4 py-3">Descrição</th>
 <th className="px-4 py-3">Categoria</th>
 <th className="px-4 py-3 text-right">Valor</th>
 <th className="px-4 py-3">Método Pag.</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-industrial-border text-[13px]">
 {filteredTransactions.sort((a, b) => b.date.localeCompare(a.date)).map((tx) => (
 <tr key={tx.id} className="even:bg-[#365D08]/[0.08] dark:even:bg-[#365D08]/20 odd:bg-industrial-surface hover:bg-[#365D08]/15 dark:hover:bg-[#365D08]/30 transition-colors group">
 <td className="px-4 py-3 text-industrial-text-muted whitespace-nowrap">
 {new Date(tx.date).toLocaleDateString('pt-BR')}
 </td>
 <td className="px-4 py-3 font-medium text-industrial-text break-words">{tx.description}</td>
 <td className="px-4 py-3">
 <span className={clsx(
"inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium",
 tx.category === 'income'
 ?"bg-green-100 text-green-800"
 :"bg-red-100 text-red-800"
 )}>
 {tx.category === 'income' ? 'Entrada' : 'Saída'}
 </span>
 </td>
 <td className={clsx("px-4 py-3 text-right font-medium whitespace-nowrap", tx.category === 'income' ? 'text-green-600' : 'text-red-600')}>
 {tx.category === 'income' ? '+' : '-'}{tx.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
 </td>
 <td className="px-4 py-3 break-words">
 {tx.paymentMethod || '---'}
 </td>
 </tr>
 ))}

 {filteredTransactions.length === 0 && (
 <tr>
 <td colSpan={5} className="px-6 py-12 text-center text-industrial-text-muted">
 Nenhuma transação registrada.
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </div>
 </>
 ) : (
 <div className="bg-industrial-surface rounded-xl shadow-sm border border-industrial-border overflow-hidden p-6 max-w-3xl mx-auto">
 <h3 className="text-lg font-bold text-industrial-text border-b pb-4 mb-4">Demonstrativo de Resultados do Exercício (DRE)</h3>
 
 <div className="space-y-4">
 <div className="flex justify-between items-center py-2">
 <span className="text-industrial-text-muted">(=) Receita Operacional Bruta</span>
 <span className="font-semibold text-green-600">{filteredSummary.revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
 </div>
 <div className="flex justify-between items-center py-2 text-sm text-industrial-text-muted pl-4 border-l-2 border-industrial-border">
 <span>(-) Deduções de Receita</span>
 <span>R$ 0,00</span>
 </div>
 <div className="flex justify-between items-center py-2 font-medium bg-industrial-bg px-2 rounded">
 <span className="text-industrial-text">(=) Receita Líquida</span>
 <span className="text-industrial-text">{filteredSummary.revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
 </div>
 <div className="flex justify-between items-center py-2">
 <span className="text-industrial-text-muted">(-) Despesas Operacionais</span>
 <span className="font-semibold text-red-600">{filteredSummary.expenses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
 </div>
 <div className="flex justify-between items-center py-2 text-sm text-industrial-text-muted pl-4 border-l-2 border-industrial-border">
 <span>Despesas Operacionais/Administrativas</span>
 <span>{filteredSummary.expenses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
 </div>
 <div className="flex justify-between items-center py-3 mt-4 border-t-2 border-gray-800 text-lg">
 <span className="font-bold text-industrial-text">(=) Lucro/Prejuízo Líquido</span>
 <span className={clsx("font-bold text-xl", filteredSummary.netProfit >= 0 ?"text-industrial-accent":"text-red-600")}>
 {filteredSummary.netProfit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
 </span>
 </div>
 </div>
 </div>
 )}

 <TransactionForm
 isOpen={isModalOpen}
 onClose={() => setIsModalOpen(false)}
 onSave={handleSave}
 />
 </div>
 );
}
