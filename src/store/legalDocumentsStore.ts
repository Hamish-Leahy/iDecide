import { create } from 'zustand';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export type DocumentStatus = 'draft' | 'active' | 'needs_review' | 'expired' | 'revoked';

export interface LegalDocument {
  id: string;
  title: string;
  documentType: string;
  filePath: string;
  version: number;
  status: DocumentStatus;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  versionNumber: number;
  filePath: string;
  changes: string;
  createdBy: string;
  createdAt: string;
}

export interface DocumentMetadata {
  id: string;
  documentId: string;
  keyPoints: any[];
  extractedData: Record<string, any>;
  validationStatus: Record<string, any>;
}

interface LegalDocumentsStore {
  documents: LegalDocument[];
  versions: Record<string, DocumentVersion[]>;
  metadata: Record<string, DocumentMetadata>;
  isLoading: boolean;
  error: string | null;
  
  // Document management
  fetchDocuments: () => Promise<void>;
  uploadDocument: (file: File, type: string, metadata: any) => Promise<string>;
  updateDocument: (id: string, updates: Partial<LegalDocument>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  
  // Version control
  createVersion: (documentId: string, file: File, changes: string) => Promise<void>;
  getVersions: (documentId: string) => Promise<DocumentVersion[]>;
  
  // Metadata and extraction
  updateMetadata: (documentId: string, metadata: Partial<DocumentMetadata>) => Promise<void>;
  extractDocumentData: (file: File) => Promise<Record<string, any>>;
  validateDocument: (documentId: string) => Promise<Record<string, any>>;
  
  // Access control
  grantAccess: (documentId: string, userId: string, accessLevel: string) => Promise<void>;
  revokeAccess: (documentId: string, userId: string) => Promise<void>;

  // Task management
  fetchTasks: () => Promise<void>;
  addTask: (documentId: string, task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  completeTask: (taskId: string) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;

  // Review management
  scheduleReview: (documentId: string, reviewDate: Date) => Promise<void>;
  completeReview: (reviewId: string, notes: string) => Promise<void>;
  getUpcomingReviews: () => Promise<Review[]>;
}

export const useLegalDocumentsStore = create<LegalDocumentsStore>((set, get) => ({
  documents: [],
  versions: {},
  metadata: {},
  isLoading: false,
  error: null,

  fetchDocuments: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data: documents, error } = await supabase
        .from('legal_documents')
        .select(`
          *,
          document_versions (*),
          document_metadata (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Process and organize the data
      const versions: Record<string, DocumentVersion[]> = {};
      const metadata: Record<string, DocumentMetadata> = {};

      documents.forEach((doc: any) => {
        if (doc.document_versions) {
          versions[doc.id] = doc.document_versions;
        }
        if (doc.document_metadata?.[0]) {
          metadata[doc.id] = doc.document_metadata[0];
        }
      });

      set({
        documents,
        versions,
        metadata,
        isLoading: false
      });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  uploadDocument: async (file: File, type: string, metadata: any) => {
    set({ isLoading: true, error: null });
    try {
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('legal-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Create document record
      const { data: document, error: docError } = await supabase
        .from('legal_documents')
        .insert({
          title: file.name,
          document_type: type,
          file_path: filePath,
          file_hash: await computeFileHash(file),
          metadata
        })
        .select()
        .single();

      if (docError) throw docError;

      // Extract and store metadata
      const extractedData = await get().extractDocumentData(file);
      const { error: metaError } = await supabase
        .from('document_metadata')
        .insert({
          document_id: document.id,
          extracted_data: extractedData
        });

      if (metaError) throw metaError;

      await get().fetchDocuments();
      return document.id;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateDocument: async (id: string, updates: Partial<LegalDocument>) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('legal_documents')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      await get().fetchDocuments();
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  deleteDocument: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('legal_documents')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await get().fetchDocuments();
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  createVersion: async (documentId: string, file: File, changes: string) => {
    set({ isLoading: true, error: null });
    try {
      // Upload new version file
      const fileExt = file.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('legal-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get current version number
      const { data: currentDoc } = await supabase
        .from('legal_documents')
        .select('version')
        .eq('id', documentId)
        .single();

      const newVersion = (currentDoc?.version || 0) + 1;

      // Create version record
      const { error: versionError } = await supabase
        .from('document_versions')
        .insert({
          document_id: documentId,
          version_number: newVersion,
          file_path: filePath,
          file_hash: await computeFileHash(file),
          changes
        });

      if (versionError) throw versionError;

      // Update document version
      const { error: updateError } = await supabase
        .from('legal_documents')
        .update({ version: newVersion })
        .eq('id', documentId);

      if (updateError) throw updateError;

      await get().fetchDocuments();
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  getVersions: async (documentId: string) => {
    try {
      const { data, error } = await supabase
        .from('document_versions')
        .select('*')
        .eq('document_id', documentId)
        .order('version_number', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error: any) {
      set({ error: error.message });
      return [];
    }
  },

  updateMetadata: async (documentId: string, metadata: Partial<DocumentMetadata>) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('document_metadata')
        .upsert({
          document_id: documentId,
          ...metadata
        });

      if (error) throw error;
      await get().fetchDocuments();
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  extractDocumentData: async (file: File) => {
    // This would integrate with a document parsing service
    // For now, return placeholder data
    return {
      title: file.name,
      date: new Date().toISOString(),
      type: file.type,
      size: file.size
    };
  },

  validateDocument: async (documentId: string) => {
    set({ isLoading: true, error: null });
    try {
      const document = get().documents.find(d => d.id === documentId);
      if (!document) throw new Error('Document not found');

      // Perform validation checks
      const validationResults = {
        hasRequiredFields: true,
        hasValidSignatures: true,
        isComplete: true,
        issues: []
      };

      await get().updateMetadata(documentId, {
        validationStatus: validationResults
      });

      return validationResults;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return {
        hasRequiredFields: false,
        hasValidSignatures: false,
        isComplete: false,
        issues: [error.message]
      };
    }
  },

  grantAccess: async (documentId: string, userId: string, accessLevel: string) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('document_access')
        .insert({
          document_id: documentId,
          user_id: userId,
          access_level: accessLevel
        });

      if (error) throw error;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  revokeAccess: async (documentId: string, userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('document_access')
        .delete()
        .eq('document_id', documentId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('legal_document_tasks')
        .select('*')
        .order('due_date', { ascending: true });

      if (error) throw error;
      set({ tasks: data || [], isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  addTask: async (documentId, task) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('legal_document_tasks')
        .insert([{ ...task, document_id: documentId }]);

      if (error) throw error;
      await get().fetchTasks();
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  updateTask: async (taskId, updates) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('legal_document_tasks')
        .update(updates)
        .eq('id', taskId);

      if (error) throw error;
      await get().fetchTasks();
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  completeTask: async (taskId) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('legal_document_tasks')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) throw error;
      await get().fetchTasks();
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  deleteTask: async (taskId) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('legal_document_tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      await get().fetchTasks();
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  scheduleReview: async (documentId, reviewDate) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('legal_document_reviews')
        .insert([{
          document_id: documentId,
          review_date: reviewDate.toISOString().split('T')[0]
        }]);

      if (error) throw error;
      
      // Update document next review date
      await supabase
        .from('legal_documents')
        .update({ next_review_date: reviewDate.toISOString().split('T')[0] })
        .eq('id', documentId);

    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  completeReview: async (reviewId, notes) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('legal_document_reviews')
        .update({
          status: 'completed',
          notes,
          completed_at: new Date().toISOString()
        })
        .eq('id', reviewId);

      if (error) throw error;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  getUpcomingReviews: async () => {
    try {
      const { data, error } = await supabase
        .from('legal_document_reviews')
        .select(`
          *,
          legal_documents (
            title,
            document_type
          )
        `)
        .eq('status', 'scheduled')
        .order('review_date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      set({ error: error.message });
      return [];
    }
  }
}));

// Helper function to compute file hash
async function computeFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Initialize by fetching documents
useLegalDocumentsStore.getState().fetchDocuments();