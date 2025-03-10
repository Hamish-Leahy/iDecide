import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DigitalAsset {
  id: string;
  category: 'passwords' | 'bank-accounts' | 'crypto' | 'notes';
  title: string;
  username?: string;
  password?: string;
  url?: string;
  accountNumber?: string;
  routingNumber?: string;
  bankName?: string;
  walletAddress?: string;
  network?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

interface DigitalAssetsState {
  assets: DigitalAsset[];
  vaultCode: string | null;
  isVaultLocked: boolean;
  addAsset: (asset: Omit<DigitalAsset, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateAsset: (id: string, updates: Partial<DigitalAsset>) => void;
  deleteAsset: (id: string) => void;
  setVaultCode: (code: string) => void;
  unlockVault: (code: string) => boolean;
  lockVault: () => void;
}

export const useDigitalAssetsStore = create<DigitalAssetsState>()(
  persist(
    (set, get) => ({
      assets: [],
      vaultCode: null,
      isVaultLocked: true,

      addAsset: (asset) => {
        const timestamp = new Date().toISOString();
        set((state) => ({
          assets: [
            ...state.assets,
            {
              ...asset,
              id: crypto.randomUUID(),
              createdAt: timestamp,
              updatedAt: timestamp,
            },
          ],
        }));
      },

      updateAsset: (id, updates) => {
        set((state) => ({
          assets: state.assets.map((asset) =>
            asset.id === id
              ? { ...asset, ...updates, updatedAt: new Date().toISOString() }
              : asset
          ),
        }));
      },

      deleteAsset: (id) => {
        set((state) => ({
          assets: state.assets.filter((asset) => asset.id !== id),
        }));
      },

      setVaultCode: (code) => {
        set({ vaultCode: code, isVaultLocked: false });
      },

      unlockVault: (code) => {
        const state = get();
        if (code === state.vaultCode) {
          set({ isVaultLocked: false });
          return true;
        }
        return false;
      },

      lockVault: () => {
        set({ isVaultLocked: true });
      },
    }),
    {
      name: 'digital-assets-storage',
      partialize: (state) => ({
        assets: state.assets,
        vaultCode: state.vaultCode,
        isVaultLocked: true, // Always start locked
      }),
    }
  )
);