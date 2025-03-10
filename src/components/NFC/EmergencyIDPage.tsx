import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Phone, Mail, Heart, AlertCircle, User, Loader2 } from 'lucide-react';
import { useNFCStore } from '../../store/nfcStore';

interface EmergencyData {
  id: string;
  name: string;
  type: 'emergency' | 'medical' | 'contact';
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    email: string;
  };
  medicalInfo: {
    bloodType: string;
    allergies: string;
    conditions: string;
    medications: string;
  };
}

const EmergencyIDPage = () => {
  const { id } = useParams<{ id: string }>();
  const { getCardById } = useNFCStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<EmergencyData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) {
          throw new Error('No emergency ID provided');
        }

        const cardData = getCardById(id);
        if (!cardData) {
          throw new Error('Emergency ID not found');
        }

        setData(cardData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, getCardById]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#2D5959] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading emergency information...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Emergency ID Not Found
          </h1>
          <p className="text-gray-600">
            {error || 'This emergency ID card may have been deactivated or does not exist.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-[#2D5959] p-6 text-white">
            <h1 className="text-2xl font-bold mb-2">Emergency Information</h1>
            <p className="opacity-90">This is an emergency contact card for {data.name}</p>
          </div>

          {/* Emergency Contact */}
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-[#2D5959]" />
              Emergency Contact
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-gray-600">Name</p>
                <p className="font-medium">{data.emergencyContact.name}</p>
              </div>
              <div>
                <p className="text-gray-600">Relationship</p>
                <p className="font-medium">{data.emergencyContact.relationship}</p>
              </div>
              <div className="flex gap-4">
                {data.emergencyContact.phone && (
                  <a
                    href={`tel:${data.emergencyContact.phone}`}
                    className="flex items-center gap-2 px-4 py-2 bg-[#2D5959] text-white rounded-lg hover:bg-opacity-90"
                  >
                    <Phone className="w-4 h-4" />
                    Call
                  </a>
                )}
                {data.emergencyContact.email && (
                  <a
                    href={`mailto:${data.emergencyContact.email}`}
                    className="flex items-center gap-2 px-4 py-2 border border-[#2D5959] text-[#2D5959] rounded-lg hover:bg-gray-50"
                  >
                    <Mail className="w-4 h-4" />
                    Email
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Medical Information */}
          {data.type !== 'contact' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-[#2D5959]" />
                Medical Information
              </h2>
              <div className="space-y-4">
                {data.medicalInfo.bloodType && (
                  <div>
                    <p className="text-gray-600">Blood Type</p>
                    <p className="font-medium">{data.medicalInfo.bloodType}</p>
                  </div>
                )}
                {data.medicalInfo.allergies && (
                  <div>
                    <p className="text-gray-600">Allergies</p>
                    <p className="font-medium">{data.medicalInfo.allergies}</p>
                  </div>
                )}
                {data.medicalInfo.conditions && (
                  <div>
                    <p className="text-gray-600">Medical Conditions</p>
                    <p className="font-medium">{data.medicalInfo.conditions}</p>
                  </div>
                )}
                {data.medicalInfo.medications && (
                  <div>
                    <p className="text-gray-600">Current Medications</p>
                    <p className="font-medium">{data.medicalInfo.medications}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          This emergency information card was created with iDecide
        </p>
      </div>
    </div>
  );
};

export default EmergencyIDPage;