import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Beneficiary {
  id: string;
  type: 'primary' | 'contingent';
  fullName: string;
  relationship: string;
  dateOfBirth: string;
  ssn: string;
  email: string;
  phone: string;
  address: string;
  percentage: number;
  createdAt: string;
  updatedAt: string;
}

export interface Asset {
  id: string;
  name: string;
  type: string;
  value: string;
  beneficiaries: Beneficiary[];
}

interface ChangeLogEntry {
  id: string;
  assetId: string;
  beneficiaryId: string;
  action: 'add' | 'update' | 'remove';
  changes: Record<string, any>;
  timestamp: string;
}

interface BeneficiaryStore {
  assets: Asset[];
  changeLog: ChangeLogEntry[];
  addAsset: (asset: Omit<Asset, 'id' | 'beneficiaries'>) => string;
  updateAsset: (id: string, updates: Partial<Asset>) => void;
  removeAsset: (id: string) => void;
  addBeneficiary: (assetId: string, beneficiary: Omit<Beneficiary, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateBeneficiary: (assetId: string, beneficiaryId: string, updates: Partial<Beneficiary>) => void;
  removeBeneficiary: (assetId: string, beneficiaryId: string) => void;
  validateBeneficiaryPercentages: (assetId: string) => boolean;
  getChangeHistory: (assetId?: string, beneficiaryId?: string) => ChangeLogEntry[];
}

export const useBeneficiaryStore = create<BeneficiaryStore>()(
  persist(
    (set, get) => ({
      assets: [
        {
          id: '1',
          name: 'Retirement Account',
          type: '401(k)',
          value: '$500,000',
          beneficiaries: [],
        },
        {
          id: '2',
          name: 'Life Insurance Policy',
          type: 'Term Life',
          value: '$1,000,000',
          beneficiaries: [],
        },
      ],
      changeLog: [],

      addAsset: (asset) => {
        const id = crypto.randomUUID();
        set((state) => ({
          assets: [...state.assets, { ...asset, id, beneficiaries: [] }],
        }));
        return id;
      },

      updateAsset: (id, updates) => {
        set((state) => ({
          assets: state.assets.map((asset) =>
            asset.id === id ? { ...asset, ...updates } : asset
          ),
        }));
      },

      removeAsset: (id) => {
        set((state) => ({
          assets: state.assets.filter((asset) => asset.id !== id),
        }));
      },

      addBeneficiary: (assetId, beneficiary) => {
        const id = crypto.randomUUID();
        const timestamp = new Date().toISOString();
        
        set((state) => {
          const newBeneficiary = {
            ...beneficiary,
            id,
            createdAt: timestamp,
            updatedAt: timestamp,
          };

          const newAssets = state.assets.map((asset) => {
            if (asset.id === assetId) {
              return {
                ...asset,
                beneficiaries: [...asset.beneficiaries, newBeneficiary],
              };
            }
            return asset;
          });

          const logEntry: ChangeLogEntry = {
            id: crypto.randomUUID(),
            assetId,
            beneficiaryId: id,
            action: 'add',
            changes: newBeneficiary,
            timestamp,
          };

          return {
            assets: newAssets,
            changeLog: [...state.changeLog, logEntry],
          };
        });

        return id;
      },

      updateBeneficiary: (assetId, beneficiaryId, updates) => {
        const timestamp = new Date().toISOString();
        
        set((state) => {
          const newAssets = state.assets.map((asset) => {
            if (asset.id === assetId) {
              return {
                ...asset,
                beneficiaries: asset.beneficiaries.map((beneficiary) => {
                  if (beneficiary.id === beneficiaryId) {
                    return {
                      ...beneficiary,
                      ...updates,
                      updatedAt: timestamp,
                    };
                  }
                  return beneficiary;
                }),
              };
            }
            return asset;
          });

          const logEntry: ChangeLogEntry = {
            id: crypto.randomUUID(),
            assetId,
            beneficiaryId,
            action: 'update',
            changes: updates,
            timestamp,
          };

          return {
            assets: newAssets,
            changeLog: [...state.changeLog, logEntry],
          };
        });
      },

      removeBeneficiary: (assetId, beneficiaryId) => {
        const timestamp = new Date().toISOString();
        
        set((state) => {
          const asset = state.assets.find((a) => a.id === assetId);
          const beneficiary = asset?.beneficiaries.find((b) => b.id === beneficiaryId);

          const newAssets = state.assets.map((asset) => {
            if (asset.id === assetId) {
              return {
                ...asset,
                beneficiaries: asset.beneficiaries.filter(
                  (b) => b.id !== beneficiaryId
                ),
              };
            }
            return asset;
          });

          const logEntry: ChangeLogEntry = {
            id: crypto.randomUUID(),
            assetId,
            beneficiaryId,
            action: 'remove',
            changes: beneficiary || {},
            timestamp,
          };

          return {
            assets: newAssets,
            changeLog: [...state.changeLog, logEntry],
          };
        });
      },

      validateBeneficiaryPercentages: (assetId) => {
        const state = get();
        const asset = state.assets.find((a) => a.id === assetId);
        
        if (!asset) return false;

        const primaryBeneficiaries = asset.beneficiaries.filter(
          (b) => b.type === 'primary'
        );
        const contingentBeneficiaries = asset.beneficiaries.filter(
          (b) => b.type === 'contingent'
        );

        const primaryTotal = primaryBeneficiaries.reduce(
          (sum, b) => sum + b.percentage,
          0
        );
        const contingentTotal = contingentBeneficiaries.reduce(
          (sum, b) => sum + b.percentage,
          0
        );

        return primaryTotal === 100 && (contingentBeneficiaries.length === 0 || contingentTotal === 100);
      },

      getChangeHistory: (assetId, beneficiaryId) => {
        const state = get();
        let filteredLog = state.changeLog;

        if (assetId) {
          filteredLog = filteredLog.filter((entry) => entry.assetId === assetId);
        }

        if (beneficiaryId) {
          filteredLog = filteredLog.filter(
            (entry) => entry.beneficiaryId === beneficiaryId
          );
        }

        return filteredLog.sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
      },
    }),
    {
      name: 'beneficiary-storage',
    }
  )
);