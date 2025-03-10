import React, { useState, useEffect } from 'react';
import { X, Smartphone, AlertCircle, Loader2 } from 'lucide-react';
import { useNFCStore } from '../../store/nfcStore';

interface NFCCardModalProps {
  card?: any;
  onClose: () => void;
}

const NFCCardModal: React.FC<NFCCardModalProps> = ({ card, onClose }) => {
  const { addCard, updateCard, cards } = useNFCStore();
  const [isWriting, setIsWriting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nfcStatus, setNfcStatus] = useState<'checking' | 'supported' | 'unsupported' | 'permission_needed'>('checking');
  const [writeStatus, setWriteStatus] = useState<'idle' | 'waiting' | 'writing' | 'success' | 'failed'>('idle');
  const [formData, setFormData] = useState({
    name: card?.name || '',
    type: card?.type || 'emergency',
    emergencyContact: {
      name: card?.emergencyContact?.name || '',
      relationship: card?.emergencyContact?.relationship || '',
      phone: card?.emergencyContact?.phone || '',
      email: card?.emergencyContact?.email || '',
    },
    medicalInfo: {
      bloodType: card?.medicalInfo?.bloodType || '',
      allergies: card?.medicalInfo?.allergies || '',
      conditions: card?.medicalInfo?.conditions || '',
      medications: card?.medicalInfo?.medications || '',
    }
  });

  useEffect(() => {
    const checkNFC = async () => {
      try {
        if (!('NDEFReader' in window)) {
          setNfcStatus('unsupported');
          return;
        }

        try {
          const ndef = new (window as any).NDEFReader();
          await ndef.scan();
          ndef.onreading = () => {};
          setNfcStatus('supported');
        } catch (err: any) {
          if (err.name === 'NotAllowedError') {
            setNfcStatus('permission_needed');
          } else if (err.name === 'NotReadableError' || err.name === 'NotSupportedError') {
            setNfcStatus('unsupported');
          } else {
            console.error('NFC Error:', err);
            setNfcStatus('unsupported');
          }
        }
      } catch (err) {
        console.error('NFC Check Error:', err);
        setNfcStatus('unsupported');
      }
    };

    checkNFC();
  }, []);

  useEffect(() => {
    if (!card && cards.length > 0) {
      const existingCard = cards[0];
      setFormData({
        name: existingCard.name,
        type: existingCard.type,
        emergencyContact: {
          name: existingCard.emergencyContact?.name || '',
          relationship: existingCard.emergencyContact?.relationship || '',
          phone: existingCard.emergencyContact?.phone || '',
          email: existingCard.emergencyContact?.email || '',
        },
        medicalInfo: {
          bloodType: existingCard.medicalInfo?.bloodType || '',
          allergies: existingCard.medicalInfo?.allergies || '',
          conditions: existingCard.medicalInfo?.conditions || '',
          medications: existingCard.medicalInfo?.medications || '',
        }
      });
    }
  }, [card, cards]);

  const requestNFCPermission = async () => {
    try {
      const ndef = new (window as any).NDEFReader();
      await ndef.scan();
      ndef.onreading = () => {};
      setNfcStatus('supported');
    } catch (err) {
      console.error('NFC Permission Error:', err);
      setNfcStatus('unsupported');
    }
  };

  const writeToNFC = async (cardId: string) => {
    let ndef: any;
    let abortController: AbortController | null = null;

    try {
      ndef = new (window as any).NDEFReader();
      setWriteStatus('waiting');
      setError(null);

      abortController = new AbortController();
      const signal = abortController.signal;

      const timeout = setTimeout(() => {
        abortController?.abort();
        setError('NFC scanning timed out. Please try again.');
        setWriteStatus('failed');
      }, 30000);

      await ndef.scan({ signal });
      
      // Use the /id/ path for the card URL
      const cardUrl = `${window.location.origin}/id/${cardId}`;
      
      ndef.onreading = async () => {
        try {
          setWriteStatus('writing');
          
          await ndef.write({
            records: [{
              recordType: "url",
              data: cardUrl
            }]
          });
          
          clearTimeout(timeout);
          setWriteStatus('success');
          
          setTimeout(() => {
            onClose();
          }, 1500);
          
        } catch (err: any) {
          console.error('NFC Write Error:', err);
          setError('Failed to write to NFC tag. Please try again and make sure the tag is properly positioned.');
          setWriteStatus('failed');
        }
      };

      ndef.onerror = (err: any) => {
        console.error('NFC Scan Error:', err);
        setError('Error scanning for NFC tag. Please make sure NFC is enabled and try again.');
        setWriteStatus('failed');
        clearTimeout(timeout);
      };

    } catch (err: any) {
      console.error('NFC Access Error:', err);
      if (err.name === 'AbortError') {
        setError('NFC scanning was cancelled. Please try again.');
      } else {
        setError('Failed to access NFC. Please ensure NFC is enabled and permissions are granted.');
      }
      setWriteStatus('failed');
    }

    return () => {
      if (abortController) {
        abortController.abort();
      }
      if (ndef) {
        ndef.onreading = null;
        ndef.onerror = null;
      }
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsWriting(true);

    try {
      if (nfcStatus === 'unsupported') {
        throw new Error('NFC is not supported on this device');
      }

      let cardId;
      if (card) {
        await updateCard(card.id, formData);
        cardId = card.id;
      } else {
        cardId = await addCard(formData);
      }

      await writeToNFC(cardId);
    } catch (err: any) {
      setError(err.message);
      setIsWriting(false);
      setWriteStatus('failed');
    }
  };

  const getStatusMessage = () => {
    switch (writeStatus) {
      case 'waiting':
        return 'Please tap your NFC card to the back of your phone';
      case 'writing':
        return 'Writing to NFC card... Please keep the card in place';
      case 'success':
        return 'Successfully wrote to NFC card!';
      case 'failed':
        return 'Failed to write to NFC card. Please try again.';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-xl font-semibold">
            {card ? 'Edit Emergency ID' : (cards.length > 0 ? 'Update Emergency ID' : 'Create Emergency ID')}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {nfcStatus === 'permission_needed' && (
            <div className="bg-yellow-50 text-yellow-700 p-4 m-6 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="font-medium">NFC Permission Required</p>
                <p className="text-sm">Please grant permission to use NFC on your device.</p>
                <button
                  onClick={requestNFCPermission}
                  className="mt-2 px-4 py-2 bg-yellow-100 rounded-lg hover:bg-yellow-200 transition-colors"
                >
                  Grant Permission
                </button>
              </div>
            </div>
          )}

          {nfcStatus === 'unsupported' && (
            <div className="bg-red-50 text-red-600 p-4 m-6 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="font-medium">NFC Not Available</p>
                <p className="text-sm">Please ensure NFC is enabled on your device and try again.</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 p-4 m-6 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {writeStatus !== 'idle' && (
            <div className="bg-blue-50 text-blue-600 p-4 m-6 rounded-lg flex items-center gap-2">
              {writeStatus === 'success' ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span>{getStatusMessage()}</span>
                </div>
              ) : (
                <>
                  <Loader2 className="w-5 h-5 animate-spin flex-shrink-0" />
                  <span>{getStatusMessage()}</span>
                </>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {!card && cards.length > 0 && (
              <div className="bg-blue-50 text-blue-600 p-4 rounded-lg">
                Using information from your existing Emergency ID. You can modify it before writing to the NFC card.
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Card Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5959]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Card Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5959]"
              >
                <option value="emergency">Emergency Contact</option>
                <option value="medical">Medical Information</option>
                <option value="contact">Contact Card</option>
              </select>
            </div>

            <div className="border-t pt-6">
              <h4 className="text-lg font-medium mb-4">Emergency Contact Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyContact.name}
                    onChange={(e) => setFormData({
                      ...formData,
                      emergencyContact: {
                        ...formData.emergencyContact,
                        name: e.target.value
                      }
                    })}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5959]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Relationship
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyContact.relationship}
                    onChange={(e) => setFormData({
                      ...formData,
                      emergencyContact: {
                        ...formData.emergencyContact,
                        relationship: e.target.value
                      }
                    })}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5959]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.emergencyContact.phone}
                    onChange={(e) => setFormData({
                      ...formData,
                      emergencyContact: {
                        ...formData.emergencyContact,
                        phone: e.target.value
                      }
                    })}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5959]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.emergencyContact.email}
                    onChange={(e) => setFormData({
                      ...formData,
                      emergencyContact: {
                        ...formData.emergencyContact,
                        email: e.target.value
                      }
                    })}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5959]"
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h4 className="text-lg font-medium mb-4">Medical Information</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Blood Type
                  </label>
                  <input
                    type="text"
                    value={formData.medicalInfo.bloodType}
                    onChange={(e) => setFormData({
                      ...formData,
                      medicalInfo: {
                        ...formData.medicalInfo,
                        bloodType: e.target.value
                      }
                    })}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5959]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Allergies
                  </label>
                  <textarea
                    value={formData.medicalInfo.allergies}
                    onChange={(e) => setFormData({
                      ...formData,
                      medicalInfo: {
                        ...formData.medicalInfo,
                        allergies: e.target.value
                      }
                    })}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5959]"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Medical Conditions
                  </label>
                  <textarea
                    value={formData.medicalInfo.conditions}
                    onChange={(e) => setFormData({
                      ...formData,
                      medicalInfo: {
                        ...formData.medicalInfo,
                        conditions: e.target.value
                      }
                    })}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5959]"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Medications
                  </label>
                  <textarea
                    value={formData.medicalInfo.medications}
                    onChange={(e) => setFormData({
                      ...formData,
                      medicalInfo: {
                        ...formData.medicalInfo,
                        medications: e.target.value
                      }
                    })}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5959]"
                    rows={2}
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="border-t p-6">
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isWriting || nfcStatus === 'unsupported'}
              className="px-4 py-2 bg-[#2D5959] text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 flex items-center gap-2"
            >
              {isWriting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Writing to NFC...
                </>
              ) : (
                <>
                  <Smartphone className="w-4 h-4" />
                  Write to NFC Card
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFCCardModal;