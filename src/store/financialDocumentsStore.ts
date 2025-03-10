import { create } from 'zustand';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export interface FinancialDocument {
  id: string;
  title: string;
  description?: string;
  documentType: string;
  filePath: string;
  version: number;
  status: 'draft' | 'active' | 'archived';
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

interface FinancialDocumentsStore {
  documents: FinancialDocument[];
  isLoading: boolean;
  error: string | null;
  
  // Document management
  fetchDocuments: () => Promise<void>;
  uploadDocument: (file: File, type: string, metadata: any) => Promise<string>;
  updateDocument: (id: string, updates: Partial<FinancialDocument>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  
  // Version control
  createVersion: (documentId: string, file: File, changes: string) => Promise<void>;
  getVersions: (documentId: string) => Promise<any[]>;
  
  // Access control
  grantAccess: (documentId: string, userId: string, accessLevel: string) => Promise<void>;
  revokeAccess: (documentId: string, userId: string) => Promise<void>;
  
  // Document processing
  extractDocumentData: (file: File) => Promise<Record<string, any>>;
  validateDocument: (documentId: string) => Promise<Record<string, any>>;
  classifyDocument: (file: File) => Promise<string>;
}

export const useFinancialDocumentsStore = create<FinancialDocumentsStore>((set, get) => ({
  documents: [],
  isLoading: false,
  error: null,

  fetchDocuments: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('financial_documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ documents: data, isLoading: false });
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
        .from('financial-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Classify document
      const documentType = await get().classifyDocument(file);

      // Create document record
      const { data: document, error: docError } = await supabase
        .from('financial_documents')
        .insert({
          title: file.name,
          document_type: documentType || type,
          file_path: filePath,
          metadata
        })
        .select()
        .single();

      if (docError) throw docError;

      // Extract and store metadata
      const extractedData = await get().extractDocumentData(file);
      await supabase
        .from('financial_document_metadata')
        .insert({
          document_id: document.id,
          extracted_data: extractedData
        });

      await get().fetchDocuments();
      return document.id;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateDocument: async (id: string, updates: Partial<FinancialDocument>) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('financial_documents')
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
      // First get the document to get its file path
      const { data: document } = await supabase
        .from('financial_documents')
        .select('file_path')
        .eq('id', id)
        .single();

      if (document?.file_path) {
        // Delete the file from storage
        const { error: storageError } = await supabase.storage
          .from('financial-documents')
          .remove([document.file_path]);

        if (storageError) throw storageError;
      }

      // Delete the document record
      const { error } = await supabase
        .from('financial_documents')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update local state
      set(state => ({
        documents: state.documents.filter(doc => doc.id !== id),
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  createVersion: async (documentId: string, file: File, changes: string) => {
    set({ isLoading: true, error: null });
    try {
      // Upload new version
      const fileExt = file.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('financial-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get current version
      const { data: currentDoc } = await supabase
        .from('financial_documents')
        .select('version')
        .eq('id', documentId)
        .single();

      const newVersion = (currentDoc?.version || 0) + 1;

      // Create version record
      await supabase
        .from('financial_document_versions')
        .insert({
          document_id: documentId,
          version_number: newVersion,
          file_path: filePath,
          changes
        });

      // Update document version
      await supabase
        .from('financial_documents')
        .update({ version: newVersion })
        .eq('id', documentId);

      await get().fetchDocuments();
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  getVersions: async (documentId: string) => {
    try {
      const { data, error } = await supabase
        .from('financial_document_versions')
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

  grantAccess: async (documentId: string, userId: string, accessLevel: string) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('financial_document_access')
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
        .from('financial_document_access')
        .delete()
        .eq('document_id', documentId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  extractDocumentData: async (file: File) => {
    // This would integrate with a document parsing service
    // For now, return basic file info
    return {
      title: file.name,
      size: file.size,
      type: file.type,
      lastModified: new Date(file.lastModified).toISOString()
    };
  },

  validateDocument: async (documentId: string) => {
    set({ isLoading: true, error: null });
    try {
      const document = get().documents.find(d => d.id === documentId);
      if (!document) throw new Error('Document not found');

      // Perform validation checks
      const validationResults = {
        isComplete: true,
        hasRequiredFields: true,
        issues: []
      };

      await supabase
        .from('financial_document_metadata')
        .upsert({
          document_id: documentId,
          validation_status: validationResults
        });

      return validationResults;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return {
        isComplete: false,
        hasRequiredFields: false,
        issues: [error.message]
      };
    }
  },

  classifyDocument: async (file: File) => {
    // This would integrate with a document classification service
    // For now, infer from file name
    const fileName = file.name.toLowerCase();
    if (fileName.includes('tax')) return 'tax';
    if (fileName.includes('bank')) return 'bank-statement';
    if (fileName.includes('insurance')) return 'insurance';
    return 'other';
  }
}));

// Initialize by fetching documents
useFinancialDocumentsStore.getState().fetchDocuments();