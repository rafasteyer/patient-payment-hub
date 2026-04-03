import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Patient } from '../types';

interface PatientFormProps {
 isOpen: boolean;
 onClose: () => void;
 onSave: (patient: Omit<Patient, 'id' | 'createdAt'>) => void;
 initialData?: Patient | null;
}

export function PatientForm({ isOpen, onClose, onSave, initialData }: PatientFormProps) {
 const [formData, setFormData] = useState<Partial<Patient>>({});

 useEffect(() => {
 if (initialData) {
 setFormData(initialData);
 } else {
 setFormData({});
 }
 }, [initialData, isOpen]);

 if (!isOpen) return null;

 const handleSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 onSave({
 amount: formData.amount || null,
 name: formData.name || null,
 cardNumber: formData.cardNumber || null,
 cpf: formData.cpf || null,
 birthDate: formData.birthDate || null,
 motherName: formData.motherName || null,
 holder: formData.holder || null,
 healthPlan: formData.healthPlan || null,
 guideExpiration: formData.guideExpiration || null,
 status: formData.status || 'active',
 lastSessionDate: formData.lastSessionDate || null,
 });
 onClose();
 };

 const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 const { name, value } = e.target;
 setFormData(prev => ({ ...prev, [name]: value }));
 };

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
 <div className="bg-industrial-surface rounded-xl shadow-xl w-full max-w-2xl my-8 animate-in zoom-in-95 duration-200">
 <div className="flex items-center justify-between p-6 border-b border-industrial-border">
 <h2 className="text-xl font-bold text-industrial-accent">
 {initialData ? 'Editar Paciente' : 'Novo Paciente'}
 </h2>
 <button onClick={onClose} className="text-industrial-text-muted hover:text-gray-600">
 <X size={24} />
 </button>
 </div>

 <form onSubmit={handleSubmit} className="p-6 space-y-4">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-medium text-industrial-text mb-1">Nome Completo</label>
 <input type="text"name="name"value={formData.name || ''} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-industrial-border focus:ring-2 focus:ring-industrial-accent focus:border-transparent outline-none"/>
 </div>
 <div>
 <label className="block text-sm font-medium text-industrial-text mb-1">CPF</label>
 <input type="text"name="cpf"value={formData.cpf || ''} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-industrial-border focus:ring-2 focus:ring-industrial-accent focus:border-transparent outline-none"/>
 </div>
 <div>
 <label className="block text-sm font-medium text-industrial-text mb-1">Data de Nascimento</label>
 <input type="date"name="birthDate"value={formData.birthDate || ''} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-industrial-border focus:ring-2 focus:ring-industrial-accent focus:border-transparent outline-none"/>
 </div>
 <div>
 <label className="block text-sm font-medium text-industrial-text mb-1">Nome da Mãe</label>
 <input type="text"name="motherName"value={formData.motherName || ''} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-industrial-border focus:ring-2 focus:ring-industrial-accent focus:border-transparent outline-none"/>
 </div>
 <div>
 <label className="block text-sm font-medium text-industrial-text mb-1">Valor (R$)</label>
 <input type="text"name="amount"value={formData.amount || ''} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-industrial-border focus:ring-2 focus:ring-industrial-accent focus:border-transparent outline-none"/>
 </div>
 <div>
 <label className="block text-sm font-medium text-industrial-text mb-1">Plano</label>
 <input type="text"name="healthPlan"value={formData.healthPlan || ''} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-industrial-border focus:ring-2 focus:ring-industrial-accent focus:border-transparent outline-none"/>
 </div>
 <div>
 <label className="block text-sm font-medium text-industrial-text mb-1">Carteirinha</label>
 <input type="text"name="cardNumber"value={formData.cardNumber || ''} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-industrial-border focus:ring-2 focus:ring-industrial-accent focus:border-transparent outline-none"/>
 </div>
 <div>
 <label className="block text-sm font-medium text-industrial-text mb-1">Titular do Plano</label>
 <input type="text"name="holder"value={formData.holder || ''} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-industrial-border focus:ring-2 focus:ring-industrial-accent focus:border-transparent outline-none"/>
 </div>
 <div>
 <label className="block text-sm font-medium text-industrial-text mb-1">Vencimento da Guia</label>
 <input type="date"name="guideExpiration"value={formData.guideExpiration || ''} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-industrial-border focus:ring-2 focus:ring-industrial-accent focus:border-transparent outline-none"/>
 </div>
 </div>

 <div className="pt-4 flex justify-end gap-3">
 <button type="button"onClick={onClose} className="px-4 py-2 text-industrial-text hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
 <button type="submit"className="px-6 py-2 bg-industrial-accent text-white rounded-lg hover:bg-[#243F05] transition-colors font-medium">Salvar</button>
 </div>
 </form>
 </div>
 </div>
 );
}
