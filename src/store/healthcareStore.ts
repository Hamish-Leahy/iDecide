import { create } from 'zustand';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface HealthcareContact {
  id: string;
  type: 'primary_care' | 'healthcare_agent' | 'emergency';
  name: string;
  relationship?: string;
  specialty?: string;
  organization?: string;
  phone: string;
  email: string;
  address?: string;
  notes?: string;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

interface MedicalCondition {
  id: string;
  condition: string;
  diagnosisDate: string;
  treatingPhysicianId: string;
  status: 'active' | 'resolved' | 'managed';
  treatmentNotes?: string;
  createdAt: string;
  updatedAt: string;
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  prescribingPhysicianId: string;
  startDate: string;
  endDate?: string;
  purpose?: string;
  sideEffects?: string;
  isCurrent: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Allergy {
  id: string;
  allergen: string;
  reaction: string;
  severity: 'mild' | 'moderate' | 'severe';
  diagnosisDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface HealthcareStore {
  contacts: HealthcareContact[];
  conditions: MedicalCondition[];
  medications: Medication[];
  allergies: Allergy[];
  isLoading: boolean;
  error: string | null;

  // Contact management
  fetchContacts: () => Promise<void>;
  addContact: (contact: Omit<HealthcareContact, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateContact: (id: string, updates: Partial<HealthcareContact>) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;

  // Medical conditions
  fetchConditions: () => Promise<void>;
  addCondition: (condition: Omit<MedicalCondition, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCondition: (id: string, updates: Partial<MedicalCondition>) => Promise<void>;
  deleteCondition: (id: string) => Promise<void>;

  // Medications
  fetchMedications: () => Promise<void>;
  addMedication: (medication: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateMedication: (id: string, updates: Partial<Medication>) => Promise<void>;
  deleteMedication: (id: string) => Promise<void>;

  // Allergies
  fetchAllergies: () => Promise<void>;
  addAllergy: (allergy: Omit<Allergy, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateAllergy: (id: string, updates: Partial<Allergy>) => Promise<void>;
  deleteAllergy: (id: string) => Promise<void>;
}

export const useHealthcareStore = create<HealthcareStore>((set, get) => ({
  contacts: [],
  conditions: [],
  medications: [],
  allergies: [],
  isLoading: false,
  error: null,

  fetchContacts: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('healthcare_contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ contacts: data || [], isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  addContact: async (contact) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('healthcare_contacts')
        .insert([contact]);

      if (error) throw error;
      await get().fetchContacts();
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  updateContact: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('healthcare_contacts')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      await get().fetchContacts();
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  deleteContact: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('healthcare_contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await get().fetchContacts();
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchConditions: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('medical_history')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ conditions: data || [], isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  addCondition: async (condition) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('medical_history')
        .insert([condition]);

      if (error) throw error;
      await get().fetchConditions();
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  updateCondition: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('medical_history')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      await get().fetchConditions();
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  deleteCondition: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('medical_history')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await get().fetchConditions();
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchMedications: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ medications: data || [], isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  addMedication: async (medication) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('medications')
        .insert([medication]);

      if (error) throw error;
      await get().fetchMedications();
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  updateMedication: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('medications')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      await get().fetchMedications();
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  deleteMedication: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('medications')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await get().fetchMedications();
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchAllergies: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('allergies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ allergies: data || [], isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  addAllergy: async (allergy) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('allergies')
        .insert([allergy]);

      if (error) throw error;
      await get().fetchAllergies();
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  updateAllergy: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('allergies')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      await get().fetchAllergies();
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  deleteAllergy: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('allergies')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await get().fetchAllergies();
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
}));

// Initialize by fetching all data
useHealthcareStore.getState().fetchContacts();
useHealthcareStore.getState().fetchConditions();
useHealthcareStore.getState().fetchMedications();
useHealthcareStore.getState().fetchAllergies();