import Papa from 'papaparse';
import { patientService } from './patientService';
import { financeService } from './financeService';
import type { Patient, Transaction } from '../types';

export const importExportService = {
    exportPatients: () => {
        const data = patientService.getAll();
        const csv = Papa.unparse(data);
        downloadCSV(csv, 'pacientes.csv');
    },

    exportFinance: () => {
        const data = financeService.getTransactions();
        const csv = Papa.unparse(data);
        downloadCSV(csv, 'financeiro.csv');
    },

    importData: (file: File, onSuccess: (msg: string) => void, onError: (err: string) => void) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const data = results.data as any[];
                if (data.length === 0) return onError('Arquivo vazio ou inválido');

                // Heuristic detection based on columns
                const keys = Object.keys(data[0]);

                // Patients
                if (keys.includes('cpf') || keys.includes('CPF')) {
                    try {
                        let count = 0;
                        data.forEach(row => {
                            // Map CSV row to Patient object (normalizing keys if needed)
                            const patient: Omit<Patient, 'id' | 'createdAt'> = {
                                name: row.name || row.Nome || row.nome,
                                cpf: row.cpf || row.CPF,
                                birthDate: row.birthDate || row.Data_Nascimento,
                                status: (row.status || row.Status_Atendimento || 'active').toLowerCase(),
                                lastSessionDate: row.lastSessionDate || row.Data_Ultima_Sessao || new Date().toISOString()
                            };
                            if (patient.name && patient.cpf) {
                                patientService.add(patient);
                                count++;
                            }
                        });
                        onSuccess(`${count} pacientes importados com sucesso.`);
                        window.location.reload(); // Simple refresh to update views
                        return;
                    } catch (e) {
                        onError('Erro ao importar pacientes. Verifique o formato.');
                        return;
                    }
                }

                // Finance
                if (keys.includes('amount') || keys.includes('Valor') || keys.includes('valor')) {
                    try {
                        let count = 0;
                        data.forEach(row => {
                            const tx: Omit<Transaction, 'id' | 'createdAt'> = {
                                date: row.date || row.Data || new Date().toISOString().split('T')[0],
                                description: row.description || row.Descricao,
                                category: (row.category === 'income' || row.category === 'expense') ? row.category : (row.Categoria === 'Receita' ? 'income' : 'expense'),
                                amount: parseFloat(row.amount || row.Valor || '0'),
                                professional: row.professional || row.Profissional_Responsavel,
                                paymentMethod: row.paymentMethod || row.MetodoPagamento || 'Pix'
                            };
                            if (tx.description && tx.amount) {
                                financeService.addTransaction(tx);
                                count++;
                            }
                        });
                        onSuccess(`${count} transações importadas com sucesso.`);
                        window.location.reload();
                        return;
                    } catch (e) {
                        onError('Erro ao importar financeiro.');
                        return;
                    }
                }

                onError('Formato de arquivo não reconhecido. Use colunas padrão.');
            },
            error: (err) => {
                onError(`Erro de interpretação: ${err.message}`);
            }
        });
    }
};

function downloadCSV(csv: string, filename: string) {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}
