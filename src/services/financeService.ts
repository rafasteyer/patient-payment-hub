import type { Transaction, Goal } from '../types';
import { storage } from './storage';
import { MOCK_TRANSACTIONS, MOCK_GOALS } from './mockData';

const TRANSACTIONS_KEY = 'transactions';
const GOALS_KEY = 'goals';

export const financeService = {
    getTransactions: (): Transaction[] => {
        const data = storage.get<Transaction[]>(TRANSACTIONS_KEY);
        if (!data) {
            storage.set(TRANSACTIONS_KEY, MOCK_TRANSACTIONS);
            return MOCK_TRANSACTIONS;
        }
        return data;
    },

    addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>): Transaction => {
        const transactions = financeService.getTransactions();
        const newTx: Transaction = {
            ...transaction,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
        };
        storage.set(TRANSACTIONS_KEY, [...transactions, newTx]);
        return newTx;
    },

    deleteTransaction: (id: string): void => {
        const transactions = financeService.getTransactions().filter(t => t.id !== id);
        storage.set(TRANSACTIONS_KEY, transactions);
    },

    updateTransaction: (id: string, updatedData: Partial<Transaction>): void => {
        const transactions = financeService.getTransactions();
        const index = transactions.findIndex(t => t.id === id);
        if (index >= 0) {
            transactions[index] = { ...transactions[index], ...updatedData };
            storage.set(TRANSACTIONS_KEY, transactions);
        }
    },

    getGoals: (): Goal[] => {
        const data = storage.get<Goal[]>(GOALS_KEY);
        if (!data) {
            storage.set(GOALS_KEY, MOCK_GOALS);
            return MOCK_GOALS;
        }
        return data;
    },

    updateGoal: (goal: Goal): void => {
        const goals = financeService.getGoals();
        const index = goals.findIndex(g => g.month === goal.month);
        if (index >= 0) {
            goals[index] = goal;
        } else {
            goals.push(goal);
        }
        storage.set(GOALS_KEY, goals);
    },

    // KPI Calculations
    getFinancialSummary: () => {
        const transactions = financeService.getTransactions();
        const income = transactions
            .filter(t => t.category === 'income')
            .reduce((acc, t) => acc + t.amount, 0);
        const expense = transactions
            .filter(t => t.category === 'expense')
            .reduce((acc, t) => acc + t.amount, 0);

        return {
            revenue: income,
            expenses: expense,
            netProfit: income - expense
        };
    }
};
