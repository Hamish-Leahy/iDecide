import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LegalChange {
  id: string;
  section: string;
  action: string;
  details: string;
  timestamp: string;
}

interface LegalChangesStore {
  changes: LegalChange[];
  addChange: (change: Omit<LegalChange, 'id' | 'timestamp'>) => void;
  clearChanges: () => void;
}

export const useLegalChangesStore = create<LegalChangesStore>()(
  persist(
    (set) => ({
      changes: [],
      addChange: (change) =>
        set((state) => ({
          changes: [
            {
              ...change,
              id: crypto.randomUUID(),
              timestamp: new Date().toISOString(),
            },
            ...state.changes,
          ].slice(0, 50), // Keep only the last 50 changes
        })),
      clearChanges: () => set({ changes: [] }),
    }),
    {
      name: 'legal-changes-storage',
    }
  )
);