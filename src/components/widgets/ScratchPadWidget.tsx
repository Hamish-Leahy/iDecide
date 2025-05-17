import React, { useState, useEffect } from 'react';
import { StickyNote, Save, Trash2 } from 'lucide-react';
import { Card } from '../common/Card';

interface ScratchPadWidgetProps {
  className?: string;
}

export function ScratchPadWidget({ className = '' }: ScratchPadWidgetProps) {
  const [notes, setNotes] = useState<string>('');
  const [isSaved, setIsSaved] = useState<boolean>(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Load saved notes from localStorage on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('scratchPadNotes');
    if (savedNotes) {
      setNotes(savedNotes);
      
      const savedTimestamp = localStorage.getItem('scratchPadLastSaved');
      if (savedTimestamp) {
        setLastSaved(new Date(parseInt(savedTimestamp)));
      }
    }
  }, []);
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
    setIsSaved(false);
  };
  
  const saveNotes = () => {
    localStorage.setItem('scratchPadNotes', notes);
    const now = new Date();
    localStorage.setItem('scratchPadLastSaved', now.getTime().toString());
    setLastSaved(now);
    setIsSaved(true);
  };
  
  const clearNotes = () => {
    if (window.confirm('Are you sure you want to clear all notes?')) {
      setNotes('');
      localStorage.removeItem('scratchPadNotes');
      localStorage.removeItem('scratchPadLastSaved');
      setLastSaved(null);
      setIsSaved(true);
    }
  };
  
  // Auto-save when component unmounts
  useEffect(() => {
    return () => {
      if (!isSaved && notes) {
        localStorage.setItem('scratchPadNotes', notes);
        localStorage.setItem('scratchPadLastSaved', new Date().getTime().toString());
      }
    };
  }, [notes, isSaved]);

  return (
    <Card className={`${className}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <StickyNote size={18} className="text-yellow-500" />
            Scratch Pad
          </h3>
          <div className="flex items-center gap-1">
            <button 
              onClick={saveNotes}
              disabled={isSaved || !notes}
              className={`p-1 rounded-full ${
                isSaved || !notes 
                  ? 'text-gray-300 cursor-not-allowed' 
                  : 'text-blue-500 hover:bg-blue-50'
              }`}
              title="Save notes"
            >
              <Save size={16} />
            </button>
            <button 
              onClick={clearNotes}
              disabled={!notes}
              className={`p-1 rounded-full ${
                !notes 
                  ? 'text-gray-300 cursor-not-allowed' 
                  : 'text-red-500 hover:bg-red-50'
              }`}
              title="Clear notes"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
        
        <textarea
          value={notes}
          onChange={handleChange}
          placeholder="Type your notes here..."
          className="w-full h-32 p-3 text-sm border rounded-lg focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 resize-none"
        />
        
        {lastSaved && (
          <div className="mt-2 text-xs text-gray-500 text-right">
            Last saved: {lastSaved.toLocaleString()}
          </div>
        )}
      </div>
    </Card>
  );
}