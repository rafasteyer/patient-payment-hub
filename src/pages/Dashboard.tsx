import { useEffect, useState } from 'react';
import {
 BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Users, DollarSign, Activity, TrendingUp } from 'lucide-react';
import { financeService } from '../services/financeService';
import { patientService } from '../services/patientService';
import type { Goal } from '../types';
import clsx from 'clsx';

export function Dashboard() {
    const [transactions, setTransactions] = useState</* eslint-disable-next-line @typescript-eslint/no-explicit-any */ any[]>([]);
    const [patients, setPatients] = useState<any[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [period, setPeriod] = useState<string>('monthly');
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');

    /* eslint-disable react-hooks/set-state-in-effect */
    useEffect(() => {
        setTransactions(financeService.getTransactions());
        setGoals(financeService.getGoals());
        setPatients(patientService.getAll());
    }, []);

    const isDateInPeriod = (dateStr?: string) => {
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

    const filteredTx = transactions.filter(tx => isDateInPeriod(tx.date));
    const revenue = filteredTx.filter(tx => tx.category === 'income').reduce((acc, tx) => acc + tx.amount, 0);
    const expenses = filteredTx.filter(tx => tx.category === 'expense').reduce((acc, tx) => acc + tx.amount, 0);
    const netProfit = revenue - expenses;

    const filteredPts = patients.filter(p => isDateInPeriod(p.createdAt));
    const activePts = filteredPts.filter(p => p.status === 'active').length;
    const totalPts = filteredPts.length;

 // Compute Chart Data (Current Month vs Goal)
 const currentMonth = new Date().toISOString().slice(0, 7);
 const currentGoal = goals.find(g => g.month === currentMonth);
 const revenueGoal = currentGoal?.revenueGoal || 0;

    // Data for "Meta vs Realizado"
    const chartData = [
        {
            name: 'Faturamento',
            Realizado: revenue,
            Meta: revenueGoal, // Use actual goal logic
        },
    ];

 // Logic for detailed monthly breakdown could go here, keeping it simple for now (Current Month Snapshot)

    // Conversion Rate
    const conversionRate = totalPts > 0
        ? Math.round((activePts / totalPts) * 100)
        : 0;

 return (
 <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-industrial-accent">Dashboard</h2>
                    <p className="text-industrial-text mt-1">Visão geral da Clínica Teoria da Mente</p>
                </div>
                
                <div className="flex items-center gap-2 flex-wrap">
                    <select 
                        value={period} 
                        onChange={(e) => setPeriod(e.target.value)}
                        className="px-3 py-2.5 rounded-lg border border-industrial-border bg-industrial-surface dark:bg-gray-800 text-sm outline-none shadow-sm"
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
            </div>

 {/* KPI Cards */}
 <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <KPICard
                    title="Faturamento"
                    value={revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    icon={DollarSign}
                    trend={revenueGoal > 0 ? Math.round((revenue / revenueGoal) * 100) : undefined}
                    trendLabel="% da Meta"
                />
                <KPICard
                    title="Lucro Líquido"
                    value={netProfit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    icon={TrendingUp}
                    highlight={netProfit < 0}
                />
                <KPICard
                    title="Pacientes Ativos"
                    value={activePts.toString()}
                    icon={Users}
                    subValue={`${totalPts} no Período Selecionado`}
                />
                <KPICard
                    title="Taxa de Conversão"
                    value={`${conversionRate}%`}
                    icon={Activity}
                    subValue="Total vs Ativos"
                />
 </div>

 {/* Main Charts Row */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
 {/* Meta vs Realizado Chart */}
 <div className="bg-industrial-surface p-6 rounded-xl shadow-sm border border-industrial-border">
 <h3 className="text-lg font-bold text-industrial-text mb-6">Meta vs Realizado (Mês Atual)</h3>
 <div className="h-80">
 <ResponsiveContainer width="100%"height="100%">
 <BarChart data={chartData} layout="vertical"margin={{ left: 20 }}>
 <CartesianGrid strokeDasharray="3 3"horizontal={false} />
 <XAxis type="number"hide />
 <YAxis dataKey="name"type="category"width={100} tick={{ fill: '#6B7280' }} />
 <Tooltip
 cursor={{ fill: 'transparent' }}
 contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
 />
 <Legend />
 <Bar dataKey="Realizado"fill="#1E3A8A"radius={[0, 4, 4, 0]} barSize={32} />
 <Bar dataKey="Meta"fill="#E5E7EB"radius={[0, 4, 4, 0]} barSize={32} />
 </BarChart>
 </ResponsiveContainer>
 </div>
 </div>

 {/* Financial Composition (Simple vs) */}
 <div className="bg-industrial-surface p-6 rounded-xl shadow-sm border border-industrial-border">
 <h3 className="text-lg font-bold text-industrial-text mb-6">Composição Financeira</h3>
 <div className="h-80 flex items-center justify-center">
 <ResponsiveContainer width="100%"height="100%">
                            <BarChart data={[
                                { name: 'Entradas', value: revenue },
                                { name: 'Saídas', value: expenses },
                            ]}>
 <CartesianGrid strokeDasharray="3 3"vertical={false} />
 <XAxis dataKey="name"tick={{ fill: '#6B7280' }} />
 <YAxis tick={{ fill: '#6B7280' }} />
 <Tooltip
 formatter={(value: /* eslint-disable-next-line @typescript-eslint/no-explicit-any */ any) => value?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
 contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
 />
 <Bar dataKey="value"fill="#1E3A8A"radius={[4, 4, 0, 0]} barSize={48} name="Valor (R$)"/>
 </BarChart>
 </ResponsiveContainer>
 </div>
 </div>
 </div>
 </div>
 );
}

function KPICard({ title, value, icon: Icon, subValue, trend, trendLabel, highlight }: /* eslint-disable-next-line @typescript-eslint/no-explicit-any */ any) {
 return (
 <div className="bg-industrial-surface p-6 rounded-xl shadow-sm border border-industrial-border flex flex-col justify-between h-32 hover:translate-y-[-2px] transition-transform duration-200">
 <div className="flex justify-between items-start">
 <div>
 <p className="text-sm font-medium text-industrial-text-muted">{title}</p>
 <h3 className={clsx("text-2xl font-bold mt-1", highlight ?"text-red-600":"text-industrial-text")}>
 {value}
 </h3>
 </div>
 <div className="p-2 bg-industrial-bg rounded-lg text-industrial-accent">
 <Icon size={20} />
 </div>
 </div>

 {(subValue || trend) && (
 <div className="flex items-center gap-2 mt-2">
 {trend !== undefined && (
 <span className={clsx("text-xs font-bold px-1.5 py-0.5 rounded", trend >= 100 ?"bg-green-100 text-green-700":"bg-amber-100 text-amber-700")}>
 {trend}%
 </span>
 )}
 <span className="text-xs text-industrial-text-muted">
 {trendLabel || subValue}
 </span>
 </div>
 )}
 </div>
 );
}
