import React, { useState, useEffect } from 'react';
import { Target, Save } from 'lucide-react';
import { financeService } from '../services/financeService';
import type { Goal } from '../types';

export function Goals() {
 const [goals, setGoals] = useState<Goal[]>([]);
 const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
 const [revenueGoal, setRevenueGoal] = useState('');
 const [patientGoal, setPatientGoal] = useState('');
 const [message, setMessage] = useState('');

 useEffect(() => {
 const data = financeService.getGoals();
 setGoals(data);
 loadGoalForMonth(currentMonth, data);
 }, []);

 const loadGoalForMonth = (month: string, data: Goal[]) => {
 const goal = data.find(g => g.month === month);
 if (goal) {
 setRevenueGoal(goal.revenueGoal.toString());
 setPatientGoal(goal.newPatientsGoal.toString());
 } else {
 setRevenueGoal('');
 setPatientGoal('');
 }
 };

 const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 const month = e.target.value;
 setCurrentMonth(month);
 loadGoalForMonth(month, goals);
 setMessage('');
 };

 const handleSave = (e: React.FormEvent) => {
 e.preventDefault();
 const newGoal: Goal = {
 id: crypto.randomUUID(), // In a real app we might reuse ID if exists, but storage service handles by month lookup
 month: currentMonth,
 revenueGoal: parseFloat(revenueGoal),
 newPatientsGoal: parseInt(patientGoal),
 };
 financeService.updateGoal(newGoal);

 // Reload local state
 const updatedGoals = financeService.getGoals();
 setGoals(updatedGoals);

 setMessage('Metas atualizadas com sucesso!');
 setTimeout(() => setMessage(''), 3000);
 };

 return (
 <div className="space-y-6">
 <div className="flex justify-between items-center">
 <div>
 <h2 className="text-2xl font-bold text-industrial-text">Metas e Objetivos</h2>
 <p className="text-industrial-text text-sm mt-1">Defina seus alvos mensais</p>
 </div>
 </div>

 <div className="bg-industrial-surface p-8 rounded-xl shadow-sm border border-industrial-border max-w-2xl">
 <form onSubmit={handleSave} className="space-y-6">

 <div className="flex items-center gap-4 p-4 bg-[#365D08]/10 rounded-lg text-industrial-accent mb-6">
 <Target className="w-6 h-6"/>
 <p className="font-medium text-sm">
 Estabeleça metas claras para acompanhar o desempenho no Dashboard.
 </p>
 </div>

 <div>
 <label className="block text-sm font-medium text-industrial-text mb-1">Mês de Referência</label>
 <input
 type="month"
 value={currentMonth}
 onChange={handleMonthChange}
 className="w-full px-4 py-3 rounded-lg border border-industrial-border focus:ring-2 focus:ring-industrial-accent outline-none"
 />
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div>
 <label className="block text-sm font-medium text-industrial-text mb-1">Meta de Faturamento (R$)</label>
 <input
 type="number"
 step="0.01"
 required
 value={revenueGoal}
 onChange={e => setRevenueGoal(e.target.value)}
 className="w-full px-4 py-3 rounded-lg border border-industrial-border focus:ring-2 focus:ring-industrial-accent outline-none text-lg"
 placeholder="0.00"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-industrial-text mb-1">Meta de Novos Pacientes</label>
 <input
 type="number"
 required
 value={patientGoal}
 onChange={e => setPatientGoal(e.target.value)}
 className="w-full px-4 py-3 rounded-lg border border-industrial-border focus:ring-2 focus:ring-industrial-accent outline-none text-lg"
 placeholder="0"
 />
 </div>
 </div>

 <div className="pt-4 flex items-center justify-between">
 <span className="text-green-600 text-sm font-medium h-5 block">
 {message}
 </span>
 <button
 type="submit"
 className="flex items-center gap-2 bg-industrial-accent text-white px-8 py-3 rounded-lg hover:bg-[#243F05] transition-all shadow-lg shadow-[#243F05]/20 active:scale-95 font-medium"
 >
 <Save size={20} />
 Salvar Metas
 </button>
 </div>
 </form>
 </div>
 </div>
 );
}
