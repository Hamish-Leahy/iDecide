import { create } from 'zustand';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email: string;
}

interface MedicalInfo {
  bloodType: string;
  allergies: string;
  conditions: string;
  medications: string;
}

interface NFCCard {
  id: string;
  name: string;
  type: 'emergency' | 'medical' | 'contact';
  status: 'active' | 'inactive';
  lastUsed?: string;
  emergencyContact: EmergencyContact;
  medicalInfo: MedicalInfo;
  createdAt: string;
  updatedAt: string;
}

interface NFCStore {
  cards: NFCCard[];
  isLoading: boolean;
  error: string | null;
  fetchCards: () => Promise<void>;
  addCard: (card: Omit<NFCCard, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateCard: (id: string, updates: Partial<NFCCard>) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  getCardById: (id: string) => NFCCard | null;
}

export const useNFCStore = create<NFCStore>((set, get) => ({
  cards: [],
  isLoading: false,
  error: null,

  fetchCards: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data: emergencyIds, error: emergencyIdsError } = await supabase
        .from('emergency_ids')
        .select(`
          *,
          emergency_contacts (*),
          medical_info (*)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (emergencyIdsError) throw emergencyIdsError;

      const cards = emergencyIds.map((id: any) => ({
        id: id.id,
        name: id.name,
        type: id.type,
        status: id.status,
        lastUsed: id.last_used,
        emergencyContact: id.emergency_contacts[0] || {},
        medicalInfo: {
          bloodType: id.medical_info[0]?.blood_type || '',
          allergies: id.medical_info[0]?.allergies || '',
          conditions: id.medical_info[0]?.conditions || '',
          medications: id.medical_info[0]?.medications || '',
          ...id.medical_info[0]?.medical_info || {}
        },
        createdAt: id.created_at,
        updatedAt: id.updated_at,
      }));

      set({ cards, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  addCard: async (card) => {
    set({ isLoading: true, error: null });
    try {
      // Insert emergency ID
      const { data: emergencyId, error: emergencyIdError } = await supabase
        .from('emergency_ids')
        .insert({
          name: card.name,
          type: card.type,
          status: 'active',
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (emergencyIdError) throw emergencyIdError;

      // Insert emergency contact
      if (card.emergencyContact) {
        const { error: contactError } = await supabase
          .from('emergency_contacts')
          .insert({
            emergency_id_id: emergencyId.id,
            ...card.emergencyContact,
          });

        if (contactError) throw contactError;
      }

      // Insert medical info
      if (card.medicalInfo) {
        const { error: medicalError } = await supabase
          .from('medical_info')
          .insert({
            emergency_id_id: emergencyId.id,
            blood_type: card.medicalInfo.bloodType,
            allergies: card.medicalInfo.allergies,
            conditions: card.medicalInfo.conditions,
            medications: card.medicalInfo.medications,
            medical_info: card.medicalInfo
          });

        if (medicalError) throw medicalError;
      }

      // Refresh cards
      await get().fetchCards();
      
      return emergencyId.id;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateCard: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      // Update emergency ID
      const { error: emergencyIdError } = await supabase
        .from('emergency_ids')
        .update({
          name: updates.name,
          type: updates.type,
          status: updates.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (emergencyIdError) throw emergencyIdError;

      // Update emergency contact if provided
      if (updates.emergencyContact) {
        const { error: contactError } = await supabase
          .from('emergency_contacts')
          .upsert({
            emergency_id_id: id,
            ...updates.emergencyContact,
            updated_at: new Date().toISOString()
          });

        if (contactError) throw contactError;
      }

      // Update medical info if provided
      if (updates.medicalInfo) {
        const { error: medicalError } = await supabase
          .from('medical_info')
          .upsert({
            emergency_id_id: id,
            blood_type: updates.medicalInfo.bloodType,
            allergies: updates.medicalInfo.allergies,
            conditions: updates.medicalInfo.conditions,
            medications: updates.medicalInfo.medications,
            medical_info: updates.medicalInfo,
            updated_at: new Date().toISOString()
          });

        if (medicalError) throw medicalError;
      }

      // Refresh cards
      await get().fetchCards();
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  deleteCard: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('emergency_ids')
        .update({ status: 'inactive' })
        .eq('id', id);

      if (error) throw error;

      // Refresh cards
      await get().fetchCards();
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  getCardById: (id) => {
    return get().cards.find(card => card.id === id) || null;
  },
}));

// Initialize by fetching cards
useNFCStore.getState().fetchCards();