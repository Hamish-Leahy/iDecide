import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createClient } from '@supabase/supabase-js';
import { emailService } from '../services/emailService';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export type AccessLevel = 'admin' | 'executor' | 'viewer';

export interface AccessInvite {
  id: string;
  email: string;
  accessLevel: AccessLevel;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  expiresAt: string;
}

export interface AccessGrant {
  id: string;
  userId: string;
  grantedBy: string;
  accessLevel: AccessLevel;
  createdAt: string;
  revokedAt?: string;
}

interface AccessStore {
  invites: AccessInvite[];
  grants: AccessGrant[];
  sendInvite: (email: string, accessLevel: AccessLevel) => Promise<void>;
  acceptInvite: (inviteId: string) => Promise<void>;
  declineInvite: (inviteId: string) => Promise<void>;
  revokeAccess: (grantId: string) => Promise<void>;
  updateAccessLevel: (grantId: string, newLevel: AccessLevel) => Promise<void>;
}

export const useAccessStore = create<AccessStore>()(
  persist(
    (set, get) => ({
      invites: [],
      grants: [],

      sendInvite: async (email: string, accessLevel: AccessLevel) => {
        const invite: AccessInvite = {
          id: crypto.randomUUID(),
          email,
          accessLevel,
          status: 'pending',
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        };

        try {
          // Send invitation email
          await emailService.sendInviteEmail(email, accessLevel);

          // Update store with new invite
          set((state) => ({
            invites: [...state.invites, invite],
          }));
        } catch (error) {
          console.error('Failed to send invite:', error);
          throw error;
        }
      },

      acceptInvite: async (inviteId: string) => {
        const invite = get().invites.find((i) => i.id === inviteId);
        if (!invite || invite.status !== 'pending') return;

        const grant: AccessGrant = {
          id: crypto.randomUUID(),
          userId: crypto.randomUUID(), // This would come from the accepting user's auth
          grantedBy: 'system', // This would be the inviting user's ID
          accessLevel: invite.accessLevel,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          invites: state.invites.map((i) =>
            i.id === inviteId ? { ...i, status: 'accepted' } : i
          ),
          grants: [...state.grants, grant],
        }));
      },

      declineInvite: async (inviteId: string) => {
        set((state) => ({
          invites: state.invites.map((i) =>
            i.id === inviteId ? { ...i, status: 'declined' } : i
          ),
        }));
      },

      revokeAccess: async (grantId: string) => {
        set((state) => ({
          grants: state.grants.map((g) =>
            g.id === grantId
              ? { ...g, revokedAt: new Date().toISOString() }
              : g
          ),
        }));
      },

      updateAccessLevel: async (grantId: string, newLevel: AccessLevel) => {
        set((state) => ({
          grants: state.grants.map((g) =>
            g.id === grantId ? { ...g, accessLevel: newLevel } : g
          ),
        }));
      },
    }),
    {
      name: 'access-storage',
    }
  )
);