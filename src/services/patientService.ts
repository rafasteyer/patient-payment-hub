import type { Patient } from '../types';
import { storage } from './storage';
import { MOCK_PATIENTS } from './mockData';

const PATIENTS_KEY = 'patients';

export const patientService = {
    getAll: (): Patient[] => {
        const data = storage.get<Patient[]>(PATIENTS_KEY);
        if (!data) {
            // Seed initial data
            storage.set(PATIENTS_KEY, MOCK_PATIENTS);
            return MOCK_PATIENTS;
        }
        return data;
    },

    add: (patient: Omit<Patient, 'id' | 'createdAt'>): Patient => {
        const patients = patientService.getAll();
        const newPatient: Patient = {
            ...patient,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
        };
        storage.set(PATIENTS_KEY, [...patients, newPatient]);
        return newPatient;
    },

    update: (id: string, updates: Partial<Patient>): Patient | null => {
        const patients = patientService.getAll();
        const index = patients.findIndex(p => p.id === id);
        if (index === -1) return null;

        const updated = { ...patients[index], ...updates };
        patients[index] = updated;
        storage.set(PATIENTS_KEY, patients);
        return updated;
    },

    delete: (id: string): void => {
        const patients = patientService.getAll();
        const filtered = patients.filter(p => p.id !== id);
        storage.set(PATIENTS_KEY, filtered);
    }
};
