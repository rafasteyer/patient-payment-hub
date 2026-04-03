export type PatientStatus = 'active' | 'inactive';
export type TransactionType = 'income' | 'expense';
export type PaymentStatus = 'paid' | 'pending';

export interface Patient {
    id: string; // Identifier
    amount?: string | null; // Valor
    name?: string | null;
    cardNumber?: string | null; // Carteirinha
    cpf?: string | null;
    birthDate?: string | null; // Data de Nascimento
    motherName?: string | null; // Nome da Mãe
    holder?: string | null; // Titular
    healthPlan?: string | null; // Plano
    guideExpiration?: string | null; // Vencimento da Guia
    
    // Older fields we might want to keep or just drop them.
    // The user mentioned: Valor | Nome | Carteirinha | CPF | Data Nascimento | Idade | Nome da Mãe | Titular | Plano | Vencimento da Guia
    // Idade will be calculated dynamically.
    status?: PatientStatus;
    lastSessionDate?: string | null;
    createdAt?: string;
}

export interface Transaction {
    id: string;
    date: string;
    description: string;
    category: TransactionType;
    amount: number;
    professional: string;
    paymentMethod: string;
    createdAt: string;
}

export interface Goal {
    id: string;
    month: string; // YYYY-MM
    revenueGoal: number;
    newPatientsGoal: number;
}
