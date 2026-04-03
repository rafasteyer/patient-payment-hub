import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { Transaction, TransactionType } from '../types';

interface TransactionFormProps {
 isOpen: boolean;
 onClose: () => void;
 onSave: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
 initialData?: Transaction | null;
}

export function TransactionForm({ isOpen, onClose, onSave, initialData }: TransactionFormProps) {
 const [description, setDescription] = useState('');
 const [amount, setAmount] = useState('');
 const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
 const [category, setCategory] = useState<TransactionType>('income');
 const [professional, setProfessional] = useState('');
 const [paymentMethod, setPaymentMethod] = useState('Pix');

 React.useEffect(() => {
 if (initialData) {
 setDescription(initialData.description);
 setAmount(String(Math.abs(initialData.amount)));
 setDate(initialData.date);
 setCategory(initialData.category);
 setProfessional(initialData.professional);
 setPaymentMethod(initialData.paymentMethod);
 } else {
 setDescription('');
 setAmount('');
 setDate(new Date().toISOString().split('T')[0]);
 setCategory('income');
 setProfessional('');
 setPaymentMethod('Pix');
 }
 }, [initialData, isOpen]);

 if (!isOpen) return null;

 const handleSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 onSave({
 description,
 amount: parseFloat(amount),
 date,
 category,
 professional,
 paymentMethod,
 });
 onClose();
 // Reset form check
 setDescription('');
 setAmount('');
 };

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
 <div className="bg-industrial-surface rounded-xl shadow-xl w-full max-w-md animate-in zoom-in-95 duration-200">
 <div className="flex items-center justify-between p-6 border-b border-industrial-border">
 <h2 className="text-xl font-bold text-industrial-accent">
 {initialData ? 'Editar Transação' : 'Nova Transação'}
 </h2>
 <button onClick={onClose} className="text-industrial-text-muted hover:text-gray-600">
 <X size={24} />
 </button>
 </div>

 <form onSubmit={handleSubmit} className="p-6 space-y-4">
 <div>
 <label className="block text-sm font-medium text-industrial-text mb-1">Descrição</label>
 <input
 required
 type="text"
 value={description}
 onChange={e => setDescription(e.target.value)}
 className="w-full px-4 py-2 rounded-lg border border-industrial-border focus:ring-2 focus:ring-industrial-accent focus:border-transparent outline-none"
 placeholder="Ex: Consulta Particular"
 />
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-medium text-industrial-text mb-1">Valor</label>
 <input
 required
 type="number"
 step="0.01"
 value={amount}
 onChange={e => setAmount(e.target.value)}
 className="w-full px-4 py-2 rounded-lg border border-industrial-border focus:ring-2 focus:ring-industrial-accent outline-none"
 placeholder="0.00"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-industrial-text mb-1">Data</label>
 <input
 required
 type="date"
 value={date}
 onChange={e => setDate(e.target.value)}
 className="w-full px-4 py-2 rounded-lg border border-industrial-border focus:ring-2 focus:ring-industrial-accent outline-none"
 />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-medium text-industrial-text mb-1">Categoria</label>
 <select
 value={category}
 onChange={e => setCategory(e.target.value as TransactionType)}
 className="w-full px-4 py-2 rounded-lg border border-industrial-border focus:ring-2 focus:ring-industrial-accent outline-none"
 >
 <option value="income">Receita</option>
 <option value="expense">Despesa</option>
 </select>
 </div>
 <div>
 <label className="block text-sm font-medium text-industrial-text mb-1">Método de Pagamento</label>
 <input
 type="text"
 value={paymentMethod}
 onChange={e => setPaymentMethod(e.target.value)}
 className="w-full px-4 py-2 rounded-lg border border-industrial-border focus:ring-2 focus:ring-industrial-accent outline-none"
 placeholder="Pix, Cartão, Dinheiro..."
 />
 </div>
 </div>

 <div>
 <label className="block text-sm font-medium text-industrial-text mb-1">Profissional / Responsável</label>
 <input
 type="text"
 value={professional}
 onChange={e => setProfessional(e.target.value)}
 className="w-full px-4 py-2 rounded-lg border border-industrial-border focus:ring-2 focus:ring-industrial-accent focus:border-transparent outline-none"
 placeholder="Ex: Dr. Silva"
 />
 </div>

 <div className="pt-4 flex justify-end gap-3">
 <button
 type="button"
 onClick={onClose}
 className="px-4 py-2 text-industrial-text hover:bg-gray-100 rounded-lg transition-colors"
 >
 Cancelar
 </button>
 <button
 type="submit"
 className="px-6 py-2 bg-industrial-accent text-white rounded-lg hover:bg-industrial-accent-hover transition-colors shadow-lg font-medium"
 >
 Salvar
 </button>
 </div>
 </form>
 </div>
 </div>
 );
}
