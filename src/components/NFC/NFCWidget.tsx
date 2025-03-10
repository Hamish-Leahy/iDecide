import React, { useState } from 'react';
import { Nfc, Plus, Edit, Trash2, QrCode, AlertCircle } from 'lucide-react';
import { useNFCStore } from '../../store/nfcStore';
import NFCCardModal from './NFCCardModal';

interface NFCCard {
  id: string;
  name: string;
  type: 'emergency' | 'medical' | 'contact';
  status: 'active' | 'inactive';
  lastUsed?: string;
}

const NFCWidget = () => {
  const { cards, deleteCard } = useNFCStore();
  const [showModal, setShowModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState<NFCCard | null>(null);

  const handleCreateCard = () => {
    setSelectedCard(null);
    setShowModal(true);
  };

  const handleEditCard = (card: NFCCard) => {
    setSelectedCard(card);
    setShowModal(true);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm mt-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Emergency IDs</h3>
        <button
          onClick={handleCreateCard}
          className="w-8 h-8 flex items-center justify-center rounded-full text-[#2D5959] hover:bg-[#2D5959] hover:text-white transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        {cards.length === 0 ? (
          <div className="text-center py-6">
            <div className="flex justify-center mb-3">
              <Nfc className="w-12 h-12 text-gray-400" />
            </div>
            <p className="text-gray-500">No emergency IDs configured</p>
            <button
              onClick={handleCreateCard}
              className="mt-4 text-[#2D5959] hover:text-[#85B1B1]"
            >
              Create your first emergency ID
            </button>
          </div>
        ) : (
          cards.map((card) => (
            <div
              key={card.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#B5D3D3] rounded-lg">
                  {card.type === 'emergency' ? (
                    <AlertCircle className="w-5 h-5 text-[#2D5959]" />
                  ) : card.type === 'medical' ? (
                    <QrCode className="w-5 h-5 text-[#2D5959]" />
                  ) : (
                    <Nfc className="w-5 h-5 text-[#2D5959]" />
                  )}
                </div>
                <div>
                  <h4 className="font-medium">{card.name}</h4>
                  <p className="text-sm text-gray-500">
                    {card.lastUsed ? `Last used ${card.lastUsed}` : 'Never used'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditCard(card)}
                  className="p-2 hover:bg-white rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => deleteCard(card.id)}
                  className="p-2 hover:bg-white rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <NFCCardModal
          card={selectedCard}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default NFCWidget;