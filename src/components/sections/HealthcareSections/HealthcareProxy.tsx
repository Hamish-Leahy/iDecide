import React, { useState } from 'react';
import { UserCheck, Upload, Download, Eye, Edit, Trash2, Plus } from 'lucide-react';
import FileUpload from '../../FileUpload/FileUpload';
import PDFPreview from '../../PDFPreview/PDFPreview';
import EmptyState from './EmptyState';
import ContactForm from './ContactForm';
import { useHealthcareStore } from '../../../store/healthcareStore';

const HealthcareProxy = () => {
  const [showUpload, setShowUpload] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  
  const { contacts, addContact } = useHealthcareStore();
  const proxyContacts = contacts.filter(c => c.type === 'healthcare_agent');

  const handleFileUpload = (files: File[]) => {
    if (files.length > 0) {
      setSelectedFile(files[0]);
      setShowUpload(false);
      setShowPreview(true);
    }
  };

  const handleAddContact = async (data: any) => {
    try {
      await addContact(data);
      setShowContactForm(false);
    } catch (error) {
      console.error('Failed to add contact:', error);
    }
  };

  if (proxyContacts.length === 0) {
    return (
      <EmptyState
        title="No Healthcare Proxy Designated"
        description="Designate someone you trust to make healthcare decisions on your behalf if you're unable to do so."
        buttonText="Add Healthcare Proxy"
        onAction={() => setShowContactForm(true)}
        icon={UserCheck}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-[#2D5959]">Healthcare Proxy</h2>
        <div className="flex gap-4">
          <button
            onClick={() => setShowContactForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#2D5959] text-white rounded-lg hover:bg-opacity-90"
          >
            <Plus className="w-4 h-4" />
            Add Proxy
          </button>
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 px-4 py-2 border border-[#2D5959] text-[#2D5959] rounded-lg hover:bg-[#B5D3D3] hover:bg-opacity-20"
          >
            <Upload className="w-4 h-4" />
            Upload Document
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {proxyContacts.map((contact) => (
          <div key={contact.id} className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#B5D3D3] rounded-lg">
                  <UserCheck className="w-6 h-6 text-[#2D5959]" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{contact.name}</h3>
                  <p className="text-gray-600">{contact.relationship}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <Edit className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <Trash2 className="w-5 h-5 text-red-500" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <p className="flex items-center gap-2">
                <span className="text-gray-600">Phone:</span>
                <span>{contact.phone}</span>
              </p>
              {contact.email && (
                <p className="flex items-center gap-2">
                  <span className="text-gray-600">Email:</span>
                  <span>{contact.email}</span>
                </p>
              )}
              {contact.address && (
                <p className="flex items-center gap-2">
                  <span className="text-gray-600">Address:</span>
                  <span>{contact.address}</span>
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl">
            <div className="p-6">
              <FileUpload
                onUpload={handleFileUpload}
                maxFiles={1}
                acceptedFileTypes={['application/pdf']}
              />
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-6">
              <PDFPreview
                file={selectedFile}
                onFileChange={setSelectedFile}
                onError={(error) => console.error(error)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Contact Form Modal */}
      {showContactForm && (
        <ContactForm
          onSubmit={handleAddContact}
          onClose={() => setShowContactForm(false)}
        />
      )}
    </div>
  );
};

export default HealthcareProxy;