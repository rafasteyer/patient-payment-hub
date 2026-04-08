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
  const [transactions, setTransactions] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [period, setPeriod] = useState<string>('monthly');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [txs, gs, pts] = await Promise.all([
          financeService.getTransactions(),
          financeService.getGoals(),
          patientService.getAll(),
        ]);
        setTransactions(txs);
        setGoals(gs);
        setPatients(pts);
      } catch (err) {
        console.error('Erro ao carregar dashboard:', err);
      }
    })();
  }, []);

  const isDateInPeriod = (dateStr?: string) => {
    if (!dateStr) return true;
    if (period === 'all') return true;
    const date = new Date(dateStr.includes('T') ? dateStr : dateStr + 'T12:00:00Z');
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    if (period === 'daily') {
      return date.toISOString().split('T')[0] === today.toISOString().split('T')[0];
    }
    if (period === 'weekly') {
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 7);
      sevenDaysAgo.setHours(0, 0, 0, 0);
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

  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentGoal = goals.find(g => g.month === currentMonth);
  const revenueGoal = currentGoal?.revenueGoal || 0;

  const chartData = [{ name: 'Faturamento', Realizado: revenue, Meta: revenueGoal }];
  const conversionRate = totalPts > 0 ? Math.round((activePts / totalPts) * 100) : 0;

  const BRAND = '#16a34a';
  const BRAND_MUTED = '#E8ECF0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Dashboard</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Visão geral da Clínica Teoria da Mente</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 rounded-lg border text-sm outline-none"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
          >
            <option value="all">Todo Período</option>
            <option value="daily">Hoje</option>
            <option value="weekly">Últimos 7 dias</option>
            <option value="monthly">Este Mês</option>
            <option value="custom">Personalizado...</option>
          </select>
          {period === 'custom' && (
            <div className="flex gap-2">
              <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)}
                className="px-2 py-2 w-32 rounded-lg border text-sm"
                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }} />
              <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)}
                className="px-2 py-2 w-32 rounded-lg border text-sm"
                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }} />
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard title="Faturamento" value={revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} icon={DollarSign}
          trend={revenueGoal > 0 ? Math.round((revenue / revenueGoal) * 100) : undefined} trendLabel="% da Meta" />
        <KPICard title="Lucro Líquido" value={netProfit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} icon={TrendingUp} highlight={netProfit < 0} />
        <KPICard title="Pacientes Ativos" value={activePts.toString()} icon={Users} subValue={`${totalPts} no período`} />
        <KPICard title="Taxa de Conversão" value={`${conversionRate}%`} icon={Activity} subValue="Total vs Ativos" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Meta vs Realizado */}
        <div className="card p-6">
          <h3 className="text-base font-semibold mb-5" style={{ color: 'var(--color-text)' }}>Meta vs Realizado (Mês Atual)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-border)" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{ fill: 'var(--color-text-muted)', fontSize: 13 }} />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '10px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }}
                />
                <Legend />
                <Bar dataKey="Realizado" fill={BRAND} radius={[0, 6, 6, 0]} barSize={28} />
                <Bar dataKey="Meta" fill={BRAND_MUTED} radius={[0, 6, 6, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Composição Financeira */}
        <div className="card p-6">
          <h3 className="text-base font-semibold mb-5" style={{ color: 'var(--color-text)' }}>Composição Financeira</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[{ name: 'Entradas', value: revenue }, { name: 'Saídas', value: expenses }]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="name" tick={{ fill: 'var(--color-text-muted)', fontSize: 13 }} />
                <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} />
                <Tooltip
                  formatter={(value: any) => value?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  contentStyle={{ borderRadius: '10px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }}
                />
                <Bar dataKey="value" fill={BRAND} radius={[6, 6, 0, 0]} barSize={52} name="Valor (R$)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, icon: Icon, subValue, trend, trendLabel, highlight }: any) {
  return (
    <div className="card p-5 flex flex-col justify-between min-h-[120px] hover:-translate-y-0.5 transition-transform duration-200">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>{title}</p>
          <h3 className={clsx('text-2xl font-bold mt-1.5', highlight ? 'text-red-500' : '')}
            style={!highlight ? { color: 'var(--color-text)' } : {}}>
            {value}
          </h3>
        </div>
        <div className="p-2.5 rounded-xl" style={{ background: 'var(--color-brand-light)', color: 'var(--color-brand)' }}>
          <Icon size={18} strokeWidth={2} />
        </div>
      </div>
      {(subValue || trend !== undefined) && (
        <div className="flex items-center gap-2 mt-3">
          {trend !== undefined && (
            <span className={clsx('text-xs font-bold px-1.5 py-0.5 rounded', trend >= 100 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700')}>
              {trend}%
            </span>
          )}
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{trendLabel || subValue}</span>
        </div>
      )}
    </div>
  );
}
